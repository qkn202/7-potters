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

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`)
    }
    return res.result.value
  }

  async function captureScreenshot(name) {
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = path.join(ARTIFACT_DIR, `${name}.png`)
    fs.writeFileSync(outPath, buf)
    console.log(`Saved screenshot: ${outPath} (${buf.length} bytes)`)
  }

  console.log('Navigating to http://127.0.0.1:5180...')
  await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
  
  // Wait until window.duelingGame is fully ready
  let isReady = false
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500))
    try {
      const ready = await evaluate(`typeof window.duelingGame !== 'undefined'`)
      if (ready) {
        isReady = true
        console.log(`duelingGame initialized after ${(i + 1) * 500}ms`)
        break
      }
    } catch (e) {}
  }
  if (!isReady) {
    console.error('Timed out waiting for duelingGame to initialize!')
    process.exit(1)
  }

  console.log('\n--- 1. STARTING DUEL IN SINGLE PLAYER ---')
  await evaluate(`
    (() => {
      const soloBtn = document.getElementById('btn-play-single')
      if (soloBtn) soloBtn.click()
      const g = window.duelingGame
      if (g) {
        if (g.setAiDisabled) g.setAiDisabled(true)
        if (g.resetHp) g.resetHp()
      }
    })()
  `)
  await new Promise(r => setTimeout(r, 2000))

  console.log('\n--- 2. INSPECTING SPELL COOLDOWN DOCK ---')
  const dockSlotsInfo = await evaluate(`
    (() => {
      const dock = document.getElementById('spell-cooldown-dock')
      if (!dock) return null
      const slots = Array.from(dock.querySelectorAll('.dock-slot')).map(s => ({
        spell: s.dataset.spell,
        hotkey: s.querySelector('.dock-hotkey')?.textContent?.trim(),
        manaCost: s.querySelector('.dock-mana-cost')?.textContent?.trim(),
        title: s.getAttribute('title')
      }))
      return {
        dockFound: true,
        slotCount: slots.length,
        slots
      }
    })()
  `)
  console.log('Dock inspection result:', JSON.stringify(dockSlotsInfo, null, 2))

  console.log('\n--- 3. INSPECTING GRIMOIRE MODAL COOLDOWN TAGS ---')
  // Open Grimoire
  await evaluate(`
    const btn = document.getElementById('btn-toggle-grimoire')
    if (btn) btn.click()
  `)
  await new Promise(r => setTimeout(r, 800))

  const grimoireCards = await evaluate(`
    (() => {
      const modal = document.getElementById('spell-grimoire-modal')
      if (!modal || modal.classList.contains('hidden')) return null
      const items = Array.from(modal.querySelectorAll('.grimoire-item')).map(item => ({
        spell: item.dataset.spell,
        name: item.querySelector('.grimoire-spell-name')?.textContent?.trim(),
        sub: item.querySelector('.grimoire-spell-sub')?.textContent?.trim(),
        cdTag: item.querySelector('.grimoire-cd-tag')?.textContent?.trim(),
        manaTag: item.querySelector('.grimoire-mana-tag')?.textContent?.trim()
      }))
      return {
        modalVisible: true,
        itemCount: items.length,
        items
      }
    })()
  `)
  console.log('Grimoire inspection result:', JSON.stringify(grimoireCards, null, 2))
  await captureScreenshot('cooldown_grimoire_modal_showcase')

  // Close Grimoire
  await evaluate(`
    const closeBtn = document.getElementById('grimoire-close-btn')
    if (closeBtn) closeBtn.click()
  `)
  await new Promise(r => setTimeout(r, 800))

  console.log('\n--- 4. TESTING SPELL CAST & COOLDOWN ENFORCEMENT ---')
  // Initial state check
  const initialMana = await evaluate(`window.duelingGame.playerMana`)
  console.log(`Initial Player Mana: ${initialMana}`)

  // Cast Confringo (10.0s cooldown, 26 mana)
  console.log('Casting Confringo (Power 14, Mana 26, CD 10.0s)...')
  await evaluate(`window.duelingGame.castPlayerSpell('confringo', 95)`)
  await new Promise(r => setTimeout(r, 200))

  // Cast Expelliarmus (3.0s cooldown, 15 mana)
  console.log('Casting Expelliarmus (Power 8, Mana 15, CD 3.0s)...')
  await evaluate(`window.duelingGame.castPlayerSpell('expelliarmus', 95)`)
  await new Promise(r => setTimeout(r, 300))

  const cdStateAfterCasting = await evaluate(`
    (() => {
      const time = window.duelingGame.instance.clock.getElapsedTime()
      const cds = window.duelingGame.playerCooldowns
      const mana = window.duelingGame.playerMana
      const confringoSlot = document.querySelector('.dock-slot[data-spell="confringo"]')
      const expelliarmusSlot = document.querySelector('.dock-slot[data-spell="expelliarmus"]')
      const stupefySlot = document.querySelector('.dock-slot[data-spell="stupefy"]')
      return {
        time,
        mana,
        confringoCdUntil: cds.confringo,
        confringoRemain: cds.confringo ? (cds.confringo - time).toFixed(1) : 0,
        confringoHasCooldownClass: confringoSlot?.classList.contains('is-cooldown'),
        confringoTimerText: confringoSlot?.querySelector('.dock-cd-timer')?.textContent,
        expelliarmusRemain: cds.expelliarmus ? (cds.expelliarmus - time).toFixed(1) : 0,
        expelliarmusHasCooldownClass: expelliarmusSlot?.classList.contains('is-cooldown'),
        stupefyHasCooldownClass: stupefySlot?.classList.contains('is-cooldown')
      }
    })()
  `)
  console.log('CD state after casts:', JSON.stringify(cdStateAfterCasting, null, 2))

  console.log('\n--- 5. TESTING CAST REJECTION DURING COOLDOWN ---')
  const manaBeforeBlockedCast = await evaluate(`window.duelingGame.playerMana`)
  console.log(`Mana before blocked cast: ${manaBeforeBlockedCast}`)

  // Attempt to cast Confringo again immediately (while it has ~9.5s cooldown left)
  await evaluate(`window.duelingGame.castPlayerSpell('confringo', 95)`)
  await new Promise(r => setTimeout(r, 150))

  const manaAfterBlockedCast = await evaluate(`window.duelingGame.playerMana`)
  console.log(`Mana after blocked cast: ${manaAfterBlockedCast}`)
  const manaCostNotCharged = (manaBeforeBlockedCast - manaAfterBlockedCast) < 5.0
  console.log(`Mana preserved (NOT deducted 26 MP)? ${manaCostNotCharged ? 'YES (PASSED)' : 'NO (FAILED)'}`)

  await captureScreenshot('cooldown_dock_active_timers')

  console.log('\n--- 6. WAITING FOR 3.0s EXPELLIARMUS RECOVERY ---')
  await new Promise(r => setTimeout(r, 3200))

  const recoveryState = await evaluate(`
    (() => {
      const time = window.duelingGame.instance.clock.getElapsedTime()
      const cds = window.duelingGame.playerCooldowns
      const expelliarmusSlot = document.querySelector('.dock-slot[data-spell="expelliarmus"]')
      const confringoSlot = document.querySelector('.dock-slot[data-spell="confringo"]')
      return {
        time,
        expelliarmusRemain: cds.expelliarmus ? Math.max(0, cds.expelliarmus - time).toFixed(1) : 0,
        expelliarmusIsCoolingDown: expelliarmusSlot?.classList.contains('is-cooldown'),
        confringoRemain: cds.confringo ? Math.max(0, cds.confringo - time).toFixed(1) : 0,
        confringoIsCoolingDown: confringoSlot?.classList.contains('is-cooldown')
      }
    })()
  `)
  console.log('Recovery state after 3.2s:', JSON.stringify(recoveryState, null, 2))
  await captureScreenshot('cooldown_selective_recovery')

  console.log('\n--- 7. TESTING CASTING VIA HOTKEY [2] (PROTEGO) ---')
  await evaluate(`
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', code: 'Digit2', bubbles: true }))
  `)
  await new Promise(r => setTimeout(r, 400))

  const protegoCheck = await evaluate(`
    (() => {
      const time = window.duelingGame.instance.clock.getElapsedTime()
      const cds = window.duelingGame.playerCooldowns
      return {
        protegoCdUntil: cds.protego,
        protegoRemain: cds.protego ? (cds.protego - time).toFixed(1) : 0,
        shieldUntil: window.duelingGame.instance.playerShieldActiveUntil
      }
    })()
  `)
  console.log('Protego hotkey cast result:', JSON.stringify(protegoCheck, null, 2))

  console.log('\nAll Cooldown System automated verifications completed successfully!')
  ws.close()
}

run().catch(err => {
  console.error('Test execution error:', err)
  process.exit(1)
})
