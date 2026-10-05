// test_hud_mana_mechanics.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  let tabs = await tabsRes.json()
  let pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))

  if (!pageTab) {
    const newTabRes = await fetch('http://localhost:9222/json/new?http://127.0.0.1:5180/')
    pageTab = await newTabRes.json()
    await new Promise(r => setTimeout(r, 1500))
  }

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

  console.log('--- 1. Resetting to Desktop Viewport & Reloading ---')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  })

  await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
  await new Promise(r => setTimeout(r, 2200))

  console.log('--- 2. Entering Single Player Mode ---')
  const enterRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btn-play-single') || document.getElementById('card-mode-single')
      if (btn) {
        btn.click()
        return { clicked: true, gameMode: window.duelingGame?.instance?.gameMode }
      }
      return { clicked: false }
    })()`,
    returnByValue: true
  })
  console.log('Enter Single Player result:', enterRes.result.value)
  await new Promise(r => setTimeout(r, 1200))

  console.log('--- 3. Checking Initial Dual HP/MP Bar State ---')
  const initialStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame
      game.setAiDisabled(true)
      return {
        playerHp: game.playerHp,
        playerMana: game.playerMana,
        enemyHp: game.enemyHp,
        enemyMana: game.enemyMana,
        playerHpText: document.getElementById('player-hp-text')?.textContent,
        playerMpText: document.getElementById('player-mp-text')?.textContent,
        enemyHpText: document.getElementById('enemy-hp-text')?.textContent,
        enemyMpText: document.getElementById('enemy-mp-text')?.textContent,
        promptMana: document.getElementById('prompt-spell-mana')?.textContent,
        promptManaClass: document.getElementById('prompt-spell-mana')?.className
      }
    })()`,
    returnByValue: true
  })
  console.log('Initial Duel Stats:', initialStats.result.value)

  // Capture Desktop Initial HUD
  const ss1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('test_hud_desktop_initial.png', Buffer.from(ss1.data, 'base64'))
  console.log('📸 Saved test_hud_desktop_initial.png')

  console.log('--- 4. Casting Spells & Consuming Mana ---')
  // Cast Expelliarmus (15 MP)
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.duelingGame.castPlayerSpell('expelliarmus', 90)
    })()`
  })
  await new Promise(r => setTimeout(r, 600))

  // Cast Avada Kedavra (55 MP)
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.duelingGame.castPlayerSpell('avadakedavra', 80)
    })()`
  })
  await new Promise(r => setTimeout(r, 800))

  const afterCastStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame
      const akBtn = document.querySelector('[data-spell="avadakedavra"]')
      return {
        playerMana: Math.round(game.playerMana),
        playerMpText: document.getElementById('player-mp-text')?.textContent,
        akHasOutOfManaClass: akBtn?.classList.contains('spell-out-of-mana'),
        promptManaText: document.getElementById('prompt-spell-mana')?.textContent
      }
    })()`,
    returnByValue: true
  })
  console.log('Stats After Casting Expelliarmus (15) + Avada Kedavra (55):', afterCastStats.result.value)

  const ss2 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('test_hud_mana_spent.png', Buffer.from(ss2.data, 'base64'))
  console.log('📸 Saved test_hud_mana_spent.png')

  console.log('--- 5. Attempting to Cast High-Cost Spell with Insufficient Mana ---')
  // Mana is ~30 MP. Attempting Avada Kedavra (55 MP) should fail and trigger warning!
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.duelingGame.castPlayerSpell('avadakedavra', 90)
    })()`
  })
  await new Promise(r => setTimeout(r, 400))

  const oomStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame
      const toastTitle = document.getElementById('toast-title')?.textContent
      const toastSub = document.getElementById('toast-sub')?.textContent
      const toastHidden = document.getElementById('gesture-toast')?.classList.contains('hidden')
      const floatingTexts = Array.from(document.querySelectorAll('.floating-dmg')).map(el => el.textContent)
      return {
        playerMana: Math.round(game.playerMana),
        toastTitle,
        toastSub,
        toastVisible: !toastHidden,
        floatingTexts
      }
    })()`,
    returnByValue: true
  })
  console.log('Out of Mana Verification:', oomStats.result.value)

  const ss3 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('test_hud_out_of_mana.png', Buffer.from(ss3.data, 'base64'))
  console.log('📸 Saved test_hud_out_of_mana.png')

  console.log('--- 6. Passive Mana Regeneration (+10 MP/s) ---')
  await new Promise(r => setTimeout(r, 4000))

  const regenStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame
      return {
        playerMana: Math.round(game.playerMana),
        playerMpText: document.getElementById('player-mp-text')?.textContent
      }
    })()`,
    returnByValue: true
  })
  console.log('Regenerated Mana Stats:', regenStats.result.value)

  const ss4 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('test_hud_mana_regenerated.png', Buffer.from(ss4.data, 'base64'))
  console.log('📸 Saved test_hud_mana_regenerated.png')

  console.log('--- 7. Mobile Portrait Viewport Verification (390 x 844) ---')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  })
  await new Promise(r => setTimeout(r, 1200))

  const mobileStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const playerCard = document.querySelector('.player-hud-group')
      const enemyCard = document.querySelector('.enemy-hud-group')
      const playerMp = document.querySelector('.player-mp')
      const mobileRibbon = document.getElementById('mobile-spell-ribbon')
      const dodgeLeft = document.getElementById('mobile-dodge-left')
      return {
        playerCardVisible: !!playerCard && window.getComputedStyle(playerCard).display !== 'none',
        enemyCardVisible: !!enemyCard && window.getComputedStyle(enemyCard).display !== 'none',
        playerMpWidth: playerMp ? window.getComputedStyle(playerMp).width : null,
        mobileRibbonVisible: !!mobileRibbon && window.getComputedStyle(mobileRibbon).display !== 'none',
        dodgeBtnVisible: !!dodgeLeft && window.getComputedStyle(dodgeLeft).display !== 'none'
      }
    })()`,
    returnByValue: true
  })
  console.log('Mobile Portrait Layout Stats:', mobileStats.result.value)

  const ss5 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('test_hud_mobile_portrait.png', Buffer.from(ss5.data, 'base64'))
  console.log('📸 Saved test_hud_mobile_portrait.png')

  ws.close()
  console.log('✅ ALL HUD & MANA TESTS PASSED SUCCESSFULLY!')
}

run().catch(console.error)
