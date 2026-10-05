import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.url.includes('5180') && t.type === 'page')
  if (!target) {
    console.error('Target 5180 not found!')
    process.exit(1)
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let idCounter = 1
  const pending = new Map()

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  ws.on('message', data => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }
  })

  await new Promise(r => ws.on('open', r))
  console.log('WebSocket connected')

  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 1800))

  // Hide banner & modal
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const banner = document.getElementById('match-banner')
        if (banner) banner.classList.add('hidden')
        const modal = document.getElementById('end-match-modal')
        if (modal) modal.classList.add('hidden')
      })()
    `
  })

  const capture = async (filename) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/.gemini/antigravity-ide/brain/e40e3d86-dfc2-40b9-b653-c5a6cb062216/${filename}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`Saved ${outPath}`)
  }

  // 1. Capture Neutral Stance
  await new Promise(r => setTimeout(r, 300))
  await capture('dodge_test_neutral')

  // 2. Press KeyA (Lean Left)
  console.log('Pressing KeyA (Lean Left)...')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyA', key: 'a' })
  await new Promise(r => setTimeout(r, 350))
  await capture('dodge_test_lean_left')
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyA', key: 'a' })
  await new Promise(r => setTimeout(r, 200))

  // 3. Press KeyD (Lean Right)
  console.log('Pressing KeyD (Lean Right)...')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd' })
  await new Promise(r => setTimeout(r, 350))
  await capture('dodge_test_lean_right')
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd' })
  await new Promise(r => setTimeout(r, 200))

  // 4. Press KeyS (Duck low)
  console.log('Pressing KeyS (Duck Low)...')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyS', key: 's' })
  await new Promise(r => setTimeout(r, 350))
  await capture('dodge_test_duck')
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyS', key: 's' })

  ws.close()
  console.log('Dodge test completed!')
}

run().catch(console.error)
