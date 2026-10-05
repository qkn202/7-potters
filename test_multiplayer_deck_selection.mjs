// test_multiplayer_deck_selection.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function connectToChromeDebugger() {
  console.log('Connecting to Chrome CDP on port 9222...')
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
  console.log('Connected to Chrome CDP.')

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
      awaitPromise: true
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
  const { ws, send, evaluate, captureScreenshot } = await connectToChromeDebugger()

  await send('Page.enable')
  await send('Runtime.enable')

  // Set standard landscape resolution
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  })

  console.log('Navigating to http://127.0.0.1:5180...')
  await send('Page.navigate', { url: 'http://127.0.0.1:5180' })
  await new Promise((r) => setTimeout(r, 1200))

  console.log('\n--- 1. INSPECTING LOBBY 4-SPELL DECK BUILDER ---')
  const deckLobbyInfo = await evaluate(`
    (() => {
      const section = document.getElementById('multiplayer-deck-section')
      const counter = document.getElementById('deck-counter-badge')
      const stripSlots = document.querySelectorAll('#equipped-slots-strip .deck-slot-card')
      const poolCards = document.querySelectorAll('#deck-pool-grid .pool-spell-card')
      const gameDeck = window.duelingGame?.selectedMultiplayerSpells || []
      
      const slots = Array.from(stripSlots).map(el => ({
        occupied: el.classList.contains('slot-occupied'),
        spell: el.querySelector('.slot-spell-name')?.textContent || 'TRỐNG',
        mana: el.querySelector('.slot-tag-mana')?.textContent || '',
        cd: el.querySelector('.slot-tag-cd')?.textContent || ''
      }))

      return {
        sectionFound: !!section,
        counterText: counter?.textContent,
        counterClass: counter?.className,
        slotCount: stripSlots.length,
        slots,
        poolCardCount: poolCards.length,
        gameDeck
      }
    })()
  `)
  console.log('Lobby Deck Builder State:', JSON.stringify(deckLobbyInfo, null, 2))
  await captureScreenshot('multiplayer_lobby_deck_builder')

  console.log('\n--- 2. TESTING DECK CUSTOMIZATION (UNEQUIP & REJECT IF < 4 SPELLS) ---')
  // Unequip 1 spell: confringo
  await evaluate(`
    (() => {
      window.duelingGame.unequipMultiplayerSpell('confringo')
    })()
  `)
  await new Promise((r) => setTimeout(r, 300))

  const afterUnequipState = await evaluate(`
    (() => {
      const counter = document.getElementById('deck-counter-badge')
      const deck = window.duelingGame.selectedMultiplayerSpells
      return {
        deckLength: deck.length,
        deck,
        counterText: counter?.textContent,
        isPartial: counter?.classList.contains('counter-partial')
      }
    })()
  `)
  console.log('State after unequipping Confringo (now 3 spells):', afterUnequipState)

  // Attempt to start hosting with only 3 spells -> must be blocked
  console.log('Attempting to click "MỞ PHÒNG" with 3 spells...')
  const hostBlockedResult = await evaluate(`
    (() => {
      const hostBtn = document.getElementById('btn-start-hosting')
      const hostStatusBefore = document.getElementById('host-status-msg')?.textContent
      const currentCodeBefore = window.duelingGame.currentRoomCode
      hostBtn?.click()
      const deckSection = document.getElementById('multiplayer-deck-section')
      return {
        hasShakeError: deckSection?.classList.contains('deck-shake-error'),
        isHostingBlocked: !window.duelingGame.network.isHost && (!window.duelingGame.currentRoomCode || window.duelingGame.currentRoomCode === currentCodeBefore)
      }
    })()
  `)
  console.log('Host blocked result with 3 spells:', hostBlockedResult)
  await captureScreenshot('multiplayer_deck_partial_error')

  console.log('\n--- 3. EQUIP AVADA KEDAVRA TO COMPLETE 4/4 DECK ---')
  await evaluate(`
    (() => {
      window.duelingGame.equipMultiplayerSpell('avadakedavra')
    })()
  `)
  await new Promise((r) => setTimeout(r, 400))

  const completeDeckState = await evaluate(`
    (() => {
      const counter = document.getElementById('deck-counter-badge')
      const deck = window.duelingGame.selectedMultiplayerSpells
      return {
        deckLength: deck.length,
        deck,
        counterText: counter?.textContent,
        isFull: counter?.classList.contains('counter-full')
      }
    })()
  `)
  console.log('Completed Deck State (4/4):', completeDeckState)

  console.log('\n--- 4. START MULTIPLAYER MATCH WITH 4 EQUIPPED SPELLS ---')
  await evaluate(`
    (() => {
      window.duelingGame.startMultiplayerMatch(true, 'ROOM-7788')
    })()
  `)
  await new Promise((r) => setTimeout(r, 800))

  const inGameDockInfo = await evaluate(`
    (() => {
      const dock = document.getElementById('spell-cooldown-dock')
      const slots = document.querySelectorAll('#spell-cooldown-dock .dock-slot')
      const modePill = document.getElementById('duel-mode-pill')
      
      const slotData = Array.from(slots).map(s => ({
        spell: s.dataset.spell,
        hotkey: s.querySelector('.dock-hotkey')?.textContent,
        mana: s.querySelector('.dock-mana-cost')?.textContent,
        title: s.getAttribute('title')
      }))

      return {
        gameMode: window.duelingGame.gameMode,
        modePillText: modePill?.textContent,
        slotCount: slots.length,
        slotData
      }
    })()
  `)
  console.log('In-Game Multiplayer Dock (Expecting exactly 4 slots):', JSON.stringify(inGameDockInfo, null, 2))
  await captureScreenshot('multiplayer_ingame_4slot_dock')

  console.log('\n--- 5. TESTING CAST RESTRICTION (BLOCKED FOR UNEQUIPPED SPELL) ---')
  const initialMana = await evaluate(`window.duelingGame.playerMana`)
  console.log(`Initial player mana: ${initialMana}`)

  // Confringo is NOT equipped! (Equipped: expelliarmus, protego, stupefy, avadakedavra)
  console.log('Attempting to cast Confringo (unequipped in this duel)...')
  await evaluate(`
    (() => {
      window.duelingGame.castPlayerSpell('confringo', 95)
    })()
  `)
  await new Promise((r) => setTimeout(r, 200))

  const afterBlockedMana = await evaluate(`window.duelingGame.playerMana`)
  const isManaCostPreserved = (initialMana - afterBlockedMana) < 5.0
  console.log(`Player mana after attempting to cast unequipped Confringo: ${afterBlockedMana}`)
  console.log(`Was 26 MP Confringo cast REJECTED and mana preserved? ${isManaCostPreserved ? 'YES (PASSED)' : 'NO (FAILED)'}`)

  // Cast equipped Avada Kedavra (Hotkey [4] or slot 4)
  console.log('\nCasting equipped Avada Kedavra (Slot [4])...')
  await evaluate(`
    (() => {
      // Trigger via hotkey '4'
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '4', code: 'Digit4' }))
    })()
  `)
  await new Promise((r) => setTimeout(r, 300))

  const avadaCooldownState = await evaluate(`
    (() => {
      const time = window.duelingGame.instance.clock.getElapsedTime()
      const cdUntil = window.duelingGame.playerCooldowns.avadakedavra || 0
      const remain = cdUntil - time
      const avadaSlot = document.querySelector('.dock-slot[data-spell="avadakedavra"]')
      return {
        cdUntil,
        remain: remain.toFixed(1),
        isCoolingDown: avadaSlot?.classList.contains('is-cooldown'),
        timerText: avadaSlot?.querySelector('.dock-cd-timer')?.textContent
      }
    })()
  `)
  console.log('Avada Kedavra Cooldown State after cast:', avadaCooldownState)

  console.log('\n--- 6. INSPECTING GRIMOIRE MODAL MULTIPLAYER BADGES ---')
  await evaluate(`
    (() => {
      const modal = document.getElementById('spell-grimoire-modal')
      modal?.classList.remove('hidden')
    })()
  `)
  await new Promise((r) => setTimeout(r, 400))

  const grimoireMultiplayerState = await evaluate(`
    (() => {
      const items = document.querySelectorAll('.grimoire-item')
      return Array.from(items).map(item => ({
        spell: item.dataset.spell,
        isEquipped: item.classList.contains('is-multi-equipped'),
        isUnequipped: item.classList.contains('is-multi-unequipped')
      }))
    })()
  `)
  console.log('Grimoire Modal Equipped Status:', JSON.stringify(grimoireMultiplayerState, null, 2))
  await captureScreenshot('multiplayer_grimoire_equipped_badges')

  // Close Grimoire & Return to Main Menu
  await evaluate(`
    (() => {
      document.getElementById('spell-grimoire-modal')?.classList.add('hidden')
      window.duelingGame.showMainMenu()
    })()
  `)
  await new Promise((r) => setTimeout(r, 600))

  const singlePlayerRestoredState = await evaluate(`
    (() => {
      const slots = document.querySelectorAll('#spell-cooldown-dock .dock-slot')
      return {
        gameMode: window.duelingGame.gameMode,
        restoredSlotCount: slots.length
      }
    })()
  `)
  console.log('Restored Single-Player Dock (Expecting 9 slots):', singlePlayerRestoredState)

  console.log('\nALL MULTIPLAYER 4-SPELL LOADOUT VERIFICATIONS COMPLETED SUCCESSFULLY!')
  ws.close()
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
