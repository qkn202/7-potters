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
  await new Promise(r => setTimeout(r, 4000))

  // Ensure game is initialized & reset
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        if (!g) return;
        g.aiDisabled = true;
        g.matchOver = false;
        g.playerHp = 100;
        g.enemyHp = 100;
        const modal = document.getElementById('game-over-modal');
        if (modal) modal.style.display = 'none';
      })();
    `,
  })

  async function capture(filename) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' })
    const outPath = path.join(ARTIFACT_DIR, filename)
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'))
    console.log(`Saved screenshot: ${outPath}`)
  }

  // =========================================================================
  // 1. PETRIFICUS TOTALUS (Full Body-Bind Charm)
  // =========================================================================
  console.log('\n--- 1. Testing Petrificus Totalus (Target-Only, Zero Projectile) ---')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        // Frame Voldemort full body from table seal to head
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x + 0.35, v.y + 0.95, v.z + 2.45);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 0.70, v.z);
        g.camera.position.set(v.x + 0.35, v.y + 0.95, v.z + 2.45);
        g.camera.lookAt(v.x, v.y + 0.70, v.z);
        g.camera.fov = 42;
        g.camera.updateProjectionMatrix();

        // Cast Petrificus Totalus
        g.castPlayerSpell('petrificus', 100);
      })();
    `,
  })

  // Wait 400ms for bands to clamp and ground seal to glow
  await new Promise(r => setTimeout(r, 450))
  await capture('petrificus_totalus_ingame_sketch.png')

  // Close-up on the runic marble bands and rigid stance
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x - 0.25, v.y + 0.85, v.z + 1.70);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 0.75, v.z);
        g.camera.position.set(v.x - 0.25, v.y + 0.85, v.z + 1.70);
        g.camera.lookAt(v.x, v.y + 0.75, v.z);
        g.camera.fov = 38;
        g.camera.updateProjectionMatrix();
      })();
    `,
  })
  await new Promise(r => setTimeout(r, 200))
  await capture('petrificus_close_up.png')

  console.log('Waiting for Petrificus to clear...')
  await new Promise(r => setTimeout(r, 3200))

  // Reset health & states for next test
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        g.playerHp = 100;
        g.enemyHp = 100;
        g.matchOver = false;
        g.opponentLego.setPetrified(false);
      })();
    `,
  })

  // =========================================================================
  // 2. STUPEFY (Stunning Spell)
  // =========================================================================
  console.log('\n--- 2. Testing Stupefy (Target-Only, Zero Projectile) ---')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        // Frame Voldemort chest, head, and overhead spinning halo of 5 golden stars
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x - 0.25, v.y + 1.15, v.z + 2.30);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 0.95, v.z);
        g.camera.position.set(v.x - 0.25, v.y + 1.15, v.z + 2.30);
        g.camera.lookAt(v.x, v.y + 0.95, v.z);
        g.camera.fov = 40;
        g.camera.updateProjectionMatrix();

        // Cast Stupefy
        g.castPlayerSpell('stupefy', 100);
      })();
    `,
  })

  // Wait 400ms for concussive blast and orbiting dizzy stars to spin
  await new Promise(r => setTimeout(r, 450))
  await capture('stupefy_ingame_sketch.png')

  // Close-up on Voldemort head and spinning 5-star golden halo
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x, v.y + 1.30, v.z + 1.45);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 1.20, v.z);
        g.camera.position.set(v.x, v.y + 1.30, v.z + 1.45);
        g.camera.lookAt(v.x, v.y + 1.20, v.z);
        g.camera.fov = 36;
        g.camera.updateProjectionMatrix();
      })();
    `,
  })
  await new Promise(r => setTimeout(r, 200))
  await capture('stupefy_stars_close_up.png')

  console.log('Waiting for Stupefy to clear...')
  await new Promise(r => setTimeout(r, 2500))

  // Reset health & states for next test
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        g.playerHp = 100;
        g.enemyHp = 100;
        g.matchOver = false;
        g.opponentLego.setStunned(false);
      })();
    `,
  })

  // =========================================================================
  // 3. OBLIVIATE (Memory Charm / Amnesia)
  // =========================================================================
  console.log('\n--- 3. Testing Obliviate (Target-Only, Zero Projectile) ---')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        // Frame Voldemort head, temples, and memory vortex
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x + 0.28, v.y + 1.20, v.z + 2.25);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 1.05, v.z);
        g.camera.position.set(v.x + 0.28, v.y + 1.20, v.z + 2.25);
        g.camera.lookAt(v.x, v.y + 1.05, v.z);
        g.camera.fov = 39;
        g.camera.updateProjectionMatrix();

        // Cast Obliviate
        g.castPlayerSpell('obliviate', 100);
      })();
    `,
  })

  // Wait 600ms for memory filaments to undulate upwards and memory vortex to spin
  await new Promise(r => setTimeout(r, 650))
  await capture('obliviate_ingame_sketch.png')

  // Close-up on Pensieve thought vortex & undulating silvery memory ribbons
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const v = g.opponentBasePos;
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(v.x - 0.15, v.y + 1.30, v.z + 1.45);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(v.x, v.y + 1.22, v.z);
        g.camera.position.set(v.x - 0.15, v.y + 1.30, v.z + 1.45);
        g.camera.lookAt(v.x, v.y + 1.22, v.z);
        g.camera.fov = 35;
        g.camera.updateProjectionMatrix();
      })();
    `,
  })
  await new Promise(r => setTimeout(r, 200))
  await capture('obliviate_pensieve_close_up.png')

  // =========================================================================
  // 4. DUEL PERSPECTIVE (Harry foreground -> Voldemort afflicted)
  // =========================================================================
  console.log('\n--- 4. Capturing Full Duel Perspective ---')
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        g.playerHp = 100;
        g.enemyHp = 100;
        g.matchOver = false;
        
        // Restore default duel camera settings
        g.CAMERA_POSITIONS[g.cameraMode].pos.set(-1.20, 0.18, 3.85);
        g.CAMERA_POSITIONS[g.cameraMode].look.set(0.12, 0.12, -3.45);
        g.camera.position.set(-1.20, 0.18, 3.85);
        g.camera.lookAt(0.12, 0.12, -3.45);
        g.camera.fov = 52;
        g.camera.updateProjectionMatrix();
        
        // Cast Petrificus Totalus from Harry to show full duel context (Notice: ZERO projectile flying!)
        g.castPlayerSpell('petrificus', 100);
      })();
    `,
  })
  await new Promise(r => setTimeout(r, 450))
  await capture('cc_spells_duel_perspective.png')

  console.log('\nAll in-game CC spell sketches captured successfully!')
  ws.close()
  process.exit(0)
}

run().catch(err => {
  console.error('Error during capture:', err)
  process.exit(1)
})
