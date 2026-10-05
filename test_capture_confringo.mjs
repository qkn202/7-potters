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
  await new Promise(r => setTimeout(r, 3500))

  console.log('Entering single player match...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-play-single');
        if (btn) btn.click();
        const menu = document.getElementById('main-menu-overlay');
        if (menu) { menu.style.display = 'none'; menu.classList.add('hidden'); }
      })()
    `
  })
  await new Promise(r => setTimeout(r, 1200))
  console.log('Resetting match and waiting 2000ms for full character asset load...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const g = window.game;
        if (g) {
          g.isPaused = false;
          g.aiDisabled = true;
          g.enemyNextActionTime = 999999;
          g.playerHp = 100;
          g.enemyHp = 100;
          g.playerMana = 100;
          g.enemyMana = 100;
          g.matchOver = false;
          g.matchTimer = 120;
          g.updateHpBars();
        }
        const banner = document.getElementById('match-banner');
        if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
        const modal = document.getElementById('end-match-modal');
        if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
      })()
    `
  })
  await new Promise(r => setTimeout(r, 2000))

  const captureFrame = async (filename) => {
    console.log(`Capturing ${filename}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath1 = `/Users/khang/hogwarts-duel-3d/docs/screenshots/${filename}.png`
    const outPath2 = `/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/${filename}.png`
    fs.writeFileSync(outPath1, buf)
    fs.writeFileSync(outPath2, buf)
    console.log(`Saved ${filename}`)
  }

  // --- 1. CAPTURE FLIGHT SHOWCASE (Molten firebolt with Mach compression shock rings) ---
  console.log('1. Casting Confringo for flight capture...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const g = window.game;
        g.isPaused = false;
        g.aiDisabled = true;
        g.enemyNextActionTime = 999999;
        g.playerCooldowns = {};
        g.playerMana = 100;
        g.playerHp = 100;
        g.enemyHp = 100;
        g.updateHpBars();
        g.castPlayerSpell('confringo', 100);
      })()
    `
  })

  // Wait ~60ms for projectile to reach table center (z ~ -0.4 to -0.6)
  await new Promise(r => setTimeout(r, 60))
  // Pause to capture sharp, unblurred firebolt in flight
  await send('Runtime.evaluate', { expression: `if (window.game) window.game.isPaused = true;` })
  await captureFrame('confringo_flight_showcase')

  // --- 2. CAPTURE IMPACT DETONATION SHOWCASE (Volumetric cauliflower fireball blossom) ---
  console.log('2. Resuming flight towards impact...')
  await send('Runtime.evaluate', { expression: `if (window.game) window.game.isPaused = false;` })

  // Wait for impact (~100ms) + blossom peak (~90ms) = 190ms
  await new Promise(r => setTimeout(r, 190))
  // Pause at peak blossom
  await send('Runtime.evaluate', { expression: `if (window.game) window.game.isPaused = true;` })
  await captureFrame('confringo_impact_showcase')

  // --- 3. CAPTURE SMOKE PLUME & TABLE SCORCH SHOWCASE ---
  console.log('3. Resuming for smoke plume & charred scorch mark...')
  await send('Runtime.evaluate', { expression: `if (window.game) window.game.isPaused = false;` })
  // Wait 600ms for smoke column to rise and scorch mark with lava fissures to reveal
  await new Promise(r => setTimeout(r, 600))
  await captureFrame('confringo_smoke_showcase')

  ws.close()
  console.log('All Confringo showcases captured successfully!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
