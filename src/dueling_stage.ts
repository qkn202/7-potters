import * as THREE from 'three'
import greatHallBackdropSrc from './assets/dueling/great_hall_25d.jpg'

// =========================================================================
// HOGWARTS DUELING ARENA — 2.5D WEBGPU FINAL PRODUCTION MAP
// 2.5D High-Definition Matte Painting Great Hall Backdrop & 3D Royal Obsidian Runway
// =========================================================================

/**
 * Creates the high-gloss Royal Obsidian Marble PBR Texture (1024x2048) for the dueling runway.
 * Features polished midnight obsidian, fine golden veins, 24 ancient Elder Futhark runes along the
 * gilded border ribbons, the Sacred Zodiac Priori Incantatem magic circle at center, and duelist crests.
 */
/**
 * Creates the authentic Harry Potter Dueling Club Antique English Oak Texture (1024x2048).
 * Modeled after the canonical Chamber of Secrets Dueling Club stage:
 * - Hand-planed antique English Oak planks with rich longitudinal grain and deep walnut-amber tones.
 * - Inlaid gilded brass perimeter ribbons with Gothic corner bracket plates and engraved Elder Runes.
 * - Central Priori Incantatem magic circle with the Hogwarts Crest and Latin motto.
 * - Harry's side: Inlaid velvet crimson Gryffindor medallion with embossed golden lion rampant.
 * - Voldemort's side: Inlaid velvet emerald Slytherin medallion with embossed golden coiling serpent.
 * - Transverse starting lines (vạch xuất phát cúi chào đối thủ).
 */
export function createAntiqueHogwartsOakStageTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 2048
  const ctx = cv.getContext('2d')!

  const W = cv.width
  const H = cv.height

  // 1. Deep Antique English Oak Base (Warm walnut & aged golden chestnut gradient)
  const baseGrad = ctx.createLinearGradient(0, 0, W, H)
  baseGrad.addColorStop(0, '#2d180d')
  baseGrad.addColorStop(0.3, '#3a2012')
  baseGrad.addColorStop(0.7, '#351d10')
  baseGrad.addColorStop(1, '#27140a')
  ctx.fillStyle = baseGrad
  ctx.fillRect(0, 0, W, H)

  // 2. Longitudinal Timber Planks (6 wide planks of aged English oak)
  const numPlanks = 6
  const plankW = W / numPlanks

  for (let p = 0; p < numPlanks; p++) {
    const px = p * plankW
    const tone = (p % 2 === 0 ? 1 : -1) * (10 + ((p * 4) % 15))

    // Subtle plank wash
    ctx.fillStyle = `rgba(${58 + tone}, ${34 + tone / 2}, ${18 + tone / 3}, 0.35)`
    ctx.fillRect(px, 0, plankW, H)

    // Wood Grain Striations (wavy vertical tree rings & fibers)
    for (let g = 0; g < 42; g++) {
      const gx = px + 6 + Math.random() * (plankW - 12)
      const alpha = 0.05 + Math.random() * 0.10
      const isDark = Math.random() > 0.4
      ctx.strokeStyle = isDark 
        ? `rgba(18, 9, 4, ${alpha * 1.5})` 
        : `rgba(245, 158, 11, ${alpha * 0.7})`
      ctx.lineWidth = 1.0 + Math.random() * 2.2
      ctx.beginPath()
      let x = gx
      ctx.moveTo(x, 0)
      for (let y = 0; y < H; y += 45) {
        x += Math.sin(y * 0.007 + g * 1.3) * 3.5 + (Math.random() - 0.5) * 1.2
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Occasional Wood Knots (vân mắt gỗ tự nhiên)
    if (p % 2 === 1) {
      const knotY = 350 + (p * 550) % (H - 700)
      const knotX = px + plankW * 0.45
      const knotGrad = ctx.createRadialGradient(knotX, knotY, 4, knotX, knotY, 38)
      knotGrad.addColorStop(0, 'rgba(15, 6, 2, 0.75)')
      knotGrad.addColorStop(0.5, 'rgba(45, 24, 12, 0.45)')
      knotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = knotGrad
      ctx.beginPath()
      ctx.ellipse(knotX, knotY, 18, 38, Math.PI * 0.05, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Plank Seam V-Grooves (Mạch ghép ván gỗ âm dương)
  for (let p = 1; p < numPlanks; p++) {
    const x = p * plankW
    // Shadow line
    ctx.strokeStyle = 'rgba(10, 4, 2, 0.85)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()

    // Fine golden light catching the beveled edge
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.16)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 2, 0)
    ctx.lineTo(x + 2, H)
    ctx.stroke()
  }

  // Antique Wood Varnish Edge Vignette
  const vigL = ctx.createLinearGradient(0, 0, 90, 0)
  vigL.addColorStop(0, 'rgba(12, 6, 3, 0.65)')
  vigL.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = vigL
  ctx.fillRect(0, 0, 90, H)

  const vigR = ctx.createLinearGradient(W, 0, W - 90, 0)
  vigR.addColorStop(0, 'rgba(12, 6, 3, 0.65)')
  vigR.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = vigR
  ctx.fillRect(W - 90, 0, 90, H)

  // 3. Gilded Brass / Bronze Inlay Trim (Viền chỉ đồng thau phong cách hoàng gia)
  const marginL = 58
  const marginR = W - 58

  // Outer Polished Brass Band
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(marginL, 20)
  ctx.lineTo(marginL, H - 20)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(marginR, 20)
  ctx.lineTo(marginR, H - 20)
  ctx.stroke()

  // Inner Bright Brass Line
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(marginL + 22, 32)
  ctx.lineTo(marginL + 22, H - 32)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(marginR - 22, 32)
  ctx.lineTo(marginR - 22, H - 32)
  ctx.stroke()

  // Ancient Elder Futhark Runes engraved along brass channels (Luminous Cyan & Gold in Sketch)
  const elderRunes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ']
  ctx.font = 'bold 30px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let runeIdx = 0
  for (let y = 65; y < H - 65; y += 44) {
    const rune = elderRunes[runeIdx % elderRunes.length]
    // Left edge runes: Vibrant glowing cyan-blue
    ctx.save()
    ctx.shadowColor = '#00e5ff'
    ctx.shadowBlur = 14
    ctx.fillStyle = '#38bdf8'
    ctx.fillText(rune, marginL + 11, y)
    ctx.restore()

    // Right edge runes: Luminous golden glow
    ctx.save()
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#fde68a'
    ctx.fillText(rune, marginR - 11, y)
    ctx.restore()

    runeIdx++
  }

  // Antique Brass Corner Plates with Rivet Studs
  const drawCornerPlate = (x: number, y: number, isRight: boolean, isBottom: boolean) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = '#b45309'
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.fillRect(isRight ? -40 : 0, isBottom ? -40 : 0, 40, 40)
    ctx.strokeRect(isRight ? -40 : 0, isBottom ? -40 : 0, 40, 40)
    // Brass rivet stud
    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.arc(isRight ? -20 : 20, isBottom ? -20 : 20, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  drawCornerPlate(marginL - 7, 20, false, false)
  drawCornerPlate(marginR + 7, 20, true, false)
  drawCornerPlate(marginL - 7, H - 20, false, true)
  drawCornerPlate(marginR + 7, H - 20, true, true)

  // 4. Central Sacred Zodiac Priori Incantatem Circle
  const cx = W / 2
  const cy = H / 2
  const rCircle = 230

  // Outer Gilded Ring
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(cx, cy, rCircle, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, rCircle - 12, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#b45309'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, rCircle - 44, 0, Math.PI * 2)
  ctx.stroke()

  // 12 Astrological Zodiac Glyphs along the magic circle perimeter
  const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 26px serif'
  zodiacSymbols.forEach((sym, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
    const zr = rCircle - 28
    const zx = cx + Math.cos(angle) * zr
    const zy = cy + Math.sin(angle) * zr
    ctx.fillText(sym, zx, zy)
  })

  // 8-Pointed Star of Magic (Sacred Octagram Interlocking Squares)
  const drawOctagram = (radius: number, color: string, lw: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lw
    ctx.save()
    ctx.translate(cx, cy)
    for (let rot = 0; rot < 2; rot++) {
      ctx.beginPath()
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2 + (rot * Math.PI) / 4
        const sx = Math.cos(a) * radius
        const sy = Math.sin(a) * radius
        if (s === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()
  }

  drawOctagram(rCircle - 54, 'rgba(217, 119, 6, 0.85)', 3.5)
  drawOctagram(rCircle - 98, 'rgba(251, 191, 36, 0.90)', 2.5)

  // Center Inlaid Hogwarts Medallion
  const rCore = 68
  const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rCore)
  coreGrad.addColorStop(0, '#543219')
  coreGrad.addColorStop(0.7, '#381f0f')
  coreGrad.addColorStop(1, '#241308')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(cx, cy, rCore, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx, cy, rCore, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 52px "Cinzel", "Times New Roman", serif'
  ctx.fillText('H', cx, cy + 4)

  // 5. Duelist House Roundels (Canon Chamber of Secrets Styling)
  // 5. Sacred Dueling Ring Inlays (Foreground & Distance Arcs - Exact Reference Image)
  const drawSacredDuelingRing = (zoneX: number, zoneY: number, rZone: number = 175) => {
    // Outer fluted golden ring
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(zoneX, zoneY, rZone, 0, Math.PI * 2)
    ctx.stroke()

    // Inner bright gold inlay
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(zoneX, zoneY, rZone - 8, 0, Math.PI * 2)
    ctx.stroke()

    // Fine inner concentric ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(zoneX, zoneY, rZone - 28, 0, Math.PI * 2)
    ctx.stroke()

    // Concentric ancient runes along ring perimeter
    const runeSymbols = ['ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ']
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 22px serif'
    runeSymbols.forEach((sym, i) => {
      const angle = (i / runeSymbols.length) * Math.PI * 2
      const zr = rZone - 18
      const zx = zoneX + Math.cos(angle) * zr
      const zy = zoneY + Math.sin(angle) * zr
      ctx.fillText(sym, zx, zy)
    })
  }

  drawSacredDuelingRing(cx, 1620, 195)
  drawSacredDuelingRing(cx, 440, 175)

  // 6. Transverse Starting Guard Lines (Vạch xuất phát cúi chào đối thủ)
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(marginL + 22, 175)
  ctx.lineTo(marginR - 22, 175)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(marginL + 22, H - 175)
  ctx.lineTo(marginR - 22, H - 175)
  ctx.stroke()

  // Fine highlighted line
  ctx.strokeStyle = '#fde68a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(marginL + 22, 177)
  ctx.lineTo(marginR - 22, 177)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(marginL + 22, H - 173)
  ctx.lineTo(marginR - 22, H - 173)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(cv)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

/**
 * Creates carved antique English Oak side wainscot paneling with brass studs and trefoil carvings.
 */
export function createAntiqueOakSideTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 128
  const ctx = cv.getContext('2d')!

  // Deep carved English Oak background
  ctx.fillStyle = '#2b170c'
  ctx.fillRect(0, 0, 1024, 128)

  // Top Polished Brass Molding Rail
  ctx.fillStyle = '#d97706'
  ctx.fillRect(0, 0, 1024, 16)
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(0, 4, 1024, 4)

  // Brass Stud Rivets along top rail
  for (let x = 16; x < 1024; x += 32) {
    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.arc(x, 10, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Carved Gothic Blind Trefoil Arcades in dark oak
  const archW = 64
  for (let x = 0; x < 1024; x += archW) {
    // Recessed panel
    ctx.fillStyle = '#1c0e07'
    ctx.beginPath()
    ctx.moveTo(x + 10, 120)
    ctx.lineTo(x + 10, 48)
    ctx.quadraticCurveTo(x + archW / 2, 22, x + archW - 10, 48)
    ctx.lineTo(x + archW - 10, 120)
    ctx.closePath()
    ctx.fill()

    // Inner bevel molding
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + 14, 118)
    ctx.lineTo(x + 14, 52)
    ctx.quadraticCurveTo(x + archW / 2, 26, x + archW - 14, 52)
    ctx.lineTo(x + archW - 14, 118)
    ctx.stroke()

    // Embossed gold rune inside each panel
    ctx.fillStyle = 'rgba(251, 191, 36, 0.70)'
    ctx.font = 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ᚱ', x + archW / 2, 74)
  }

  // Bottom Brass Baseboard Strip
  ctx.fillStyle = '#92400e'
  ctx.fillRect(0, 120, 1024, 8)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(0, 122, 1024, 2)

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.set(4, 1)
  const T = THREE as any
  if (T.SRGBColorSpace) (tex as any).colorSpace = T.SRGBColorSpace
  else if (T.sRGBEncoding) (tex as any).encoding = T.sRGBEncoding
  return tex
}

// =========================================================================
// HOGWARTS DUELING STAGE — 2.5D DIORAMA CLASS
// =========================================================================

export class HogwartsDuelingStage {
  public group: THREE.Group
  public runwayMesh: THREE.Mesh
  public backdropMesh!: THREE.Mesh

  private runwayMat: THREE.MeshStandardMaterial
  private borderMat: THREE.MeshStandardMaterial
  private torchLights: THREE.PointLight[] = []
  private hearthLights: THREE.PointLight[] = []

  constructor() {
    this.group = new THREE.Group()

    // 1. Satin Antique English Oak Material for Runway (Chamber of Secrets Canon)
    const runwayTex = createAntiqueHogwartsOakStageTexture()
    this.runwayMat = new THREE.MeshStandardMaterial({
      map: runwayTex,
      roughness: 0.38,
      metalness: 0.16,
      emissive: 0xd97706,
      emissiveMap: runwayTex,
      emissiveIntensity: 0.24, // Warm candlelit golden glow on runes and emblems
    })

    // 2. Main Raised Royal Dueling Runway Slab (4.5m × 10.8m × 0.32m — Longitudinal Runway)
    const runwayGeo = new THREE.BoxGeometry(4.5, 0.32, 10.8)
    this.runwayMesh = new THREE.Mesh(runwayGeo, this.runwayMat)
    this.runwayMesh.position.set(0, -1.01, -1.2)
    this.runwayMesh.receiveShadow = true
    this.group.add(this.runwayMesh)

    // 3. Side Curbing with Carved Trefoil Wainscot & Gold Molding
    const sideTex = createAntiqueOakSideTexture()
    const sideMat = new THREE.MeshStandardMaterial({
      map: sideTex,
      roughness: 0.42,
      metalness: 0.20,
    })

    const leftCurbGeo = new THREE.PlaneGeometry(10.8, 0.32)
    const leftCurbMesh = new THREE.Mesh(leftCurbGeo, sideMat)
    leftCurbMesh.rotation.y = -Math.PI / 2
    leftCurbMesh.position.set(-2.252, -1.01, -1.2)
    this.group.add(leftCurbMesh)

    const rightCurbGeo = new THREE.PlaneGeometry(10.8, 0.32)
    const rightCurbMesh = new THREE.Mesh(rightCurbGeo, sideMat)
    rightCurbMesh.rotation.y = Math.PI / 2
    rightCurbMesh.position.set(2.252, -1.01, -1.2)
    this.group.add(rightCurbMesh)

    // 4. Polished Brass / Gilded Edge Rails
    this.borderMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.88,
      roughness: 0.22,
    })

    const railGeo = new THREE.CylinderGeometry(0.045, 0.045, 10.8, 16)
    railGeo.rotateX(Math.PI / 2)

    const leftRail = new THREE.Mesh(railGeo, this.borderMat)
    leftRail.position.set(-2.25, -0.84, -1.2)
    this.group.add(leftRail)

    const rightRail = new THREE.Mesh(railGeo, this.borderMat)
    rightRail.position.set(2.25, -0.84, -1.2)
    this.group.add(rightRail)

    // 5. Corner Pedestals with Golden Caps & Glowing Crystals
    const makeCornerPedestal = (posX: number, posZ: number, crystalCol: number) => {
      const pGroup = new THREE.Group()

      const colGeo = new THREE.BoxGeometry(0.24, 0.42, 0.24)
      const colMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.45 })
      const col = new THREE.Mesh(colGeo, colMat)
      col.position.set(0, -0.96, 0)
      pGroup.add(col)

      const capGeo = new THREE.ConeGeometry(0.18, 0.16, 4)
      capGeo.rotateY(Math.PI / 4)
      const cap = new THREE.Mesh(capGeo, this.borderMat)
      cap.position.set(0, -0.68, 0)
      pGroup.add(cap)

      const crystalGeo = new THREE.OctahedronGeometry(0.075)
      const crystalMat = new THREE.MeshBasicMaterial({ color: crystalCol })
      const crystal = new THREE.Mesh(crystalGeo, crystalMat)
      crystal.position.set(0, -0.52, 0)
      pGroup.add(crystal)

      // Soft crystal glow
      const cLight = new THREE.PointLight(crystalCol, 1.8, 3.5)
      cLight.position.set(0, -0.48, 0)
      pGroup.add(cLight)

      pGroup.position.set(posX, 0, posZ)
      return pGroup
    }

    this.group.add(makeCornerPedestal(-2.28, 4.15, 0xef4444))  // Front-Left: Ruby Red
    this.group.add(makeCornerPedestal(2.28, 4.15, 0xf59e0b))   // Front-Right: Amber Gold
    this.group.add(makeCornerPedestal(-2.28, -6.55, 0x38bdf8)) // Back-Left: Sapphire
    this.group.add(makeCornerPedestal(2.28, -6.55, 0x10b981))  // Back-Right: Emerald

    // 6. Foreground & Background Entry Steps
    const stepGeo = new THREE.BoxGeometry(4.8, 0.14, 0.36)
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x351d10, roughness: 0.45 })

    const frontStep = new THREE.Mesh(stepGeo, stepMat)
    frontStep.position.set(0, -1.08, 4.35)
    this.group.add(frontStep)

    const backStep = new THREE.Mesh(stepGeo, stepMat)
    backStep.position.set(0, -1.08, -6.75)
    this.group.add(backStep)

    // 7. BUILD 2.5D DIORAMA LAYERS
    this.build25DBackdrop()
    this.build25DSideLighting()
    this.buildSpectatorAudience()
  }

  /**
   * Layer 0: Builds the High-Definition 2.5D Hogwarts Great Hall painted diorama backdrop.
   */
  private build25DBackdrop() {
    const loader = new THREE.TextureLoader()
    const backdropTex = loader.load(greatHallBackdropSrc)
    const T = THREE as any
    if (T.SRGBColorSpace) (backdropTex as any).colorSpace = T.SRGBColorSpace
    else if (T.sRGBEncoding) (backdropTex as any).encoding = T.sRGBEncoding

    const backdropMat = new THREE.MeshBasicMaterial({
      map: backdropTex,
    })

    // 16:9 Aspect Ratio (28m × 15.75m) positioned behind the stage
    const backdropGeo = new THREE.PlaneGeometry(28, 15.75)
    this.backdropMesh = new THREE.Mesh(backdropGeo, backdropMat)
    this.backdropMesh.position.set(0, 2.70, -7.8)
    this.group.add(this.backdropMesh)

    // Ethereal Moonbeam Radiance Point Light
    const moonRadiance = new THREE.PointLight(0x7dd3fc, 3.2, 18.0)
    moonRadiance.position.set(0, 5.2, -6.2)
    this.group.add(moonRadiance)

    // Left & Right Castle Hearth Fire Lights
    const hearthL = new THREE.PointLight(0xf97316, 4.2, 14.0)
    hearthL.position.set(-6.5, 0.4, -6.0)
    this.group.add(hearthL)
    this.hearthLights.push(hearthL)

    const hearthR = new THREE.PointLight(0xf97316, 4.2, 14.0)
    hearthR.position.set(6.5, 0.4, -6.0)
    this.group.add(hearthR)
    this.hearthLights.push(hearthR)
  }

  /**
   * Layer 1: Warm Castle Torchlights illuminating the arena perimeter without geometry clutter.
   */
  private build25DSideLighting() {
    // Left & Right warm torch lighting
    ;[
      { x: -5.5, y: 1.6, z: -3.5 },
      { x: 5.5, y: 1.6, z: -3.5 },
      { x: -5.5, y: 1.6, z: 0.5 },
      { x: 5.5, y: 1.6, z: 0.5 },
    ].forEach((pos) => {
      const tLight = new THREE.PointLight(0xf59e0b, 2.8, 9.0)
      tLight.position.set(pos.x, pos.y, pos.z)
      this.group.add(tLight)
      this.torchLights.push(tLight)
    })
  }

  /**
   * Layer 2: Builds seated LEGO Hogwarts student spectators along the wooden side benches
   * Matching the authentic dueling club audience in the concept sketch
   */
  private buildSpectatorAudience() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd13b, roughness: 0.55, metalness: 0.05 })
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.50 })

    // Generate cute Lego face texture for spectators
    const createSpectatorFaceTexture = () => {
      const cv = document.createElement('canvas')
      cv.width = 256
      cv.height = 256
      const ctx = cv.getContext('2d')!
      ctx.clearRect(0, 0, 256, 256)
      // Eyes
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.ellipse(80, 110, 12, 18, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(176, 110, 12, 18, 0, 0, Math.PI * 2)
      ctx.fill()
      // Catchlights
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(77, 105, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(173, 105, 5, 0, Math.PI * 2)
      ctx.fill()
      // Eyebrows
      ctx.strokeStyle = '#2b1d12'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(60, 80)
      ctx.quadraticCurveTo(80, 70, 100, 82)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(156, 82)
      ctx.quadraticCurveTo(176, 70, 196, 80)
      ctx.stroke()
      // Smile
      ctx.strokeStyle = '#23150d'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(128, 145, 32, 0.2 * Math.PI, 0.8 * Math.PI)
      ctx.stroke()
      return new THREE.CanvasTexture(cv)
    }

    // Generate Hogwarts Uniform Torso Texture with collared shirt, V-neck sweater, and striped tie
    const createStudentTorsoTexture = (houseHex: string = '#991b1b', goldHex: string = '#fbbf24') => {
      const cv = document.createElement('canvas')
      cv.width = 256
      cv.height = 256
      const ctx = cv.getContext('2d')!
      // Dark grey wool knit sweater
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, 256, 256)
      // White collared shirt cutout
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.moveTo(88, 0)
      ctx.lineTo(128, 105)
      ctx.lineTo(168, 0)
      ctx.closePath()
      ctx.fill()
      // Striped House Tie
      ctx.fillStyle = houseHex
      ctx.beginPath()
      ctx.moveTo(114, 25)
      ctx.lineTo(142, 25)
      ctx.lineTo(136, 195)
      ctx.lineTo(128, 225)
      ctx.lineTo(120, 195)
      ctx.closePath()
      ctx.fill()
      // Gold diagonal stripes on tie
      ctx.strokeStyle = goldHex
      ctx.lineWidth = 7
      for (let y = 45; y < 195; y += 30) {
        ctx.beginPath()
        ctx.moveTo(116, y)
        ctx.lineTo(138, y + 16)
        ctx.stroke()
      }
      // V-neck sweater knit border
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 12
      ctx.beginPath()
      ctx.moveTo(86, 0)
      ctx.lineTo(128, 108)
      ctx.lineTo(170, 0)
      ctx.stroke()
      return new THREE.CanvasTexture(cv)
    }

    const faceDecalMat = new THREE.MeshStandardMaterial({
      map: createSpectatorFaceTexture(),
      transparent: true,
      roughness: 0.45,
    })

    const createSpectatorMinifig = (robeCol: number, hairCol: number, faceAng = 0, isGirlHair = false) => {
      const fig = new THREE.Group()
      fig.scale.set(0.92, 0.92, 0.92)

      const hairMat = new THREE.MeshStandardMaterial({ color: hairCol, roughness: 0.60 })

      // Seated hips & legs
      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), robeMat)
      hips.position.set(0, 0.06, 0)
      fig.add(hips)

      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.24), robeMat)
      legL.position.set(-0.065, 0.06, 0.14)
      fig.add(legL)
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.24), robeMat)
      legR.position.set(0.065, 0.06, 0.14)
      fig.add(legR)

      // Torso with Hogwarts Uniform Decal
      const houseHex = robeCol === 0x15803d ? '#15803d' : (robeCol === 0x1d4ed8 ? '#1d4ed8' : '#991b1b')
      const goldHex = robeCol === 0x15803d ? '#94a3b8' : '#fbbf24'
      const torsoMat = new THREE.MeshStandardMaterial({
        map: createStudentTorsoTexture(houseHex, goldHex),
        roughness: 0.55,
      })
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.16), torsoMat)
      torso.position.set(0, 0.28, 0.02)
      torso.rotation.x = 0.08
      fig.add(torso)

      // Neck Stud
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 12), skinMat)
      neck.position.set(0, 0.45, 0.03)
      fig.add(neck)

      // Head
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), skinMat)
      head.position.set(0, 0.52, 0.03)
      head.rotation.y = faceAng
      fig.add(head)

      // Face Decal
      const faceDecal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.081, 0.081, 0.12, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3),
        faceDecalMat
      )
      faceDecal.position.set(0, 0.52, 0.03)
      faceDecal.rotation.y = faceAng
      fig.add(faceDecal)

      // Hairpiece covering top, back, and sides
      if (isGirlHair) {
        // Hermione bushy wavy hair
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.098, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.78), hairMat)
        hairCap.position.set(0, 0.56, 0.02)
        fig.add(hairCap)
        const locksL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.20, 8), hairMat)
        locksL.position.set(-0.095, 0.44, 0.06)
        locksL.rotation.z = 0.15
        fig.add(locksL)
        const locksR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.20, 8), hairMat)
        locksR.position.set(0.095, 0.44, 0.06)
        locksR.rotation.z = -0.15
        fig.add(locksR)
      } else {
        // Boy contoured Lego hairpiece with sideburns and back coverage
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.096, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.76), hairMat)
        hairCap.position.set(0, 0.56, 0.02)
        fig.add(hairCap)
        const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.096, 0.08, 16, 1, true, Math.PI * 0.5, Math.PI), hairMat)
        backHair.position.set(0, 0.52, 0.02)
        fig.add(backHair)
      }

      // Curved Lego arms
      const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.50 })
      const armGeoL = new THREE.CylinderGeometry(0.040, 0.040, 0.24, 12)
      const armL = new THREE.Mesh(armGeoL, armMat)
      armL.position.set(-0.16, 0.26, 0.06)
      armL.rotation.x = Math.PI * 0.28
      armL.rotation.z = 0.20
      fig.add(armL)

      const armGeoR = new THREE.CylinderGeometry(0.040, 0.040, 0.24, 12)
      const armR = new THREE.Mesh(armGeoR, armMat)
      armR.position.set(0.16, 0.26, 0.06)
      armR.rotation.x = Math.PI * 0.28
      armR.rotation.z = -0.20
      fig.add(armR)

      // Yellow C-Hands resting on the wooden table bench
      const handGeo = new THREE.TorusGeometry(0.024, 0.009, 8, 16, Math.PI * 1.4)
      handGeo.rotateZ(Math.PI / 2)
      const handL = new THREE.Mesh(handGeo, skinMat)
      handL.position.set(-0.16, 0.12, 0.22)
      fig.add(handL)
      const handR = new THREE.Mesh(handGeo, skinMat)
      handR.position.set(0.16, 0.12, 0.22)
      fig.add(handR)

      return fig
    }

    // Long Wooden Great Hall Dining Tables & Benches along left and right sides
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.55 })
    const tableWoodMat = new THREE.MeshStandardMaterial({ color: 0x24140b, roughness: 0.45 })

    // Left Dining Table & Bench (closer to runway matching Reference Image)
    const leftTable = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 8.5), tableWoodMat)
    leftTable.position.set(-1.85, -0.88, 0.0)
    this.group.add(leftTable)

    const leftBench = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 8.5), benchMat)
    leftBench.position.set(-2.25, -1.02, 0.0)
    this.group.add(leftBench)

    // Right Dining Table & Bench
    const rightTable = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 8.5), tableWoodMat)
    rightTable.position.set(1.85, -0.88, 0.0)
    this.group.add(rightTable)

    const rightBench = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 8.5), benchMat)
    rightBench.position.set(2.25, -1.02, 0.0)
    this.group.add(rightBench)

    // Left Bench Spectators (Angled towards duel like Reference Image)
    const leftAudience = [
      { x: -2.15, y: -0.96, z: 1.65, col: 0x991b1b, hair: 0x181513, rot: Math.PI * 0.42, girl: false }, // Gryffindor black hair
      { x: -2.20, y: -0.96, z: 0.65, col: 0x991b1b, hair: 0x78350f, rot: Math.PI * 0.36, girl: true },  // Hermione bushy hair
      { x: -2.25, y: -0.96, z: -0.35, col: 0x1d4ed8, hair: 0x3d2314, rot: Math.PI * 0.30, girl: false }, // Ravenclaw brown hair
      { x: -2.30, y: -0.96, z: -1.35, col: 0xd97706, hair: 0x111317, rot: Math.PI * 0.24, girl: false }, // Hufflepuff
    ]
    leftAudience.forEach(cfg => {
      const f = createSpectatorMinifig(cfg.col, cfg.hair, 0, cfg.girl)
      f.position.set(cfg.x, cfg.y, cfg.z)
      f.rotation.y = cfg.rot
      this.group.add(f)
    })

    // Right Bench Spectators (Mid-ground)
    const rightAudience = [
      { x: 2.20, y: -0.96, z: 0.65, col: 0x15803d, hair: 0xfde047, rot: -Math.PI * 0.36, girl: false }, // Draco slick blonde
      { x: 2.25, y: -0.96, z: -0.35, col: 0x15803d, hair: 0x3d2314, rot: -Math.PI * 0.30, girl: false }, // Slytherin
      { x: 2.30, y: -0.96, z: -1.35, col: 0x1d4ed8, hair: 0x181513, rot: -Math.PI * 0.24, girl: true },  // Ravenclaw girl
    ]
    rightAudience.forEach(cfg => {
      const f = createSpectatorMinifig(cfg.col, cfg.hair, 0, cfg.girl)
      f.position.set(cfg.x, cfg.y, cfg.z)
      f.rotation.y = cfg.rot
      this.group.add(f)
    })

    // --- Foreground Right: Ron Weasley watching from behind (Exact Reference Match!) ---
    const ronGroup = new THREE.Group()
    ronGroup.scale.set(1.05, 1.05, 1.05)
    ronGroup.position.set(0.66, -0.84, 2.45)
    ronGroup.rotation.y = -Math.PI * 0.88

    const ronRobeMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.65 })
    const ronSkinMat = new THREE.MeshStandardMaterial({ color: 0xffd13b, roughness: 0.45, metalness: 0.02 })
    const ronGingerHairMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.42 })

    // Seated Lego Hips & Legs
    const ronHips = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), ronRobeMat)
    ronHips.position.set(0, 0.06, 0)
    ronGroup.add(ronHips)

    const ronLegL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.24), ronRobeMat)
    ronLegL.position.set(-0.065, 0.06, 0.14)
    ronGroup.add(ronLegL)
    const ronLegR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.24), ronRobeMat)
    ronLegR.position.set(0.065, 0.06, 0.14)
    ronGroup.add(ronLegR)

    // Authentic LEGO Minifigure Trapezoid Torso with beveled rounded edges
    const ronTorsoShape = new THREE.Shape()
    ronTorsoShape.moveTo(-0.13, -0.17)
    ronTorsoShape.lineTo(0.13, -0.17)
    ronTorsoShape.lineTo(0.09, 0.17)
    ronTorsoShape.lineTo(-0.09, 0.17)
    ronTorsoShape.closePath()
    const ronTorsoGeo = new THREE.ExtrudeGeometry(ronTorsoShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.014,
      bevelThickness: 0.014,
    })
    ronTorsoGeo.center()
    const ronTorso = new THREE.Mesh(ronTorsoGeo, ronRobeMat)
    ronTorso.position.set(0, 0.28, 0)
    ronGroup.add(ronTorso)

    // Back Robe Hood Lining Decal (Scarlet Gryffindor V-Cowl)
    const ronBackHood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.07, 0.12, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 })
    )
    ronBackHood.rotation.x = Math.PI * 0.45
    ronBackHood.position.set(0, 0.36, -0.08)
    ronGroup.add(ronBackHood)

    // Lego Neck Stud
    const ronNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.06, 16), ronSkinMat)
    ronNeck.position.set(0, 0.44, 0)
    ronGroup.add(ronNeck)

    // Head
    const ronHead = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.14, 20), ronSkinMat)
    ronHead.position.set(0, 0.51, 0)
    ronGroup.add(ronHead)

    // Sculpted tousled ginger Lego hairpiece with layered tufts and sideburns
    const ronHairGroup = new THREE.Group()
    const ronHairCap = new THREE.Mesh(new THREE.SphereGeometry(0.098, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.78), ronGingerHairMat)
    ronHairCap.position.set(0, 0.55, 0)
    ronHairCap.scale.set(1.02, 1.04, 1.02)
    ronHairGroup.add(ronHairCap)

    // Back hair curtain
    const ronBackHair = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.09, 18, 1, true, Math.PI * 0.55, Math.PI * 0.90), ronGingerHairMat)
    ronBackHair.position.set(0, 0.51, 0)
    ronHairGroup.add(ronBackHair)

    const makeRonTuft = (sx: number, sy: number, sz: number, px: number, py: number, pz: number, rx: number, ry: number, rz: number) => {
      const geo = new THREE.ConeGeometry(0.038, 0.075, 6)
      geo.scale(sx, sy, sz)
      const tuft = new THREE.Mesh(geo, ronGingerHairMat)
      tuft.position.set(px, py, pz)
      tuft.rotation.set(rx, ry, rz)
      return tuft
    }
    ronHairGroup.add(makeRonTuft(1.2, 1.0, 0.9, -0.05, 0.59, -0.05, 0.45, -0.2, 0.15))
    ronHairGroup.add(makeRonTuft(1.1, 0.9, 0.9, 0.04, 0.59, -0.05, 0.40, 0.25, -0.20))
    ronHairGroup.add(makeRonTuft(1.0, 0.8, 0.8, 0.07, 0.55, 0.02, 0.20, 0.50, -0.30))
    ronHairGroup.add(makeRonTuft(1.0, 0.8, 0.8, -0.07, 0.55, 0.02, 0.20, -0.50, 0.30))
    ronHairGroup.add(makeRonTuft(1.2, 0.9, 0.8, 0.0, 0.60, 0.02, -0.30, 0, 0))
    ronGroup.add(ronHairGroup)

    // Left Arm resting forward with yellow C-hand on bench corner (Exact Reference Match!)
    const ronArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.24, 12), ronRobeMat)
    ronArmL.position.set(-0.16, 0.24, 0.10)
    ronArmL.rotation.x = Math.PI * 0.40
    ronArmL.rotation.z = 0.25
    ronGroup.add(ronArmL)

    const ronHandGeo = new THREE.TorusGeometry(0.028, 0.010, 8, 16, Math.PI * 1.4)
    ronHandGeo.rotateZ(Math.PI / 2)
    const ronHand = new THREE.Mesh(ronHandGeo, ronSkinMat)
    ronHand.position.set(-0.19, 0.12, 0.22)
    ronGroup.add(ronHand)

    this.group.add(ronGroup)

    // --- Ancient Leather Spellbooks resting on wood (Matching Reference Image) ---
    const createSpellBook = (coverColor: number, goldSymbol: string = '☽') => {
      const book = new THREE.Group()
      const coverGeo = new THREE.BoxGeometry(0.24, 0.045, 0.32)
      const coverMat = new THREE.MeshStandardMaterial({ color: coverColor, roughness: 0.6 })
      const cover = new THREE.Mesh(coverGeo, coverMat)
      book.add(cover)

      const pagesGeo = new THREE.BoxGeometry(0.22, 0.038, 0.30)
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 })
      const pages = new THREE.Mesh(pagesGeo, pagesMat)
      pages.position.set(0.01, 0, 0)
      book.add(pages)

      // Gold embossed symbol
      const cv = document.createElement('canvas')
      cv.width = 128
      cv.height = 128
      const ctx = cv.getContext('2d')!
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 6
      ctx.strokeRect(8, 8, 112, 112)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 54px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(goldSymbol, 64, 64)
      const tex = new THREE.CanvasTexture(cv)
      const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(0.19, 0.26),
        new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3 })
      )
      decal.rotation.x = -Math.PI / 2
      decal.position.set(0, 0.024, 0)
      book.add(decal)

      return book
    }

    const b1 = createSpellBook(0x1e293b, '☽') // Navy book with crescent moon (Foreground Right)
    b1.position.set(0.65, -0.835, 1.55)
    b1.rotation.y = 0.22
    this.group.add(b1)

    const b2 = createSpellBook(0x78350f, '✦') // Golden brown leather book (Mid-Right)
    b2.position.set(0.95, -0.835, -0.65)
    b2.rotation.y = -0.30
    this.group.add(b2)

    const b3 = createSpellBook(0x14532d, '⚡') // Emerald book (Mid-Left)
    b3.position.set(-0.75, -0.835, -0.40)
    b3.rotation.y = 0.45
    this.group.add(b3)
  }

  /**
   * Dynamic update:
   * 1. 2.5D optical parallax shifting based on camera/mouse coordinates (camX, camY).
   * 2. Torch and hearth fire flickering.
   * 3. Gilded rune sheen and magic circle pulsing.
   */
  public update(time: number, camX: number = 0, camY: number = 0) {
    // 2.5D Parallax Shifts
    if (this.backdropMesh) {
      this.backdropMesh.position.x = -camX * 0.05
      this.backdropMesh.position.y = 2.70 - camY * 0.03
    }

    // Rune and magic circle golden glow pulsation
    this.runwayMat.emissiveIntensity = 0.32 + Math.sin(time * 3.0) * 0.08

    // Torch flame flickering
    this.torchLights.forEach((light, idx) => {
      light.intensity = 2.8 + Math.sin(time * 8.0 + idx * 1.5) * 0.45 + Math.cos(time * 16.0 + idx * 2.0) * 0.22
    })

    // Hearth fire pulsating
    this.hearthLights.forEach((light, idx) => {
      light.intensity = 4.2 + Math.sin(time * 6.5 + idx * 2.0) * 0.85 + Math.cos(time * 13.0) * 0.35
    })
  }
}
