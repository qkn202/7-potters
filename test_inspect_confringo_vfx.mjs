// test_inspect_confringo_vfx.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectToChromeDebugger() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await targetsRes.json()
  const target = targets.find((t) => t.type === 'page' && t.url.includes('5180')) || targets[0]
  if (!target) throw new Error('No valid browser target found')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 1
  const pending = new Map()

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }
  })

  await new Promise((r) => ws.on('open', r))

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails))
    }
    return res.result?.value
  }

  async function captureScreenshot(name) {
    const res = await send('Page.captureScreenshot', { format: 'png', quality: 90 })
    const buf = Buffer.from(res.data, 'base64')
    const path = `/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/${name}.png`
    fs.writeFileSync(path, buf)
    console.log(`Saved screenshot: ${path} (${buf.length} bytes)`)
    return path
  }

  return { ws, send, evaluate, captureScreenshot }
}

async function run() {
  // Start headless Chrome if not already running
  try {
    await fetch('http://127.0.0.1:9222/json')
  } catch (e) {
    console.log('Starting headless Chrome...')
    const { spawn } = await import('node:child_process')
    spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--user-data-dir=/tmp/chrome-confringo-vfx',
      '--disable-gpu',
      'http://127.0.0.1:5180',
    ], { detached: true, stdio: 'ignore' }).unref()
    await new Promise((r) => setTimeout(r, 2000))
  }

  const { ws, send, evaluate, captureScreenshot } = await connectToChromeDebugger()
  console.log('Connected to Chrome. Setting viewport and reloading...')

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  })

  await send('Page.reload', { ignoreCache: true })
  await new Promise((r) => setTimeout(r, 3500))

  console.log('Clicking Single Player match button...')
  await evaluate(`
    (() => {
      const btn = document.getElementById('btn-play-single');
      if (btn) btn.click();
      const menu = document.getElementById('main-menu-overlay');
      if (menu) { menu.style.display = 'none'; menu.classList.add('hidden'); }
    })()
  `)

  await new Promise((r) => setTimeout(r, 1200))

  // Disable AI and ensure full mana
  await evaluate(`
    (() => {
      if (window.duelingGame) {
        window.duelingGame.aiDisabled = true;
        window.duelingGame.playerMana = 100;
        window.duelingGame.playerHp = 100;
        window.duelingGame.enemyHp = 100;
      }
      const banner = document.getElementById('match-banner');
      if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
    })()
  `)

  await new Promise((r) => setTimeout(r, 400))

  // 1. Cast Confringo and pause when projectile is at mid-table (progress ~0.45)
  console.log('Casting Confringo and waiting for mid-flight position...')
  await evaluate(`
    new Promise((resolve) => {
      window.game.castPlayerSpell('confringo', 100);
      const checkInterval = setInterval(() => {
        const proj = window.game.projectiles.find(p => p.spell.name === 'confringo' && p.active);
        if (proj && proj.progress >= 0.40) {
          clearInterval(checkInterval);
          window.game.isPaused = true;
          resolve();
        }
      }, 8);
    })
  `)
  await captureScreenshot('confringo_flight_showcase')

  // 2. Unpause and let it travel to impact detonation
  console.log('Resuming to capture impact detonation...')
  await evaluate(`
    new Promise((resolve) => {
      window.game.isPaused = false;
      const checkHit = setInterval(() => {
        const proj = window.game.projectiles.find(p => p.spell.name === 'confringo' && p.active);
        if (!proj) {
          clearInterval(checkHit);
          // Allow 140ms for the cauliflower explosion to blossom fully
          setTimeout(() => {
            window.game.isPaused = true;
            resolve();
          }, 140);
        }
      }, 8);
    })
  `)
  await captureScreenshot('confringo_impact_showcase')

  // 3. Unpause and let smoke plume rise and table scorch settle
  console.log('Resuming to capture rising smoke and charred table scorch...')
  await evaluate(`
    new Promise((resolve) => {
      window.game.isPaused = false;
      setTimeout(() => {
        window.game.isPaused = true;
        resolve();
      }, 550);
    })
  `)
  await captureScreenshot('confringo_smoke_showcase')

  await evaluate('window.game.isPaused = false')

  ws.close()
  console.log('Inspection capture completed successfully!')
}

run().catch((err) => {
  console.error('Error during capture:', err)
  process.exit(1)
})
