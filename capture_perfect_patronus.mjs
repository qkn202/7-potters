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

  if (!target.url.includes('5180')) {
    console.log('Navigating to http://127.0.0.1:5180...')
    await send('Page.navigate', { url: 'http://127.0.0.1:5180' })
    await new Promise(r => setTimeout(r, 4500))
  } else {
    console.log('Reloading page...')
    await send('Page.reload', { ignoreCache: true })
    await new Promise(r => setTimeout(r, 4000))
  }

  // Ensure game and 3D template are ready
  for (let attempt = 0; attempt < 10; attempt++) {
    const check = await send('Runtime.evaluate', {
      expression: '!!window.duelingGame?.instance?.patronusStag3DTemplate',
      returnByValue: true
    })
    if (check.result.value) {
      console.log('✨ 3D Patronus Stag Template is ready!')
      break
    }
    await new Promise(r => setTimeout(r, 500))
  }

  const cleanState = async (mode = 'cinematic') => {
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const inst = window.duelingGame?.instance;
          if (inst) {
            inst.cameraMode = '${mode}';
            inst.playerHp = 100;
            inst.enemyHp = 100;
            inst.updateHpBars();
            inst.aiDisabled = true;
            inst.matchOver = false;
            if (inst.projectiles) {
              inst.projectiles.forEach(p => {
                p.active = false;
                inst.scene.remove(p.mesh);
                if (p.groundScorchMesh) inst.scene.remove(p.groundScorchMesh);
              });
              inst.projectiles = [];
            }
          }
          document.querySelectorAll('.combat-number').forEach(e => e.remove());
          const flash = document.getElementById('impact-flash');
          if (flash) flash.classList.remove('flash-active');
          const banner = document.getElementById('match-banner');
          if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
          const modal = document.getElementById('end-match-modal');
          if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
        })()
      `
    })
    await new Promise(r => setTimeout(r, 300))
  }

  const captureFrame = async (filename) => {
    console.log(`Capturing ${filename}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/hogwarts-duel-3d/docs/screenshots/${filename}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`✅ Saved live in-game frame: ${outPath}`)
  }

  // --- 1. OVER-THE-SHOULDER CINEMATIC VIEW ---
  console.log('1. Setting up Over-the-shoulder Cinematic View...')
  await cleanState('cinematic')
  await send('Runtime.evaluate', {
    expression: `window.duelingGame?.instance?.castPlayerSpell('expecto_patronum', 100)`
  })
  // At speed 8.5, stag moves ~1.8m at 220ms, clearly emerging into full table view
  await new Promise(r => setTimeout(r, 220))
  await captureFrame('patronus_pure_stag_cinematic')

  await new Promise(r => setTimeout(r, 1200))

  // --- 2. SIDE SPECTATOR PROFILE (Complete pure stag body in leaping flight) ---
  console.log('2. Setting up Side Spectator View...')
  await cleanState('side')
  await send('Runtime.evaluate', {
    expression: `window.duelingGame?.instance?.castPlayerSpell('expecto_patronum', 100)`
  })
  // Allow stag to reach middle of the table (center profile)
  await new Promise(r => setTimeout(r, 120))
  await captureFrame('patronus_pure_stag_side')

  await new Promise(r => setTimeout(r, 1200))

  // --- 3. APPROACHING VOLDEMORT (Majestic Gallop down the table) ---
  console.log('3. Setting up Approaching Voldemort View...')
  await cleanState('cinematic')
  await send('Runtime.evaluate', {
    expression: `window.duelingGame?.instance?.castPlayerSpell('expecto_patronum', 100)`
  })
  await new Promise(r => setTimeout(r, 480))
  await captureFrame('patronus_pure_stag_approaching')

  ws.close()
  console.log('🎉 Done capturing pure 3D stag!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
