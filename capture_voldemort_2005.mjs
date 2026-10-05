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

  console.log('Reloading game page at http://127.0.0.1:5180...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 4000))

  // Wait for game instance to be ready
  for (let attempt = 0; attempt < 10; attempt++) {
    const check = await send('Runtime.evaluate', {
      expression: '!!window.duelingGame && !!window.duelingGame.opponentGroup',
      returnByValue: true
    })
    if (check.result.value) {
      console.log('Dueling game ready with Voldemort!')
      break
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  // 1. Capture Close-Up Portrait of 2005 Voldemort Head & Poncho Cloak
  console.log('Setting camera for close-up portrait of 2005 Lego Voldemort...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame;
        if (!game) return;
        // Position camera directly in front of Voldemort's face and upper torso
        const vPos = game.opponentBasePos;
        game.camera.position.set(vPos.x, vPos.y + 0.65, vPos.z + 1.15);
        game.camera.lookAt(vPos.x, vPos.y + 0.60, vPos.z);
        game.camera.fov = 40;
        game.camera.updateProjectionMatrix();
        
        // Hide HUD for pristine cinematic capture
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.style.display = 'none';
      })()
    `
  })
  await new Promise(r => setTimeout(r, 1200))

  const shot1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/voldemort_2005_ingame_portrait.png', Buffer.from(shot1.data, 'base64'))
  console.log('Saved /Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/voldemort_2005_ingame_portrait.png')

  // 2. Capture Full-Body Dueling Stance of 2005 Voldemort (Showing Poncho Cloak Shreds, White Hands, Black Wand)
  console.log('Setting camera for full-body dueling stance of 2005 Lego Voldemort...')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame;
        if (!game) return;
        const vPos = game.opponentBasePos;
        game.camera.position.set(vPos.x + 0.95, vPos.y + 0.55, vPos.z + 1.85);
        game.camera.lookAt(vPos.x, vPos.y + 0.35, vPos.z);
        game.camera.fov = 45;
        game.camera.updateProjectionMatrix();
      })()
    `
  })
  await new Promise(r => setTimeout(r, 1200))

  const shot2 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/voldemort_2005_ingame_action.png', Buffer.from(shot2.data, 'base64'))
  console.log('Saved /Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/voldemort_2005_ingame_action.png')

  // 3. Restore Default Duel Camera and HUD
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const game = window.duelingGame;
        if (!game) return;
        game.camera.fov = 52;
        game.camera.updateProjectionMatrix();
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.style.display = 'block';
      })()
    `
  })

  console.log('Finished capturing 2005 Voldemort in-game screenshots!')
  ws.close()
}

run().catch(console.error)
