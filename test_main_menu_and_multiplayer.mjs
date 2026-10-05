// test_main_menu_and_multiplayer.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectToPage() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!pageTab) throw new Error('Game page not found on port 5180')

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl)
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
  const { ws, send } = await connectToPage()

  console.log('1. Setting Desktop Metrics (1280 x 750) and reloading...')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 750,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 0 }
  })
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2600))

  // Inspect Main Menu State
  const menuState = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const menuOverlay = document.getElementById('main-menu-overlay')
      const hudOverlay = document.getElementById('hud-overlay')
      const singleBtn = document.getElementById('btn-play-single')
      const hostBtn = document.getElementById('btn-start-hosting')
      const tabJoin = document.getElementById('tab-join-btn')
      return {
        gameMode: game?.gameMode,
        aiDisabled: game?.aiDisabled,
        menuVisible: !menuOverlay?.classList.contains('hidden'),
        hudHidden: hudOverlay?.classList.contains('hidden'),
        hasSingleBtn: !!singleBtn,
        hasHostBtn: !!hostBtn,
        hasTabJoin: !!tabJoin
      }
    })()`,
    returnByValue: true
  })
  console.log('Main Menu Initial State (Desktop):', menuState.result.value)

  // Capture Desktop Main Menu Screenshot
  const ssMenu = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_main_menu_desktop.png', Buffer.from(ssMenu.data, 'base64'))
  console.log('Saved screenshot_main_menu_desktop.png')

  // Switch to Mobile Portrait (393 x 852)
  console.log('2. Testing Mobile Portrait Main Menu (393 x 852)...')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true })
  await new Promise(r => setTimeout(r, 600))

  const ssMenuMobile = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_main_menu_mobile.png', Buffer.from(ssMenuMobile.data, 'base64'))
  console.log('Saved screenshot_main_menu_mobile.png')

  // Test Clicking Single Player Mode
  console.log('3. Testing Single Player Launch from Menu...')
  const launchSingleRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const btn = document.getElementById('btn-play-single')
      if (btn) btn.click()
      return {
        gameMode: game?.gameMode,
        aiDisabled: game?.aiDisabled,
        menuHidden: document.getElementById('main-menu-overlay')?.classList.contains('hidden'),
        hudVisible: !document.getElementById('hud-overlay')?.classList.contains('hidden'),
        modePill: document.getElementById('duel-mode-pill')?.textContent
      }
    })()`,
    returnByValue: true
  })
  console.log('Single Player Launch result:', launchSingleRes.result.value)

  await new Promise(r => setTimeout(r, 800))
  const ssSingleGame = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_single_game_active.png', Buffer.from(ssSingleGame.data, 'base64'))
  console.log('Saved screenshot_single_game_active.png')

  // Test Return to Menu
  console.log('4. Testing Return to Menu via HUD button...')
  const returnMenuRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const menuBtn = document.getElementById('btn-return-menu')
      if (menuBtn) menuBtn.click()
      return {
        gameMode: game?.gameMode,
        menuVisible: !document.getElementById('main-menu-overlay')?.classList.contains('hidden'),
        hudHidden: document.getElementById('hud-overlay')?.classList.contains('hidden')
      }
    })()`,
    returnByValue: true
  })
  console.log('Return to Menu result:', returnMenuRes.result.value)

  // Test Multiplayer Host Room Creation
  console.log('5. Testing Multiplayer Host Room Creation...')
  const hostRoomRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const game = window.duelingGame?.instance || window.game
      const hostBtn = document.getElementById('btn-start-hosting')
      if (hostBtn) hostBtn.click()
      await new Promise(r => setTimeout(r, 300))
      return {
        roomCode: game?.currentRoomCode,
        displayCode: document.getElementById('display-room-code')?.textContent,
        isHosting: game?.network?.isHost,
        isConnecting: game?.network?.isConnecting
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  })
  console.log('Host Room Creation result:', hostRoomRes.result.value)

  await new Promise(r => setTimeout(r, 400))
  const ssHostLobby = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_multiplayer_host_lobby.png', Buffer.from(ssHostLobby.data, 'base64'))
  console.log('Saved screenshot_multiplayer_host_lobby.png')

  ws.close()
  console.log('Verification finished successfully!')
}

run().catch(console.error)
