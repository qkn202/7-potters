import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.url.includes('5180') && t.type === 'page')
  if (!target) {
    console.error('Target 5180 not found!')
    process.exit(1)
  }

  console.log('Connecting to', target.webSocketDebuggerUrl)
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
  console.log('WebSocket connected')

  // Reload page to start brand new match
  console.log('Reloading page...')
  await send('Page.reload', { ignoreCache: true })
  await new Promise(r => setTimeout(r, 2200))

  // Clean UI banners/modals and disable AI so match stays clean
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.duelingGame) {
          if (typeof window.duelingGame.resetHp === 'function') window.duelingGame.resetHp()
          if (typeof window.duelingGame.setAiDisabled === 'function') window.duelingGame.setAiDisabled(true)
        }
        const banner = document.getElementById('match-banner')
        if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
        const modal = document.getElementById('end-match-modal')
        if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
      })()
    `
  })
  await new Promise(r => setTimeout(r, 400))

  const captureFrame = async (name, delayMs) => {
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
    console.log(`Capturing ${name}...`)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    const outPath = `/Users/khang/.gemini/antigravity-ide/brain/e40e3d86-dfc2-40b9-b653-c5a6cb062216/${name}.png`
    fs.writeFileSync(outPath, buf)
    console.log(`Saved ${outPath}`)
  }

  const spellsToTest = [
    { name: 'sectumsempra', label: 'spell_sectumsempra', delays: [180, 260] },
    { name: 'petrificus', label: 'spell_petrificus', delays: [180, 260] },
    { name: 'confringo', label: 'spell_confringo', delays: [180, 260] },
    { name: 'immobulus', label: 'spell_immobulus', delays: [180, 260] },
    { name: 'morsmordre', label: 'spell_morsmordre', delays: [180, 260] },
    { name: 'levicorpus', label: 'spell_levicorpus', delays: [180, 260] },
    { name: 'obliviate', label: 'spell_obliviate', delays: [180, 260] },
    { name: 'expecto_patronum', label: 'spell_expecto_patronum', delays: [200, 300] },
  ]

  for (const s of spellsToTest) {
    console.log(`\n--- Casting ${s.name} ---`)
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          if (window.duelingGame && typeof window.duelingGame.resetHp === 'function') {
            window.duelingGame.resetHp()
          }
          const banner = document.getElementById('match-banner')
          if (banner) { banner.style.display = 'none'; banner.classList.add('hidden'); }
          const modal = document.getElementById('end-match-modal')
          if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
          
          if (window.duelingGame && typeof window.duelingGame.castSpell === 'function') {
            window.duelingGame.castSpell('${s.name}')
          } else if (window.game && typeof window.game.castPlayerSpell === 'function') {
            window.game.castPlayerSpell('${s.name}', 100)
          }
        })()
      `
    })

    await captureFrame(`${s.label}_flight`, 260)
    await captureFrame(`${s.label}_hit`, 260)
    // Wait between spells
    await new Promise(r => setTimeout(r, 800))
  }

  ws.close()
  console.log('\nAll spells successfully captured!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
