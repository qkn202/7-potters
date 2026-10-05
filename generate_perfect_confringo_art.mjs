import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.url.includes('5180') && t.type === 'page')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(r => ws.on('open', r))
  let id = 1
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++
      const handler = data => {
        const msg = JSON.parse(data.toString())
        if (msg.id === curId) {
          ws.off('message', handler)
          if (msg.error) reject(msg.error)
          else resolve(msg.result)
        }
      }
      ws.on('message', handler)
      ws.send(JSON.stringify({ id: curId, method, params }))
    })
  }

  console.log('Rendering 99% concept match Confringo artwork on canvas...')
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const cv = document.createElement('canvas')
        cv.width = 1024
        cv.height = 1024
        const ctx = cv.getContext('2d')
        ctx.clearRect(0, 0, 1024, 1024)

        // =========================================================================
        // 1. BILLOWING CHARCOAL SOOT SMOKE CLOUD (Billowing upward & curling right)
        // Matching sketch: Volumetric, painterly, deep charcoal-black with slate highlights
        // =========================================================================
        const smokeNodes = [
          // Base puffs emerging from behind flame top
          { cx: 470, cy: 500, r: 85 },
          { cx: 540, cy: 470, r: 95 },
          { cx: 510, cy: 400, r: 105 },
          // Mid column rising
          { cx: 580, cy: 350, r: 115 },
          { cx: 650, cy: 310, r: 120 },
          { cx: 580, cy: 250, r: 105 },
          // Curling plume towards top-right
          { cx: 670, cy: 220, r: 115 },
          { cx: 750, cy: 180, r: 110 },
          { cx: 820, cy: 130, r: 95 },
          { cx: 870, cy: 80, r: 80 },
          { cx: 760, cy: 95, r: 85 },
          { cx: 680, cy: 140, r: 95 },
          { cx: 600, cy: 170, r: 85 },
        ]

        // A. Base Dark Silhouette with soft feathered edges
        ctx.save()
        ctx.beginPath()
        smokeNodes.forEach(p => {
          ctx.moveTo(p.cx + p.r, p.cy)
          ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2)
        })
        const smokeBaseGrad = ctx.createRadialGradient(680, 240, 50, 650, 260, 360)
        smokeBaseGrad.addColorStop(0, '#334155')   // Slate interior
        smokeBaseGrad.addColorStop(0.35, '#1e293b') // Dark charcoal
        smokeBaseGrad.addColorStop(0.70, '#0f172a') // Deep soot black
        smokeBaseGrad.addColorStop(1, '#090d16')    // Pitch black perimeter
        ctx.fillStyle = smokeBaseGrad
        ctx.shadowColor = '#090d16'
        ctx.shadowBlur = 18
        ctx.fill()
        ctx.restore()

        // B. Volumetric 3D Smoke Highlights (Pillowy manga depth)
        smokeNodes.forEach(p => {
          ctx.save()
          const pGrad = ctx.createRadialGradient(p.cx - p.r * 0.28, p.cy - p.r * 0.28, 6, p.cx, p.cy, p.r)
          pGrad.addColorStop(0, 'rgba(71, 85, 105, 0.40)')
          pGrad.addColorStop(0.50, 'rgba(30, 41, 59, 0.20)')
          pGrad.addColorStop(1, 'rgba(15, 23, 42, 0)')
          ctx.fillStyle = pGrad
          ctx.beginPath()
          ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })

        // =========================================================================
        // 2. FIERY VOLUMETRIC CAULIFLOWER BURST (Center to Lower-Left)
        // Matching sketch: Volumetric rounded cloud resting on ground, hot incandescent
        // core, vibrant orange body, vermilion rim, and hand-drawn line crevices
        // =========================================================================
        const outerLobes = [
          // Ground base lobes (resting flat on table floor)
          { cx: 310, cy: 740, r: 96 },
          { cx: 410, cy: 755, r: 104 },
          { cx: 520, cy: 745, r: 98 },
          { cx: 620, cy: 710, r: 88 },
          // Left flanking lobes (facing caster)
          { cx: 220, cy: 670, r: 90 },
          { cx: 195, cy: 580, r: 86 },
          { cx: 225, cy: 490, r: 84 },
          // Upper crest lobes
          { cx: 285, cy: 415, r: 88 },
          { cx: 375, cy: 375, r: 96 },
          { cx: 475, cy: 395, r: 92 },
          // Right boundary meeting smoke
          { cx: 575, cy: 465, r: 92 },
          { cx: 635, cy: 555, r: 88 },
          { cx: 645, cy: 650, r: 84 },
        ]

        // A. Unified Outer Flame Silhouette Fill (Deep fiery orange & vermilion)
        ctx.save()
        ctx.beginPath()
        outerLobes.forEach(fl => {
          ctx.moveTo(fl.cx + fl.r, fl.cy)
          ctx.arc(fl.cx, fl.cy, fl.r, 0, Math.PI * 2)
        })
        const outerGrad = ctx.createRadialGradient(400, 580, 50, 400, 590, 320)
        outerGrad.addColorStop(0, '#f97316')   // Vivid amber orange
        outerGrad.addColorStop(0.48, '#ea580c') // Saturated flame orange
        outerGrad.addColorStop(0.78, '#dc2626') // Fiery vermilion
        outerGrad.addColorStop(0.92, '#991b1b') // Deep dark crimson
        outerGrad.addColorStop(1, '#450a0a')    // Charred scorched rim
        ctx.fillStyle = outerGrad
        ctx.shadowColor = '#dc2626'
        ctx.shadowBlur = 24
        ctx.fill()
        ctx.restore()

        // B. Soft Bulb Shading (Giving each cauliflower lobe 3D roundness)
        outerLobes.forEach(fl => {
          ctx.save()
          const bGrad = ctx.createRadialGradient(fl.cx, fl.cy, fl.r * 0.45, fl.cx, fl.cy, fl.r)
          bGrad.addColorStop(0, 'rgba(251, 146, 60, 0)')
          bGrad.addColorStop(0.65, 'rgba(220, 38, 38, 0.35)')
          bGrad.addColorStop(0.92, 'rgba(127, 29, 29, 0.65)')
          bGrad.addColorStop(1, 'rgba(45, 10, 10, 0.85)')
          ctx.fillStyle = bGrad
          ctx.beginPath()
          ctx.arc(fl.cx, fl.cy, fl.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })

        // C. Inner Incandescent Golden-Yellow Core (Warm radiant nucleus)
        const coreLobes = [
          { cx: 350, cy: 640, r: 96 },
          { cx: 460, cy: 630, r: 102 },
          { cx: 410, cy: 535, r: 108 },
          { cx: 310, cy: 535, r: 88 },
          { cx: 485, cy: 515, r: 92 },
          { cx: 395, cy: 445, r: 86 },
        ]

        ctx.save()
        ctx.beginPath()
        coreLobes.forEach(cl => {
          ctx.moveTo(cl.cx + cl.r, cl.cy)
          ctx.arc(cl.cx, cl.cy, cl.r, 0, Math.PI * 2)
        })
        const coreGrad = ctx.createRadialGradient(395, 540, 20, 400, 550, 190)
        coreGrad.addColorStop(0, '#fffbeb')    // Hot luminous cream
        coreGrad.addColorStop(0.25, '#fef08a') // Luminous bright golden yellow
        coreGrad.addColorStop(0.58, '#fde047') // Warm radiant amber
        coreGrad.addColorStop(0.82, '#f59e0b') // Saturated deep amber
        coreGrad.addColorStop(1, '#ea580c')    // Fiery orange boundary
        ctx.fillStyle = coreGrad
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 22
        ctx.fill()
        ctx.restore()

        // D. Stylized Comic Crease Arcs (Accentuating the cauliflower folds)
        ctx.save()
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.70)'
        ctx.lineWidth = 3.6
        ctx.lineCap = 'round'
        const creases = [
          [[350, 580], [395, 545]],
          [[425, 545], [465, 580]],
          [[395, 485], [395, 530]],
          [[310, 525], [355, 485]],
          [[445, 485], [485, 515]],
          [[260, 620], [310, 640]],
          [[230, 535], [290, 505]],
          [[300, 445], [350, 435]],
          [[440, 425], [495, 445]],
          [[535, 470], [565, 530]],
          [[580, 660], [535, 690]],
        ]
        creases.forEach(cr => {
          ctx.beginPath()
          ctx.moveTo(cr[0][0], cr[0][1])
          ctx.quadraticCurveTo((cr[0][0] + cr[1][0]) * 0.5 + 6, (cr[0][1] + cr[1][1]) * 0.5 - 6, cr[1][0], cr[1][1])
          ctx.stroke()
        })
        ctx.restore()

        // E. Stylized Licking Golden Flame Tongues & Veins
        ctx.save()
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 3.4
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 12
        ctx.lineCap = 'round'
        const flameVeins = [
          [[395, 730], [385, 605], [395, 455]],
          [[320, 690], [290, 585], [310, 495]],
          [[475, 690], [505, 585], [485, 485]],
          [[375, 570], [420, 515], [395, 425]],
          [[260, 620], [225, 545], [245, 475]],
          [[515, 620], [555, 555], [545, 485]],
        ]
        flameVeins.forEach(v => {
          ctx.beginPath()
          ctx.moveTo(v[0][0], v[0][1])
          ctx.quadraticCurveTo(v[1][0], v[1][1], v[2][0], v[2][1])
          ctx.stroke()
        })
        ctx.restore()

        // =========================================================================
        // 3. "EXPLOSIVE SPARKERS" (Sharp Radiant Needle Spikes)
        // Matching sketch: Long razor-sharp diamond needles shooting outward radially
        // =========================================================================
        const needles = [
          { from: [240, 520], to: [50, 410], width: 18 },    // High-left towards caster
          { from: [210, 600], to: [20, 590], width: 22 },    // Direct left
          { from: [240, 700], to: [40, 780], width: 18 },    // Down-left towards floor
          { from: [300, 425], to: [160, 210], width: 22 },   // Up-left
          { from: [395, 375], to: [360, 110], width: 24 },   // Straight up
          { from: [520, 400], to: [660, 170], width: 22 },   // Up-right through smoke
          { from: [640, 620], to: [890, 600], width: 22 },   // Direct right
          { from: [600, 730], to: [860, 830], width: 24 },   // Down-right across table
          { from: [410, 780], to: [420, 970], width: 18 },   // Downward table splash
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
          nGrad.addColorStop(0.75, '#fef08a')
          nGrad.addColorStop(1, '#ffffff')
          ctx.fillStyle = nGrad
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 16
          ctx.fill()

          // Inner white razor spine
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2.2
          ctx.beginPath()
          ctx.moveTo(n.from[0] + ux * len * 0.22, n.from[1] + uy * len * 0.22)
          ctx.lineTo(n.to[0], n.to[1])
          ctx.stroke()
          ctx.restore()
        })

        // =========================================================================
        // 4. "MOLTEN MAGMA SPARKS" (Scattered droplet embers)
        // =========================================================================
        for (let s = 0; s < 45; s++) {
          const ang = Math.random() * Math.PI * 2
          const dist = 160 + Math.random() * 340
          const sx = 400 + Math.cos(ang) * dist
          const sy = 580 + Math.sin(ang) * dist * 0.88
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
  const outPath = '/Users/khang/hogwarts-duel-3d/docs/screenshots/confringo_art_v2.png'
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  console.log(`Saved artwork to ${outPath}`)
  ws.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
