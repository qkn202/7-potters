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

  console.log('Connecting to', target.webSocketDebuggerUrl)
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

  // Reload page to start brand new match
  console.log('Reloading page...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 2000))

  // Clean UI banners/modals and ensure match is active
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame && typeof window.duelingGame.resetHp === 'function') {
          window.duelingGame.resetHp()
        }
        const banner = document.getElementById('match-banner')
        if (banner) {
          banner.style.display = 'none'
          banner.classList.add('hidden')
        }
        const modal = document.getElementById('end-match-modal')
        if (modal) {
          modal.style.display = 'none'
          modal.classList.add('hidden')
        }
      })()
    `
  })
  await new Promise(r => setTimeout(r, 400))

  // Capture frames helper
  const captureFrame = async (name, delayMs) => {
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
    console.log(`Capturing ${name}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/.gemini/antigravity-ide/brain/e40e3d86-dfc2-40b9-b653-c5a6cb062216/${name}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`Saved ${outPath}`)
  }

  // Cast Incendio (window.duelingGame.castIncendio)
  console.log('Casting Incendio...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame && typeof window.duelingGame.castIncendio === 'function') {
          window.duelingGame.castIncendio()
          console.log('Incendio cast triggered via castIncendio!')
        } else if (window.game && typeof window.game.castPlayerSpell === 'function') {
          window.game.castPlayerSpell('incendio', 100)
        }
      })()
    `
  })

  // Capture frames when projectile is traveling down runway
  await captureFrame('incendio_frame_120ms', 120)
  await captureFrame('incendio_frame_180ms', 60)
  await captureFrame('incendio_frame_240ms', 60)
  await captureFrame('incendio_frame_300ms', 60)

  ws.close()
  console.log('Done captures!')
}

run().catch(console.error)
