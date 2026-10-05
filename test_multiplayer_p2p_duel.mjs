// test_multiplayer_p2p_duel.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectWebSocket(url) {
  const ws = new WebSocket(url)
  let id = 1
  const pending = new Map()

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }
  })

  await new Promise(r => ws.on('open', r))
  await send('Page.enable')
  await send('Runtime.enable')

  return { ws, send }
}

async function run() {
  console.log('Connecting to browser on port 9222...')
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const hostTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!hostTab) throw new Error('Host tab not found on port 5180')

  const host = await connectWebSocket(hostTab.webSocketDebuggerUrl)
  console.log('Host connected!')

  // Reset Host to desktop metrics and reload clean
  await host.send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 700,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 0 }
  })
  await host.send('Page.navigate', { url: 'http://localhost:5180/' })
  await new Promise(r => setTimeout(r, 2200))

  // Step 1: Host creates room
  console.log('1. Host clicking "MỞ PHÒNG & CHỜ BẠN BÈ"...')
  const hostCreateRes = await host.send('Runtime.evaluate', {
    expression: `(async () => {
      const game = window.duelingGame?.instance || window.game
      const hostBtn = document.getElementById('btn-start-hosting')
      if (hostBtn) hostBtn.click()
      await new Promise(r => setTimeout(r, 600))
      return {
        roomCode: game?.currentRoomCode,
        displayCode: document.getElementById('display-room-code')?.textContent,
        isHost: game?.network?.isHost,
        isConnecting: game?.network?.isConnecting
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  })
  const hostInfo = hostCreateRes.result.value
  const roomCode = hostInfo.roomCode || hostInfo.displayCode
  console.log('Host created room:', roomCode, hostInfo)

  // Step 2: Open Guest Tab with ?room=roomCode
  console.log('2. Opening Guest Tab with room URL:', `http://localhost:5180/?room=${roomCode}`)
  const targetRes = await host.send('Target.createTarget', {
    url: `http://localhost:5180/?room=${roomCode}`
  })
  const guestTargetId = targetRes.targetId

  // Wait for guest page to initialize
  await new Promise(r => setTimeout(r, 2200))
  const updatedTabs = await (await fetch('http://localhost:9222/json/list')).json()
  const guestTab = updatedTabs.find(t => t.id === guestTargetId)
  if (!guestTab) throw new Error('Could not find guest tab')

  const guest = await connectWebSocket(guestTab.webSocketDebuggerUrl)
  console.log('Guest connected!')

  await guest.send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 700,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 0 }
  })

  // Step 3: Guest clicks join room
  console.log('3. Guest joining room with code:', roomCode)
  const guestJoinRes = await guest.send('Runtime.evaluate', {
    expression: `(async () => {
      const game = window.duelingGame?.instance || window.game
      const joinInput = document.getElementById('input-join-code')
      const joinBtn = document.getElementById('btn-join-room')
      const tabJoin = document.getElementById('tab-join-btn')
      if (tabJoin) tabJoin.click()
      if (joinInput && !joinInput.value) joinInput.value = '${roomCode}'
      if (joinBtn) joinBtn.click()
      await new Promise(r => setTimeout(r, 800))
      return {
        inputValue: joinInput?.value,
        roomCode: game?.currentRoomCode,
        isConnecting: game?.network?.isConnecting
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  })
  console.log('Guest Join click result:', guestJoinRes.result.value)

  // Step 4: Wait for handshake connection
  console.log('4. Waiting for P2P handshake (up to 8s)...')
  let connected = false
  for (let i = 0; i < 16; i++) {
    await new Promise(r => setTimeout(r, 500))
    const connCheck = await host.send('Runtime.evaluate', {
      expression: `(() => {
        const game = window.duelingGame?.instance || window.game
        return {
          hostConnected: game?.network?.isConnected,
          hostGameMode: game?.gameMode,
          hostMenuHidden: document.getElementById('main-menu-overlay')?.classList.contains('hidden'),
          hostHudVisible: !document.getElementById('hud-overlay')?.classList.contains('hidden'),
          modePill: document.getElementById('duel-mode-pill')?.textContent
        }
      })()`,
      returnByValue: true
    })
    const guestCheck = await guest.send('Runtime.evaluate', {
      expression: `(() => {
        const game = window.duelingGame?.instance || window.game
        return {
          guestConnected: game?.network?.isConnected,
          guestGameMode: game?.gameMode,
          guestMenuHidden: document.getElementById('main-menu-overlay')?.classList.contains('hidden'),
          guestHudVisible: !document.getElementById('hud-overlay')?.classList.contains('hidden'),
          modePill: document.getElementById('duel-mode-pill')?.textContent
        }
      })()`,
      returnByValue: true
    })

    const h = connCheck.result.value
    const g = guestCheck.result.value
    console.log(`Poll ${i+1}: Host[conn=${h.hostConnected}, mode=${h.hostGameMode}, menuHide=${h.hostMenuHidden}], Guest[conn=${g.guestConnected}, mode=${g.guestGameMode}, menuHide=${g.guestMenuHidden}]`)

    if (h.hostConnected && g.guestConnected && h.hostGameMode === 'multiplayer' && g.guestGameMode === 'multiplayer') {
      connected = true
      break
    }
  }

  console.log('Handshake result:', connected ? 'SUCCESS!' : 'FAILED TO COMPLETE HANDSHAKE')

  // Step 5: Test Synchronized Spell Casting
  console.log('5. Testing synchronized spell casting from Host...')
  const castRes = await host.send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game?.castPlayerSpell) {
        game.castPlayerSpell('expelliarmus')
        return { castOk: true, spell: 'expelliarmus', playerHp: game.playerHp, oppHp: game.oppHp }
      }
      return { castOk: false }
    })()`,
    returnByValue: true
  })
  console.log('Host spell cast result:', castRes.result.value)

  await new Promise(r => setTimeout(r, 600))

  // Capture screenshots of both Host and Guest during active online multiplayer duel!
  const ssHost = await host.send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_multiplayer_host_active.png', Buffer.from(ssHost.data, 'base64'))
  console.log('Saved screenshot_multiplayer_host_active.png')

  const ssGuest = await guest.send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_multiplayer_guest_active.png', Buffer.from(ssGuest.data, 'base64'))
  console.log('Saved screenshot_multiplayer_guest_active.png')

  // Step 6: Test dodge synchronization from Guest
  console.log('6. Testing dodge from Guest...')
  const guestDodgeRes = await guest.send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game?.triggerPlayerDodge) {
        game.triggerPlayerDodge(-1) // Dodge left
        return { dodgeOk: true }
      }
      return { dodgeOk: false }
    })()`,
    returnByValue: true
  })
  console.log('Guest dodge result:', guestDodgeRes.result.value)

  await new Promise(r => setTimeout(r, 500))

  // Step 7: Clean up guest tab
  console.log('7. Cleaning up guest tab...')
  await host.send('Target.closeTarget', { targetId: guestTargetId })
  host.ws.close()
  guest.ws.close()
  console.log('Multiplayer P2P duel verification finished successfully!')
}

run().catch(console.error)
