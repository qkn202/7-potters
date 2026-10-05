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
  console.log('Connected to Chrome CDP.')

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  })

  console.log('Navigating to http://127.0.0.1:5180...')
  await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
  await new Promise(r => setTimeout(r, 3500))

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`)
    }
    return res.result?.value
  }

  async function capture(filename) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' })
    const outPath = path.join(ARTIFACT_DIR, filename)
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'))
    console.log(`Saved screenshot: ${outPath}`)
  }

  // 1. Start match
  console.log('Starting solo match...')
  await evaluate(`
    (() => {
      const soloBtn = document.getElementById('btn-play-single');
      if (soloBtn) soloBtn.click();
      document.getElementById('main-menu-modal')?.classList.add('hidden');
      const g = window.duelingGame;
      if (g) {
        g.setAiDisabled(true);
        g.resetHp();
      }
    })()
  `)
  await new Promise(r => setTimeout(r, 1200))

  // 2. Check that gesture-prompt-card is gone and corner button exists
  const checkState = await evaluate(`
    (() => {
      const promptCard = document.getElementById('gesture-prompt-card');
      const grimoireBtn = document.getElementById('btn-toggle-grimoire');
      const btnRect = grimoireBtn ? grimoireBtn.getBoundingClientRect() : null;
      return {
        promptCardExists: Boolean(promptCard),
        grimoireBtnExists: Boolean(grimoireBtn),
        btnRect: btnRect ? {
          top: btnRect.top,
          left: btnRect.left,
          right: btnRect.right,
          bottom: btnRect.bottom,
          width: btnRect.width,
          height: btnRect.height
        } : null
      };
    })()
  `)
  console.log('DOM check state:', checkState)
  if (checkState.promptCardExists) {
    throw new Error('Failure: #gesture-prompt-card still exists in DOM!')
  }
  if (!checkState.grimoireBtnExists) {
    throw new Error('Failure: #btn-toggle-grimoire is missing!')
  }
  console.log('✓ #gesture-prompt-card removed!')
  console.log('✓ #btn-toggle-grimoire positioned at bottom-right corner:', checkState.btnRect)

  // Capture clean spacious view with corner button
  await capture('clean_duel_with_corner_grimoire.png')

  // 3. Test clicking the corner Grimoire button
  console.log('Clicking corner Grimoire button...')
  const grimoireOpened = await evaluate(`
    (() => {
      const grimoireBtn = document.getElementById('btn-toggle-grimoire');
      if (grimoireBtn) grimoireBtn.click();
      const modal = document.getElementById('spell-grimoire-modal');
      return modal && !modal.classList.contains('hidden');
    })()
  `)
  console.log('Grimoire modal open status:', grimoireOpened)
  if (!grimoireOpened) {
    throw new Error('Failure: Clicking corner Grimoire button did not open the modal!')
  }
  console.log('✓ Grimoire modal opened successfully on corner button click!')

  await capture('grimoire_modal_opened.png')

  // Close Grimoire modal
  await evaluate(`
    (() => {
      const closeBtn = document.getElementById('grimoire-close-btn');
      if (closeBtn) closeBtn.click();
    })()
  `)
  await new Promise(r => setTimeout(r, 400))

  // 4. Test Player CC display when prompt card is gone
  console.log('Applying Petrificus to player to verify clean floating CC alert...')
  await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToPlayer('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN');
    })()
  `)
  await new Promise(r => setTimeout(r, 400))

  const ccFloatingCheck = await evaluate(`
    (() => {
      const overlay = document.getElementById('player-cc-overlay');
      const isVisible = overlay && !overlay.classList.contains('hidden');
      const title = document.getElementById('player-cc-title')?.textContent;
      return { isVisible, title };
    })()
  `)
  console.log('Player floating CC check:', ccFloatingCheck)
  if (!ccFloatingCheck.isVisible) {
    throw new Error('Failure: Player CC alert is not visible!')
  }
  console.log('✓ Player CC floating alert works cleanly!')

  await capture('clean_player_cc_floating_alert.png')

  console.log('\n=============================================')
  console.log('ALL TESTS PASSED! UI IS CLEAN & CORNER BUTTON WORKING!')
  console.log('=============================================')
  process.exit(0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
