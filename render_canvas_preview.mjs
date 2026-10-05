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

  console.log('Rendering Confringo texture in browser...')
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const cv = document.createElement('canvas')
        cv.width = 1024
        cv.height = 1024
        const ctx = cv.getContext('2d')
        ctx.clearRect(0, 0, 1024, 1024)

        // --- A. BILLOWING VOLUMETRIC CHARCOAL SMOKE PLUME (Emerging from top & curling right) ---
        // Seamlessly connecting from top-crest of flame into the sky
        const smokePuffs = [
          // Base connection puffs merging into flame top
          { cx: 460, cy: 460, r: 85 },
          { cx: 530, cy: 440, r: 90 },
          { cx: 500, cy: 370, r: 95 },
          // Billowing upward-right plume
          { cx: 580, cy: 330, r: 105 },
          { cx: 660, cy: 270, r: 115 },
          { cx: 600, cy: 220, r: 95 },
          { cx: 720, cy: 190, r: 105 },
          { cx: 800, cy: 140, r: 90 },
          { cx: 860, cy: 90, r: 75 },
          { cx: 710, cy: 110, r: 80 },
          { cx: 640, cy: 150, r: 85 },
        ]

        // 1. Unified Smoke Silhouette Fill
        ctx.save()
        ctx.beginPath()
        smokePuffs.forEach(p => {
          ctx.moveTo(p.cx + p.r, p.cy)
          ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2)
        })
        const smokeBaseGrad = ctx.createRadialGradient(680, 240, 40, 660, 260, 340)
        smokeBaseGrad.addColorStop(0, '#334155')
        smokeBaseGrad.addColorStop(0.35, '#1e293b')
        smokeBaseGrad.addColorStop(0.70, '#0f172a')
        smokeBaseGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)')
        ctx.fillStyle = smokeBaseGrad
        ctx.shadowColor = 'rgba(15, 23, 42, 0.85)'
        ctx.shadowBlur = 18
        ctx.fill()
        ctx.restore()

        // 2. Individual Volumetric Smoke Highlights (Pillowy 3D Depth)
        smokePuffs.forEach(p => {
          ctx.save()
          const pGrad = ctx.createRadialGradient(p.cx - p.r * 0.25, p.cy - p.r * 0.25, 5, p.cx, p.cy, p.r)
          pGrad.addColorStop(0, 'rgba(71, 85, 105, 0.45)')
          pGrad.addColorStop(0.50, 'rgba(30, 41, 59, 0.25)')
          pGrad.addColorStop(1, 'rgba(15, 23, 42, 0)')
          ctx.fillStyle = pGrad
          ctx.beginPath()
          ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })

        // --- B. FIERY CAULIFLOWER EXPLOSIVE BURST (Full rounded mound in center) ---
        const outerFlameLobes = [
          // Ground base lobes
          { cx: 310, cy: 720, r: 92 },
          { cx: 410, cy: 740, r: 98 },
          { cx: 510, cy: 730, r: 94 },
          { cx: 610, cy: 690, r: 86 },
          // Left flanking lobes (facing caster)
          { cx: 230, cy: 650, r: 88 },
          { cx: 210, cy: 560, r: 84 },
          { cx: 240, cy: 470, r: 82 },
          // Upper left & top crest lobes
          { cx: 300, cy: 400, r: 86 },
          { cx: 380, cy: 360, r: 92 },
          { cx: 470, cy: 380, r: 88 },
          // Right flame boundary meeting smoke
          { cx: 560, cy: 450, r: 88 },
          { cx: 620, cy: 540, r: 86 },
          { cx: 630, cy: 630, r: 82 },
        ]

        // 1. Unified Outer Flame Silhouette Fill (Deep fiery orange & vermilion)
        ctx.save()
        ctx.beginPath()
        outerFlameLobes.forEach(fl => {
          ctx.moveTo(fl.cx + fl.r, fl.cy)
          ctx.arc(fl.cx, fl.cy, fl.r, 0, Math.PI * 2)
        })
        const outerFlameGrad = ctx.createRadialGradient(400, 560, 40, 400, 580, 310)
        outerFlameGrad.addColorStop(0, '#f97316')
        outerFlameGrad.addColorStop(0.48, '#ea580c')
        outerFlameGrad.addColorStop(0.78, '#dc2626')
        outerFlameGrad.addColorStop(0.92, '#991b1b')
        outerFlameGrad.addColorStop(1, 'rgba(40, 15, 15, 0.95)')
        ctx.fillStyle = outerFlameGrad
        ctx.shadowColor = '#dc2626'
        ctx.shadowBlur = 24
        ctx.fill()
        ctx.restore()

        // 2. Soft Scalloped Edge Shading on Outer Flame (Giving each bulb rounded form)
        outerFlameLobes.forEach(fl => {
          ctx.save()
          const bGrad = ctx.createRadialGradient(fl.cx, fl.cy, fl.r * 0.45, fl.cx, fl.cy, fl.r)
          bGrad.addColorStop(0, 'rgba(251, 146, 60, 0)')
          bGrad.addColorStop(0.65, 'rgba(220, 38, 38, 0.35)')
          bGrad.addColorStop(0.92, 'rgba(127, 29, 29, 0.65)')
          bGrad.addColorStop(1, 'rgba(28, 25, 23, 0.85)')
          ctx.fillStyle = bGrad
          ctx.beginPath()
          ctx.arc(fl.cx, fl.cy, fl.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })

        // 3. Inner Brilliant Golden-Yellow Core (Warm incandescent nucleus, NO white blowout!)
        const coreFlameLobes = [
          { cx: 360, cy: 620, r: 94 },
          { cx: 460, cy: 610, r: 98 },
          { cx: 410, cy: 520, r: 104 },
          { cx: 320, cy: 520, r: 86 },
          { cx: 480, cy: 500, r: 90 },
          { cx: 400, cy: 430, r: 84 },
        ]

        ctx.save()
        ctx.beginPath()
        coreFlameLobes.forEach(cl => {
          ctx.moveTo(cl.cx + cl.r, cl.cy)
          ctx.arc(cl.cx, cl.cy, cl.r, 0, Math.PI * 2)
        })
        const coreGrad = ctx.createRadialGradient(400, 520, 20, 400, 530, 180)
        coreGrad.addColorStop(0, '#fef9c3')    // Warm luminous cream highlight
        coreGrad.addColorStop(0.28, '#fef08a') // Radiant golden yellow
        coreGrad.addColorStop(0.62, '#fde047') // Warm golden amber
        coreGrad.addColorStop(0.85, '#f59e0b') // Deep amber
        coreGrad.addColorStop(1, '#ea580c')    // Saturated fiery orange border
        ctx.fillStyle = coreGrad
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.restore()

        // 4. Stylized Curved Comic Crease Arcs (Accentuating the cauliflower crevices)
        ctx.save()
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.65)'
        ctx.lineWidth = 3.5
        ctx.lineCap = 'round'
        const creases = [
          // Between core bulbs
          [[360, 560], [400, 530]],
          [[420, 530], [460, 560]],
          [[400, 470], [400, 510]],
          [[320, 510], [360, 470]],
          [[440, 470], [480, 500]],
          // Outer crevices
          [[270, 600], [320, 620]],
          [[240, 520], [300, 490]],
          [[310, 430], [360, 420]],
          [[440, 410], [490, 430]],
          [[530, 450], [560, 510]],
          [[570, 640], [530, 670]],
        ]
        creases.forEach(cr => {
          ctx.beginPath()
          ctx.moveTo(cr[0][0], cr[0][1])
          ctx.quadraticCurveTo((cr[0][0] + cr[1][0]) * 0.5 + 5, (cr[0][1] + cr[1][1]) * 0.5 - 5, cr[1][0], cr[1][1])
          ctx.stroke()
        })
        ctx.restore()

        // 5. Stylized Flame Ribs & Swirling Golden Tongues
        ctx.save()
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 3.2
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 10
        ctx.lineCap = 'round'
        const flameVeins = [
          [[400, 710], [390, 590], [400, 440]],
          [[330, 670], [300, 570], [320, 480]],
          [[470, 670], [500, 570], [480, 470]],
          [[380, 550], [420, 500], [400, 410]],
          [[270, 600], [240, 530], [260, 460]],
          [[510, 600], [550, 540], [540, 470]],
        ]
        flameVeins.forEach(v => {
          ctx.beginPath()
          ctx.moveTo(v[0][0], v[0][1])
          ctx.quadraticCurveTo(v[1][0], v[1][1], v[2][0], v[2][1])
          ctx.stroke()
        })
        ctx.restore()

        // --- C. "EXPLOSIVE SPARKERS" (Sharp Radiant Needle Spikes) ---
        const needles = [
          { from: [250, 500], to: [70, 400], width: 18 },    // Up-left towards caster
          { from: [220, 580], to: [40, 570], width: 20 },    // Direct left
          { from: [250, 680], to: [60, 760], width: 18 },    // Down-left
          { from: [310, 410], to: [180, 220], width: 22 },   // High up-left
          { from: [400, 360], to: [370, 130], width: 24 },   // Straight up
          { from: [520, 390], to: [640, 190], width: 20 },   // Up-right through smoke
          { from: [630, 600], to: [870, 580], width: 20 },   // Direct right
          { from: [590, 710], to: [840, 810], width: 22 },   // Down-right across table
          { from: [410, 760], to: [420, 960], width: 18 },   // Downward table splash
        ]

        needles.forEach(n => {
          const dx = n.to[0] - n.from[0]
          const dy = n.to[1] - n.from[1]
          const len = Math.hypot(dx, dy)
          const ux = dx / len
          const uy = dy / len
          const nx = -uy
          const ny = ux

          // Aerodynamic tapered diamond needle
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(n.from[0], n.from[1])
          ctx.lineTo(n.from[0] + ux * len * 0.28 + nx * n.width * 0.5, n.from[1] + uy * len * 0.28 + ny * n.width * 0.5)
          ctx.lineTo(n.to[0], n.to[1])
          ctx.lineTo(n.from[0] + ux * len * 0.28 - nx * n.width * 0.5, n.from[1] + uy * len * 0.28 - ny * n.width * 0.5)
          ctx.closePath()

          const nGrad = ctx.createLinearGradient(n.from[0], n.from[1], n.to[0], n.to[1])
          nGrad.addColorStop(0, '#ea580c')
          nGrad.addColorStop(0.30, '#fde047')
          nGrad.addColorStop(0.80, '#fef08a')
          nGrad.addColorStop(1, '#ffffff')
          ctx.fillStyle = nGrad
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 14
          ctx.fill()

          // Inner white razor spine
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2.0
          ctx.beginPath()
          ctx.moveTo(n.from[0] + ux * len * 0.25, n.from[1] + uy * len * 0.25)
          ctx.lineTo(n.to[0], n.to[1])
          ctx.stroke()
          ctx.restore()
        })

        // --- D. "MOLTEN MAGMA SPARKS" (Scattered droplet embers) ---
        for (let s = 0; s < 45; s++) {
          const ang = Math.random() * Math.PI * 2
          const dist = 160 + Math.random() * 340
          const sx = 410 + Math.cos(ang) * dist
          const sy = 560 + Math.sin(ang) * dist * 0.88
          const r = 2.5 + Math.random() * 4.5

          ctx.save()
          ctx.fillStyle = s % 3 === 0 ? '#ffffff' : (s % 2 === 0 ? '#fef08a' : '#f97316')
          ctx.shadowColor = '#ea580c'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()

          // Dark soot rim
          ctx.strokeStyle = 'rgba(28, 25, 23, 0.80)'
          ctx.lineWidth = 1.2
          ctx.stroke()
          ctx.restore()
        }

        return cv.toDataURL('image/png')
      })()
    `
  })

  const dataUrl = evalRes.result.value
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
  const outPath = '/Users/khang/hogwarts-duel-3d/docs/screenshots/confringo_texture_preview.png'
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  console.log(`Saved texture preview to ${outPath}`)

  ws.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
