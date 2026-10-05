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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  })

  console.log('Reloading page and waiting for all textures to load...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 4200))

  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame) {
          if (typeof window.duelingGame.resetHp === 'function') window.duelingGame.resetHp()
          if (typeof window.duelingGame.setAiDisabled === 'function') window.duelingGame.setAiDisabled(true)
        }
        const banner = document.getElementById('match-banner')
        if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
        const modal = document.getElementById('end-match-modal')
        if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
      })()
    `
  })
  await new Promise(r => setTimeout(r, 600))

  const captureFrame = async (filename) => {
    console.log(`Capturing ${filename}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/hogwarts-duel-3d/docs/screenshots/${filename}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`Saved ${outPath}`)
  }

  console.log('Casting Petrificus Totalus (7)...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame && typeof window.duelingGame.castSpell === 'function') {
          window.duelingGame.castSpell('petrificus')
        }
      })()
    `
  })

  // Capture mid-flight down the Great Hall table (obelisk spear + dual corkscrew + tumbling rocks)
  await new Promise(r => setTimeout(r, 38))
  await captureFrame('petrificus_flight_showcase')

  // Wait for impact clamp and petrification state
  await new Promise(r => setTimeout(r, 260))
  await captureFrame('petrificus_impact_showcase')

  ws.close()
  console.log('Done!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
