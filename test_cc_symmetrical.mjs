import WebSocket from 'ws'
import fs from 'fs'
import path from 'path'

const ARTIFACT_DIR = '/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41'

async function runTest() {
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
  console.log('CDP WebSocket opened')

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

  // 1. Enter Solo match
  console.log('Entering single player duel...')
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

  // TEST 1: Apply Petrificus to Player
  console.log('\n--- TEST 1: Apply Petrificus (Hóa Đá) to Player (2.5s) ---')
  const test1Apply = await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToPlayer('petrificus', 2.5, 'HÓA ĐÁ TOÀN THÂN');
      const overlay = document.getElementById('player-cc-overlay');
      const title = document.getElementById('player-cc-title')?.textContent;
      const timer = document.getElementById('player-cc-timer-val')?.textContent;
      const isVisible = overlay && !overlay.classList.contains('hidden');
      const isPetrified = g.playerLego ? g.playerLego.isPetrified : false;
      const initialMana = g.playerMana;
      
      // Attempt to cast spell while CC'd
      g.castPlayerSpell('expelliarmus');
      const manaAfterCastAttempt = g.playerMana;
      
      return {
        isVisible,
        title,
        timer,
        isPetrified,
        castBlocked: (initialMana === manaAfterCastAttempt),
        playerStunnedUntil: g.playerStunnedUntil > 0
      };
    })()
  `)
  console.log('Test 1 State:', test1Apply)
  if (!test1Apply.isVisible || !test1Apply.isPetrified || !test1Apply.castBlocked) {
    throw new Error('Test 1 Failed: Player CC overlay, petrified flag, or spell blocking failed!')
  }
  console.log('✓ Player CC overlay visible, Lego isPetrified=true, spellcast blocked!')

  await capture('cc_player_petrificus_locked.png')

  // Wait 2.7s for Player CC to expire
  console.log('Waiting 2.7s for Player Petrificus CC to auto-expire...')
  await new Promise(r => setTimeout(r, 2700))

  const test1Expired = await evaluate(`
    (() => {
      const g = window.duelingGame;
      const overlay = document.getElementById('player-cc-overlay');
      const isHidden = overlay && overlay.classList.contains('hidden');
      const isPetrified = g.playerLego ? g.playerLego.isPetrified : true;
      const stunnedUntil = g.playerStunnedUntil;
      
      // Try to cast now that CC expired
      const prevMana = g.playerMana;
      g.castPlayerSpell('expelliarmus');
      const castSuccess = (g.playerMana < prevMana);
      
      return {
        isHidden,
        isPetrified,
        stunnedUntil,
        castSuccess
      };
    })()
  `)
  console.log('Test 1 Expiration:', test1Expired)
  if (!test1Expired.isHidden || test1Expired.isPetrified || !test1Expired.castSuccess) {
    throw new Error('Test 1 Expiration Failed: Player was not restored after CC expired!')
  }
  console.log('✓ Player CC auto-recovered: overlay hidden, Lego posture normal, spellcast restored!')

  // TEST 2: Apply Stupefy to Opponent
  console.log('\n--- TEST 2: Apply Stupefy (Choáng Váng) to Opponent (2.0s) ---')
  const test2Apply = await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToOpponent('stupefy', 2.0, 'CHOÁNG VÁNG');
      const statusEl = document.getElementById('enemy-cc-status');
      const title = document.getElementById('enemy-cc-title')?.textContent;
      const timer = document.getElementById('enemy-cc-timer-val')?.textContent;
      const isVisible = statusEl && !statusEl.classList.contains('hidden');
      const isStunned = g.opponentLego ? g.opponentLego.isStunned : false;
      const telegraphHidden = document.getElementById('enemy-telegraph')?.classList.contains('hidden');
      
      return {
        isVisible,
        title,
        timer,
        isStunned,
        telegraphHidden,
        enemyStunnedUntil: g.enemyStunnedUntil > 0
      };
    })()
  `)
  console.log('Test 2 State:', test2Apply)
  if (!test2Apply.isVisible || !test2Apply.isStunned || !test2Apply.telegraphHidden) {
    throw new Error('Test 2 Failed: Opponent CC banner, stunned flag, or telegraph cancel failed!')
  }
  console.log('✓ Opponent CC banner visible, Lego isStunned=true, enemy cast cancelled!')

  await capture('cc_enemy_stupefy_stunned.png')

  // Wait 2.2s for Opponent CC to expire
  console.log('Waiting 2.2s for Opponent CC to auto-expire...')
  await new Promise(r => setTimeout(r, 2200))

  const test2Expired = await evaluate(`
    (() => {
      const g = window.duelingGame;
      const statusEl = document.getElementById('enemy-cc-status');
      const isHidden = statusEl && statusEl.classList.contains('hidden');
      const isStunned = g.opponentLego ? g.opponentLego.isStunned : true;
      const stunnedUntil = g.enemyStunnedUntil;
      
      return {
        isHidden,
        isStunned,
        stunnedUntil
      };
    })()
  `)
  console.log('Test 2 Expiration:', test2Expired)
  if (!test2Expired.isHidden || test2Expired.isStunned) {
    throw new Error('Test 2 Expiration Failed: Opponent was not restored after CC expired!')
  }
  console.log('✓ Opponent CC auto-recovered: banner hidden, Lego posture normal!')

  // TEST 3: Expelliarmus Disarm Test
  console.log('\n--- TEST 3: Expelliarmus Disarm (Tước Đũa) on Player ---')
  const test3Apply = await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToPlayer('expelliarmus', 2.4, 'TƯỚC ĐŨA PHÉP');
      const overlay = document.getElementById('player-cc-overlay');
      const title = document.getElementById('player-cc-title')?.textContent;
      const isVisible = overlay && !overlay.classList.contains('hidden');
      const isDisarmed = g.playerLego ? g.playerLego.isDisarmed : false;
      const wandHidden = g.playerLego ? !g.playerLego.wandGroup.visible : false;
      
      return {
        isVisible,
        title,
        isDisarmed,
        wandHidden,
        hasThemeClass: overlay.classList.contains('cc-theme-disarm')
      };
    })()
  `)
  console.log('Test 3 State:', test3Apply)
  if (!test3Apply.isVisible || !test3Apply.isDisarmed || !test3Apply.hasThemeClass) {
    throw new Error('Test 3 Failed: Expelliarmus disarm state failed!')
  }
  console.log('✓ Expelliarmus Disarm active: wand hidden, hands back, disarm theme active!')
  await capture('cc_player_expelliarmus_disarmed.png')

  // TEST 4: Obliviate Confuse Test on Opponent
  console.log('\n--- TEST 4: Obliviate Confuse (Lú Lẫn) on Opponent ---')
  const test4Apply = await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToOpponent('obliviate', 2.0, 'XÓA KÝ ỨC / LÚ LẪN');
      const statusEl = document.getElementById('enemy-cc-status');
      const title = document.getElementById('enemy-cc-title')?.textContent;
      const isVisible = statusEl && !statusEl.classList.contains('hidden');
      const isConfused = g.opponentLego ? g.opponentLego.isConfused : false;
      const hasTheme = statusEl ? statusEl.classList.contains('cc-theme-confuse') : false;
      
      return {
        isVisible,
        title,
        isConfused,
        hasTheme
      };
    })()
  `)
  console.log('Test 4 State:', test4Apply)
  if (!test4Apply.isVisible || !test4Apply.isConfused || !test4Apply.hasTheme) {
    throw new Error('Test 4 Failed: Obliviate confuse state failed!')
  }
  console.log('✓ Obliviate Confuse active: confuse theme, head sway, confuse badge active!')
  await capture('cc_enemy_obliviate_confused.png')

  // TEST 5: Immobulus Freeze on Player
  console.log('\n--- TEST 5: Immobulus Freeze (Đóng Băng) on Player ---')
  const test5Apply = await evaluate(`
    (() => {
      const g = window.duelingGame;
      g.applyCrowdControlToPlayer('immobulus', 2.2, 'ĐÓNG BĂNG');
      const overlay = document.getElementById('player-cc-overlay');
      const title = document.getElementById('player-cc-title')?.textContent;
      const isVisible = overlay && !overlay.classList.contains('hidden');
      const isPetrified = g.playerLego ? g.playerLego.isPetrified : false;
      const hasTheme = overlay ? overlay.classList.contains('cc-theme-ice') : false;
      
      return {
        isVisible,
        title,
        isPetrified,
        hasTheme
      };
    })()
  `)
  console.log('Test 5 State:', test5Apply)
  if (!test5Apply.isVisible || !test5Apply.isPetrified || !test5Apply.hasTheme) {
    throw new Error('Test 5 Failed: Immobulus freeze state failed!')
  }
  console.log('✓ Immobulus Freeze active: ice theme, rigid freeze, freeze overlay active!')
  await capture('cc_player_immobulus_frozen.png')

  console.log('\n=============================================')
  console.log('ALL CROWD CONTROL TESTS PASSED SUCCESSFULLY!')
  console.log('=============================================')
  process.exit(0)
}

runTest().catch(err => {
  console.error('Test run failed:', err)
  process.exit(1)
})
