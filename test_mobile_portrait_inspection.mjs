// test_mobile_portrait_inspection.mjs
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

  // Set mobile device emulation: iPhone 14 Pro (393 x 852, scale 3)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: {
      type: 'portraitPrimary',
      angle: 0
    }
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true })

  console.log('Reloading with mobile portrait metrics...')
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2600))

  // Inspect layout elements
  const layoutInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game) {
        game.aiDisabled = true
        document.getElementById('end-match-modal')?.classList.add('hidden')
        document.getElementById('match-banner')?.classList.add('hidden')
      }
      const topHud = document.querySelector('.hud-top')?.getBoundingClientRect()
      const bottomHud = document.querySelector('.hud-bottom')?.getBoundingClientRect()
      const spellWheel = document.querySelector('.spell-wheel-wrapper')?.getBoundingClientRect()
      const promptCard = document.querySelector('.gesture-prompt-card')?.getBoundingClientRect()
      const clock = document.querySelector('.center-duel-header')?.getBoundingClientRect()
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        topHud,
        bottomHud,
        spellWheel,
        promptCard,
        clock,
        cameraMode: game?.cameraMode
      }
    })()`,
    returnByValue: true
  })
  console.log('Mobile Layout State:', JSON.stringify(layoutInfo.result.value, null, 2))

  const ss = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_mobile_portrait_current.png', Buffer.from(ss.data, 'base64'))
  console.log('Saved screenshot_mobile_portrait_current.png')

  ws.close()
}

run().catch(console.error)
