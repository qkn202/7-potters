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
  console.log('Connected to CDP!')

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  // 1. Reload page
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 2500))

  // Select Player: Harry, Opponent: Ron
  console.log('Selecting Player: Harry, Opponent: Ron Weasley...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const playerHarry = document.querySelector('#player-char-selector button[data-char="harry"]');
        if (playerHarry) playerHarry.click();
        const oppRon = document.querySelector('#opponent-char-selector button[data-char="ron"]');
        if (oppRon) oppRon.click();
      })()
    `
  })

  await new Promise(r => setTimeout(r, 800))

  // Click Start Duel
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-play-single');
        if (btn) btn.click();
      })()
    `
  })

  await new Promise(r => setTimeout(r, 4000))

  // 1. Capture Ron as opponent on the runway (cinematic 3/4 angle)
  console.log('Capturing Ron Weasley as Opponent on runway...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame.instance;
        if (!game) return;
        const oPos = game.opponentBasePos;
        game.CAMERA_POSITIONS.cinematic.pos.set(oPos.x + 0.65, oPos.y + 0.60, oPos.z + 1.65);
        game.CAMERA_POSITIONS.cinematic.look.set(oPos.x, oPos.y + 0.45, oPos.z);
        game.camera.position.copy(game.CAMERA_POSITIONS.cinematic.pos);
        game.camera.fov = 40;
        game.camera.updateProjectionMatrix();
      })()
    `
  })

  await new Promise(r => setTimeout(r, 1200))

  const shotOppRon = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scripts/screenshot_ron_opponent_showcase.png', Buffer.from(shotOppRon.data, 'base64'))
  console.log('Saved: scripts/screenshot_ron_opponent_showcase.png')

  // 2. Capture Ron close-up front view (showing freckles, sweater, tie & badge in Great Hall lighting)
  console.log('Capturing Ron Weasley portrait close-up in Great Hall...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame.instance;
        if (!game) return;
        const oPos = game.opponentBasePos;
        game.CAMERA_POSITIONS.cinematic.pos.set(oPos.x, oPos.y + 0.95, oPos.z + 1.15);
        game.CAMERA_POSITIONS.cinematic.look.set(oPos.x, oPos.y + 0.90, oPos.z);
        game.camera.position.copy(game.CAMERA_POSITIONS.cinematic.pos);
        game.camera.fov = 32;
        game.camera.updateProjectionMatrix();
        
        // Hide HUD for pristine cinematic close-up
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.style.display = 'none';
      })()
    `
  })

  await new Promise(r => setTimeout(r, 1200))

  const shotCloseRon = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scripts/screenshot_ron_face_showcase.png', Buffer.from(shotCloseRon.data, 'base64'))
  console.log('Saved: scripts/screenshot_ron_face_showcase.png')

  // Copy best showcase images to artifact directory for presentation
  const artifactDir = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41';
  fs.copyFileSync('scripts/screenshot_ron_opponent_showcase.png', `${artifactDir}/ron_opponent_showcase.png`);
  fs.copyFileSync('scripts/screenshot_ron_face_showcase.png', `${artifactDir}/ron_face_showcase.png`);
  fs.copyFileSync('public/assets/dueling/avatar_ron.png', `${artifactDir}/avatar_ron.png`);

  ws.close()
}

run().catch(console.error)
