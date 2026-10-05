import WebSocket from 'ws'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41'

async function run() {
  console.log('Connecting to Chrome CDP on port 9222...')
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
  await new Promise(r => setTimeout(r, 3200))

  async function snap(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const outPath = path.join(ARTIFACT_DIR, filename)
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'))
    console.log(`Saved screenshot: ${outPath}`)
  }

  // Disable AI and reset state
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        if (!g) return;
        g.aiDisabled = true;
        g.matchOver = false;
        g.playerHp = 100;
        g.enemyHp = 100;
        g.updateHpBars();
        if (g.enemyTelegraphTime) g.enemyTelegraphTime = 999999;
      })()
    `
  })
  await new Promise(r => setTimeout(r, 500))

  // Camera settings helpers
  async function setMacroCam() {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const g = window.game;
          g.CAMERA_POSITIONS.cinematic.pos.set(-0.55, 0.48, 1.55);
          g.CAMERA_POSITIONS.cinematic.look.set(-1.02, 0.36, 0.85);
          g.camera.position.set(-0.55, 0.48, 1.55);
          g.camera.lookAt(-1.02, 0.36, 0.85);
        })()
      `
    })
  }

  async function setDuelCam() {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const g = window.game;
          g.CAMERA_POSITIONS.cinematic.pos.set(-1.85, 0.28, 3.65);
          g.CAMERA_POSITIONS.cinematic.look.set(0.18, -0.05, -3.20);
          g.camera.position.set(-1.85, 0.28, 3.65);
          g.camera.lookAt(0.18, -0.05, -3.20);
        })()
      `
    })
  }

  // --- 1. PETRICUS TOTALUS ---
  console.log('Capturing Petrificus Totalus wand macro & duel...')
  await setMacroCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('petrificus', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_petrificus_macro.png')

  await new Promise(r => setTimeout(r, 1200))
  await setDuelCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('petrificus', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_petrificus_duel.png')

  // --- 2. STUPEFY ---
  console.log('Capturing Stupefy wand macro & duel...')
  await new Promise(r => setTimeout(r, 1200))
  await setMacroCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('stupefy', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_stupefy_macro.png')

  await new Promise(r => setTimeout(r, 1200))
  await setDuelCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('stupefy', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_stupefy_duel.png')

  // --- 3. OBLIVIATE ---
  console.log('Capturing Obliviate wand macro & duel...')
  await new Promise(r => setTimeout(r, 1200))
  await setMacroCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('obliviate', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_obliviate_macro.png')

  await new Promise(r => setTimeout(r, 1200))
  await setDuelCam()
  await new Promise(r => setTimeout(r, 300))
  await send('Runtime.evaluate', {
    expression: `window.game.castPlayerSpell('obliviate', 100);`
  })
  await new Promise(r => setTimeout(r, 130))
  await snap('wand_vfx_obliviate_duel.png')

  // Reset camera settings back
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        g.CAMERA_POSITIONS.cinematic.pos.set(-1.20, 0.18, 3.85);
        g.CAMERA_POSITIONS.cinematic.look.set(0.25, -0.08, -3.45);
      })()
    `
  })

  console.log('Finished capturing all wand CC VFX images!')
  ws.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
