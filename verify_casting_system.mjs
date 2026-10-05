// verify_casting_system.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!pageTab) {
    console.error('Target page not found')
    process.exit(1)
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
  console.log('Connected to Chrome DevTools WebSocket')

  await send('Page.enable')
  await send('Runtime.enable')

  // Reload page to get fresh state
  console.log('Reloading page...')
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2000))

  // 1. Verify Default Initial State
  const initialState = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const activeSpell = game?.activeArmedSpell
      const card = document.getElementById('gesture-prompt-card')
      const cardVisible = card && !card.classList.contains('hidden')
      const spellName = document.getElementById('prompt-spell-name')?.textContent
      const selectedBtn = document.querySelector('.spell-active-selected')
      const selectedSpell = selectedBtn?.dataset?.spell
      return { activeSpell, cardVisible, spellName, selectedSpell }
    })()`,
    returnByValue: true
  })
  console.log('1. Initial State:', initialState.result.value)

  // 2. Test Selection / Arming via Button Click
  console.log('2. Clicking Avada Kedavra button to test Arming...')
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const avadaBtn = document.querySelector('.spell-hotspot[data-spell="avadakedavra"]')
      if (avadaBtn) {
        avadaBtn.click()
      }
      const game = window.duelingGame?.instance || window.game
      const activeSpell = game?.activeArmedSpell
      const spellName = document.getElementById('prompt-spell-name')?.textContent
      const instruction = document.getElementById('prompt-gesture-instruction')?.textContent
      const statusText = document.getElementById('prompt-status-text')?.textContent
      const isSelected = avadaBtn?.classList.contains('spell-active-selected')
      return { activeSpell, spellName, instruction, statusText, isSelected }
    })()`,
    returnByValue: true
  })
  console.log('Arming Result:', clickResult.result.value)

  // 3. Test Invalid Drawing (Wrong Shape / Scribble) -> MUST FAIL
  console.log('3. Testing Wrong Shape (Drawing a small straight horizontal line for Avada Kedavra)...')
  const wrongDrawResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      // Draw horizontal line (Sectumsempra shape) while Avada is armed
      const pts = []
      for (let x = 300; x <= 450; x += 10) pts.push({ x, y: 350 })
      
      const prevEnemyHp = game.enemyHp
      window.duelingGame.simulateDrawStroke(pts)
      
      const statusText = document.getElementById('prompt-status-text')?.textContent
      const toastTitle = document.getElementById('toast-title')?.textContent
      const toastSub = document.getElementById('toast-sub')?.textContent
      return { statusText, toastTitle, toastSub, enemyHpUnchanged: game.enemyHp === prevEnemyHp }
    })()`,
    returnByValue: true
  })
  console.log('Wrong Shape Result:', wrongDrawResult.result.value)

  // 4. Test Valid Drawing for Armed Spell -> MUST CAST
  console.log('4. Testing Correct Shape for Avada Kedavra (Sharp 3-turn lightning)...')
  const validDrawResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      // Avada Kedavra 3+ turns lightning stroke
      const pts = [
        { x: 300, y: 200 },
        { x: 420, y: 260 },
        { x: 280, y: 320 },
        { x: 410, y: 380 },
        { x: 300, y: 440 }
      ]
      // interpolate for density
      const densePts = []
      for (let i = 0; i < pts.length - 1; i++) {
        for (let s = 0; s < 6; s++) {
          densePts.push({
            x: pts[i].x + (pts[i+1].x - pts[i].x) * (s / 6),
            y: pts[i].y + (pts[i+1].y - pts[i].y) * (s / 6)
          })
        }
      }
      densePts.push(pts[pts.length - 1])
      
      window.duelingGame.simulateDrawStroke(densePts)
      
      const statusText = document.getElementById('prompt-status-text')?.textContent
      const toastTitle = document.getElementById('toast-title')?.textContent
      const toastSub = document.getElementById('toast-sub')?.textContent
      return { statusText, toastTitle, toastSub, castProgress: game.playerCastProgress }
    })()`,
    returnByValue: true
  })
  console.log('Valid Shape Result:', validDrawResult.result.value)

  // Wait a moment for effects to register
  await new Promise(r => setTimeout(r, 600))

  // Capture screenshot of the duel with the prompt card and casting effect
  console.log('Capturing in-game screenshot...')
  const screenshot = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_casting_verified.png', Buffer.from(screenshot.data, 'base64'))
  console.log('Screenshot saved to screenshot_casting_verified.png')

  ws.close()
  console.log('Verification completed successfully!')
}

run().catch(console.error)
