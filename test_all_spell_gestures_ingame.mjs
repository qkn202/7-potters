// test_all_spell_gestures_ingame.mjs
import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const tabsRes = await fetch('http://localhost:9222/json/list')
  const tabs = await tabsRes.json()
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('5180'))
  if (!pageTab) throw new Error('Game page not found')

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

  console.log('Testing each of the 9 spells: selection + drawing matching gesture...')

  const spellsToTest = [
    { key: 'expelliarmus', code: '1' },
    { key: 'protego', code: '2' },
    { key: 'stupefy', code: '3' },
    { key: 'avadakedavra', code: '4' },
    { key: 'sectumsempra', code: '5' },
    { key: 'petrificus', code: '6' },
    { key: 'confringo', code: '7' },
    { key: 'obliviate', code: '8' },
    { key: 'expecto_patronum', code: 'p' },
  ]

  for (const s of spellsToTest) {
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const game = window.duelingGame?.instance || window.game
        game.setArmedSpell('${s.key}')
        
        let pts = []
        if ('${s.key}' === 'expelliarmus') {
          pts = [{x:300, y:200}, {x:400, y:280}, {x:310, y:340}, {x:410, y:420}]
        } else if ('${s.key}' === 'protego') {
          for (let a = Math.PI * 0.9; a >= Math.PI * 0.1; a -= 0.15) {
            pts.push({ x: 350 + 90 * Math.cos(a), y: 350 - 90 * Math.sin(a) })
          }
        } else if ('${s.key}' === 'stupefy') {
          for (let x = 250; x <= 450; x += 10) {
            pts.push({ x, y: 300 + Math.sin((x - 250) * 0.06) * 35 })
          }
        } else if ('${s.key}' === 'avadakedavra') {
          pts = [{x:300,y:180},{x:410,y:250},{x:290,y:310},{x:400,y:370},{x:310,y:430}]
        } else if ('${s.key}' === 'sectumsempra') {
          for (let x = 250; x <= 450; x += 10) pts.push({ x, y: 300 })
        } else if ('${s.key}' === 'petrificus') {
          for (let y = 200; y <= 400; y += 10) pts.push({ x: 350, y })
        } else if ('${s.key}' === 'confringo') {
          pts = [{x:350,y:200},{x:430,y:360},{x:270,y:360},{x:350,y:200}]
        } else if ('${s.key}' === 'obliviate') {
          for (let a = 0; a <= Math.PI * 2.05; a += 0.2) {
            pts.push({ x: 350 + 70 * Math.cos(a), y: 300 + 70 * Math.sin(a) })
          }
        } else if ('${s.key}' === 'expecto_patronum') {
          for (let a = 0; a <= Math.PI * 1.75; a += 0.2) {
            pts.push({ x: 350 + 60 * Math.cos(a), y: 320 + 60 * Math.sin(a) })
          }
          pts.push({ x: 420, y: 240 })
          pts.push({ x: 460, y: 190 })
        }

        // Interpolate points
        const dense = []
        for (let i = 0; i < pts.length - 1; i++) {
          for (let st = 0; st < 4; st++) {
            dense.push({
              x: pts[i].x + (pts[i+1].x - pts[i].x) * (st / 4),
              y: pts[i].y + (pts[i+1].y - pts[i].y) * (st / 4)
            })
          }
        }
        dense.push(pts[pts.length - 1])

        window.duelingGame.simulateDrawStroke(dense)
        const toastTitle = document.getElementById('toast-title')?.textContent
        const statusText = document.getElementById('prompt-status-text')?.textContent
        return { spell: '${s.key}', toastTitle, statusText }
      })()`,
      returnByValue: true
    })
    console.log(`[${s.key}]:`, result.result.value)
    await new Promise(r => setTimeout(r, 150))
  }

  // Capture final screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('screenshot_all_gestures_verified.png', Buffer.from(ss.data, 'base64'))
  console.log('Saved screenshot_all_gestures_verified.png')

  ws.close()
}

run().catch(console.error)
