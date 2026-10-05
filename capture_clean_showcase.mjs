import WebSocket from 'ws'
import fs from 'fs'

const ARTIFACT_DIR = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41'

async function run() {
  console.log('Connecting to Chrome CDP on 9222...')
  const res = await fetch('http://127.0.0.1:9222/json')
  const tabs = await res.json()
  const page = tabs.find(t => t.type === 'page')
  if (!page) {
    console.error('No page found!')
    process.exit(1)
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 1
  const map = new Map()

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++
      map.set(curId, { resolve, reject })
      ws.send(JSON.stringify({ id: curId, method, params }))
    })
  }

  ws.on('message', data => {
    const msg = JSON.parse(data.toString())
    if (msg.id && map.has(msg.id)) {
      const { resolve, reject } = map.get(msg.id)
      map.delete(msg.id)
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

  console.log('Reloading to load fresh code...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 3500))

  // Clean UI and prepare arena
  await send('Runtime.evaluate', {
    expression: `
      const toast = document.getElementById('gesture-toast');
      if (toast) toast.classList.add('hidden');
      const banner = document.getElementById('round-banner');
      if (banner) banner.style.display = 'none';
      if (window.game) {
        window.game.aiDisabled = true;
        window.game.enemyHp = 100;
        window.game.playerHp = 100;
        window.game.cameraMode = 'cinematic';
        window.game.isPaused = false;
      }
    `
  })
  await new Promise(r => setTimeout(r, 600))

  console.log('--- 1. CINEMATIC: CASTING EXPELLIARMUS & FREEZING MID-FLIGHT ---')
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('expelliarmus', 95)`
  })

  // Wait 90ms (approx middle of the table) and freeze frame
  await new Promise(r => setTimeout(r, 90))
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = true;`
  })
  await new Promise(r => setTimeout(r, 80))

  const shotCinFlight = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_flight_ingame.png`, Buffer.from(shotCinFlight.data, 'base64'))
  console.log('Saved pristine expelliarmus_cinematic_flight_ingame.png')

  // Resume game and wait for hit + disarmed wand tumbling in mid-air
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = false;`
  })
  await new Promise(r => setTimeout(r, 220))
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = true;`
  })
  await new Promise(r => setTimeout(r, 80))

  const shotCinDisarm = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_disarm_ingame.png`, Buffer.from(shotCinDisarm.data, 'base64'))
  console.log('Saved pristine expelliarmus_cinematic_disarm_ingame.png')

  // Resume and wait for wand landed on the table
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = false;`
  })
  await new Promise(r => setTimeout(r, 450))
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = true;`
  })
  await new Promise(r => setTimeout(r, 80))

  const shotCinLanded = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_landed_ingame.png`, Buffer.from(shotCinLanded.data, 'base64'))
  console.log('Saved pristine expelliarmus_cinematic_landed_ingame.png')

  // Unpause & reset for Side broadcast view
  await send('Runtime.evaluate', {
    expression: `
      if (window.game) {
        window.game.isPaused = false;
        window.game.cameraMode = 'side';
        window.game.enemyHp = 100;
      }
    `
  })
  await new Promise(r => setTimeout(r, 2000))

  console.log('--- 2. SIDE BROADCAST: CASTING & FREEZING MID-FLIGHT ---')
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('expelliarmus', 95)`
  })

  // Wait 90ms and freeze
  await new Promise(r => setTimeout(r, 90))
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = true;`
  })
  await new Promise(r => setTimeout(r, 80))

  const shotSideFlight = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_side_flight_ingame.png`, Buffer.from(shotSideFlight.data, 'base64'))
  console.log('Saved pristine expelliarmus_side_flight_ingame.png')

  // Resume and wait for disarm tumble
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = false;`
  })
  await new Promise(r => setTimeout(r, 240))
  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = true;`
  })
  await new Promise(r => setTimeout(r, 80))

  const shotSideDisarm = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_side_disarm_ingame.png`, Buffer.from(shotSideDisarm.data, 'base64'))
  console.log('Saved pristine expelliarmus_side_disarm_ingame.png')

  await send('Runtime.evaluate', {
    expression: `if (window.game) window.game.isPaused = false;`
  })

  ws.close()
  console.log('All 5 high-fidelity in-engine screenshots captured successfully!')
}

run().catch(console.error)
