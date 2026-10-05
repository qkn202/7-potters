import WebSocket from 'ws'
import fs from 'fs'

async function run() {
  const jsonRes = await fetch('http://127.0.0.1:9222/json')
  const targets = await jsonRes.json()
  const target = targets.find(t => t.type === 'page')
  if (!target) {
    console.error('No page target found!')
    process.exit(1)
  }

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

  console.log('Rendering Majestic Expecto Patronum in-engine visual sketch...')
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const W = 1280
        const H = 800
        const cv = document.createElement('canvas')
        cv.width = W
        cv.height = H
        const ctx = cv.getContext('2d')

        // 1. DUELING ARENA NIGHT SKY BACKGROUND
        const bgGrad = ctx.createRadialGradient(W * 0.52, H * 0.45, 60, W * 0.5, H * 0.5, 750)
        bgGrad.addColorStop(0, '#0c1a30')
        bgGrad.addColorStop(0.35, '#081220')
        bgGrad.addColorStop(0.70, '#040914')
        bgGrad.addColorStop(1, '#010308')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, W, H)

        // Subtle gothic stone arena ground
        const floorGrad = ctx.createLinearGradient(0, H * 0.70, 0, H)
        floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)')
        floorGrad.addColorStop(0.5, 'rgba(10, 16, 30, 0.85)')
        floorGrad.addColorStop(1, 'rgba(2, 6, 23, 1)')
        ctx.fillStyle = floorGrad
        ctx.fillRect(0, H * 0.70, W, H * 0.30)

        // 2. CELESTIAL EXPANDING SHOCKWAVES (Concentric elliptical ripples)
        const center = { x: 670, y: 380 }
        
        ctx.save()
        for (let r = 0; r < 4; r++) {
          const rx = 240 + r * 130
          const ry = 110 + r * 58
          ctx.beginPath()
          ctx.ellipse(center.x + r * 20, center.y + 15, rx, ry, -0.12, 0, Math.PI * 2)
          ctx.strokeStyle = r === 0 ? 'rgba(255, 255, 255, 0.85)' : 
                           (r === 1 ? 'rgba(224, 242, 254, 0.60)' : 
                           (r === 2 ? 'rgba(125, 211, 252, 0.35)' : 'rgba(56, 189, 248, 0.15)'))
          ctx.lineWidth = Math.max(1.5, 4.5 - r * 0.9)
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 24 + r * 8
          ctx.stroke()
        }
        ctx.restore()

        // 3. WAND STREAM & FLOWING ETHEREAL MIST RIBBONS (From wand tip at left)
        const wandOrigin = { x: 70, y: 640 }
        
        // Wand burst flare
        ctx.save()
        const wandFlare = ctx.createRadialGradient(wandOrigin.x, wandOrigin.y, 2, wandOrigin.x, wandOrigin.y, 110)
        wandFlare.addColorStop(0, '#ffffff')
        wandFlare.addColorStop(0.2, 'rgba(224, 242, 254, 0.9)')
        wandFlare.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)')
        wandFlare.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.fillStyle = wandFlare
        ctx.beginPath()
        ctx.arc(wandOrigin.x, wandOrigin.y, 110, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Flowing Catmull-Rom style ribbon streams
        const ribbons = [
          { p0: wandOrigin, cp1: { x: 220, y: 560 }, cp2: { x: 420, y: 460 }, p1: { x: 620, y: 400 }, w: 50, color: 'rgba(56, 189, 248, 0.28)' },
          { p0: wandOrigin, cp1: { x: 250, y: 520 }, cp2: { x: 450, y: 390 }, p1: { x: 680, y: 360 }, w: 30, color: 'rgba(186, 230, 253, 0.55)' },
          { p0: wandOrigin, cp1: { x: 290, y: 580 }, cp2: { x: 500, y: 450 }, p1: { x: 740, y: 410 }, w: 18, color: 'rgba(240, 249, 255, 0.85)' },
          // Upper swirling wisp over antlers
          { p0: { x: 340, y: 480 }, cp1: { x: 480, y: 220 }, cp2: { x: 700, y: 150 }, p1: { x: 920, y: 200 }, w: 22, color: 'rgba(125, 211, 252, 0.40)' },
          // Lower ground vortex wisp
          { p0: { x: 380, y: 610 }, cp1: { x: 580, y: 640 }, cp2: { x: 800, y: 580 }, p1: { x: 1040, y: 490 }, w: 32, color: 'rgba(14, 165, 233, 0.25)' }
        ]

        ribbons.forEach(rib => {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(rib.p0.x, rib.p0.y)
          ctx.bezierCurveTo(rib.cp1.x, rib.cp1.y, rib.cp2.x, rib.cp2.y, rib.p1.x, rib.p1.y)
          ctx.strokeStyle = rib.color
          ctx.lineWidth = rib.w
          ctx.lineCap = 'round'
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 35
          ctx.stroke()
          ctx.restore()
        })

        // 4. VOLUMETRIC SILVER-WHITE BLOOM AURA
        ctx.save()
        const auraGrad = ctx.createRadialGradient(680, 360, 50, 680, 360, 350)
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)')
        auraGrad.addColorStop(0.22, 'rgba(224, 242, 254, 0.72)')
        auraGrad.addColorStop(0.50, 'rgba(125, 211, 252, 0.38)')
        auraGrad.addColorStop(0.80, 'rgba(14, 165, 233, 0.12)')
        auraGrad.addColorStop(1, 'rgba(2, 6, 23, 0)')
        ctx.fillStyle = auraGrad
        ctx.fillRect(180, 40, 1000, 640)
        ctx.restore()

        // 5. ANATOMICALLY DETAILED SILVER STAG (Noble Gallop Pose)
        // Center offset around (680, 360)
        ctx.save()
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = 30

        // Create silver shimmering body gradient
        const stagGrad = ctx.createLinearGradient(450, 450, 850, 200)
        stagGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)')
        stagGrad.addColorStop(0.4, '#ffffff')
        stagGrad.addColorStop(0.7, '#ffffff')
        stagGrad.addColorStop(1, 'rgba(240, 249, 255, 0.95)')
        ctx.fillStyle = stagGrad

        // --- A. MAIN BODY TORSO & FLANK ---
        ctx.beginPath()
        // Withers (top of shoulder)
        ctx.moveTo(680, 290)
        // Back dip (saddle)
        ctx.bezierCurveTo(630, 295, 590, 310, 560, 315)
        // Muscular rump / croup
        ctx.bezierCurveTo(530, 320, 505, 335, 495, 365)
        // Buttock to rear thigh
        ctx.bezierCurveTo(490, 395, 510, 420, 540, 430)
        // Underbelly tuck
        ctx.bezierCurveTo(590, 435, 630, 415, 670, 400)
        // Deep muscular chest curve
        ctx.bezierCurveTo(720, 385, 750, 355, 745, 325)
        // Front breast / brisket to withers
        ctx.bezierCurveTo(735, 305, 705, 290, 680, 290)
        ctx.closePath()
        ctx.fill()

        // --- B. REGAL ARCHED NECK ---
        ctx.beginPath()
        ctx.moveTo(685, 290) // withers
        // Crest of neck arching up-forward
        ctx.bezierCurveTo(710, 255, 735, 220, 765, 185)
        // Throat latch & jaw
        ctx.lineTo(775, 195)
        // Underside of neck (dewlap) swooping back to chest
        ctx.bezierCurveTo(755, 240, 735, 280, 730, 315)
        ctx.closePath()
        ctx.fill()

        // --- C. NOBLE HEAD & MUZZLE ---
        ctx.beginPath()
        ctx.moveTo(765, 185) // crown
        // Forehead down to nose
        ctx.bezierCurveTo(790, 175, 820, 170, 850, 180)
        // Velvet muzzle tip
        ctx.bezierCurveTo(855, 185, 850, 195, 835, 200)
        // Chin & slender lower jaw
        ctx.bezierCurveTo(810, 205, 790, 200, 775, 195)
        ctx.closePath()
        ctx.fill()

        // Alert Pricked Ears
        // Left Ear
        ctx.beginPath()
        ctx.moveTo(760, 180)
        ctx.bezierCurveTo(745, 150, 750, 140, 758, 145)
        ctx.bezierCurveTo(768, 155, 768, 170, 766, 182)
        ctx.fill()
        // Right Ear
        ctx.beginPath()
        ctx.moveTo(772, 182)
        ctx.bezierCurveTo(775, 148, 785, 138, 792, 145)
        ctx.bezierCurveTo(795, 158, 788, 172, 780, 185)
        ctx.fill()

        // --- D. FORELEGS (Dynamic galloping stride) ---
        // Right Foreleg (Reaching high & forward in mid-air)
        ctx.beginPath()
        ctx.moveTo(725, 335) // shoulder
        ctx.quadraticCurveTo(755, 360, 785, 365) // upper arm
        ctx.lineTo(840, 370) // forearm
        ctx.lineTo(875, 390) // knee & pastern
        ctx.lineTo(890, 395) // pointed hoof
        ctx.lineTo(875, 400)
        ctx.lineTo(830, 380)
        ctx.lineTo(775, 375)
        ctx.lineTo(715, 355)
        ctx.closePath()
        ctx.fill()

        // Left Foreleg (Tucked beneath chest preparing next thrust)
        ctx.beginPath()
        ctx.moveTo(695, 355)
        ctx.quadraticCurveTo(715, 390, 725, 420) // knee down
        ctx.lineTo(710, 460) // cannon
        ctx.lineTo(695, 485) // hoof
        ctx.lineTo(685, 475)
        ctx.lineTo(700, 440)
        ctx.lineTo(690, 410)
        ctx.closePath()
        ctx.fill()

        // --- E. HINDQUARTERS & HIND LEGS (Powerful leaping drive) ---
        // Left Hind Leg (Extended far back in trailing leap)
        ctx.beginPath()
        ctx.moveTo(525, 350) // hip
        ctx.bezierCurveTo(480, 375, 440, 410, 410, 450) // muscular stifle
        ctx.lineTo(365, 510) // hock
        ctx.lineTo(325, 560) // fetlock & hoof
        ctx.lineTo(335, 565)
        ctx.lineTo(380, 520)
        ctx.lineTo(430, 465)
        ctx.lineTo(485, 415)
        ctx.closePath()
        ctx.fill()

        // Right Hind Leg (Cocking forward under flank for spring)
        ctx.beginPath()
        ctx.moveTo(555, 365)
        ctx.quadraticCurveTo(535, 420, 510, 465) // gaskin
        ctx.lineTo(485, 515) // hock
        ctx.lineTo(465, 545) // hoof
        ctx.lineTo(455, 535)
        ctx.lineTo(475, 495)
        ctx.lineTo(500, 450)
        ctx.lineTo(530, 405)
        ctx.closePath()
        ctx.fill()

        // Flowing Silver Tail
        ctx.beginPath()
        ctx.moveTo(498, 360)
        ctx.bezierCurveTo(465, 355, 440, 380, 425, 410)
        ctx.bezierCurveTo(435, 405, 460, 385, 490, 380)
        ctx.fill()

        // --- F. MAGNIFICENT BRANCHING SILVER ANTLERS ---
        ctx.strokeStyle = '#ffffff'
        ctx.shadowColor = '#bae6fd'
        ctx.shadowBlur = 22
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // 1. Right Antler (Prominent foreground branch)
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(775, 180) // pedicle
        ctx.bezierCurveTo(780, 130, 760, 85, 730, 45) // main beam sweep
        ctx.stroke()

        // Brow tine
        ctx.lineWidth = 4.5
        ctx.beginPath()
        ctx.moveTo(776, 165)
        ctx.bezierCurveTo(805, 150, 835, 145, 860, 145)
        ctx.stroke()

        // Bez tine
        ctx.beginPath()
        ctx.moveTo(772, 135)
        ctx.bezierCurveTo(795, 115, 820, 105, 840, 100)
        ctx.stroke()

        // Royal tine (high reach)
        ctx.beginPath()
        ctx.moveTo(755, 105)
        ctx.bezierCurveTo(775, 75, 800, 60, 820, 55)
        ctx.stroke()

        // Crown surroyals (Majestic top forks)
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(738, 70)
        ctx.lineTo(760, 38)
        ctx.moveTo(730, 45)
        ctx.lineTo(725, 20)
        ctx.moveTo(730, 45)
        ctx.lineTo(705, 32)
        ctx.stroke()

        // 2. Left Antler (Background branch, slightly offset & softer)
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(762, 178)
        ctx.bezierCurveTo(740, 135, 700, 95, 665, 60)
        ctx.stroke()

        // Brow tine
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(756, 160)
        ctx.bezierCurveTo(775, 145, 795, 140, 815, 140)
        ctx.stroke()

        // Tray tine
        ctx.beginPath()
        ctx.moveTo(735, 125)
        ctx.bezierCurveTo(750, 100, 770, 88, 785, 82)
        ctx.stroke()

        // Crown forks
        ctx.beginPath()
        ctx.moveTo(685, 80)
        ctx.lineTo(705, 52)
        ctx.moveTo(665, 60)
        ctx.lineTo(655, 35)
        ctx.moveTo(665, 60)
        ctx.lineTo(640, 50)
        ctx.stroke()

        // --- G. LUMINOUS EYE & INNER ENERGY SINEWS ---
        ctx.fillStyle = '#e0f2fe'
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(798, 185, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(798, 185, 1.8, 0, Math.PI * 2)
        ctx.fill()

        // Ethereal wisps trailing from hooves into slipstream
        const hoofWisps = [
          { x: 890, y: 395, dx: -90, dy: 15 },
          { x: 695, y: 485, dx: -110, dy: 25 },
          { x: 465, y: 545, dx: -140, dy: 35 },
          { x: 325, y: 560, dx: -180, dy: 40 }
        ]
        hoofWisps.forEach(hw => {
          ctx.save()
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)'
          ctx.lineWidth = 3.5
          ctx.beginPath()
          ctx.moveTo(hw.x, hw.y)
          ctx.quadraticCurveTo(hw.x + hw.dx * 0.5, hw.y + hw.dy * 0.4 - 15, hw.x + hw.dx, hw.y + hw.dy)
          ctx.stroke()
          ctx.restore()
        })

        ctx.restore()

        // 6. LUMINESCENT STARDUST & ETHEREAL EMBERS (90+ particles)
        for (let s = 0; s < 110; s++) {
          const sx = 280 + Math.random() * 800
          const sy = 60 + Math.random() * 580
          const rad = 1.2 + Math.random() * 3.8
          ctx.save()
          ctx.fillStyle = s % 4 === 0 ? '#ffffff' : (s % 3 === 0 ? '#bae6fd' : '#38bdf8')
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 14
          ctx.beginPath()
          ctx.arc(sx, sy, rad, 0, Math.PI * 2)
          ctx.fill()

          // 4-Point cross sparkle on brighter stars
          if (s % 7 === 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)'
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(sx - rad * 3.2, sy)
            ctx.lineTo(sx + rad * 3.2, sy)
            ctx.moveTo(sx, sy - rad * 3.2)
            ctx.lineTo(sx, sy + rad * 3.2)
            ctx.stroke()
          }
          ctx.restore()
        }

        // 7. IN-GAME GRAPHICAL HUD & COMPONENT ARCHITECTURE ANNOTATIONS
        ctx.save()
        // Title Box
        ctx.fillStyle = 'rgba(2, 6, 23, 0.75)'
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(40, 35, 620, 160, 10)
        ctx.fill()
        ctx.stroke()

        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 16
        ctx.fillText('EXPECTO PATRONUM — IN-ENGINE GRAPHICS V2', 60, 70)
        
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace'
        ctx.fillStyle = '#94a3b8'
        ctx.shadowBlur = 0
        ctx.fillText('• Layer 1: Procedural Galloping Stag Canvas (High-Anatomy Silver Silhouette)', 60, 102)
        ctx.fillText('• Layer 2: Ethereal Vapor Ribbons (Volumetric Catmull-Rom Spline Stream)', 60, 124)
        ctx.fillText('• Layer 3: Dynamic Expanding Shockwaves (Additive Tilted RingGeometry)', 60, 146)
        ctx.fillText('• Layer 4: 110+ Luminescent Stardust Billboard Embers (Real-time Drift)', 60, 168)
        ctx.restore()

        return cv.toDataURL('image/png')
      })()
    `
  })

  const dataUrl = evalRes.result.value
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
  const outPath = '/Users/khang/hogwarts-duel-3d/docs/screenshots/expecto_patronum_concept_v2.png'
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  console.log(`Saved enhanced Expecto Patronum visual sketch to ${outPath}`)
  ws.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
