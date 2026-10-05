// verify_hud_rune_drawings.mjs
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

  console.log('Reloading page...')
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2500))

  // Inspect the HUD buttons and card
  const checkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game) {
        game.aiDisabled = true
      }
      document.getElementById('end-match-modal')?.classList.add('hidden')

      // Check all 9 buttons
      const hotspots = Array.from(document.querySelectorAll('.spell-hotspot'))
      const outerBtns = Array.from(document.querySelectorAll('.spell-outer-btn'))
      const allBtns = [...outerBtns, ...hotspots]

      const btnResults = allBtns.map(btn => {
        const spell = btn.getAttribute('data-spell')
        const svg = btn.querySelector('svg.spell-rune-icon')
        const hasSvg = !!svg
        const text = btn.innerText.trim()
        return { spell, hasSvg, text }
      })

      // Select confringo to test active spell switch
      if (game && game.setArmedSpell) {
        game.setArmedSpell('confringo')
      }

      const promptIcon = document.getElementById('prompt-spell-icon')
      const promptHasSvg = !!promptIcon?.querySelector('svg.spell-rune-icon')
      const promptSvgHtml = promptIcon?.innerHTML || ''

      return {
        totalButtons: allBtns.length,
        btnResults,
        promptHasSvg,
        promptSvgPreview: promptSvgHtml.substring(0, 100)
      }
    })()`,
    returnByValue: true
  })

  console.log('HUD Inspection Result:', JSON.stringify(checkRes.result.value, null, 2))

  // Wait a moment for styles to apply
  await new Promise(r => setTimeout(r, 1000))

  // Capture full HUD screenshot
  const ss1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_hud_runes_verified.png', Buffer.from(ss1.data, 'base64'))
  console.log('Saved screenshot_hud_runes_verified.png')

  // Switch to Expecto Patronum and capture
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      if (game && game.setArmedSpell) {
        game.setArmedSpell('expecto_patronum')
      }
    })()`
  })

  await new Promise(r => setTimeout(r, 800))
  const ss2 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_hud_patronum_rune.png', Buffer.from(ss2.data, 'base64'))
  console.log('Saved screenshot_hud_patronum_rune.png')

  ws.close()
}

run().catch(console.error)
