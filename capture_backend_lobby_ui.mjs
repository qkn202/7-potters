// capture_backend_lobby_ui.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectToChromeDebugger() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await targetsRes.json()
  const target = targets.find((t) => t.type === 'page' && t.url.includes('5180')) || targets[0]
  if (!target) throw new Error('No valid browser target found')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 1
  const pending = new Map()

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }
  })

  await new Promise((r) => ws.on('open', r))

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails))
    }
    return res.result?.value
  }

  async function captureScreenshot(path) {
    const res = await send('Page.captureScreenshot', { format: 'png', quality: 90 })
    const buf = Buffer.from(res.data, 'base64')
    fs.writeFileSync(path, buf)
    console.log(`Saved screenshot: ${path} (${buf.length} bytes)`)
  }

  return { ws, send, evaluate, captureScreenshot }
}

async function run() {
  const { ws, evaluate, captureScreenshot } = await connectToChromeDebugger()
  console.log('Connected to Chrome. Waiting for DOM...')
  await new Promise((r) => setTimeout(r, 1200))

  // Populate mock open rooms in the UI to demonstrate Sảnh Chờ
  await evaluate(`
    (() => {
      const demoRooms = [
        {
          code: 'HOGW-9912',
          hostName: 'Hermione Granger',
          hostDeck: ['expelliarmus', 'protego', 'petrificus', 'lumos'],
          createdAt: Date.now() - 60000
        },
        {
          code: 'HOGW-4431',
          hostName: 'Draco Malfoy',
          hostDeck: ['confringo', 'stupefy', 'avadakedavra', 'protego'],
          createdAt: Date.now() - 180000
        }
      ]
      window.duelingGame?.renderOpenLobbyRooms(demoRooms)
    })()
  `)

  await new Promise((r) => setTimeout(r, 600))

  const screenshotPath = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/multiplayer_backend_lobby_rooms.png'
  await captureScreenshot(screenshotPath)

  ws.close()
  console.log('Capture finished successfully!')
}

run().catch(console.error)
