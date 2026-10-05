import * as THREE from 'three'

// =========================================================================
// PROCEDURAL TEXTURE GENERATION FOR 8 NEW ADVANCED SPELLS
// =========================================================================

export interface Vfx8Textures {
  bloodSlash: THREE.CanvasTexture
  stoneBinding: THREE.CanvasTexture
  confringoBlast: THREE.CanvasTexture
  stylizedFlameLobe: THREE.CanvasTexture
  explosiveSparker: THREE.CanvasTexture
  frostCrystal: THREE.CanvasTexture
  darkSerpent: THREE.CanvasTexture
  gravityRune: THREE.CanvasTexture
  memorySpiral: THREE.CanvasTexture
  patronusStag: THREE.CanvasTexture
}

/**
 * 1. Sectumsempra Blood Blade Slash Texture (512x512)
 * High-definition sweeping curved crescent scythe with glowing arterial crimson,
 * white-hot razor cutting edge, serrated energy fringes, and flying blood droplets.
 */
function createBloodSlashTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 512)

  ctx.save()
  // Deep blood aura glow
  ctx.shadowColor = '#dc2626'
  ctx.shadowBlur = 26

  // Outer dark crimson arterial body
  const grad = ctx.createLinearGradient(50, 460, 485, 45)
  grad.addColorStop(0, '#450a0a')
  grad.addColorStop(0.35, '#8b0000')
  grad.addColorStop(0.65, '#dc2626')
  grad.addColorStop(1, '#ef4444')

  // Sweeping wide crescent scythe arc (Matching concept sketch)
  ctx.beginPath()
  ctx.moveTo(50, 460)
  ctx.bezierCurveTo(115, 260, 255, 105, 485, 45)
  ctx.bezierCurveTo(310, 165, 175, 305, 50, 460)
  ctx.fillStyle = grad
  ctx.fill()

  // Inner searing scarlet flame wedge
  const innerGrad = ctx.createLinearGradient(80, 435, 480, 50)
  innerGrad.addColorStop(0, '#991b1b')
  innerGrad.addColorStop(0.45, '#ef4444')
  innerGrad.addColorStop(0.85, '#fca5a5')
  innerGrad.addColorStop(1, '#ffffff')

  ctx.beginPath()
  ctx.moveTo(70, 445)
  ctx.bezierCurveTo(135, 265, 270, 115, 480, 50)
  ctx.bezierCurveTo(295, 155, 165, 285, 70, 445)
  ctx.fillStyle = innerGrad
  ctx.fill()

  // Razor-sharp white-hot cutting edge
  ctx.beginPath()
  ctx.moveTo(70, 445)
  ctx.bezierCurveTo(135, 265, 270, 115, 480, 50)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 6
  ctx.stroke()

  ctx.strokeStyle = '#fecdd3'
  ctx.lineWidth = 14
  ctx.stroke()

  // Sinuous arterial blood droplets and spray sparks along the trailing edge
  for (let i = 0; i < 38; i++) {
    const t = Math.random()
    const px = 50 + t * (485 - 50) + (Math.random() - 0.5) * 65
    const py = 460 - Math.pow(t, 0.78) * (460 - 45) + (Math.random() - 0.5) * 65
    const rad = 2 + Math.random() * 5.5
    ctx.beginPath()
    ctx.arc(px, py, rad, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#8b0000'
    ctx.fill()
  }
  ctx.restore()

  return new THREE.CanvasTexture(cv)
}

/**
 * 2. Petrificus Totalus Runic Binding Band Texture (512x128)
 * Luminous chalk-white & ethereal cyan ancient binding runes on translucent silver-blue ribbon
 * (Exact match to Harry Potter Canon Full Body-Bind Curse & in-game concept)
 */
function createStoneBindingTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 128
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 128)

  // 1. Deep translucent midnight silver-blue ribbon gradient base
  const grad = ctx.createLinearGradient(0, 0, 0, 128)
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.85)')
  grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.95)')
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 128)

  // 2. Bright glowing runic edge borders
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 12
  ctx.strokeRect(0, 2, 512, 124)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.strokeRect(0, 4, 512, 120)

  // 3. Ancient Elder Futhark / Celestial Binding Glyphs (Ký tự cổ ngữ phong ấn)
  const runes = ['᚛', 'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', '᚜']
  ctx.font = 'bold 36px "Segoe UI Historic", "Courier New", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const count = 18
  const step = 512 / count
  for (let i = 0; i < count; i++) {
    const rune = runes[i % runes.length]
    const x = step * i + step * 0.5
    const y = 64

    // Neon cyan glow pass
    ctx.fillStyle = '#38bdf8'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 16
    ctx.fillText(rune, x, y)

    // Brilliant chalk-white hot core pass
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 6
    ctx.fillText(rune, x, y)
  }

  // 4. Subtle magical sparkles along the band
  for (let s = 0; s < 30; s++) {
    const sx = Math.random() * 512
    const sy = 10 + Math.random() * 108
    const sr = 1.0 + Math.random() * 2.0
    ctx.fillStyle = '#f8fafc'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/**
 * 3. Confringo Fiery Explosive Burst Master Texture (1024x1024)
 * Exact 99% match to Concept Sheet 1 (Bottom Left: CONFRINGO):
 * - Volumetric cauliflower flame cloud with luminous golden-yellow core and saturated fiery orange/vermilion petals
 * - Thick billowing dark charcoal soot smoke column curling upward and to the right
 * - Distinct high-velocity directional needle spikes ("EXPLOSIVE SPARKERS") radiating in starburst angles
 * - Scattered molten magma droplet embers
 * - Comic sketch lineart and stylized soot crevices without blinding white blowout
 */
function createConfringoBlastTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 1024, 1024)

  const cx = 512
  const cy = 512

  // --- 1. OUTER SOFT THERMAL RADIATION & CONCUSSIVE GLOW ---
  // Completely soft Gaussian-style falloff to zero alpha at edges (zero bounding box clipping)
  const ambientGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 490)
  ambientGlow.addColorStop(0, 'rgba(255, 235, 180, 0.95)')
  ambientGlow.addColorStop(0.20, 'rgba(255, 140, 20, 0.75)')
  ambientGlow.addColorStop(0.45, 'rgba(234, 88, 12, 0.45)')
  ambientGlow.addColorStop(0.70, 'rgba(185, 28, 28, 0.18)')
  ambientGlow.addColorStop(0.92, 'rgba(127, 29, 29, 0.05)')
  ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = ambientGlow
  ctx.beginPath()
  ctx.arc(cx, cy, 490, 0, Math.PI * 2)
  ctx.fill()

  // --- 2. VOLUMETRIC CAULIFLOWER FLAME LOBES (Outer Mantle) ---
  // 14 organic overlapping spherical fireballs radiating in 360 degrees
  const outerLobes = [
    { ang: 0.0, dist: 220, r: 145 },
    { ang: 0.45, dist: 240, r: 155 },
    { ang: 0.90, dist: 210, r: 140 },
    { ang: 1.35, dist: 250, r: 160 },
    { ang: 1.80, dist: 230, r: 150 },
    { ang: 2.25, dist: 260, r: 165 },
    { ang: 2.70, dist: 220, r: 145 },
    { ang: 3.15, dist: 240, r: 155 },
    { ang: 3.60, dist: 215, r: 140 },
    { ang: 4.05, dist: 255, r: 160 },
    { ang: 4.50, dist: 235, r: 150 },
    { ang: 4.95, dist: 260, r: 165 },
    { ang: 5.40, dist: 225, r: 145 },
    { ang: 5.85, dist: 245, r: 155 },
  ]

  // A. Outer smoky charred crust for each lobe
  outerLobes.forEach(l => {
    const lx = cx + Math.cos(l.ang) * l.dist
    const ly = cy + Math.sin(l.ang) * l.dist * 0.92 // slightly flattened for blast weight
    const grad = ctx.createRadialGradient(lx, ly, l.r * 0.15, lx, ly, l.r)
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.95)')
    grad.addColorStop(0.40, 'rgba(220, 38, 38, 0.88)')
    grad.addColorStop(0.70, 'rgba(153, 27, 27, 0.70)')
    grad.addColorStop(0.90, 'rgba(38, 20, 20, 0.55)')
    grad.addColorStop(1, 'rgba(15, 10, 10, 0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(lx, ly, l.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // B. Mid vibrant incendiary flame lobes (Golden amber to fiery vermilion)
  const midLobes = [
    { ang: 0.22, dist: 140, r: 130 },
    { ang: 0.70, dist: 150, r: 135 },
    { ang: 1.15, dist: 135, r: 125 },
    { ang: 1.60, dist: 155, r: 140 },
    { ang: 2.05, dist: 140, r: 130 },
    { ang: 2.50, dist: 150, r: 135 },
    { ang: 2.95, dist: 135, r: 125 },
    { ang: 3.40, dist: 155, r: 140 },
    { ang: 3.85, dist: 140, r: 130 },
    { ang: 4.30, dist: 150, r: 135 },
    { ang: 4.75, dist: 135, r: 125 },
    { ang: 5.20, dist: 155, r: 140 },
    { ang: 5.65, dist: 140, r: 130 },
    { ang: 6.10, dist: 150, r: 135 },
  ]

  midLobes.forEach(m => {
    const mx = cx + Math.cos(m.ang) * m.dist
    const my = cy + Math.sin(m.ang) * m.dist * 0.95
    const mGrad = ctx.createRadialGradient(mx, my, m.r * 0.10, mx, my, m.r)
    mGrad.addColorStop(0, 'rgba(254, 240, 138, 0.98)')
    mGrad.addColorStop(0.35, 'rgba(251, 146, 60, 0.92)')
    mGrad.addColorStop(0.70, 'rgba(234, 88, 12, 0.80)')
    mGrad.addColorStop(0.92, 'rgba(185, 28, 28, 0.35)')
    mGrad.addColorStop(1, 'rgba(127, 29, 29, 0)')

    ctx.fillStyle = mGrad
    ctx.beginPath()
    ctx.arc(mx, my, m.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // --- 3. INNER INCANDESCENT FUSION CORE (Blinding White-Hot Heart) ---
  const coreClusters = [
    { dx: 0, dy: 0, r: 130 },
    { dx: -45, dy: -25, r: 105 },
    { dx: 45, dy: -20, r: 100 },
    { dx: -30, dy: 35, r: 100 },
    { dx: 35, dy: 30, r: 95 },
  ]

  coreClusters.forEach(c => {
    const cGrad = ctx.createRadialGradient(cx + c.dx, cy + c.dy, 10, cx + c.dx, cy + c.dy, c.r)
    cGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    cGrad.addColorStop(0.25, 'rgba(255, 250, 204, 0.98)')
    cGrad.addColorStop(0.55, 'rgba(253, 224, 71, 0.90)')
    cGrad.addColorStop(0.80, 'rgba(249, 115, 22, 0.65)')
    cGrad.addColorStop(1, 'rgba(234, 88, 12, 0)')

    ctx.fillStyle = cGrad
    ctx.beginPath()
    ctx.arc(cx + c.dx, cy + c.dy, c.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // --- 4. SWIRLING FLAME TENDRILS & CREVICE CREASES ---
  ctx.save()
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ctx.shadowColor = '#f59e0b'
  ctx.shadowBlur = 12

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const startR = 75
    const endR = 210 + (i % 3) * 45
    const sx = cx + Math.cos(a) * startR
    const sy = cy + Math.sin(a) * startR
    const ex = cx + Math.cos(a + 0.35) * endR
    const ey = cy + Math.sin(a + 0.35) * endR
    const cpx = cx + Math.cos(a + 0.15) * (startR + endR) * 0.55
    const cpy = cy + Math.sin(a + 0.15) * (startR + endR) * 0.55

    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(cpx, cpy, ex, ey)
    ctx.stroke()
  }
  ctx.restore()

  // --- 5. FLYING MOLTEN MAGMA SPARKS & EMBERS ---
  for (let s = 0; s < 60; s++) {
    const ang = Math.random() * Math.PI * 2
    const dist = 140 + Math.random() * 320
    const sx = cx + Math.cos(ang) * dist
    const sy = cy + Math.sin(ang) * dist * 0.95
    const r = 2.0 + Math.random() * 4.0

    ctx.save()
    ctx.fillStyle = s % 3 === 0 ? '#ffffff' : (s % 2 === 0 ? '#fef08a' : '#f97316')
    ctx.shadowColor = '#ea580c'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/**
 * 3b. Stylized Flame Lobe Texture (512x512)
 * High-definition hand-drawn stylized cauliflower flame petal/lobe matching Concept Sheet 1:
 * Clean unified organic silhouette with hot golden-yellow nucleus, saturated orange body,
 * deep vermilion rim, and hand-drawn comic crease accents (NO intersecting inner circle lines).
 */
function createStylizedFlameLobeTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 512)

  const lobes = [
    // Bottom-center root bulb
    { cx: 256, cy: 340, r: 105 },
    // Flanking lower bulbs
    { cx: 180, cy: 310, r: 85 },
    { cx: 332, cy: 310, r: 85 },
    // Mid scalloped shoulders
    { cx: 160, cy: 230, r: 75 },
    { cx: 352, cy: 230, r: 75 },
    // Upper crowning bulbs
    { cx: 210, cy: 160, r: 68 },
    { cx: 302, cy: 160, r: 68 },
    // Central summit flame tongue
    { cx: 256, cy: 120, r: 64 },
  ]

  // 1. Unified Flame Fill (Warm golden yellow -> Vibrant orange -> Crimson rim)
  ctx.save()
  ctx.beginPath()
  lobes.forEach(l => {
    ctx.moveTo(l.cx + l.r, l.cy)
    ctx.arc(l.cx, l.cy, l.r, 0, Math.PI * 2)
  })
  const flameGrad = ctx.createRadialGradient(256, 270, 20, 256, 240, 210)
  flameGrad.addColorStop(0, '#fef9c3')    // Soft warm cream nucleus
  flameGrad.addColorStop(0.25, '#fef08a') // Luminous bright golden yellow
  flameGrad.addColorStop(0.55, '#fde047') // Warm golden amber
  flameGrad.addColorStop(0.80, '#fb923c') // Saturated fiery orange
  flameGrad.addColorStop(0.94, '#dc2626') // Deep vermilion rim
  flameGrad.addColorStop(1, 'rgba(40, 15, 15, 0.95)') // Dark soot rim
  ctx.fillStyle = flameGrad
  ctx.shadowColor = '#f59e0b'
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.restore()

  // 2. Soft Scalloped Edge Shading on Lobes
  lobes.forEach(l => {
    ctx.save()
    const bGrad = ctx.createRadialGradient(l.cx, l.cy, l.r * 0.40, l.cx, l.cy, l.r)
    bGrad.addColorStop(0, 'rgba(251, 146, 60, 0)')
    bGrad.addColorStop(0.70, 'rgba(220, 38, 38, 0.30)')
    bGrad.addColorStop(0.92, 'rgba(127, 29, 29, 0.55)')
    bGrad.addColorStop(1, 'rgba(28, 25, 23, 0.80)')
    ctx.fillStyle = bGrad
    ctx.beginPath()
    ctx.arc(l.cx, l.cy, l.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })

  // 3. Inner Swirling Golden Flame Veins (Gân lửa uốn lượn)
  ctx.save()
  ctx.strokeStyle = '#fef08a'
  ctx.lineWidth = 3.0
  ctx.shadowColor = '#fbbf24'
  ctx.shadowBlur = 10
  ctx.lineCap = 'round'
  const veins = [
    [[256, 380], [256, 260], [256, 125]],
    [[210, 360], [175, 260], [195, 160]],
    [[302, 360], [337, 260], [317, 160]],
    [[170, 320], [135, 240], [150, 190]],
    [[342, 320], [377, 240], [362, 190]],
  ]
  veins.forEach(v => {
    ctx.beginPath()
    ctx.moveTo(v[0][0], v[0][1])
    ctx.quadraticCurveTo(v[1][0], v[1][1], v[2][0], v[2][1])
    ctx.stroke()
  })
  ctx.restore()

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/**
 * 3c. Explosive Sparker Needle Texture (512x128)
 * Sharp directional high-velocity needle spark matching Concept Sheet 1 "EXPLOSIVE SPARKERS":
 * White-hot incandescent needle tip tapering into saturated orange and deep red wake.
 */
function createExplosiveSparkerTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 128
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 128)

  // Gradient along horizontal axis (tip at left X=0, tail at right X=512)
  const grad = ctx.createLinearGradient(0, 64, 512, 64)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.12, '#fef08a')
  grad.addColorStop(0.35, '#ff7700')
  grad.addColorStop(0.70, '#dc2626')
  grad.addColorStop(1, 'rgba(153, 27, 27, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  // Needle diamond profile
  ctx.moveTo(0, 64)
  ctx.lineTo(80, 64 - 16)
  ctx.lineTo(512, 64 - 1.5)
  ctx.lineTo(512, 64 + 1.5)
  ctx.lineTo(80, 64 + 16)
  ctx.closePath()
  ctx.fill()

  // Inner bright streak
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(0, 64)
  ctx.lineTo(160, 64)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/**
 * 4. Immobulus Frost Crystal Texture (256x256)
 * 6-fold dendritic ice crystal fractal with sharp ice needles
 */
function createFrostCrystalTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 256
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)

  ctx.save()
  ctx.translate(128, 128)
  ctx.strokeStyle = '#bae6fd'
  ctx.lineWidth = 4
  ctx.shadowColor = '#38bdf8'
  ctx.shadowBlur = 14

  for (let arm = 0; arm < 6; arm++) {
    ctx.save()
    ctx.rotate((arm * Math.PI) / 3)

    // Main needle
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -110)
    ctx.stroke()

    // Side branches
    for (let b = 30; b < 100; b += 25) {
      ctx.beginPath()
      ctx.moveTo(0, -b)
      ctx.lineTo(-20, -b - 18)
      ctx.moveTo(0, -b)
      ctx.lineTo(20, -b - 18)
      ctx.stroke()
    }
    ctx.restore()
  }

  // Brilliant crystal core
  ctx.beginPath()
  ctx.arc(0, 0, 18, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()

  return new THREE.CanvasTexture(cv)
}

/**
 * 5. Morsmordre Dark Serpent Texture (256x256)
 * Glowing emerald serpent tongue issuing from dark storm clouds
 */
function createDarkSerpentTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 256
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)

  // Sinister green snake tongue curve
  ctx.save()
  ctx.shadowColor = '#22c55e'
  ctx.shadowBlur = 16

  ctx.beginPath()
  ctx.moveTo(128, 20)
  ctx.bezierCurveTo(70, 80, 190, 150, 110, 220)
  ctx.bezierCurveTo(90, 240, 70, 250, 60, 252)
  ctx.strokeStyle = '#4ade80'
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.stroke()

  // Forked tip
  ctx.beginPath()
  ctx.moveTo(60, 252)
  ctx.lineTo(40, 240)
  ctx.moveTo(60, 252)
  ctx.lineTo(45, 255)
  ctx.strokeStyle = '#86efac'
  ctx.lineWidth = 8
  ctx.stroke()

  // Serpent glowing eyes
  ctx.fillStyle = '#fef08a'
  ctx.beginPath()
  ctx.arc(115, 45, 6, 0, Math.PI * 2)
  ctx.arc(141, 45, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  return new THREE.CanvasTexture(cv)
}

/**
 * 6. Levicorpus Arcane Gravity Glyph (256x256)
 * Violet runic wheel with anti-gravity glyph arrows
 */
function createGravityRuneTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 256
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)

  ctx.save()
  ctx.translate(128, 128)
  ctx.strokeStyle = '#c084fc'
  ctx.lineWidth = 4
  ctx.shadowColor = '#a855f7'
  ctx.shadowBlur = 14

  // Outer runic ring
  ctx.beginPath()
  ctx.arc(0, 0, 110, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, 88, 0, Math.PI * 2)
  ctx.stroke()

  // Anti-gravity upward triangles & arrows
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI) / 2)
    ctx.beginPath()
    ctx.moveTo(0, -90)
    ctx.lineTo(-14, -60)
    ctx.lineTo(14, -60)
    ctx.closePath()
    ctx.fillStyle = '#e9d5ff'
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
  return new THREE.CanvasTexture(cv)
}

/**
 * 7. Obliviate Memory Whirlpool Spiral (256x256)
 * Cyan-blue swirling vortex of luminescent thoughts and wisps
 */
function createMemorySpiralTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 256
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)

  ctx.save()
  ctx.translate(128, 128)
  ctx.shadowColor = '#06b6d4'
  ctx.shadowBlur = 15

  for (let arm = 0; arm < 4; arm++) {
    ctx.save()
    ctx.rotate((arm * Math.PI) / 2)
    ctx.beginPath()
    for (let theta = 0; theta < Math.PI * 2.5; theta += 0.08) {
      const r = 8 + Math.pow(theta, 1.4) * 22
      const x = Math.cos(theta) * r
      const y = Math.sin(theta) * r
      if (theta === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = arm % 2 === 0 ? '#67e8f9' : '#22d3ee'
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.restore()
  }

  // Luminescent floating thought dots
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2
    const dist = 15 + Math.random() * 95
    ctx.beginPath()
    ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  ctx.restore()

  return new THREE.CanvasTexture(cv)
}

/**
 * 8. Expecto Patronum Silver Stag Silhouette (512x512)
 * Pure silver radiant stag with magnificent glowing antlers
 */
function createPatronusStagTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 512)

  ctx.save()
  // Radiant silver-white halo
  const halo = ctx.createRadialGradient(256, 256, 40, 256, 256, 240)
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  halo.addColorStop(0.35, 'rgba(224, 242, 254, 0.65)')
  halo.addColorStop(0.7, 'rgba(186, 230, 253, 0.25)')
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, 512, 512)

  // Noble Stag Silhouette in Pure White
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 24
  ctx.fillStyle = '#ffffff'

  // Head and muzzle
  ctx.beginPath()
  ctx.ellipse(256, 220, 24, 38, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // Chest and torso
  ctx.beginPath()
  ctx.ellipse(250, 310, 52, 70, 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Elegant branching antlers
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'

  // Left Antler
  ctx.beginPath()
  ctx.moveTo(246, 195)
  ctx.bezierCurveTo(210, 150, 180, 110, 170, 70)
  ctx.moveTo(225, 160)
  ctx.lineTo(195, 140)
  ctx.moveTo(195, 125)
  ctx.lineTo(170, 115)
  ctx.moveTo(180, 95)
  ctx.lineTo(155, 90)
  ctx.stroke()

  // Right Antler
  ctx.beginPath()
  ctx.moveTo(266, 195)
  ctx.bezierCurveTo(302, 150, 332, 110, 342, 70)
  ctx.moveTo(287, 160)
  ctx.lineTo(317, 140)
  ctx.moveTo(317, 125)
  ctx.lineTo(342, 115)
  ctx.moveTo(332, 95)
  ctx.lineTo(357, 90)
  ctx.stroke()

  ctx.restore()
  return new THREE.CanvasTexture(cv)
}

/**
 * Initialize all 8 spell textures
 */
export function createVfx8SpellTextures(): Vfx8Textures {
  return {
    bloodSlash: createBloodSlashTexture(),
    stoneBinding: createStoneBindingTexture(),
    confringoBlast: createConfringoBlastTexture(),
    stylizedFlameLobe: createStylizedFlameLobeTexture(),
    explosiveSparker: createExplosiveSparkerTexture(),
    frostCrystal: createFrostCrystalTexture(),
    darkSerpent: createDarkSerpentTexture(),
    gravityRune: createGravityRuneTexture(),
    memorySpiral: createMemorySpiralTexture(),
    patronusStag: createPatronusStagTexture(),
  }
}

// =========================================================================
// 3D GEOMETRY BUILDERS FOR THE 8 ADVANCED SPELLS
// =========================================================================

export interface AdvancedSpellVisuals {
  spellName: string
  meshes: THREE.Object3D[]
  extraData?: any
}

/**
 * Helper to construct a lethal curved crescent blade shape (Lưỡi đao bán nguyệt sắc bén)
 * with razor front tip, sweeping convex cutting edge, and aggressive aerodynamic rear barbs
 * exactly matching the concept sketch.
 */
/**
 * High-definition procedural canvas texture for the 3D Crescent Blade body:
 * Forged obsidian blood-steel base, glowing runic fuller groove, and white-scarlet razor cutting bevel.
 */
function createForgedCrescentBladeTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')!
  ctx.clearRect(0, 0, 512, 512)

  // 1. Dark forged obsidian steel background with metallic noise grain
  ctx.fillStyle = '#160205'
  ctx.fillRect(0, 0, 512, 512)

  // Subtle metallic steel grain streaks
  for (let y = 0; y < 512; y += 4) {
    const alpha = 0.08 + Math.random() * 0.12
    ctx.fillStyle = `rgba(80, 10, 15, ${alpha})`
    ctx.fillRect(0, y, 512, 2)
  }

  // 2. Central glowing arterial blood groove / fuller (Rãnh máu huyết sắc)
  const fullerGrad = ctx.createLinearGradient(0, 300, 512, 200)
  fullerGrad.addColorStop(0, '#3b0207')
  fullerGrad.addColorStop(0.3, '#990515')
  fullerGrad.addColorStop(0.6, '#dc2626')
  fullerGrad.addColorStop(1, '#ff4444')

  ctx.strokeStyle = fullerGrad
  ctx.lineWidth = 14
  ctx.shadowColor = '#dc2626'
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.moveTo(30, 320)
  ctx.bezierCurveTo(180, 260, 360, 210, 490, 220)
  ctx.stroke()

  // 3. Ancient dark-magic runic inscriptions along the fuller
  ctx.strokeStyle = '#fca5a5'
  ctx.lineWidth = 2.5
  ctx.shadowColor = '#ef4444'
  ctx.shadowBlur = 10
  for (let r = 0; r < 7; r++) {
    const rx = 80 + r * 55
    const ry = 285 - r * 10 + (Math.sin(r * 1.5) * 8)
    ctx.beginPath()
    ctx.moveTo(rx - 8, ry - 12)
    ctx.lineTo(rx + 6, ry + 10)
    ctx.lineTo(rx - 4, ry + 14)
    ctx.stroke()
  }

  // 4. Razor-sharp outer cutting edge bevel glow (Mép vát lưỡi đao sắc lẹm)
  const edgeGrad = ctx.createLinearGradient(0, 180, 0, 50)
  edgeGrad.addColorStop(0, 'rgba(220, 38, 38, 0)')
  edgeGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.85)')
  edgeGrad.addColorStop(0.85, 'rgba(254, 205, 211, 0.95)')
  edgeGrad.addColorStop(1, '#ffffff')

  ctx.fillStyle = edgeGrad
  ctx.fillRect(0, 50, 512, 130)

  // Razor edge highlight line
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(10, 60)
  ctx.lineTo(500, 60)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

function getCrescentEdgePoints(span: number, width: number, count: number = 36): THREE.Vector3[] {
  const half = span * 0.5
  const pts: THREE.Vector3[] = []

  // Exact cubic bezier points for the outer convex cutting curve
  // Curve 1: From needle tip to mid-crest
  // Curve 2: From mid-crest to rear wing barb
  const p0 = new THREE.Vector3(half, 0, 0)
  const p1 = new THREE.Vector3(half * 0.35, width * 0.82, 0)
  const p2 = new THREE.Vector3(-half * 0.15, width * 0.92, 0)
  const p3 = new THREE.Vector3(-half * 0.60, width * 0.45, 0)
  const p4 = new THREE.Vector3(-half * 0.98, width * 0.60, 0)

  const curve1 = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
  const curve2 = new THREE.LineCurve3(p3, p4)

  const pts1 = curve1.getPoints(Math.floor(count * 0.8))
  const pts2 = curve2.getPoints(Math.floor(count * 0.2))
  pts.push(...pts1, ...pts2.slice(1))
  return pts
}

function createCrescentBladeShape(span: number, width: number): THREE.Shape {
  const shape = new THREE.Shape()
  const half = span * 0.5

  // 1. Razor-sharp front needle tip (Mũi đao nhọn hoắt)
  shape.moveTo(half, 0)

  // 2. Sweeping outer convex cutting edge: Deep lethal crescent arc (Đường cong lưỡi chém trăng khuyết sâu và sắc lẹm)
  shape.bezierCurveTo(
    half * 0.35, width * 0.82,
    -half * 0.15, width * 0.92,
    -half * 0.60, width * 0.45
  )

  // 3. Aerodynamic rear barb / scythe wing fin (Ngạnh đao xé gió phía sau - Concept Sketch)
  shape.lineTo(-half * 0.98, width * 0.60) // Outer tip of rear barb
  shape.lineTo(-half * 0.75, width * 0.15) // Deep sharp notch cut-in

  // 4. Secondary lower barb / notch (Ngạnh đao phụ)
  shape.lineTo(-half * 0.88, -width * 0.05)
  shape.lineTo(-half * 0.68, -width * 0.18)

  // 5. Inner concave belly / spine: Slender crescent sweep (Bụng đao uốn cong thanh mảnh)
  shape.bezierCurveTo(
    -half * 0.25, -width * 0.05,
    half * 0.15, width * 0.10,
    half, 0
  )

  return shape
}

/**
 * 1. SECTUMSEMPRA: True 3D Beveled Curved Crescent Blades (Lưỡi Đao Huyết Sắc Bán Nguyệt)
 * with 3D Extrude Geometry, Metallic Blood-Steel Body, Glowing Neon Scarlet Cutting Edges,
 * Aerodynamic Rear Barbs, and Trailing Arterial Blood Sprays (Exact Match to Concept Sketch)
 */
export function buildSectumsempraVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  // 1. Solid Blood-Steel Metallic Blade Material (Thân đao thép đen huyết sắc bóng bẩy, nổi rõ khối 3D và gờ vát)
  const bladeBodyMat = new THREE.MeshStandardMaterial({
    color: 0x180205, // Dark obsidian blood-steel
    roughness: 0.12, // High specular gloss to reflect Great Hall lights
    metalness: 0.94, // True heavy forged metal look
    emissive: 0x3b0005, // Faint dark magic aura (does not wash out specular highlights)
    emissiveIntensity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: true,
  })

  // 2. Luminous Neon Scarlet Cutting Edge Material (Lưỡi chém phát sáng rực rỡ)
  const cuttingEdgeMat = new THREE.MeshBasicMaterial({
    color: 0xff1e38,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  })

  // 3. White-Hot Blade Core Plasma Wire (Lõi nhiệt trắng rực ở mũi và mép cắt)
  const hotCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  })

  // 4. Slashing Wind Ribbon Wake Material (Vệt phong đao kéo dài phía sau)
  const wakeMat = new THREE.MeshBasicMaterial({
    map: tex.bloodSlash,
    color: 0xdc2626,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  // 3 Staggered Sweeping Crescent Blades arranged in a dynamic slash fan (Matching Concept Sketch)
  // Concept Sketch: Top blade tilted up (+24°), Master in center (+7°), Lower tilted down (-13°)
  const bladeGroups: THREE.Group[] = []
  const bladeConfigs = [
    // Master Center Blade: Sweeping across center, pointing forward-right
    {
      span: 1.85,
      width: 0.40,
      thick: 0.035,
      pos: new THREE.Vector3(0.05, 0.05, -0.45),
      rot: new THREE.Euler(0.18, 0.08, 0.12),
    },
    // Upper Flanking Blade: Higher and to the right, pointing up-right (+24°)
    {
      span: 1.45,
      width: 0.32,
      thick: 0.028,
      pos: new THREE.Vector3(0.55, 0.42, -0.70),
      rot: new THREE.Euler(0.22, 0.05, 0.42),
    },
    // Lower Flanking Blade: Lower and to the left, pointing slightly down-right (-13°)
    {
      span: 1.50,
      width: 0.34,
      thick: 0.030,
      pos: new THREE.Vector3(-0.45, -0.32, -0.90),
      rot: new THREE.Euler(0.15, 0.10, -0.22),
    },
  ]

  for (let b = 0; b < bladeConfigs.length; b++) {
    const cfg = bladeConfigs[b]
    const bladeGroup = new THREE.Group()
    bladeGroup.position.copy(cfg.pos)
    bladeGroup.rotation.copy(cfg.rot)

    // A. 3D Extruded Beveled Crescent Blade (Thân đao khối 3D)
    const shape = createCrescentBladeShape(cfg.span, cfg.width)
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: cfg.thick,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.016,
      bevelThickness: 0.016,
    }
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    bladeGeo.center()
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeBodyMat)
    bladeGroup.add(bladeMesh)
    meshes.push(bladeMesh)

    // B. Luminous Razor-Sharp Cutting Edge Tube along the outer convex arc
    const edgePts = getCrescentEdgePoints(cfg.span, cfg.width, 36)
    const edgeCurve = new THREE.CatmullRomCurve3(edgePts)
    const edgeTubeGeo = new THREE.TubeGeometry(edgeCurve, 36, 0.014 * (cfg.span / 1.8), 8, false)
    const edgeTubeMesh = new THREE.Mesh(edgeTubeGeo, cuttingEdgeMat)
    bladeGroup.add(edgeTubeMesh)
    meshes.push(edgeTubeMesh)

    // C. White-Hot Razor Edge Core Line (Lõi sáng trắng ở mũi và lưỡi chém)
    const coreTubeGeo = new THREE.TubeGeometry(edgeCurve, 36, 0.005 * (cfg.span / 1.8), 6, false)
    const coreTubeMesh = new THREE.Mesh(coreTubeGeo, hotCoreMat)
    bladeGroup.add(coreTubeMesh)
    meshes.push(coreTubeMesh)

    // D. Trailing Slashing Wind Ribbon Wake behind the blade
    const wakeGeo = new THREE.PlaneGeometry(cfg.span * 1.05, cfg.width * 0.85)
    const wakeMesh = new THREE.Mesh(wakeGeo, wakeMat)
    wakeMesh.position.set(-cfg.span * 0.10, -cfg.width * 0.15, -0.02)
    wakeMesh.rotation.z = 0.08
    bladeGroup.add(wakeMesh)
    meshes.push(wakeMesh)

    bladeGroups.push(bladeGroup)
    group.add(bladeGroup)
  }

  // Trailing Blood Spray Stream ("BLOOD-RED PARTICLE TRAIL" in Concept Sketch)
  for (let s = 0; s < 18; s++) {
    const isDark = s % 2 === 0
    const spMat = new THREE.SpriteMaterial({
      map: tex.bloodSlash,
      color: isDark ? 0x7f1d1d : 0xef4444,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.88 - (s * 0.04),
      rotation: Math.random() * Math.PI * 2,
      depthWrite: false,
    })
    const sp = new THREE.Sprite(spMat)
    const sz = 0.40 + Math.random() * 0.40
    sp.scale.set(sz, sz, 1)
    sp.position.set(
      (Math.random() - 0.5) * 0.65,
      (Math.random() - 0.5) * 0.45,
      -(0.20 + s * 0.18)
    )
    group.add(sp)
    meshes.push(sp)
  }

  return { spellName: 'sectumsempra', meshes, extraData: { bladeGroups } }
}

/**
 * 2. PETRIFICUS TOTALUS: Dual Intertwined Helical Stone Ribbons,
 * Monolithic Stone Obelisk Core, Orbiting Jagged Granite Shards, and Stone Dust Slipstream
 * (Exact Match to Concept Sketch)
 */
export function buildPetrificusVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  // Main rotating projectile body group
  const drillGroup = new THREE.Group()

  // 1. Luminous Runic Binding Material
  const runicMat = new THREE.MeshBasicMaterial({
    map: tex.stoneBinding,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  })

  // 2. Brilliant Chalk-White & Cyan Additive Glow Trim Material
  const cyanEdgeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.95,
  })

  const whiteCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1.0,
  })

  // 3. Dual Intertwined Helical Runic Binding Ribbons (Dải ruy băng cổ ngữ xoắn kép)
  const turns = 3.2
  const length = 2.2
  const helixMeshes: THREE.Mesh[] = []

  for (let h = 0; h < 2; h++) {
    const startPhase = h * Math.PI // 180° offset for intertwined double-helix
    const curvePoints: THREE.Vector3[] = []

    for (let i = 0; i <= 64; i++) {
      const t = i / 64
      const a = startPhase + t * turns * Math.PI * 2
      const rad = 0.36 * Math.sin(t * Math.PI) + 0.08
      curvePoints.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, length * 0.5 - t * length))
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints)
    const tubeGeo = new THREE.TubeGeometry(curve, 54, 0.040, 8, false)
    const tube = new THREE.Mesh(tubeGeo, runicMat)
    drillGroup.add(tube)
    meshes.push(tube)
    helixMeshes.push(tube)

    // Outer brilliant glowing cyan wire along the helix
    const wireGeo = new THREE.TubeGeometry(curve, 54, 0.009, 6, false)
    const wire = new THREE.Mesh(wireGeo, cyanEdgeMat)
    drillGroup.add(wire)
    meshes.push(wire)
  }

  // 4. Piercing Central Silver-White Binding Energy Lance (Ngọn giáo năng lượng trói buộc)
  const coreGeo = new THREE.CylinderGeometry(0.015, 0.08, 2.0, 8)
  coreGeo.rotateX(-Math.PI * 0.5) // Sharp tip pointing forward along -Z
  const coreMesh = new THREE.Mesh(coreGeo, whiteCoreMat)
  drillGroup.add(coreMesh)
  meshes.push(coreMesh)

  // Outer cyan sheath
  const coreSheathGeo = new THREE.CylinderGeometry(0.025, 0.095, 2.04, 8)
  coreSheathGeo.rotateX(-Math.PI * 0.5)
  const coreSheath = new THREE.Mesh(coreSheathGeo, cyanEdgeMat)
  drillGroup.add(coreSheath)
  meshes.push(coreSheath)

  // Bank & pitch the drill group slightly to reveal dynamic 3D corkscrew
  drillGroup.rotation.x = 0.14
  drillGroup.rotation.y = 0.10
  group.add(drillGroup)

  // 5. Orbiting Celestial Runic Gyroscopic Binding Rings (Vòng cổ ngữ xoay quanh)
  const gyroRings: THREE.Mesh[] = []
  for (let g = 0; g < 3; g++) {
    const ringGeo = new THREE.TorusGeometry(0.42 + g * 0.08, 0.008, 8, 36)
    const ring = new THREE.Mesh(ringGeo, cyanEdgeMat)
    ring.rotation.set(g * 0.8, g * 1.2, 0)
    group.add(ring)
    meshes.push(ring)
    gyroRings.push(ring)
  }

  // 6. Shimmering Diamond Binding Star Dust Particles
  const debrisShards: { mesh: THREE.Mesh; rotSpeed: THREE.Vector3 }[] = []
  for (let d = 0; d < 24; d++) {
    const dGeo = new THREE.OctahedronGeometry(0.025 + Math.random() * 0.03)
    const dMesh = new THREE.Mesh(dGeo, d % 2 === 0 ? whiteCoreMat : cyanEdgeMat)
    dMesh.position.set(
      (Math.random() - 0.5) * 0.45,
      (Math.random() - 0.5) * 0.45,
      0.80 - Math.random() * 2.2
    )
    group.add(dMesh)
    meshes.push(dMesh)
    debrisShards.push({
      mesh: dMesh,
      rotSpeed: new THREE.Vector3(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3),
    })
  }

  return {
    spellName: 'petrificus',
    meshes,
    extraData: { drillGroup, gyroRings, debrisShards },
  }
}

/**
 * 3. CONFRINGO: Blazing Molten Magma Core, Concentric Aerodynamic Shockwaves & Shrapnel
 * Faithfully matches Concept Sheet 1 and HP Canon:
 * - High-velocity molten magma firebolt core with incandescent fusion nucleus
 * - 3 Concentric aerodynamic fiery shockwave rings staggered along flight axis
 * - Trailing slipstream flame cone and 16 tumbling molten magma rock fragments
 */
export function buildConfringoVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex?: Vfx8Textures
): AdvancedSpellVisuals {
  const safeTex = tex || createVfx8SpellTextures()
  const meshes: THREE.Object3D[] = []

  const confringoContainer = new THREE.Group()
  confringoContainer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)
  group.add(confringoContainer)

  // 1. Aerodynamic Molten Core (Incandescent Fusion Nucleus + Molten Basalt Shell)
  const coreGroup = new THREE.Group()

  // Inner white-hot plasma nucleus
  const nucleusGeo = new THREE.SphereGeometry(0.20, 16, 16)
  const nucleusMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat)
  coreGroup.add(nucleus)

  // Mid glowing incandescent core
  const midGeo = new THREE.SphereGeometry(0.26, 20, 20)
  const midMat = new THREE.MeshBasicMaterial({
    color: 0xffea00,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const midMesh = new THREE.Mesh(midGeo, midMat)
  coreGroup.add(midMesh)

  // Outer glowing molten fireball mantle with lava cracks
  const mantleGeo = new THREE.SphereGeometry(0.32, 24, 24)
  const mantleMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.95,
    roughness: 0.30,
    metalness: 0.20,
  })
  const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat)
  coreGroup.add(mantleMesh)

  // Dynamic Point Light illuminating the table, pillars and hall
  const coreLight = new THREE.PointLight(0xff7700, 24.0, 14.0)
  coreGroup.add(coreLight)

  confringoContainer.add(coreGroup)
  meshes.push(coreGroup) // mesh[0]

  // 2. Aerodynamic Stylized Flame Tongues (4 curved flame planes wrapping tightly around core)
  const flameTongues: THREE.Mesh[] = []
  const tongueGeo = new THREE.PlaneGeometry(0.52, 1.05)
  const tongueMat = new THREE.MeshBasicMaterial({
    map: safeTex.stylizedFlameLobe,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  })
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2
    const tongue = new THREE.Mesh(tongueGeo, tongueMat)
    tongue.position.set(Math.cos(ang) * 0.14, Math.sin(ang) * 0.14, 0.38)
    tongue.rotation.z = ang
    tongue.rotation.x = 0.15
    confringoContainer.add(tongue)
    meshes.push(tongue)
    flameTongues.push(tongue)
  }

  // 3. Supersonic Compression Shock Diamonds (3 Concentric Mach Rings)
  const ringConfigs = [
    { zOffset: 0.18, radius: 0.22, tube: 0.016, color: 0xffffff, opacity: 0.95 },
    { zOffset: 0.42, radius: 0.30, tube: 0.018, color: 0xffea00, opacity: 0.90 },
    { zOffset: 0.70, radius: 0.38, tube: 0.020, color: 0xff4500, opacity: 0.85 },
  ]
  const ringGroups: THREE.Group[] = []
  for (let r = 0; r < ringConfigs.length; r++) {
    const cfg = ringConfigs[r]
    const ringGroup = new THREE.Group()
    ringGroup.position.set(0, 0, cfg.zOffset)

    const torusGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 32)
    const torusMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: cfg.opacity,
      depthWrite: false,
    })
    const torusMesh = new THREE.Mesh(torusGeo, torusMat)
    ringGroup.add(torusMesh)

    confringoContainer.add(ringGroup)
    meshes.push(ringGroup)
    ringGroups.push(ringGroup)
  }

  // 4. Trailing Slipstream Flame Cone
  const coneGeo = new THREE.ConeGeometry(0.28, 1.5, 18, 1, true)
  coneGeo.rotateX(Math.PI * 0.5)
  coneGeo.translate(0, 0, 0.75)
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xff5500,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.60,
    depthWrite: false,
  })
  const slipstreamCone = new THREE.Mesh(coneGeo, coneMat)
  confringoContainer.add(slipstreamCone)
  meshes.push(slipstreamCone)

  // 5. Molten Magma Embers & Shards along Slipstream (16 tumbling basalt rock fragments)
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    emissive: 0xff5500,
    emissiveIntensity: 0.65,
    roughness: 0.30,
    metalness: 0.25,
  })
  const debrisShards: THREE.Mesh[] = []
  for (let s = 0; s < 16; s++) {
    const shardSize = 0.035 + (s % 4) * 0.015
    const shardGeo = new THREE.DodecahedronGeometry(shardSize, 0)
    const shardMesh = new THREE.Mesh(shardGeo, shardMat)
    const zPos = 0.18 + (s / 16) * 1.4
    const angle = (s / 16) * Math.PI * 2 * 2.5
    const rad = 0.12 + (s % 3) * 0.08
    shardMesh.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad, zPos)
    confringoContainer.add(shardMesh)
    meshes.push(shardMesh)
    debrisShards.push(shardMesh)
  }

  return {
    spellName: 'confringo',
    meshes,
    extraData: { confringoContainer, coreGroup, flameTongues, ringGroups, slipstreamCone, debrisShards },
  }
}

/**
 * 4. IMMOBULUS: Hexagonal Ice Crystal Cluster & Frost Mist
 */
export function buildImmobulusVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  const crystalCluster = new THREE.Group()
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transmission: 0.85,
    roughness: 0.15,
    ior: 1.31, // Water/ice IOR
    transparent: true,
    opacity: 0.9,
    reflectivity: 0.9,
  })

  // 6 icicle spines
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const coneGeo = new THREE.ConeGeometry(0.07, 0.52, 6)
    coneGeo.translate(0, 0.26, 0)
    const icicle = new THREE.Mesh(coneGeo, crystalMat)
    icicle.rotation.z = Math.PI * 0.5
    icicle.rotation.y = angle
    crystalCluster.add(icicle)
  }

  // Central star billboard
  const starMat = new THREE.SpriteMaterial({
    map: tex.frostCrystal,
    blending: THREE.AdditiveBlending,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.95,
  })
  const star = new THREE.Sprite(starMat)
  star.scale.set(1.4, 1.4, 1)
  crystalCluster.add(star)

  group.add(crystalCluster)
  meshes.push(crystalCluster)

  return { spellName: 'immobulus', meshes }
}

/**
 * 5. MORSMORDRE: Emerald Dark Mark Skull with Sinuous Serpent
 */
export function buildMorsmordreVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures,
  skullTemplate?: THREE.Group | null
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  // Cloned 3D Skull or Sprite
  if (skullTemplate) {
    const skull = skullTemplate.clone(true)
    skull.scale.set(0.65, 0.65, 0.65)
    skull.rotation.y = Math.PI
    group.add(skull)
    meshes.push(skull)
  }

  // Serpent tongue extruded along CatmullRom spline
  const serpentPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, -0.15, 0.1),
    new THREE.Vector3(0.12, -0.30, 0.35),
    new THREE.Vector3(-0.15, -0.50, 0.65),
    new THREE.Vector3(0.08, -0.72, 0.95),
  ]
  const serpentCurve = new THREE.CatmullRomCurve3(serpentPoints)
  const serpentGeo = new THREE.TubeGeometry(serpentCurve, 32, 0.055, 8, false)
  const serpentMat = new THREE.MeshBasicMaterial({
    map: tex.darkSerpent,
    color: 0x4ade80,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.92,
  })
  const serpent = new THREE.Mesh(serpentGeo, serpentMat)
  group.add(serpent)
  meshes.push(serpent)

  return { spellName: 'morsmordre', meshes }
}

/**
 * 6. LEVICORPUS: Arcane Violet Gravity Beam & Runic Glyph Rings
 */
export function buildLevicorpusVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  // Purple gravity tractor beam
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.18, 1.8, 16)
  beamGeo.rotateX(Math.PI * 0.5)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  group.add(beam)
  meshes.push(beam)

  // 2 rotating runic rings
  for (let i = 0; i < 2; i++) {
    const ringGeo = new THREE.RingGeometry(0.38 + i * 0.14, 0.44 + i * 0.14, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      map: tex.gravityRune,
      color: 0xc084fc,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.z = (i - 0.5) * 0.5
    group.add(ring)
    meshes.push(ring)
  }

  return { spellName: 'levicorpus', meshes }
}

/**
 * 7. OBLIVIATE: Mesmerizing Cyan Thought Funnel Vortex
 */
export function buildObliviateVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []

  // Memory cone vortex
  const coneGeo = new THREE.CylinderGeometry(0.68, 0.08, 1.4, 32, 1, true)
  coneGeo.rotateX(-Math.PI * 0.5)
  const coneMat = new THREE.MeshBasicMaterial({
    map: tex.memorySpiral,
    color: 0x06b6d4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  const cone = new THREE.Mesh(coneGeo, coneMat)
  group.add(cone)
  meshes.push(cone)

  // Floating memory thought wisps
  for (let i = 0; i < 4; i++) {
    const wispMat = new THREE.SpriteMaterial({
      map: tex.memorySpiral,
      color: 0x67e8f9,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    })
    const wisp = new THREE.Sprite(wispMat)
    wisp.scale.set(0.45, 0.45, 1)
    const a = (i / 4) * Math.PI * 2
    wisp.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, (i - 2) * 0.25)
    group.add(wisp)
    meshes.push(wisp)
  }

  return { spellName: 'obliviate', meshes }
}

/**
 * 8. EXPECTO PATRONUM: Celestial Silver Stag & Radiant Shockwaves
 */
export function buildExpectoPatronumVisuals(
  group: THREE.Group,
  direction: THREE.Vector3,
  tex: Vfx8Textures,
  stagTemplate?: THREE.Group | null
): AdvancedSpellVisuals {
  const meshes: THREE.Object3D[] = []
  const normDir = direction.clone().normalize()

  let stagObj: THREE.Object3D
  if (stagTemplate) {
    // 3D Blender Mesh: Show full majestic stag
    const stag3D = stagTemplate.clone(true)
    stag3D.scale.set(1.65, 1.65, 1.65)
    
    // In glTF from Blender, stag forward is -Z, up is +Y
    // Align forward vector (0, 0, -1) with flight direction
    stag3D.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), normDir)
    stag3D.position.set(0, 0.35, 0)
    
    group.add(stag3D)
    meshes.push(stag3D)
    stagObj = stag3D
  } else {
    // Fallback: Silver Stag Sprite
    const stagMat = new THREE.SpriteMaterial({
      map: tex.patronusStag,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
    })
    const stag = new THREE.Sprite(stagMat)
    stag.scale.set(3.2, 3.2, 1)
    stag.position.set(0, 0, 0)
    group.add(stag)
    meshes.push(stag)
    stagObj = stag
  }

  // Flowing Ethereal Mist Wisps trailing gracefully behind the hooves (no harsh rings)
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    normDir.clone().multiplyScalar(-0.8).add(new THREE.Vector3(0, 0.08, 0)),
    normDir.clone().multiplyScalar(-1.8).add(new THREE.Vector3(0.06, -0.06, 0)),
    normDir.clone().multiplyScalar(-2.8).add(new THREE.Vector3(-0.05, 0.04, 0)),
  ])
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 28, 0.05, 8, false)
  const ribbonMat = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  })
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat)
  group.add(ribbonMesh)
  meshes.push(ribbonMesh)

  // Floating sparkling stardust embers (soft magical dust around the stag)
  const dustCount = 20
  const dustGeo = new THREE.BufferGeometry()
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 1.4
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.4
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.8
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const dustPoints = new THREE.Points(dustGeo, dustMat)
  group.add(dustPoints)
  meshes.push(dustPoints)

  return { spellName: 'expecto_patronum', meshes, extraData: { stagObj, ribbonMesh, dustPoints } }
}

// =========================================================================
// REAL-TIME ANIMATION HANDLER FOR 8 ADVANCED SPELLS
// =========================================================================

export function animate8SpellVisuals(
  visuals: AdvancedSpellVisuals,
  time: number,
  delta: number,
  distFromWand: number
) {
  const { spellName, meshes } = visuals

  if (spellName === 'sectumsempra') {
    // Slicing wave dynamic momentum oscillation & cutting blade whip (Matching Concept Sketch)
    if (visuals.extraData?.bladeGroups) {
      const bGroups: THREE.Group[] = visuals.extraData.bladeGroups
      const basePitchX = [0.18, 0.22, 0.15]
      const baseYawY = [0.08, 0.05, 0.10]
      const baseRollZ = [0.10, 0.42, -0.22]
      bGroups.forEach((bg, idx) => {
        const pX = basePitchX[idx] ?? 0.18
        const yY = baseYawY[idx] ?? 0.08
        const rZ = baseRollZ[idx] ?? 0.10
        bg.rotation.x = pX + Math.cos(time * 14.0 + idx * 0.8) * 0.04
        bg.rotation.y = yY + Math.sin(time * 18.0 + idx) * 0.04
        bg.rotation.z = rZ + Math.sin(time * 16.0 + idx * 1.1) * 0.06
      })
    }
    meshes.forEach((m, idx) => {
      if (m instanceof THREE.Sprite) {
        // Trailing blood particles swirl and disperse in slipstream
        m.material.rotation += delta * (idx % 2 === 0 ? 5.5 : -5.5)
        const bp = 1.0 + Math.sin(time * 16.0 + idx) * 0.15
        m.scale.set(m.scale.x * bp, m.scale.y * bp, 1)
      }
    })
  } else if (spellName === 'petrificus') {
    // Dual runic helix drill corkscrews forward at high speed
    if (visuals.extraData?.drillGroup) {
      visuals.extraData.drillGroup.rotation.z += delta * 15.0
    }
    // Gyroscopic celestial runic rings rotating on multi-axes
    if (visuals.extraData?.gyroRings) {
      visuals.extraData.gyroRings.forEach((gr: THREE.Mesh, idx: number) => {
        gr.rotation.x += delta * (idx % 2 === 0 ? 3.5 : -3.5)
        gr.rotation.y += delta * 2.8
      })
    }
    // Tumbling shimmering diamond binding star dust along slipstream
    if (visuals.extraData?.debrisShards) {
      visuals.extraData.debrisShards.forEach((ds: any) => {
        ds.mesh.rotation.x += delta * ds.rotSpeed.x
        ds.mesh.rotation.y += delta * ds.rotSpeed.y
        ds.mesh.rotation.z += delta * ds.rotSpeed.z
      })
    }
  } else if (spellName === 'confringo') {
    // 1. Aerodynamic magma core violent pulsation and tumbling rotation
    const coreGroup = meshes[0]
    if (coreGroup) {
      const p = 1.0 + Math.sin(time * 30.0) * 0.10
      coreGroup.scale.setScalar(p)
      coreGroup.rotation.x += delta * 4.5
      coreGroup.rotation.y += delta * 6.5
    }
    // 2. Aerodynamic flame tongues fluttering along flight stream
    if (visuals.extraData?.flameTongues) {
      visuals.extraData.flameTongues.forEach((ft: THREE.Mesh, idx: number) => {
        const flutter = 1.0 + Math.sin(time * 26.0 + idx * 1.5) * 0.12
        ft.scale.set(flutter, flutter * 1.05, 1.0)
        ft.rotation.z += delta * (idx % 2 === 0 ? 2.5 : -2.5)
      })
    }
    // 3. Tight supersonic compression rings (shock diamonds) rotating smoothly
    if (visuals.extraData?.ringGroups) {
      visuals.extraData.ringGroups.forEach((rg: THREE.Group, r: number) => {
        rg.rotation.z += delta * (12.0 + r * 6.0)
        const ringScale = 1.0 + Math.sin(time * 20.0 + r * 1.5) * 0.08
        rg.scale.set(ringScale, ringScale, 1.0)
      })
    }
    // 4. Trailing slipstream flame flicker
    if (visuals.extraData?.slipstreamCone) {
      const slipstream = visuals.extraData.slipstreamCone
      const flicker = 1.0 + Math.sin(time * 35.0) * 0.12
      slipstream.scale.set(flicker, flicker, 1.0 + Math.cos(time * 22.0) * 0.18)
    }
    // 5. Molten magma shards swirling in helical slipstream
    if (visuals.extraData?.debrisShards) {
      visuals.extraData.debrisShards.forEach((shard: THREE.Mesh, idx: number) => {
        const swirlAng = time * 7.5 + (idx * Math.PI * 2) / 12
        const rad = 0.12 + (idx % 3) * 0.06
        shard.position.x = Math.cos(swirlAng) * rad
        shard.position.y = Math.sin(swirlAng) * rad
        shard.rotation.x += delta * (6.0 + (idx % 5))
        shard.rotation.y += delta * (8.0 + (idx % 4))
      })
    }
  } else if (spellName === 'immobulus') {
    // Crystal cluster spins on two axes
    if (meshes[0]) {
      meshes[0].rotation.z += delta * 5.0
      meshes[0].rotation.x += delta * 3.5
    }
  } else if (spellName === 'morsmordre') {
    // Undulating serpent
    if (meshes[1]) {
      meshes[1].rotation.z = Math.sin(time * 14.0) * 0.25
      meshes[1].position.x = Math.cos(time * 12.0) * 0.08
    }
  } else if (spellName === 'levicorpus') {
    // Runic glyph rings counter-rotate
    for (let i = 1; i < meshes.length; i++) {
      meshes[i].rotation.z += delta * (i === 1 ? 7.0 : -7.0)
    }
  } else if (spellName === 'obliviate') {
    // Memory funnel spins rapidly and wobbles
    if (meshes[0]) {
      meshes[0].rotation.z += delta * 16.0
    }
    for (let i = 1; i < meshes.length; i++) {
      const ang = time * 8.0 + (i / 4) * Math.PI * 2
      meshes[i].position.x = Math.cos(ang) * 0.45
      meshes[i].position.y = Math.sin(ang) * 0.45
    }
  } else if (spellName === 'expecto_patronum') {
    // 1. Silver stag bobs gracefully (galloping gait)
    const stag = visuals.extraData?.stagObj || meshes[0]
    if (stag) {
      const gallop = Math.sin(time * 14.0) * 0.12
      stag.position.y = 0.35 + gallop
      const pulse = 1.0 + Math.sin(time * 8.0) * 0.03
      if (stag instanceof THREE.Sprite) {
        stag.scale.set(3.2 * pulse, 3.2 * pulse, 1)
      } else {
        stag.scale.setScalar(1.65 * pulse)
      }
    }
    // 2. Ethereal ribbon undulating wave
    if (visuals.extraData?.ribbonMesh) {
      const rMesh = visuals.extraData.ribbonMesh as THREE.Mesh
      rMesh.rotation.z = Math.sin(time * 10.0) * 0.10
    }
  }
}
