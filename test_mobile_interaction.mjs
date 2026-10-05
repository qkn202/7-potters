// test_mobile_interaction.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
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

  // Set iPhone 14 Pro portrait metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true })

  console.log('Testing Mobile Ribbon Selection...')
  // 1. Select Protego pill
  const selectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game) game.aiDisabled = true

      const protegoPill = document.querySelector('.mobile-spell-pill[data-spell="protego"]')
      if (protegoPill) {
        protegoPill.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      }
      return {
        activeArmedSpell: game?.activeArmedSpell,
        promptTitle: document.getElementById('prompt-spell-name')?.textContent,
        pillActive: protegoPill?.classList.contains('spell-active-selected')
      }
    })()`,
    returnByValue: true
  })
  console.log('Protego selection result:', selectRes.result.value)

  // 2. Test Dodge Left Button
  const dodgeRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const dodgeLeftBtn = document.getElementById('mobile-dodge-left')
      if (dodgeLeftBtn) {
        dodgeLeftBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      }
      return {
        targetPlayerLeanX: game?.targetPlayerLeanX,
        playerDodgeTriggered: game?.targetPlayerLeanX < 0
      }
    })()`,
    returnByValue: true
  })
  console.log('Dodge Left result:', dodgeRes.result.value)

  // 3. Draw Protego Gesture Dome on Mobile Canvas
  console.log('Simulating Touch Drawing on wand canvas...')
  const drawRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const canvas = document.getElementById('wand-canvas')
      if (!canvas || !game) return { error: 'No canvas or game' }

      // Simulate dome stroke (upside down bowl) from (120, 480) up to (200, 390) down to (280, 480)
      const points = []
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const x = 120 + t * 160
        // Parabola peaking at y=390
        const y = 480 - 90 * Math.sin(t * Math.PI)
        points.push({ x, y })
      }

      // Execute gesture matching directly to verify
      const matchResult = game.evaluateSpellMatch(points, 'protego')
      return {
        matchResult,
        pointsCount: points.length
      }
    })()`,
    returnByValue: true
  })
  console.log('Touch gesture match evaluation:', drawRes.result.value)

  // Take screenshot of Protego selected state
  await new Promise(r => setTimeout(r, 600))
  const ss = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_mobile_protego_test.png', Buffer.from(ss.data, 'base64'))
  console.log('Saved screenshot_mobile_protego_test.png')

  ws.close()
}

run().catch(console.error)
