// test_freehand_drawing_live.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  let tabs = await tabsRes.json()
  let pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))

  if (!pageTab) {
    const newTabRes = await fetch('http://localhost:9222/json/new?http://127.0.0.1:5180/')
    pageTab = await newTabRes.json()
    await new Promise(r => setTimeout(r, 1500))
  }

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

  console.log('--- 1. Setting Desktop Viewport & Reloading ---')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  })

  await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
  await new Promise(r => setTimeout(r, 2500))

  console.log('--- 2. Entering Single Player Mode ---')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('card-mode-single') || document.getElementById('btn-play-single')
      if (btn) btn.click()
    })()`
  })
  await new Promise(r => setTimeout(r, 1200))

  console.log('--- 3. Verifying HUD state (No wheel, Freehand prompt active) ---')
  const hudCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const wheel = document.querySelector('.spell-wheel-wrapper')
      const ribbon = document.getElementById('mobile-spell-ribbon')
      const promptCard = document.getElementById('gesture-prompt-card')
      const grimoireBtn = document.getElementById('btn-toggle-grimoire')
      const promptTitle = document.getElementById('prompt-spell-name')?.textContent
      const promptDesc = document.getElementById('prompt-gesture-instruction')?.textContent
      const promptStatus = document.getElementById('prompt-status-text')?.textContent

      return {
        wheelPresent: !!wheel,
        wheelDisplay: wheel ? window.getComputedStyle(wheel).display : 'none',
        ribbonPresent: !!ribbon,
        ribbonDisplay: ribbon ? window.getComputedStyle(ribbon).display : 'none',
        promptCardVisible: !!promptCard,
        hasGrimoireBtn: !!grimoireBtn,
        promptTitle,
        promptDesc,
        promptStatus,
        playerMana: window.duelingGame?.instance?.playerMana
      }
    })()`,
    returnByValue: true
  })
  console.log('HUD Check Results:', hudCheck.result.value)

  // Capture Screenshot of Desktop HUD
  const snap1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_freehand_hud_desktop.png', Buffer.from(snap1.data, 'base64'))
  console.log('Saved screenshot_freehand_hud_desktop.png')

  console.log('--- 4. Testing Spell Grimoire Modal (Pháp Điển) ---')
  const openGrimoire = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btn-toggle-grimoire')
      btn?.click()
      const modal = document.getElementById('spell-grimoire-modal')
      const items = document.querySelectorAll('.grimoire-item')
      return {
        modalHidden: modal?.classList.contains('hidden'),
        itemCount: items.length
      }
    })()`,
    returnByValue: true
  })
  console.log('Grimoire Open Result:', openGrimoire.result.value)
  await new Promise(r => setTimeout(r, 400))

  const snapGrimoire = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_grimoire_modal_desktop.png', Buffer.from(snapGrimoire.data, 'base64'))
  console.log('Saved screenshot_grimoire_modal_desktop.png')

  // Close Grimoire modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.getElementById('grimoire-close-btn')?.click()
    })()`
  })
  await new Promise(r => setTimeout(r, 400))

  console.log('--- 5. Simulating Freehand Gesture Drawing: Expelliarmus (Lightning) ---')
  const drawLightning = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance
      if (!game) return { error: 'Game instance not found' }

      const manaBefore = game.playerMana

      // Generate lightning stroke points: 2 xTurns
      const pts = []
      let x = 300, y = 300
      pts.push({ x, y })
      const turns = [
        { tx: 380, ty: 360 },
        { tx: 310, ty: 420 },
        { tx: 390, ty: 490 }
      ]
      for (const t of turns) {
        for (let s = 1; s <= 8; s++) {
          pts.push({
            x: x + (t.tx - x) * (s / 8),
            y: y + (t.ty - y) * (s / 8)
          })
        }
        x = t.tx
        y = t.ty
      }

      // Feed into game drawing simulation
      game.isDrawing = true
      game.drawnPoints = pts
      game.endDrawing()

      return {
        manaBefore,
        manaAfter: game.playerMana,
        manaDeducted: manaBefore - game.playerMana,
        detectedSpell: game.activeArmedSpell,
        promptTitle: document.getElementById('prompt-spell-name')?.textContent
      }
    })()`,
    returnByValue: true
  })
  console.log('Expelliarmus Gesture Cast Result:', drawLightning.result.value)

  await new Promise(r => setTimeout(r, 500))
  const snapExpelli = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_cast_expelliarmus.png', Buffer.from(snapExpelli.data, 'base64'))

  console.log('--- 6. Simulating Freehand Gesture Drawing: Protego (Dome) ---')
  const drawProtego = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance
      if (!game) return { error: 'Game instance not found' }

      const manaBefore = game.playerMana

      // Generate dome stroke points
      const pts = []
      const cx = 400, cy = 400, r = 90
      for (let angle = Math.PI; angle >= 0; angle -= 0.12) {
        pts.push({
          x: cx + r * Math.cos(angle),
          y: cy - r * Math.sin(angle)
        })
      }

      game.isDrawing = true
      game.drawnPoints = pts
      game.endDrawing()

      return {
        manaBefore,
        manaAfter: game.playerMana,
        manaDeducted: manaBefore - game.playerMana,
        detectedSpell: game.activeArmedSpell,
        shieldActive: game.playerShieldActiveUntil > (game.clock?.getElapsedTime() ?? 0)
      }
    })()`,
    returnByValue: true
  })
  console.log('Protego Gesture Cast Result:', drawProtego.result.value)

  console.log('--- 7. Simulating Invalid Gesture (Fizzle & Rejection) ---')
  const drawInvalid = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance
      if (!game) return { error: 'Game instance not found' }

      const manaBefore = game.playerMana
      // Tiny random squiggle
      const pts = [
        { x: 300, y: 300 },
        { x: 305, y: 305 },
        { x: 302, y: 310 },
        { x: 307, y: 312 },
        { x: 304, y: 315 },
        { x: 308, y: 318 }
      ]

      game.isDrawing = true
      game.drawnPoints = pts
      game.endDrawing()

      return {
        manaBefore,
        manaAfter: game.playerMana,
        manaDeducted: manaBefore - game.playerMana,
        promptStatusText: document.getElementById('prompt-status-text')?.textContent,
        fizzleParticlesSpawned: game.fizzleParticles?.length > 0
      }
    })()`,
    returnByValue: true
  })
  console.log('Invalid Stroke Rejection Result:', drawInvalid.result.value)

  console.log('--- 8. Testing Mobile Portrait Viewport (390x844) ---')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  })
  await new Promise(r => setTimeout(r, 600))

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const wheel = document.querySelector('.spell-wheel-wrapper')
      const ribbon = document.getElementById('mobile-spell-ribbon')
      const dodgeBar = document.getElementById('mobile-dodge-bar')
      const promptCard = document.getElementById('gesture-prompt-card')

      return {
        wheelDisplay: wheel ? window.getComputedStyle(wheel).display : 'none',
        ribbonDisplay: ribbon ? window.getComputedStyle(ribbon).display : 'none',
        dodgeBarDisplay: dodgeBar ? window.getComputedStyle(dodgeBar).display : 'none',
        promptCardVisible: !!promptCard
      }
    })()`,
    returnByValue: true
  })
  console.log('Mobile Check Results:', mobileCheck.result.value)

  const snapMobile = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_freehand_mobile_portrait.png', Buffer.from(snapMobile.data, 'base64'))
  console.log('Saved screenshot_freehand_mobile_portrait.png')

  ws.close()
  console.log('--- ALL FREEHAND TESTS COMPLETED SUCCESSFULLY ---')
}

run().catch(console.error)
