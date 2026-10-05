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

  console.log('Reloading page...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 2500))

  // 1. Select Ron Weasley on the Main Menu as Player
  console.log('Selecting Ron Weasley on Main Menu...')
  const selectRon = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const ronBtn = document.querySelector('#player-char-selector button[data-char="ron"]');
        if (ronBtn) {
          ronBtn.click();
          return { clicked: true, name: document.getElementById('label-player-char-name')?.innerText };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  })
  console.log('Select Ron result:', selectRon.result.value)

  await new Promise(r => setTimeout(r, 1000))

  // Capture Main Menu screenshot with Ron selected
  const shotMenu = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scripts/screenshot_menu_ron.png', Buffer.from(shotMenu.data, 'base64'))
  console.log('Saved: scripts/screenshot_menu_ron.png')

  // 2. Click Start Duel button
  console.log('Clicking Start Single Player Duel...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-play-single');
        if (btn) btn.click();
      })()
    `
  })

  // Wait for duel to start and Ron 3D model to load
  await new Promise(r => setTimeout(r, 4000))

  // Position camera to capture Ron Weasley on the dueling stage in glory
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame;
        if (!game) return;
        // Position camera to view player (Ron) in foreground
        const pPos = game.playerBasePos;
        game.camera.position.set(pPos.x - 0.45, pPos.y + 0.65, pPos.z - 1.25);
        game.camera.lookAt(pPos.x, pPos.y + 0.50, pPos.z);
        game.camera.fov = 45;
        game.camera.updateProjectionMatrix();
      })()
    `
  })

  await new Promise(r => setTimeout(r, 1000))

  const shotDuel = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scripts/screenshot_ron_dueling.png', Buffer.from(shotDuel.data, 'base64'))
  console.log('Saved: scripts/screenshot_ron_dueling.png')

  ws.close()
}

run().catch(console.error)
