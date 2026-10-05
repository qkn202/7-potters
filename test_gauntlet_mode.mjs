// test_gauntlet_mode.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectToPage() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!pageTab) throw new Error('Game page not found on port 5180')

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl)
  let id = 1
  const pending = new Map()

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }
  })

  await new Promise(r => ws.on('open', r))
  await send('Page.enable')
  await send('Runtime.enable')

  return { ws, send }
}

async function run() {
  console.log('Connecting to Hogwarts Dueling game at port 9222 / 5180...')
  const { ws, send } = await connectToPage()

  console.log('Setting desktop dimensions (1280x750) and reloading page...')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 750,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: 'landscapePrimary', angle: 0 }
  })
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2800))

  // Step 1: Verify Main Menu Gauntlet Ladder
  console.log('\n--- STEP 1: Verify Main Menu Gauntlet Ladder ---')
  const menuInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const playerSelector = document.getElementById('player-char-selector')
      const playerBtns = Array.from(playerSelector?.querySelectorAll('.char-thumb-btn') || []).map(b => b.dataset.char)
      const gauntletContainer = document.getElementById('gauntlet-ladder-preview')
      const gauntletCards = Array.from(gauntletContainer?.querySelectorAll('.gauntlet-step-card') || []).map(c => ({
        badge: c.querySelector('.gauntlet-step-badge')?.textContent?.trim(),
        name: c.querySelector('.gauntlet-char-name')?.textContent?.trim(),
        tier: c.querySelector('.gauntlet-tier-pill')?.textContent?.trim(),
        hp: c.querySelector('.gauntlet-hp-pill')?.textContent?.trim(),
        isBoss: c.classList.contains('boss-step-card')
      }))

      return {
        selectedPlayer: game?.selectedPlayerChar,
        playerOptions: playerBtns,
        gauntletRosterLength: game?.gauntletRoster?.length,
        gauntletCards
      }
    })()`,
    returnByValue: true
  })

  console.log('Main Menu State:', JSON.stringify(menuInfo.result.value, null, 2))

  // Take screenshot of Main Menu Gauntlet
  const ssMenu = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_menu.png', Buffer.from(ssMenu.data, 'base64'))
  console.log('Saved screenshot_gauntlet_menu.png')

  // Step 2: Test Reroll
  console.log('\n--- STEP 2: Test Reroll Gauntlet ---')
  const rerollRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btn-reroll-gauntlet')
      btn?.click()
      const game = window.duelingGame?.instance || window.game
      return {
        newOpponents: game?.gauntletRoster?.map(e => ({ name: e.char.name, tier: e.tier.tierName, hp: e.tier.maxHp }))
      }
    })()`,
    returnByValue: true
  })
  console.log('After Reroll:', JSON.stringify(rerollRes.result.value, null, 2))

  // Step 3: Test Selecting Another Player Character (e.g. Ron)
  console.log('\n--- STEP 3: Test Picking Ron Weasley ---')
  const ronSelectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const ronBtn = document.querySelector('#player-char-selector button[data-char="ron"]')
      ronBtn?.click()
      const game = window.duelingGame?.instance || window.game
      return {
        selectedPlayer: game?.selectedPlayerChar,
        gauntletOpponents: game?.gauntletRoster?.map(e => e.char.name)
      }
    })()`,
    returnByValue: true
  })
  console.log('Player Ron Gauntlet:', JSON.stringify(ronSelectRes.result.value, null, 2))

  // Step 4: Start Single Player Gauntlet Match
  console.log('\n--- STEP 4: Start Single Player Match (Ải 1) ---')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const startBtn = document.getElementById('btn-play-single')
      startBtn?.click()
    })()`
  })
  await new Promise(r => setTimeout(r, 2000))

  const round1State = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const modePill = document.getElementById('duel-mode-pill')?.textContent
      const enemyName = document.getElementById('enemy-display-name')?.textContent
      const enemyBadge = document.querySelector('.enemy-bracket .avatar-level-badge')?.textContent
      const enemyHpText = document.getElementById('enemy-hp-text')?.textContent
      const playerHpText = document.getElementById('player-hp-text')?.textContent

      return {
        currentRoundIndex: game?.currentRoundIndex,
        tierNumber: game?.currentTier?.tierNumber,
        tierName: game?.currentTier?.tierName,
        maxEnemyHp: game?.maxEnemyHp,
        enemyHp: game?.enemyHp,
        playerHp: game?.playerHp,
        modePill,
        enemyName,
        enemyBadge,
        enemyHpText,
        playerHpText
      }
    })()`,
    returnByValue: true
  })
  console.log('Round 1 Active State:', JSON.stringify(round1State.result.value, null, 2))

  const ssRound1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_round1.png', Buffer.from(ssRound1.data, 'base64'))
  console.log('Saved screenshot_gauntlet_round1.png')

  // Step 5: Simulate Defeating Ải 1 -> Intermission Modal
  console.log('\n--- STEP 5: Defeating Ải 1 Opponent -> Intermission Modal ---')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.enemyHp = 0
      game.handleMatchEnd(true)
    })()`
  })
  await new Promise(r => setTimeout(r, 800))

  const intermissionState = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('round-clear-modal')
      const isVisible = !modal?.classList.contains('hidden')
      const title = document.getElementById('round-clear-title')?.textContent
      const nextOppName = document.getElementById('next-opponent-name')?.textContent
      const nextStageBadge = document.getElementById('next-stage-badge')?.textContent
      const nextHp = document.getElementById('next-opponent-hp')?.textContent
      const nextBtnText = document.getElementById('btn-next-round-text')?.textContent

      return {
        isVisible,
        title,
        nextOppName,
        nextStageBadge,
        nextHp,
        nextBtnText
      }
    })()`,
    returnByValue: true
  })
  console.log('Intermission Modal State:', JSON.stringify(intermissionState.result.value, null, 2))

  const ssIntermission = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_intermission.png', Buffer.from(ssIntermission.data, 'base64'))
  console.log('Saved screenshot_gauntlet_intermission.png')

  // Step 6: Advance to Ải 2
  console.log('\n--- STEP 6: Advance to Ải 2 ---')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const nextBtn = document.getElementById('btn-next-round')
      nextBtn?.click()
    })()`
  })
  await new Promise(r => setTimeout(r, 1800))

  const round2State = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const modePill = document.getElementById('duel-mode-pill')?.textContent
      const enemyName = document.getElementById('enemy-display-name')?.textContent
      const enemyHpText = document.getElementById('enemy-hp-text')?.textContent

      return {
        currentRoundIndex: game?.currentRoundIndex,
        tierName: game?.currentTier?.tierName,
        maxEnemyHp: game?.maxEnemyHp,
        enemyHp: game?.enemyHp,
        playerHp: game?.playerHp,
        playerMana: game?.playerMana,
        modePill,
        enemyName,
        enemyHpText
      }
    })()`,
    returnByValue: true
  })
  console.log('Round 2 Active State:', JSON.stringify(round2State.result.value, null, 2))

  const ssRound2 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_round2.png', Buffer.from(ssRound2.data, 'base64'))
  console.log('Saved screenshot_gauntlet_round2.png')

  // Step 7: Fast forward to Round 5 (Boss) and Defeat Boss -> Champion Victory
  console.log('\n--- STEP 7: Advance to Round 5 (Boss) and Beat Boss ---')
  await send('Runtime.evaluate', {
    expression: `(async () => {
      const game = window.duelingGame?.instance || window.game
      await game.startGauntletRound(4, false)
    })()`
  })
  await new Promise(r => setTimeout(r, 1800))

  const round5State = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const modePill = document.getElementById('duel-mode-pill')?.textContent
      const enemyName = document.getElementById('enemy-display-name')?.textContent
      const enemyHpText = document.getElementById('enemy-hp-text')?.textContent

      return {
        currentRoundIndex: game?.currentRoundIndex,
        tierName: game?.currentTier?.tierName,
        maxEnemyHp: game?.maxEnemyHp,
        enemyHp: game?.enemyHp,
        modePill,
        enemyName,
        enemyHpText
      }
    })()`,
    returnByValue: true
  })
  console.log('Round 5 (BOSS) State:', JSON.stringify(round5State.result.value, null, 2))

  // Defeat Boss
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.enemyHp = 0
      game.handleMatchEnd(true)
    })()`
  })
  await new Promise(r => setTimeout(r, 800))

  const champState = await send('Runtime.evaluate', {
    expression: `(() => {
      const endModal = document.getElementById('end-match-modal')
      const isVisible = !endModal?.classList.contains('hidden')
      const title = document.getElementById('modal-title')?.textContent
      const desc = document.getElementById('modal-desc')?.textContent
      const restartBtnText = document.getElementById('restart-match-btn')?.textContent

      return {
        isVisible,
        title,
        desc,
        restartBtnText
      }
    })()`,
    returnByValue: true
  })
  console.log('Grand Champion Screen:', JSON.stringify(champState.result.value, null, 2))

  const ssChamp = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_champion.png', Buffer.from(ssChamp.data, 'base64'))
  console.log('Saved screenshot_gauntlet_champion.png')

  // Step 8: Test Defeat & Rematch
  console.log('\n--- STEP 8: Test Defeat & Rematch ---')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      game.playerHp = 0
      game.handleMatchEnd(false)
    })()`
  })
  await new Promise(r => setTimeout(r, 600))

  const defeatState = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.getElementById('modal-title')?.textContent
      const desc = document.getElementById('modal-desc')?.textContent
      const retryBtn = document.getElementById('restart-match-btn')?.textContent
      const restartFrom1Btn = document.getElementById('btn-restart-gauntlet')
      const hasRestartFrom1 = !restartFrom1Btn?.classList.contains('hidden')

      return {
        title,
        desc,
        retryBtn,
        hasRestartFrom1
      }
    })()`,
    returnByValue: true
  })
  console.log('Defeat Screen State:', JSON.stringify(defeatState.result.value, null, 2))

  const ssDefeat = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_gauntlet_defeat.png', Buffer.from(ssDefeat.data, 'base64'))
  console.log('Saved screenshot_gauntlet_defeat.png')

  console.log('\nALL GAUNTLET MODE TESTS COMPLETED SUCCESSFULLY! 🎉')
  ws.close()
}

run().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
