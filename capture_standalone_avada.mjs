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

  // Set exact 1920x1080 16:9 viewport matching reference image
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  })

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
    await new Promise(r => setTimeout(r, delayMs))
    console.log(`Capturing ${name}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/.gemini/antigravity-ide/brain/e40e3d86-dfc2-40b9-b653-c5a6cb062216/${name}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`Saved ${outPath}`)
  }

  // Capture idle frame before casting spell to inspect Voldemort's head
  await captureFrame('voldemort_idle_head', 200)

  // Cast Avada Kedavra!
  console.log('Casting Avada Kedavra...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame && typeof window.duelingGame.castAvadaKedavra === 'function') {
          window.duelingGame.castAvadaKedavra()
          console.log('Avada Kedavra cast triggered!')
        } else {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', code: 'Digit5', bubbles: true }))
        }
      })()
    `
  })

  await captureFrame('voldemort_avada_v8_700ms', 700)

  ws.close()
  console.log('Done capture!')
}

run().catch(console.error)
