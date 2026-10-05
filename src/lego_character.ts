import * as THREE from 'three'

// =========================================================================
// HIGH-RESOLUTION CANVAS TEXTURES FOR AUTHENTIC MINIFIG DECALS
// =========================================================================

/**
 * Harry Potter Cute Minifigure Face (1024x1024 mapped to 120° arc)
 */
export function createHarryFaceTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  ctx.clearRect(0, 0, 1024, 1024)

  const cx = 512
  const cy = 460

  // Soft Pink Rosy Cheeks
  const drawCheek = (x: number, y: number) => {
    const rad = ctx.createRadialGradient(x, y, 5, x, y, 100)
    rad.addColorStop(0, 'rgba(244, 114, 182, 0.65)')
    rad.addColorStop(0.5, 'rgba(244, 114, 182, 0.30)')
    rad.addColorStop(1, 'rgba(244, 114, 182, 0)')
    ctx.fillStyle = rad
    ctx.beginPath()
    ctx.arc(x, y, 100, 0, Math.PI * 2)
    ctx.fill()
  }
  drawCheek(cx - 210, cy + 150)
  drawCheek(cx + 210, cy + 150)

  // Classic Round Minifigure Glasses
  ctx.strokeStyle = '#111317'
  ctx.lineWidth = 24
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Left Rim
  ctx.beginPath()
  ctx.arc(cx - 150, cy, 118, 0, Math.PI * 2)
  ctx.stroke()

  // Right Rim
  ctx.beginPath()
  ctx.arc(cx + 150, cy, 118, 0, Math.PI * 2)
  ctx.stroke()

  // Glasses Bridge
  ctx.beginPath()
  ctx.moveTo(cx - 38, cy - 18)
  ctx.quadraticCurveTo(cx, cy - 38, cx + 38, cy - 18)
  ctx.stroke()

  // Glasses Temples
  ctx.beginPath()
  ctx.moveTo(cx - 268, cy - 12)
  ctx.lineTo(cx - 360, cy - 25)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx + 268, cy - 12)
  ctx.lineTo(cx + 360, cy - 25)
  ctx.stroke()

  // Adorable Minifigure Oval Eyes
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  ctx.ellipse(cx - 150, cy, 38, 54, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 150, cy, 38, 54, 0, 0, Math.PI * 2)
  ctx.fill()

  // Crisp White Specular Eye Catchlights
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx - 160, cy - 16, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + 140, cy - 16, 16, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx - 140, cy + 18, 7.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + 160, cy + 18, 7.5, 0, Math.PI * 2)
  ctx.fill()

  // Arched Dark Brown Eyebrows
  ctx.strokeStyle = '#2b1d12'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(cx - 240, cy - 150)
  ctx.quadraticCurveTo(cx - 150, cy - 195, cx - 60, cy - 155)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx + 60, cy - 155)
  ctx.quadraticCurveTo(cx + 150, cy - 195, cx + 240, cy - 150)
  ctx.stroke()

  // Iconic Crimson Lightning Bolt Scar
  ctx.strokeStyle = '#b91c1c'
  ctx.fillStyle = '#b91c1c'
  ctx.lineWidth = 16
  ctx.beginPath()
  ctx.moveTo(cx + 120, cy - 360)
  ctx.lineTo(cx + 98, cy - 270)
  ctx.lineTo(cx + 138, cy - 250)
  ctx.lineTo(cx + 110, cy - 175)
  ctx.stroke()

  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 6
  ctx.stroke()

  // Warm Cute LEGO Smile
  ctx.strokeStyle = '#23150d'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.arc(cx, cy + 175, 95, 0.20 * Math.PI, 0.80 * Math.PI)
  ctx.stroke()

  // Smile Dimples
  ctx.beginPath()
  ctx.moveTo(cx - 78, cy + 225)
  ctx.lineTo(cx - 68, cy + 208)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx + 78, cy + 225)
  ctx.lineTo(cx + 68, cy + 208)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Harry Potter Hogwarts Knit Sweater & Gryffindor Tie Decal (1024x1024)
 */
export function createHarryTorsoTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  ctx.fillStyle = '#22252c'
  ctx.fillRect(0, 0, 1024, 1024)

  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let y = 0; y < 1024; y += 8) {
    ctx.fillRect(0, y, 1024, 3)
  }

  // White Collared Shirt Insert
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.moveTo(340, 0)
  ctx.lineTo(684, 0)
  ctx.lineTo(512, 460)
  ctx.closePath()
  ctx.fill()

  // Shirt Collar Points
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.moveTo(350, 0)
  ctx.lineTo(470, 180)
  ctx.lineTo(512, 140)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(350, 0)
  ctx.lineTo(460, 170)
  ctx.lineTo(512, 130)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(674, 0)
  ctx.lineTo(564, 170)
  ctx.lineTo(512, 130)
  ctx.closePath()
  ctx.fill()

  // Gryffindor Scarlet & Gold Knit Stripes on V-Neck
  ctx.strokeStyle = '#991b1b'
  ctx.lineWidth = 36
  ctx.beginPath()
  ctx.moveTo(320, 0)
  ctx.lineTo(512, 480)
  ctx.lineTo(704, 0)
  ctx.stroke()

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(330, 0)
  ctx.lineTo(512, 460)
  ctx.lineTo(694, 0)
  ctx.stroke()

  // Striped Gryffindor Silk Tie
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(482, 120)
  ctx.lineTo(542, 120)
  ctx.lineTo(556, 680)
  ctx.lineTo(512, 750)
  ctx.lineTo(468, 680)
  ctx.closePath()
  ctx.clip()

  ctx.fillStyle = '#831843'
  ctx.fillRect(440, 100, 150, 680)

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 26
  for (let y = 100; y < 820; y += 72) {
    ctx.beginPath()
    ctx.moveTo(430, y)
    ctx.lineTo(590, y - 50)
    ctx.stroke()
  }
  ctx.restore()

  // Tie Knot
  ctx.fillStyle = '#991b1b'
  ctx.beginPath()
  ctx.moveTo(486, 110)
  ctx.lineTo(538, 110)
  ctx.lineTo(528, 175)
  ctx.lineTo(496, 175)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(490, 145)
  ctx.lineTo(534, 135)
  ctx.stroke()

  // Lion House Crest Shield
  const crestX = 720
  const crestY = 500
  ctx.fillStyle = '#991b1b'
  ctx.beginPath()
  ctx.moveTo(crestX - 55, crestY - 60)
  ctx.lineTo(crestX + 55, crestY - 60)
  ctx.lineTo(crestX + 55, crestY + 20)
  ctx.quadraticCurveTo(crestX, crestY + 80, crestX, crestY + 80)
  ctx.quadraticCurveTo(crestX - 55, crestY + 20, crestX - 55, crestY - 60)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 8
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 54px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🦁', crestX, crestY)

  // Ribbed Hem at Bottom
  ctx.fillStyle = '#181a20'
  ctx.fillRect(0, 920, 1024, 104)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 4
  for (let x = 0; x < 1024; x += 18) {
    ctx.beginPath()
    ctx.moveTo(x, 920)
    ctx.lineTo(x, 1024)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Harry Potter Back Torso Texture with Folded Cowl Hood & Gryffindor Trim (1024x1024)
 * Matches the reference illustration (media_1790918822669.jpg) back of Harry
 */
export function createHarryBackTorsoTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  // Deep matte black/charcoal robe fabric
  ctx.fillStyle = '#1c1f26'
  ctx.fillRect(0, 0, 1024, 1024)

  // Fabric texture micro-weave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'
  for (let y = 0; y < 1024; y += 8) {
    ctx.fillRect(0, y, 1024, 3)
  }

  // Vertical back robe seams with subtle highlights and shadows
  ctx.strokeStyle = '#111317'
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(340, 280)
  ctx.lineTo(310, 880)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(684, 280)
  ctx.lineTo(714, 880)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(344, 280)
  ctx.lineTo(314, 880)
  ctx.stroke()

  // Central Folded Cowl Hood hanging down the back (Matching Reference Illustration)
  // Outer hood dark fabric with soft drop shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 16

  ctx.fillStyle = '#14161d'
  ctx.beginPath()
  ctx.moveTo(280, 0)
  ctx.quadraticCurveTo(512, 60, 744, 0)
  ctx.lineTo(660, 420)
  ctx.quadraticCurveTo(512, 540, 364, 420)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Scarlet Gryffindor Hood Interior Lining (V-fold at the top collar)
  ctx.save()
  ctx.fillStyle = '#831843'
  ctx.beginPath()
  ctx.moveTo(380, 0)
  ctx.lineTo(644, 0)
  ctx.quadraticCurveTo(512, 260, 512, 280)
  ctx.quadraticCurveTo(512, 260, 380, 0)
  ctx.closePath()
  ctx.fill()

  // Scarlet lining inner gradient/fold
  const scarletGrad = ctx.createLinearGradient(512, 0, 512, 280)
  scarletGrad.addColorStop(0, '#991b1b')
  scarletGrad.addColorStop(0.7, '#b91c1c')
  scarletGrad.addColorStop(1, '#7f1d1d')
  ctx.fillStyle = scarletGrad
  ctx.beginPath()
  ctx.moveTo(400, 0)
  ctx.lineTo(624, 0)
  ctx.lineTo(512, 260)
  ctx.closePath()
  ctx.fill()

  // Gold piping on edge of scarlet lining
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(395, 0)
  ctx.lineTo(512, 265)
  ctx.lineTo(629, 0)
  ctx.stroke()
  ctx.restore()

  // Deep cowl cloth fold creases on outer hood
  ctx.strokeStyle = '#0a0b0e'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(420, 340)
  ctx.quadraticCurveTo(512, 420, 604, 340)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(450, 410)
  ctx.quadraticCurveTo(512, 470, 574, 410)
  ctx.stroke()

  // Pointed tip of hood cowl with shadow
  ctx.fillStyle = '#0f1116'
  ctx.beginPath()
  ctx.moveTo(470, 480)
  ctx.lineTo(554, 480)
  ctx.lineTo(512, 535)
  ctx.closePath()
  ctx.fill()

  // Bottom Hem: Gryffindor Silk Stripe on Robe Waist (Matching Reference Image)
  const hemY = 880
  ctx.fillStyle = '#991b1b'
  ctx.fillRect(0, hemY, 1024, 44)

  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(0, hemY - 8, 1024, 10)
  ctx.fillRect(0, hemY + 42, 1024, 10)

  // Robe skirt base hem
  ctx.fillStyle = '#14161d'
  ctx.fillRect(0, 942, 1024, 82)

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Voldemort Menacing Minifigure Face (1024x1024 mapped to 120° arc)
 */
export function createVoldemortFaceTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  ctx.clearRect(0, 0, 1024, 1024)

  const cx = 512
  const cy = 460

  // 1. Forehead furrows (Menacing arched brow creases from 2005 Lego head)
  ctx.strokeStyle = '#101214'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy - 140, 105, Math.PI * 1.14, Math.PI * 1.86)
  ctx.stroke()

  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy - 105, 75, Math.PI * 1.18, Math.PI * 1.82)
  ctx.stroke()

  // Eyebrow brow ridges
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(cx - 140, cy - 90, 75, Math.PI * 1.10, Math.PI * 1.90)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + 140, cy - 90, 75, Math.PI * 1.10, Math.PI * 1.90)
  ctx.stroke()

  // 2. Piercing Red Reptilian Eyes (Authentic 2005 Lego pad print)
  for (const sign of [-1, 1]) {
    const ex = cx + sign * 140
    const ey = cy - 25

    // Outer jet-black eye rim / socket
    ctx.fillStyle = '#0f1113'
    ctx.beginPath()
    ctx.ellipse(ex, ey, 52, 66, sign * 0.08, 0, Math.PI * 2)
    ctx.fill()

    // Saturated crimson red iris
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.ellipse(ex, ey, 36, 50, sign * 0.08, 0, Math.PI * 2)
    ctx.fill()

    // Upper dark crimson shadow in iris
    ctx.fillStyle = '#88131b'
    ctx.beginPath()
    ctx.ellipse(ex, ey - 10, 35, 32, sign * 0.08, Math.PI, Math.PI * 2)
    ctx.fill()

    // Vertical black cat/snake slit pupil
    ctx.fillStyle = '#08090a'
    ctx.beginPath()
    ctx.moveTo(ex, ey - 44)
    ctx.lineTo(ex + sign * 8, ey)
    ctx.lineTo(ex, ey + 44)
    ctx.lineTo(ex - sign * 8, ey)
    ctx.closePath()
    ctx.fill()

    // Specular catches (Glint reflection)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(ex + sign * 14, ey - 18, 7.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.beginPath()
    ctx.arc(ex - sign * 14, ey + 18, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // 3. Signature 2005 Cheek Horns / Flame Tendrils (Distinctive tribal marks)
  for (const sign of [-1, 1]) {
    ctx.strokeStyle = '#101214'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Top horn: sweeping down from temple towards the mouth
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(cx + sign * 305, cy - 45)
    ctx.quadraticCurveTo(cx + sign * 240, cy + 15, cx + sign * 168, cy + 85)
    ctx.stroke()

    // Middle horn: curving along cheekbone
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(cx + sign * 285, cy + 45)
    ctx.quadraticCurveTo(cx + sign * 235, cy + 92, cx + sign * 180, cy + 130)
    ctx.stroke()

    // Lower horn: curving along jawline
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(cx + sign * 245, cy + 142)
    ctx.quadraticCurveTo(cx + sign * 205, cy + 175, cx + sign * 158, cy + 195)
    ctx.stroke()
  }

  // 4. Dual Snake Nostril Slits
  ctx.fillStyle = '#0f1114'
  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx + sign * 25, cy + 62)
    ctx.lineTo(cx + sign * 13, cy + 115)
    ctx.lineTo(cx + sign * 8, cy + 112)
    ctx.lineTo(cx + sign * 19, cy + 60)
    ctx.closePath()
    ctx.fill()
  }

  // 5. Cruel Downturned Snarl Mouth & Chin Crease
  ctx.strokeStyle = '#101214'
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.arc(cx, cy + 180, 115, Math.PI * 1.12, Math.PI * 1.88)
  ctx.stroke()

  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy + 228, 45, Math.PI * 1.15, Math.PI * 1.85)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Authentic 2005 Lego Dementor Shroud / Cloak Texture (Heather Grey Fabric)
 */
export function createVoldemortCapeTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  // Deep midnight charcoal black fabric
  ctx.fillStyle = '#121316'
  ctx.fillRect(0, 0, 1024, 1024)

  // Subtle woven fabric texture: fine micro-threads
  ctx.strokeStyle = 'rgba(25, 27, 32, 0.40)'
  ctx.lineWidth = 2
  for (let y = 0; y < 1024; y += 6) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(1024, y)
    ctx.stroke()
  }
  for (let x = 0; x < 1024; x += 6) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 1024)
    ctx.stroke()
  }

  // Cross-hatch diagonal weave
  ctx.strokeStyle = 'rgba(40, 44, 52, 0.25)'
  ctx.lineWidth = 1.5
  for (let i = -1024; i < 2048; i += 12) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 1024, 1024)
    ctx.stroke()
  }

  // Soft vertical fabric fold shading and velvet sheen
  const grad = ctx.createLinearGradient(0, 0, 1024, 0)
  grad.addColorStop(0, 'rgba(10, 11, 13, 0.65)')
  grad.addColorStop(0.2, 'rgba(45, 48, 56, 0.18)')
  grad.addColorStop(0.35, 'rgba(10, 11, 13, 0.50)')
  grad.addColorStop(0.5, 'rgba(45, 48, 56, 0.22)')
  grad.addColorStop(0.65, 'rgba(10, 11, 13, 0.50)')
  grad.addColorStop(0.8, 'rgba(45, 48, 56, 0.18)')
  grad.addColorStop(1, 'rgba(10, 11, 13, 0.65)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 1024)

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Build 3D Draped Back Cape Geometry for Voldemort (Authentic 2005 Lego Minifigure Cape)
 * Beautifully curved behind the back with subtle organic folds, no front bib clutter.
 */
export function buildPonchoCloakGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const rows = 6
  const cols = 9

  for (let r = 0; r <= rows; r++) {
    const v = r / rows
    const y = 0.50 - v * 0.56 // From collar (0.50) down to heels (-0.06)
    const width = 0.14 + v * 0.10 // 0.14 at shoulders widening to 0.24 at hem
    const zBase = -0.11 - v * 0.08 // Drapes back slightly as it hangs down

    for (let c = 0; c <= cols; c++) {
      const u = c / cols
      const x = (u - 0.5) * 2 * width
      // Realistic cloth ripples and gentle billow
      const foldRipple = Math.sin(u * Math.PI * 4.0) * (0.008 + v * 0.014)
      const archBack = Math.cos((u - 0.5) * Math.PI) * 0.015
      const z = zBase - foldRipple - archBack

      positions.push(x, y, z)
      uvs.push(u, 1.0 - v)
    }
  }

  const stride = cols + 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c
      const b = a + 1
      const d = (r + 1) * stride + c
      const e = d + 1

      indices.push(a, d, b)
      indices.push(b, d, e)
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * Voldemort Plain Unprinted Black Lego Torso
 */
export function createVoldemortTorsoTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 1024
  const ctx = cv.getContext('2d')!

  ctx.fillStyle = '#111113'
  ctx.fillRect(0, 0, 1024, 1024)

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

// =========================================================================
// LEGO MINIFIGURE DUELIST CLASS (STUDIO GRADE PROCEDURAL PBR)
// =========================================================================

export class LegoDuelist {
  public group: THREE.Group
  public hipsGroup: THREE.Group
  public legLeftPivot: THREE.Group
  public legRightPivot: THREE.Group
  public torsoMesh: THREE.Mesh
  public torsoDecalMesh: THREE.Mesh
  public capeMesh: THREE.Mesh
  public headPivot: THREE.Group
  public headMesh: THREE.Mesh
  public faceDecalMesh: THREE.Mesh
  public hairMesh: THREE.Group
  public armRightPivot: THREE.Group
  public wristRightPivot: THREE.Group
  public armLeftPivot: THREE.Group
  public wristLeftPivot: THREE.Group
  public wandTipMesh: THREE.Mesh
  public wandTipGroup: THREE.Group
  public wandLight: THREE.PointLight
  public wandGroup!: THREE.Group
  public isDisarmed = false

  private headBaseMat: THREE.MeshPhysicalMaterial
  private torsoMat: THREE.MeshPhysicalMaterial
  private capeMat: THREE.MeshStandardMaterial
  private wandTipMat: THREE.MeshBasicMaterial
  private isVoldemort: boolean

  // Animation States
  public castProgress = 0
  public flinchProgress = 0
  public isDefending = false
  public isStunned = false
  public isPetrified = false
  public isConfused = false
  public isClashing = false
  public isChanneling = false
  public isTargetChanneling = false
  public walkCycle = 0
  public aimOffset = new THREE.Vector2(0, 0)
  public leanX = 0
  public leanY = 0

  constructor(isVoldemort = false) {
    this.isVoldemort = isVoldemort
    this.group = new THREE.Group()

    // 1. High-Gloss ABS Plastic PBR Material
    const plasticMat = new THREE.MeshPhysicalMaterial({
      color: isVoldemort ? 0x111113 : 0x22262f,
      roughness: 0.16,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.1,
    })

    // 2. HIPS & WAIST (Grounded so soles touch y=0)
    this.hipsGroup = new THREE.Group()
    this.hipsGroup.position.set(0, 0.34, 0)
    this.group.add(this.hipsGroup)

    // Rounded hip hinge bar
    const waistGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 24)
    waistGeo.rotateZ(Math.PI / 2)
    const waistMesh = new THREE.Mesh(waistGeo, plasticMat)
    this.hipsGroup.add(waistMesh)

    // Crotch connector box
    const crotchGeo = new THREE.BoxGeometry(0.12, 0.14, 0.18)
    crotchGeo.translate(0, -0.04, 0)
    const crotchMesh = new THREE.Mesh(crotchGeo, plasticMat)
    this.hipsGroup.add(crotchMesh)

    // 3. LEGS (Left & Right)
    const makeLegMesh = () => {
      const legAssembly = new THREE.Group()

      const hingeGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.17, 24)
      hingeGeo.rotateZ(Math.PI / 2)
      const hingeMesh = new THREE.Mesh(hingeGeo, plasticMat)
      legAssembly.add(hingeMesh)

      const legBlockGeo = new THREE.BoxGeometry(0.17, 0.34, 0.20)
      legBlockGeo.translate(0, -0.17, 0)
      const legBlockMesh = new THREE.Mesh(legBlockGeo, plasticMat)
      legBlockMesh.castShadow = true
      legAssembly.add(legBlockMesh)

      // Authentic LEGO Minifigure pin holes on the back of legs with recessed rim
      const makePinHole = (yPos: number) => {
        const holeGroup = new THREE.Group()
        // Deep dark inner recess cavity
        const innerGeo = new THREE.CircleGeometry(0.038, 20)
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x050608 })
        const inner = new THREE.Mesh(innerGeo, innerMat)
        inner.position.set(0, 0, -0.103)
        inner.rotation.y = Math.PI
        holeGroup.add(inner)

        // Molded plastic bevel ring around the hole
        const rimGeo = new THREE.TorusGeometry(0.038, 0.007, 8, 20)
        const rimMesh = new THREE.Mesh(rimGeo, plasticMat)
        rimMesh.position.set(0, 0, -0.101)
        holeGroup.add(rimMesh)

        holeGroup.position.set(0, yPos, 0)
        return holeGroup
      }
      legAssembly.add(makePinHole(-0.12))
      legAssembly.add(makePinHole(-0.24))

      const toeGeo = new THREE.BoxGeometry(0.17, 0.08, 0.07)
      toeGeo.translate(0, -0.30, 0.135)
      const toeMesh = new THREE.Mesh(toeGeo, plasticMat)
      toeMesh.castShadow = true
      legAssembly.add(toeMesh)

      return legAssembly
    }

    // Right Leg
    this.legRightPivot = new THREE.Group()
    this.legRightPivot.position.set(0.095, 0, 0)
    this.legRightPivot.add(makeLegMesh())
    this.hipsGroup.add(this.legRightPivot)

    // Left Leg
    this.legLeftPivot = new THREE.Group()
    this.legLeftPivot.position.set(-0.095, 0, 0)
    this.legLeftPivot.add(makeLegMesh())
    this.hipsGroup.add(this.legLeftPivot)

    // 4. TORSO (Authentic Trapezoid with Beveled Edges)
    const torsoShape = new THREE.Shape()
    const bW = 0.21
    const tW = 0.16
    const h = 0.44
    torsoShape.moveTo(-bW, 0)
    torsoShape.lineTo(bW, 0)
    torsoShape.lineTo(tW, h)
    torsoShape.lineTo(-tW, h)
    torsoShape.closePath()

    const extrudeSettings = {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    }
    const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, extrudeSettings)
    torsoGeo.center()
    torsoGeo.translate(0, 0.28, 0)

    this.torsoMat = new THREE.MeshPhysicalMaterial({
      color: isVoldemort ? 0x111113 : 0x22262f,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.6,
    })
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.torsoMat)
    this.torsoMesh.castShadow = true
    this.hipsGroup.add(this.torsoMesh)

    // Front Decal Plane (Only Harry has front uniform decal; 2005 Voldemort has plain black torso)
    const decalGeo = new THREE.PlaneGeometry(0.36, 0.43)
    const torsoDecalMat = new THREE.MeshStandardMaterial({
      map: isVoldemort ? createVoldemortTorsoTexture() : createHarryTorsoTexture(),
      transparent: true,
      roughness: 0.25,
      metalness: 0.02,
    })
    this.torsoDecalMesh = new THREE.Mesh(decalGeo, torsoDecalMat)
    this.torsoDecalMesh.position.set(0, 0.28, 0.128)
    if (!isVoldemort) {
      this.hipsGroup.add(this.torsoDecalMesh)
    }

    // Back Decal Plane (Authentic LEGO Minifigure Back Decal)
    if (!isVoldemort) {
      const backDecalMat = new THREE.MeshStandardMaterial({
        map: createHarryBackTorsoTexture(),
        transparent: true,
        roughness: 0.35,
        metalness: 0.02,
      })
      const backDecalMesh = new THREE.Mesh(decalGeo, backDecalMat)
      backDecalMesh.position.set(0, 0.28, -0.128)
      backDecalMesh.rotation.y = Math.PI
      this.hipsGroup.add(backDecalMesh)
    }

    // Neck Stud
    const neckGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.08, 32)
    const neckMesh = new THREE.Mesh(neckGeo, plasticMat)
    neckMesh.position.set(0, 0.54, 0)
    this.hipsGroup.add(neckMesh)

    // 5. FABRIC CAPE & HOOD (Authentic 2005 Dementor Poncho Shroud Cloak for Voldemort)
    if (isVoldemort) {
      const ponchoGeo = buildPonchoCloakGeometry()
      this.capeMat = new THREE.MeshStandardMaterial({
        map: createVoldemortCapeTexture(),
        roughness: 0.95,
        metalness: 0.02,
        side: THREE.DoubleSide,
      })
      this.capeMesh = new THREE.Mesh(ponchoGeo, this.capeMat)
      this.capeMesh.position.set(0, 0, 0)
      this.capeMesh.castShadow = true

      // Frayed fabric collar torus around neck
      const collarGeo = new THREE.TorusGeometry(0.115, 0.022, 12, 24)
      collarGeo.rotateX(Math.PI / 2)
      const collarMesh = new THREE.Mesh(collarGeo, this.capeMat)
      collarMesh.position.set(0, 0.52, 0)
      this.capeMesh.add(collarMesh)

      this.hipsGroup.add(this.capeMesh)
    } else {
      const capeH = 0.32
      const capeGeo = new THREE.PlaneGeometry(0.32, capeH, 8, 16)
      const pos = capeGeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i)
        const x = pos.getX(i)
        const curveZ = -0.15 - Math.sin((capeH * 0.5 - y) * 3.2) * 0.08 - (x * x) * 0.35
        pos.setZ(i, curveZ)
      }
      capeGeo.computeVertexNormals()

      this.capeMat = new THREE.MeshStandardMaterial({
        color: 0x111215,
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
      this.capeMesh = new THREE.Mesh(capeGeo, this.capeMat)
      this.capeMesh.position.set(0, 0.34, 0)
      this.capeMesh.castShadow = true
    }

    // Subtle dark cowl collar at Harry's neck (Matching Reference Illustration)
    if (!isVoldemort) {
      const hoodRimGeo = new THREE.TorusGeometry(0.115, 0.022, 12, 24, Math.PI)
      hoodRimGeo.rotateX(Math.PI / 2)
      const hoodMat = new THREE.MeshStandardMaterial({ color: 0x14161d, roughness: 0.75 })
      const hoodRim = new THREE.Mesh(hoodRimGeo, hoodMat)
      hoodRim.position.set(0, 0.46, -0.10)
      this.hipsGroup.add(hoodRim)
    }

    // 6. HEAD PIVOT & AUTHENTIC CONTOURED LATHE HEAD
    this.headPivot = new THREE.Group()
    this.headPivot.position.set(0, 0.62, 0)
    this.hipsGroup.add(this.headPivot)

    const headPoints = [
      new THREE.Vector2(0, -0.15),
      new THREE.Vector2(0.085, -0.15),
      new THREE.Vector2(0.085, -0.12),
      new THREE.Vector2(0.125, -0.10),
      new THREE.Vector2(0.14, -0.07),
      new THREE.Vector2(0.14, 0.07),
      new THREE.Vector2(0.125, 0.10),
      new THREE.Vector2(0.075, 0.115),
      new THREE.Vector2(0.065, 0.115),
      new THREE.Vector2(0.065, 0.165),
      new THREE.Vector2(0.058, 0.17),
      new THREE.Vector2(0.046, 0.17),
      new THREE.Vector2(0.044, 0.135),
      new THREE.Vector2(0, 0.135),
    ]
    const headGeo = new THREE.LatheGeometry(headPoints, 48)

    this.headBaseMat = new THREE.MeshPhysicalMaterial({
      color: isVoldemort ? 0xbac5ad : 0xffcf9e, // Authentic 2005 Lego glow-in-the-dark phosphor green-white
      roughness: isVoldemort ? 0.38 : 0.28,
      metalness: 0.0,
      clearcoat: isVoldemort ? 0.35 : 0.50,
      clearcoatRoughness: isVoldemort ? 0.35 : 0.15,
      emissive: isVoldemort ? new THREE.Color(0x1a3320) : new THREE.Color(0x000000),
      emissiveIntensity: isVoldemort ? 0.22 : 0,
    })
    this.headMesh = new THREE.Mesh(headGeo, this.headBaseMat)
    this.headMesh.castShadow = true
    this.headPivot.add(this.headMesh)

    // Dedicated Cylindrical Face Decal Arc (120 degrees facing +Z)
    const faceGeo = new THREE.CylinderGeometry(0.1416, 0.1416, 0.16, 36, 1, true, -Math.PI / 3, 2 * Math.PI / 3)
    const faceDecalMat = new THREE.MeshStandardMaterial({
      map: isVoldemort ? createVoldemortFaceTexture() : createHarryFaceTexture(),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: isVoldemort ? 0.50 : 0.25,
    })
    this.faceDecalMesh = new THREE.Mesh(faceGeo, faceDecalMat)
    this.headPivot.add(this.faceDecalMesh)

    // 7. SCULPTED TOUSLED LEGO HAIRPIECE (Harry Potter - Lego Element #64798)
    this.hairMesh = new THREE.Group()
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x141211,
      roughness: 0.38,
      metalness: 0.06,
    })

    // Main skull cap contoured tightly over the Lego head cylinder
    const hairCapGeo = new THREE.SphereGeometry(0.150, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58)
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat)
    hairCap.position.set(0, 0.048, -0.01)
    hairCap.scale.set(1.02, 0.95, 1.05)
    this.hairMesh.add(hairCap)

    // Back of head curved Lego shell covering nape of neck smoothly
    const backShellGeo = new THREE.CylinderGeometry(0.148, 0.138, 0.16, 24, 1, false, Math.PI * 0.55, Math.PI * 0.90)
    const backShell = new THREE.Mesh(backShellGeo, hairMat)
    backShell.position.set(0, -0.015, -0.01)
    this.hairMesh.add(backShell)

    // Stepped layered wavy ridges across the back of the head (Iconic Lego mold grooves)
    const makeBackStrand = (radius: number, tube: number, y: number, z: number, rotX: number, rotY: number) => {
      const g = new THREE.TorusGeometry(radius, tube, 12, 24, Math.PI * 0.75)
      g.rotateZ(Math.PI * 0.62)
      const m = new THREE.Mesh(g, hairMat)
      m.position.set(0, y, z)
      m.rotation.x = rotX
      m.rotation.y = rotY
      return m
    }
    this.hairMesh.add(makeBackStrand(0.138, 0.024, 0.04, -0.03, -0.15, 0))
    this.hairMesh.add(makeBackStrand(0.134, 0.026, -0.01, -0.03, -0.25, 0.05))
    this.hairMesh.add(makeBackStrand(0.126, 0.028, -0.06, -0.02, -0.35, -0.05))

    // Top front tousled swept locks (Harry's messy fringe)
    const makeTuft = (sx: number, sy: number, sz: number, px: number, py: number, pz: number, rx: number, ry: number, rz: number) => {
      const geo = new THREE.ConeGeometry(0.045, 0.11, 8)
      geo.scale(sx, sy, sz)
      geo.rotateX(-Math.PI * 0.45)
      const mesh = new THREE.Mesh(geo, hairMat)
      mesh.position.set(px, py, pz)
      mesh.rotation.set(rx, ry, rz)
      return mesh
    }
    this.hairMesh.add(makeTuft(1.0, 1.0, 1.0, -0.06, 0.12, 0.08, 0.15, -0.35, 0.25))
    this.hairMesh.add(makeTuft(0.9, 1.1, 0.9, 0.03, 0.13, 0.09, 0.10, 0.25, -0.20))
    this.hairMesh.add(makeTuft(0.8, 0.9, 0.8, 0.09, 0.11, 0.06, 0.05, 0.45, -0.15))
    this.hairMesh.add(makeTuft(0.85, 0.85, 0.85, -0.02, 0.14, 0.02, 0.25, 0.0, 0.10))

    // Sideburns framing the face and ears
    const sideburnGeo = new THREE.BoxGeometry(0.028, 0.11, 0.055)
    const sideburnL = new THREE.Mesh(sideburnGeo, hairMat)
    sideburnL.position.set(-0.144, 0.01, 0.02)
    this.hairMesh.add(sideburnL)

    const sideburnR = new THREE.Mesh(sideburnGeo, hairMat)
    sideburnR.position.set(0.144, 0.01, 0.02)
    this.hairMesh.add(sideburnR)

    // Side Glasses Frame Arm and Yellow Lego Ear on right side of head (Visible in reference image)
    if (!isVoldemort) {
      const earGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.014, 12)
      earGeo.rotateZ(Math.PI / 2)
      const earR = new THREE.Mesh(earGeo, this.headBaseMat)
      earR.position.set(0.146, -0.005, 0.005)
      this.headPivot.add(earR)

      const glassesArmGeo = new THREE.BoxGeometry(0.006, 0.006, 0.11)
      const glassesArmMat = new THREE.MeshBasicMaterial({ color: 0x111111 })
      const glassesArm = new THREE.Mesh(glassesArmGeo, glassesArmMat)
      glassesArm.position.set(0.147, 0.018, 0.05)
      this.headPivot.add(glassesArm)
    }

    this.headPivot.add(this.hairMesh)
    if (isVoldemort) {
      this.hairMesh.visible = false
    }

    // 8. CURVED LEGO ARMS WITH C-HANDS & WAND
    const armMat = new THREE.MeshPhysicalMaterial({
      color: isVoldemort ? 0x111113 : 0x22262f,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.6,
    })

    const buildArmAssembly = (isRight: boolean) => {
      const armGroup = new THREE.Group()

      const ballGeo = new THREE.SphereGeometry(0.048, 20, 20)
      const ballMesh = new THREE.Mesh(ballGeo, armMat)
      armGroup.add(ballMesh)

      const sign = isRight ? 1 : -1
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(sign * 0.025, -0.09, 0.015),
        new THREE.Vector3(sign * 0.015, -0.18, 0.05),
        new THREE.Vector3(sign * -0.02, -0.24, 0.07),
      ])
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.040, 16, false)
      const tubeMesh = new THREE.Mesh(tubeGeo, armMat)
      tubeMesh.castShadow = true
      armGroup.add(tubeMesh)

      const cuffGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.04, 20)
      cuffGeo.rotateX(Math.PI / 4)
      const cuffMesh = new THREE.Mesh(cuffGeo, armMat)
      cuffMesh.position.set(sign * -0.02, -0.24, 0.07)
      armGroup.add(cuffMesh)

      return armGroup
    }

    // Wand Arm (Inner Runway Hand - facing table and opponent)
    this.armRightPivot = new THREE.Group()
    this.armRightPivot.position.set(-0.20, 0.44, 0)
    this.armRightPivot.add(buildArmAssembly(false))
    this.hipsGroup.add(this.armRightPivot)

    this.wristRightPivot = new THREE.Group()
    this.wristRightPivot.position.set(0.02, -0.26, 0.08)
    this.armRightPivot.add(this.wristRightPivot)

    const handMat = new THREE.MeshPhysicalMaterial({
      color: isVoldemort ? 0xf5f6fa : 0xffcf9e, // 2005 Authentic Ghostly White Hands
      roughness: 0.16,
      clearcoat: 0.6,
    })
    const handGeo = new THREE.TorusGeometry(0.042, 0.018, 16, 32, Math.PI * 1.45)
    const handRightMesh = new THREE.Mesh(handGeo, handMat)
    handRightMesh.rotation.z = -Math.PI / 2
    this.wristRightPivot.add(handRightMesh)

    // Turned Wand (Holly for Harry, 2005 Pitch-Black Wand for Voldemort)
    this.wandGroup = new THREE.Group()
    const wandGroup = this.wandGroup
    const wandMat = new THREE.MeshStandardMaterial({
      color: isVoldemort ? 0x141416 : 0x3d2112,
      roughness: 0.35,
    })

    const pommelGeo = new THREE.SphereGeometry(0.016, 12, 12)
    const pommel = new THREE.Mesh(pommelGeo, wandMat)
    wandGroup.add(pommel)

    const shaftGeo = new THREE.CylinderGeometry(0.007, 0.014, 0.34, 16)
    shaftGeo.translate(0, 0.17, 0)
    const shaft = new THREE.Mesh(shaftGeo, wandMat)
    wandGroup.add(shaft)

    wandGroup.rotation.x = Math.PI / 2
    wandGroup.position.set(0, 0, 0.04)
    this.wristRightPivot.add(wandGroup)

    // Wand Tip Aura & Light (Sleek cap matching wand shaft taper)
    const tipGeo = new THREE.SphereGeometry(0.009, 12, 12)
    this.wandTipMat = new THREE.MeshBasicMaterial({
      color: isVoldemort ? 0x00ff88 : 0xff4422,
    })
    this.wandTipMesh = new THREE.Mesh(tipGeo, this.wandTipMat)
    this.wandTipMesh.position.set(0, 0, 0.38)
    this.wristRightPivot.add(this.wandTipMesh)

    // Tip Group for attaching particles/effects
    this.wandTipGroup = new THREE.Group()
    this.wandTipGroup.position.set(0, 0, 0.38)
    this.wristRightPivot.add(this.wandTipGroup)

    this.wandLight = new THREE.PointLight(isVoldemort ? 0x00ff88 : 0xff4422, 0.2, 1.8)
    this.wandTipGroup.add(this.wandLight)

    // Off-hand Arm (Outer side - Relaxed / Balance)
    this.armLeftPivot = new THREE.Group()
    this.armLeftPivot.position.set(0.20, 0.44, 0)
    this.armLeftPivot.add(buildArmAssembly(true))
    this.hipsGroup.add(this.armLeftPivot)

    this.wristLeftPivot = new THREE.Group()
    this.wristLeftPivot.position.set(-0.02, -0.26, 0.08)
    this.armLeftPivot.add(this.wristLeftPivot)

    const handLeftMesh = new THREE.Mesh(handGeo, handMat)
    handLeftMesh.rotation.z = Math.PI / 2
    this.wristLeftPivot.add(handLeftMesh)

    // Default Stance
    this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(76)
    this.armLeftPivot.rotation.x = THREE.MathUtils.degToRad(18)
  }

  /**
   * Update character dynamic animations in render loop
   */
  public update(delta: number, time: number, isMoving = false, strafeSpeed = 0) {
    this.wandTipMesh.visible = true

    // 1. Cape wind flutter
    const capeWind = Math.sin(time * 3.5) * 0.06
    this.capeMesh.rotation.x = capeWind

    // 2. Wand tip light pulse (subtle accent, main duel lights managed by scene)
    const baseLight = this.isVoldemort ? 0.15 : 0.25
    this.wandLight.intensity = baseLight + Math.sin(time * 8.0) * 0.05

    // 2.5. Petrified animation (Petrificus Totalus: Locked rigid like a stone board)
    if (this.isPetrified) {
      this.headPivot.rotation.set(0, 0, 0)
      this.armRightPivot.rotation.set(0, 0, 0.06)
      this.armLeftPivot.rotation.set(0, 0, -0.06)
      this.legRightPivot.rotation.set(0, 0, 0)
      this.legLeftPivot.rotation.set(0, 0, 0)
      this.capeMesh.rotation.x = 0
      this.hipsGroup.position.set(0, 0.34, 0)
      this.hipsGroup.rotation.set(0, 0, 0)
      return
    }

    // 3. Flinch animation (Taking damage)
    if (this.flinchProgress > 0) {
      this.flinchProgress = Math.max(0, this.flinchProgress - delta * 2.8)
      // Clamped normalized progress [0..1] to ensure peak flinch curve is always positive
      const normProgress = Math.min(1.0, this.flinchProgress)
      const fCurve = Math.sin(normProgress * Math.PI)
      const severity = Math.max(1.0, this.flinchProgress) // Heavy concussive spells like Confringo
      this.headPivot.rotation.x = -0.45 * fCurve * severity
      this.hipsGroup.rotation.x = -0.40 * fCurve * severity
      this.hipsGroup.position.z = -0.42 * fCurve * severity
      this.hipsGroup.position.y = 0.34 + 0.18 * fCurve * severity // Lift slightly in air from concussive wave
      this.armLeftPivot.rotation.x = -0.65 * fCurve * severity
      this.armLeftPivot.rotation.z = -0.55 * fCurve * severity
      this.armRightPivot.rotation.x = -0.75 * fCurve * severity
      this.armRightPivot.rotation.z = 0.55 * fCurve * severity
      this.legLeftPivot.rotation.x = 0.35 * fCurve * severity
      this.legRightPivot.rotation.x = 0.25 * fCurve * severity
      return
    } else {
      this.hipsGroup.position.z = 0
      this.hipsGroup.position.y = 0.34
      this.hipsGroup.rotation.set(0, 0, 0)
    }

    // 4a. Disarmed State (Expelliarmus hit - empty hands, shocked posture)
    if (this.isDisarmed) {
      const wobble = Math.sin(time * 12.0) * 0.05
      this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(35) + wobble
      this.armRightPivot.rotation.z = -0.55
      this.armRightPivot.rotation.y = 0.25
      this.armLeftPivot.rotation.x = -THREE.MathUtils.degToRad(35) - wobble
      this.armLeftPivot.rotation.z = 0.55
      this.armLeftPivot.rotation.y = -0.25
      this.headPivot.rotation.x = -0.22
      this.wristRightPivot.rotation.set(0, 0, 0)
      return
    }

    // 4. Stunned animation (Stupefy)
    if (this.isStunned) {
      const wobble = Math.sin(time * 8.5)
      this.headPivot.rotation.y = wobble * 0.40
      this.headPivot.rotation.z = wobble * 0.18
      this.armLeftPivot.rotation.x = -0.35 + wobble * 0.25
      this.armRightPivot.rotation.x = -0.55 - wobble * 0.25
      this.legLeftPivot.rotation.x = wobble * 0.15
      this.legRightPivot.rotation.x = -wobble * 0.15
      return
    }

    // 4b. Confused / Amnesia animation (Obliviate)
    if (this.isConfused) {
      const sway = Math.sin(time * 3.5)
      this.headPivot.rotation.y = sway * 0.35
      this.headPivot.rotation.z = 0.16 + Math.cos(time * 2.8) * 0.08
      this.headPivot.rotation.x = 0.12
      this.armLeftPivot.rotation.x = -0.25 + sway * 0.15
      this.armLeftPivot.rotation.z = -0.35
      this.armRightPivot.rotation.x = -0.30 - sway * 0.15
      this.armRightPivot.rotation.z = 0.32
      this.wristRightPivot.rotation.set(0, 0, 0)
      return
    }

    // 5. Priori Incantatem Clash Stance (Beam Lock)
    if (this.isClashing) {
      const jitter = Math.sin(time * 36) * 0.035
      this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(85) + jitter
      this.armRightPivot.rotation.y = Math.cos(time * 28) * 0.03
      this.armRightPivot.rotation.z = 0.05
      this.wristRightPivot.rotation.set(0, 0, 0)

      this.armLeftPivot.rotation.x = -THREE.MathUtils.degToRad(35)
      this.armLeftPivot.rotation.z = -0.25

      this.legLeftPivot.rotation.x = -0.28
      this.legRightPivot.rotation.x = 0.22

      this.capeMesh.rotation.x = -0.32 + Math.sin(time * 20) * 0.12
      this.wandLight.intensity = 8.5 + Math.sin(time * 24) * 3.5
      return
    }

    // 5b. Sustained Spell Channeling Stance (Expelliarmus Beam Hold - Exact Match to Concept Sketch)
    if (this.isChanneling) {
      // Powerful duelist stance: wand thrust forward-up towards Voldemort matching reference illustration
      const tremor = Math.sin(time * 36) * 0.008
      this.armRightPivot.rotation.set(
        -THREE.MathUtils.degToRad(58) + tremor,
        -THREE.MathUtils.degToRad(10),
        -THREE.MathUtils.degToRad(20)
      )
      this.wristRightPivot.rotation.set(
        THREE.MathUtils.degToRad(24),
        THREE.MathUtils.degToRad(28),
        0
      )

      // Hide default wand tip sphere during continuous laser emission so muzzle starburst is crisp
      if (!this.isVoldemort) {
        this.wandTipMesh.visible = false
      }

      // Outer off-hand back for stability & balance (matching concept sketch)
      this.armLeftPivot.rotation.x = THREE.MathUtils.degToRad(22)
      this.armLeftPivot.rotation.y = THREE.MathUtils.degToRad(8)
      this.armLeftPivot.rotation.z = THREE.MathUtils.degToRad(18)

      // Head locked onto opponent down the runway
      this.headPivot.rotation.y = THREE.MathUtils.degToRad(16)
      this.headPivot.rotation.x = -THREE.MathUtils.degToRad(4)

      // Sturdy athletic leg stance
      this.legLeftPivot.rotation.x = 0.20
      this.legRightPivot.rotation.x = -0.20

      // Cape billowing back in the intense plasma backdraft
      this.capeMesh.rotation.x = -0.55 + Math.sin(time * 24) * 0.10
      this.wandLight.intensity = 4.2 + Math.sin(time * 35) * 1.0
      return
    }

    // 5c. Target Channeling Stance (Defiant duelist absorbing / contesting the beam - Matching Concept Sketch)
    if (this.isTargetChanneling) {
      // Voldemort stands tall and defiant facing Harry with wand aimed into the clash
      const tremor = Math.sin(time * 40) * 0.02
      this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(70) + tremor
      this.armRightPivot.rotation.y = THREE.MathUtils.degToRad(6)
      this.armRightPivot.rotation.z = -THREE.MathUtils.degToRad(8)
      this.wristRightPivot.rotation.set(0, 0, 0)

      this.armLeftPivot.rotation.x = THREE.MathUtils.degToRad(18)
      this.armLeftPivot.rotation.y = -THREE.MathUtils.degToRad(10)
      this.armLeftPivot.rotation.z = THREE.MathUtils.degToRad(15)

      this.headPivot.rotation.y = -THREE.MathUtils.degToRad(12)
      this.headPivot.rotation.x = THREE.MathUtils.degToRad(4)
      this.hipsGroup.position.x = Math.sin(time * 50) * 0.015
      this.hipsGroup.position.z = Math.cos(time * 45) * 0.015

      this.capeMesh.rotation.x = -0.45 + Math.sin(time * 28) * 0.08
      this.wandLight.intensity = 2.5 + Math.sin(time * 30) * 0.8
      return
    }

    // 6. Spell Cast Animation
    if (this.castProgress > 0) {
      this.castProgress = Math.max(0, this.castProgress - delta * 3.2)
      const flick = Math.sin(this.castProgress * Math.PI)

      // Dramatic wand flourish down & forward
      this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(80) - flick * 0.55
      this.armRightPivot.rotation.z = flick * 0.35
      this.wristRightPivot.rotation.z = flick * 0.45
      this.wristRightPivot.rotation.y = flick * 0.25

      this.headPivot.rotation.x = flick * 0.15
      this.capeMesh.rotation.x = -0.22 - flick * 0.35
      this.wandLight.intensity = 7.0 + flick * 8.0
      return
    }

    // 7. Defensive Shield Stance (Protego)
    if (this.isDefending) {
      this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(95)
      this.armRightPivot.rotation.z = 0.45
      this.wristRightPivot.rotation.z = 0.35
      this.armLeftPivot.rotation.x = -THREE.MathUtils.degToRad(40)
      this.armLeftPivot.rotation.z = -0.35
      this.headPivot.rotation.x = 0.05
      this.capeMesh.rotation.x = -0.15
      return
    }

    // 8. Walk / Strafe Cycle
    if (isMoving) {
      this.walkCycle += Math.abs(strafeSpeed) * delta * 14.0 + delta * 3.0
      const stride = Math.sin(this.walkCycle) * 0.55

      this.legLeftPivot.rotation.x = stride
      this.legRightPivot.rotation.x = -stride
      this.armLeftPivot.rotation.x = -stride * 0.65 + THREE.MathUtils.degToRad(15)
      this.armRightPivot.rotation.x = stride * 0.35 - THREE.MathUtils.degToRad(80)
      this.capeMesh.rotation.x = -Math.abs(stride) * 0.22 - 0.06
      this.hipsGroup.position.y = 0.34 + Math.abs(stride) * 0.018

      this.headPivot.rotation.y = this.aimOffset.x * 0.35
      this.headPivot.rotation.x = this.aimOffset.y * 0.25
      return
    }

    // 9. Idle Breathing Duel Stance
    const breath = Math.sin(time * 2.2) * 0.008
    this.hipsGroup.position.y = 0.34 + breath
    this.legLeftPivot.rotation.x = 0
    this.legRightPivot.rotation.x = 0

    const idleWand = Math.sin(time * 2.8) * 0.03
    this.armRightPivot.rotation.x = -THREE.MathUtils.degToRad(76) + idleWand + this.aimOffset.y * 0.3
    this.armRightPivot.rotation.z = -0.10 + this.aimOffset.x * 0.35
    this.armRightPivot.rotation.y = -0.12
    this.wristRightPivot.rotation.set(0, 0, 0)

    this.armLeftPivot.rotation.x = THREE.MathUtils.degToRad(18) + Math.sin(time * 2.2) * 0.02
    this.armLeftPivot.rotation.z = THREE.MathUtils.degToRad(12)

    // For Harry: keep head turned towards the arena and opponent (+0.38 rad)
    const baseHeadY = this.isVoldemort ? 0 : 0.38
    this.headPivot.rotation.y = baseHeadY + this.aimOffset.x * 0.4
    this.headPivot.rotation.x = this.aimOffset.y * 0.25
    this.headPivot.rotation.z = 0
  }

  /**
   * Applies realistic Lego minifigure leaning & ducking dodge kinematics
   * Smoothly sways the hips, tilts the torso, and lowers stance to dodge spells
   */
  public applyLeanDodge() {
    const dirSign = this.isVoldemort ? 1 : -1

    // Torso & Hips lean (expressive Lego minifigure sway & crouch)
    this.hipsGroup.position.x = this.leanX * 0.18 * dirSign
    this.hipsGroup.position.y = 0.34 - this.leanY * 0.24
    this.hipsGroup.position.z = 0

    this.hipsGroup.rotation.z = -this.leanX * 0.42 * dirSign
    this.hipsGroup.rotation.x = this.leanY * 0.45

    // Leg bend when ducking low (Lego seated/crouched knee bend)
    this.legLeftPivot.rotation.x = -this.leanY * 0.65
    this.legRightPivot.rotation.x = -this.leanY * 0.65

    // Counter-balance head so duelists keep eyes focused towards the spell trajectory
    this.headPivot.rotation.z = this.leanX * 0.25 * dirSign
    this.headPivot.rotation.x = (this.aimOffset.y * 0.25) - this.leanY * 0.28
  }

  /**
   * Canon Harry Potter Full Body-Bind Curse (Petrificus Totalus):
   * Locks the character's limbs completely rigid like an ironing board,
   * while PRESERVING 100% original character face, skin, and robe textures
   * (Does NOT turn the character into grey concrete stone or alter skin colors!).
   */
  public setPetrified(petrified: boolean) {
    this.isPetrified = petrified

    if (petrified) {
      // Canon Full Body-Bind: Arms snap straight to sides, legs pressed together, rigid posture
      this.headPivot.rotation.set(0, 0, 0)
      this.armRightPivot.rotation.set(0, 0, 0.05)
      this.armLeftPivot.rotation.set(0, 0, -0.05)
      this.legRightPivot.rotation.set(0, 0, 0)
      this.legLeftPivot.rotation.set(0, 0, 0)
      this.capeMesh.rotation.x = 0
      this.hipsGroup.position.set(0, 0.34, 0)
      this.hipsGroup.rotation.set(0, 0, 0)
    }
  }

  public setStunned(stunned: boolean) {
    this.isStunned = stunned
  }

  public setConfused(confused: boolean) {
    this.isConfused = confused
  }

  public setWandVisible(visible: boolean) {
    if (this.wandGroup) this.wandGroup.visible = visible
    if (this.wandTipMesh) this.wandTipMesh.visible = visible
    if (this.wandLight) this.wandLight.visible = visible
  }
}

