// capture_idle_guide.mjs
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

  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2200))

  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.aiDisabled = true
      document.getElementById('end-match-modal')?.classList.add('hidden')
      game.setArmedSpell('expelliarmus')
    })()`
  })

  await new Promise(r => setTimeout(r, 1000))

  const ss = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_casting_guide_ui.png', Buffer.from(ss.data, 'base64'))
  console.log('Saved screenshot_casting_guide_ui.png')

  ws.close()
}

run().catch(console.error)
