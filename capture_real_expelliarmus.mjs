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
  await new Promise(r => setTimeout(r, 3400))

  // Dismiss start banner & ensure clean canvas
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
      }
    `
  })
  await new Promise(r => setTimeout(r, 600))

  console.log('--- 1. CAPTURING CINEMATIC VIEW: 1. MID-FLIGHT SCARLET JET ---')
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('expelliarmus', 95)`
  })

  // Capture at 100ms (mid-flight across table)
  await new Promise(r => setTimeout(r, 100))
  const shotCinFlight = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_flight_ingame.png`, Buffer.from(shotCinFlight.data, 'base64'))
  console.log('Saved expelliarmus_cinematic_flight_ingame.png')

  // Capture at 360ms (tumbling wand in the air + shocked posture)
  await new Promise(r => setTimeout(r, 260))
  const shotCinDisarm = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_disarm_ingame.png`, Buffer.from(shotCinDisarm.data, 'base64'))
  console.log('Saved expelliarmus_cinematic_disarm_ingame.png')

  // Capture at 700ms (settled wand on table, Voldemort shocked)
  await new Promise(r => setTimeout(r, 340))
  const shotCinLanded = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_cinematic_landed_ingame.png`, Buffer.from(shotCinLanded.data, 'base64'))
  console.log('Saved expelliarmus_cinematic_landed_ingame.png')

  // Wait for wand retrieve
  await new Promise(r => setTimeout(r, 2200))

  console.log('--- 2. CAPTURING SIDE BROADCAST VIEW ---')
  await send('Runtime.evaluate', {
    expression: `
      if (window.game) {
        window.game.cameraMode = 'side';
        window.game.enemyHp = 100;
      }
    `
  })
  await new Promise(r => setTimeout(r, 600))

  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('expelliarmus', 95)`
  })

  // Side view mid-flight at 100ms
  await new Promise(r => setTimeout(r, 100))
  const shotSideFlight = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_side_flight_ingame.png`, Buffer.from(shotSideFlight.data, 'base64'))
  console.log('Saved expelliarmus_side_flight_ingame.png')

  // Side view disarm at 350ms
  await new Promise(r => setTimeout(r, 250))
  const shotSideDisarm = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${ARTIFACT_DIR}/expelliarmus_side_disarm_ingame.png`, Buffer.from(shotSideDisarm.data, 'base64'))
  console.log('Saved expelliarmus_side_disarm_ingame.png')

  ws.close()
  console.log('All real in-game screenshots captured with precise timings!')
}

run().catch(console.error)
