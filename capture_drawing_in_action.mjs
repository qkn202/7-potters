// capture_drawing_in_action.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!pageTab) throw new Error('Game page not found')

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

  // Arm Avada Kedavra and simulate drawing halfway through, then capture while drawing
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.aiDisabled = true
      document.getElementById('end-match-modal')?.classList.add('hidden')
      game.setArmedSpell('avadakedavra')
      
      // Start drawing on screen
      const pts = [
        {x: 350, y: 160},
        {x: 460, y: 230},
        {x: 340, y: 300},
        {x: 450, y: 370}
      ]
      game.startDrawing(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        for (let s = 1; s <= 4; s++) {
          game.drawMove(
            pts[i-1].x + (pts[i].x - pts[i-1].x) * (s / 4),
            pts[i-1].y + (pts[i].y - pts[i-1].y) * (s / 4)
          )
        }
      }
    })()`
  })

  await new Promise(r => setTimeout(r, 200))

  const ss = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_drawing_active_trail.png', Buffer.from(ss.data, 'base64'))
  console.log('Saved screenshot_drawing_active_trail.png')

  // Finish drawing to trigger cast
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.drawMove(350, 440)
      game.endDrawing()
    })()`
  })

  await new Promise(r => setTimeout(r, 300))

  const ssCast = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_drawing_cast_success.png', Buffer.from(ssCast.data, 'base64'))
  console.log('Saved screenshot_drawing_cast_success.png')

  ws.close()
}

run().catch(console.error)
