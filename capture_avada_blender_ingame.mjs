import WebSocket from 'ws'
import fs from 'fs'

const ARTIFACT_DIR = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.url.includes('5180') && t.type === 'page')
  if (!target) {
    console.error('Target 5180 not found!')
    process.exit(1)
  }

  console.log('Connecting to Chrome CDP at:', target.webSocketDebuggerUrl)
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
  console.log('WebSocket connected!')

  // 1. Set 1920x1080 16:9 viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  })

  // 2. Reload page to ensure clean state and fresh assets
  console.log('Reloading page...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 2200))

  // 3. Wait until game and spectral skull texture are fully loaded
  console.log('Checking for game engine and spectral skull readiness...')
  let isReady = false
  for (let attempt = 0; attempt < 20; attempt++) {
    const checkRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const game = window.game || window.duelingGame?.instance
          if (!game) return { ready: false, reason: 'no_game' }
          const hasSkull = !!game.vfxTextures?.skullMist
          return { ready: true, hasSkull }
        })()
      `,
      returnByValue: true
    })
    const status = checkRes.result?.value
    console.log(`Attempt ${attempt + 1}:`, status)
    if (status?.ready && status?.hasSkull) {
      isReady = true
      break
    }
    await new Promise(r => setTimeout(r, 400))
  }

  // Clean UI banners/modals
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game && typeof game.resetHp === 'function') {
          game.resetHp()
        }
        if (window.duelingGame && typeof window.duelingGame.resetHp === 'function') {
          window.duelingGame.resetHp()
        }
        const banner = document.getElementById('match-banner')
        if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
        const modal = document.getElementById('end-match-modal')
        if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
      })()
    `
  })

  const captureFrame = async (filename) => {
    await new Promise(r => setTimeout(r, 120))
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `${ARTIFACT_DIR}/${filename}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`📸 Saved: ${outPath} (${buf.length} bytes)`)
  }

  // Cast Avada Kedavra!
  console.log('⚡ Casting Avada Kedavra with deep emerald lighting storm & 3D Death Mark Phantom...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game) {
          game.isPaused = false
          game.cameraMode = 'cinematic'
          if (typeof game.castPlayerSpell === 'function') {
            game.castPlayerSpell('avadakedavra', 99)
          }
        }
      })()
    `
  })

  // Wait 650ms into the cast (lightning storm and 3D Death Phantom fully summoned)
  await new Promise(r => setTimeout(r, 650))

  // Freeze the frame mid-lightning storm!
  console.log('❄️ Freezing frame mid-lightning storm...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game) {
          game.isPaused = true
        }
      })()
    `
  })

  // 1. Capture Cinematic Over-the-shoulder POV (Clean dark table, green beam piercing skull)
  console.log('📸 Capturing Frame 1: Elevated Cinematic Perspective...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game && game.camera) {
          game.camera.position.set(-1.25, 0.45, 3.20)
          game.camera.lookAt(0.0, 0.05, 0.0)
          game.camera.updateMatrixWorld(true)
          if (game.composer) game.composer.render()
        }
      })()
    `
  })
  await captureFrame('avada_blender_cinematic')

  // 2. Capture Broadcast Side View
  console.log('📸 Capturing Frame 2: Side Broadcast Perspective...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game && game.camera) {
          game.camera.position.set(-4.2, 0.35, 0.0)
          game.camera.lookAt(0, 0.02, 0.0)
          game.camera.updateMatrixWorld(true)
          if (game.composer) game.composer.render()
        }
      })()
    `
  })
  await captureFrame('avada_blender_side')

  // 3. Capture Low-Angle Cinematic Hero View (Wand-level looking up at beam piercing skull)
  console.log('📸 Capturing Frame 3: Low-Angle Cinematic Hero View...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game && game.camera) {
          game.camera.position.set(-0.45, -0.28, 2.30)
          game.camera.lookAt(0.0, 0.15, 0.0)
          game.camera.updateMatrixWorld(true)
          if (game.composer) game.composer.render()
        }
      })()
    `
  })
  await captureFrame('avada_blender_low_angle')

  // 4. Capture Spectral Death Phantom Close-Up
  console.log('📸 Capturing Frame 4: Spectral Death Phantom Close-up...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game && game.camera && game.scene) {
          let skullPos = null
          if (game.projectiles && game.projectiles.length > 0) {
            const p = game.projectiles[0]
            if (p.skullSprite) {
              skullPos = new THREE.Vector3()
              p.skullSprite.getWorldPosition(skullPos)
            }
          }
          if (skullPos) {
            game.camera.position.set(skullPos.x - 1.15, skullPos.y + 0.10, skullPos.z + 1.55)
            game.camera.lookAt(skullPos.x, skullPos.y, skullPos.z)
          } else {
            game.camera.position.set(-1.15, 0.25, 1.55)
            game.camera.lookAt(0, 0.02, 0)
          }
          game.camera.updateMatrixWorld(true)
          if (game.composer) game.composer.render()
        }
      })()
    `
  })
  await captureFrame('avada_blender_phantom_closeup')

  // 5. Unpause and let curse travel to impact detonation
  console.log('💥 Unpausing to reach impact detonation...')
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game) {
          game.camera.position.set(-0.85, 0.56, 3.30)
          game.camera.lookAt(-0.06, 0.02, -3.20)
          game.isPaused = false
        }
      })()
    `
  })

  // Wait until beam finishes (~2150ms remaining out of 2800ms)
  await new Promise(r => setTimeout(r, 2180))

  // Freeze at impact
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game) {
          game.isPaused = true
          if (game.composer) game.composer.render()
        }
      })()
    `
  })
  console.log('📸 Capturing Frame 5: Impact Detonation...')
  await captureFrame('avada_blender_impact')

  // Unpause game
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const game = window.game || window.duelingGame?.instance
        if (game) {
          game.isPaused = false
        }
      })()
    `
  })

  ws.close()
  console.log('🎉 All Avada Kedavra multicam captures successfully rendered and saved!')
}

run().catch(console.error)
