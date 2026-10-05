import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.type === 'page')
  if (!target) {
    console.error('No page target found!')
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

  console.log('Navigating to http://127.0.0.1:5180...')
  await send('Page.navigate', { url: 'http://127.0.0.1:5180' })
  await new Promise(r => setTimeout(r, 4500))

  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame) {
          window.duelingGame.resetHp();
          window.duelingGame.setAiDisabled(true);
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
    console.log(`✅ Saved in-game screenshot: ${outPath}`)
  }

  // --- 1. CAPTURE EXPECTO PATRONUM IN-GAME FLIGHT ---
  console.log('Casting Expecto Patronum (Key P) in live duel arena...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.duelingGame.resetHp();
        window.duelingGame.setAiDisabled(true);
        window.duelingGame.castSpell('expecto_patronum');
      })()
    `
  })
  // Wait ~200ms for stag to gallop into center of the arena
  await new Promise(r => setTimeout(r, 220))
  await captureFrame('expecto_patronum_flight_ingame')

  // Wait for projectile to clear
  await new Promise(r => setTimeout(r, 2000))

  // --- 2. CAPTURE EXPECTO PATRONUM CLOSEUP / IMPACT ---
  console.log('Casting second Expecto Patronum for mid-flight closeup...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.duelingGame.resetHp();
        window.duelingGame.setAiDisabled(true);
        window.duelingGame.castSpell('expecto_patronum');
      })()
    `
  })
  await new Promise(r => setTimeout(r, 380))
  await captureFrame('expecto_patronum_mid_ingame')

  ws.close()
  console.log('Done capturing live in-game screenshots of Expecto Patronum!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
