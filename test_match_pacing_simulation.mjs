// test_match_pacing_simulation.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
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

  console.log('🔄 Reloading page...')
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2600))

  // Check initial state
  const initStats = await send('Runtime.evaluate', {
    expression: `(() => {
      const game = window.duelingGame?.instance || window.game
      const clock = document.getElementById('duel-clock')?.textContent
      return {
        clock,
        playerHp: game?.playerHp,
        enemyHp: game?.enemyHp,
        matchTimer: game?.matchTimer
      }
    })()`,
    returnByValue: true
  })
  console.log('⚡ Initial Match State:', initStats.result.value)

  // Capture initial screenshot
  const ssInit = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_duel_pacing_start.png', Buffer.from(ssInit.data, 'base64'))

  // Simulate a series of spell exchanges over 30 seconds
  console.log('⚔️ Simulating duel exchange sequence...')
  const spellSequence = [
    'expelliarmus', 'stupefy', 'confringo', 'protego', 
    'sectumsempra', 'expecto_patronum', 'expelliarmus', 'confringo'
  ]

  for (let i = 0; i < spellSequence.length; i++) {
    const spell = spellSequence[i]
    await send('Runtime.evaluate', {
      expression: `(() => {
        const game = window.duelingGame?.instance || window.game
        if (game && !game.matchOver) {
          game.castPlayerSpell('${spell}', 90)
        }
      })()`
    })
    console.log(`  -> Cast: ${spell}`)
    await new Promise(r => setTimeout(r, 2500))

    const curState = await send('Runtime.evaluate', {
      expression: `(() => {
        const game = window.duelingGame?.instance || window.game
        const clock = document.getElementById('duel-clock')?.textContent
        return {
          clock,
          playerHp: game?.playerHp,
          enemyHp: game?.enemyHp,
          matchTimer: game?.matchTimer,
          matchOver: game?.matchOver
        }
      })()`,
      returnByValue: true
    })
    console.log(`     State at step ${i+1}: Clock=${curState.result.value.clock}, Player HP=${curState.result.value.playerHp}%, Voldemort HP=${curState.result.value.enemyHp}%, Over=${curState.result.value.matchOver}`)
  }

  // Capture mid/late game duel screenshot
  const ssMid = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_duel_pacing_ongoing.png', Buffer.from(ssMid.data, 'base64'))
  console.log('📸 Saved screenshot_duel_pacing_ongoing.png')

  ws.close()
}

run().catch(console.error)
