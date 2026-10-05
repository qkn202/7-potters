// test_gesture_math.mjs
// Test gesture recognition algorithms for all 9 spells

function analyzeStroke(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const width = Math.max(1, maxX - minX)
  const height = Math.max(1, maxY - minY)
  const aspect = width / height

  const start = pts[0]
  const end = pts[pts.length - 1]
  const mid = pts[Math.floor(pts.length / 2)]
  const distToStart = Math.hypot(end.x - start.x, end.y - start.y)
  const maxDim = Math.max(width, height)
  const isClosed = distToStart < maxDim * 0.42 && pts.length > 12

  // Turns analysis with threshold filtering
  let xTurns = 0
  let yTurns = 0
  let prevDx = 0
  let prevDy = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    if (Math.abs(dx) > 3) {
      if (prevDx !== 0 && ((prevDx > 0 && dx < 0) || (prevDx < 0 && dx > 0))) {
        xTurns++
      }
      prevDx = dx
    }
    if (Math.abs(dy) > 3) {
      if (prevDy !== 0 && ((prevDy > 0 && dy < 0) || (prevDy < 0 && dy > 0))) {
        yTurns++
      }
      prevDy = dy
    }
  }

  // Count sharp directional changes (corners)
  let sharpCorners = 0
  const sampleStep = Math.max(1, Math.floor(pts.length / 16))
  for (let i = sampleStep; i < pts.length - sampleStep; i += sampleStep) {
    const v1x = pts[i].x - pts[i - sampleStep].x
    const v1y = pts[i].y - pts[i - sampleStep].y
    const v2x = pts[i + sampleStep].x - pts[i].x
    const v2y = pts[i + sampleStep].y - pts[i].y
    const dot = v1x * v2x + v1y * v2y
    const mag1 = Math.hypot(v1x, v1y)
    const mag2 = Math.hypot(v2x, v2y)
    if (mag1 > 5 && mag2 > 5) {
      const cosAngle = dot / (mag1 * mag2)
      if (cosAngle < 0.2) { // Angle > ~78 degrees
        sharpCorners++
      }
    }
  }

  return {
    width, height, aspect, start, end, mid, distToStart, isClosed,
    xTurns, yTurns, sharpCorners, minX, maxX, minY, maxY, count: pts.length
  }
}

function evaluateSpellMatch(pts, targetSpell) {
  if (!pts || pts.length < 5) return { match: false, reason: 'Nét vẽ quá ngắn' }
  const a = analyzeStroke(pts)

  if (a.width < 35 && a.height < 35) {
    return { match: false, reason: 'Thủ ấn quá nhỏ, hãy vung đũa rộng hơn' }
  }

  switch (targetSpell) {
    case 'expelliarmus': {
      // ⚡ Lightning: 2-3 xTurns, open stroke, substantial height
      if (a.isClosed) return { match: false, reason: 'Expelliarmus không khép kín, hãy vẽ hình tia sét ⚡' }
      if (a.xTurns >= 2 && a.xTurns <= 3 && a.height > 40) {
        const accuracy = Math.min(100, 85 + (a.xTurns === 2 ? 12 : 6))
        return { match: true, spell: 'expelliarmus', accuracy }
      }
      return { match: false, reason: 'Cần vẽ tia sét zic-zắc 2 lần đổi chiều ⚡' }
    }

    case 'avadakedavra': {
      // 💀 Death curse: 3+ sharp jagged turns, aggressive
      if (a.isClosed) return { match: false, reason: 'Avada Kedavra không khép kín, hãy vẽ tia sét tử thần 💀' }
      if ((a.xTurns >= 3 || (a.xTurns >= 2 && a.yTurns >= 2)) && a.height > 60) {
        const accuracy = Math.min(100, 88 + a.xTurns * 3)
        return { match: true, spell: 'avadakedavra', accuracy }
      }
      return { match: false, reason: 'Cần vẽ tia chớp nhọn sắc 3 lần đổi chiều trở lên 💀' }
    }

    case 'protego': {
      // 🛡️ Upward Dome: starts low, rises high, drops low
      if (a.isClosed) return { match: false, reason: 'Protego là vòm khiên cong, không khép kín 🛡️' }
      const risesHigh = a.mid.y < a.start.y - 25 && a.mid.y < a.end.y - 25
      if (risesHigh && a.width > 50) {
        const accuracy = 94
        return { match: true, spell: 'protego', accuracy }
      }
      return { match: false, reason: 'Cần vẽ đường vòm cong hướng lên như chiếc khiên 🛡️' }
    }

    case 'stupefy': {
      // 💫 Wave: wide horizontal ripple with yTurns
      if (a.isClosed) return { match: false, reason: 'Stupefy là làn sóng ma thuật, không khép kín 💫' }
      if (a.width > a.height * 1.2 && a.yTurns >= 1 && a.width > 60) {
        const accuracy = 90
        return { match: true, spell: 'stupefy', accuracy }
      }
      return { match: false, reason: 'Cần vẽ làn sóng lượn ngang mềm mại ~ 💫' }
    }

    case 'sectumsempra': {
      // 🩸 Horizontal slash: very wide, minimal height
      if (a.isClosed) return { match: false, reason: 'Sectumsempra là nhát chém ngang dứt khoát 🩸' }
      if (a.width > 80 && a.height < a.width * 0.45 && a.xTurns === 0) {
        const accuracy = 95
        return { match: true, spell: 'sectumsempra', accuracy }
      }
      return { match: false, reason: 'Cần vẽ một vạch chém ngang dứt khoát ━ 🩸' }
    }

    case 'petrificus': {
      // 🔒 Vertical downward thrust: very tall, minimal width, downward
      if (a.isClosed) return { match: false, reason: 'Petrificus là nhát đâm dọc phong ấn 🔒' }
      if (a.height > 80 && a.width < a.height * 0.45 && a.end.y > a.start.y + 40 && a.yTurns === 0) {
        const accuracy = 95
        return { match: true, spell: 'petrificus', accuracy }
      }
      return { match: false, reason: 'Cần vẽ vạch thẳng từ trên cắm thẳng xuống ┃ 🔒' }
    }

    case 'confringo': {
      // 💥 Triangle: closed shape with ~3 sharp corners or peak
      if (!a.isClosed) return { match: false, reason: 'Confringo yêu cầu vẽ hình tam giác khép kín △ 💥' }
      // Check top peak
      const topPeak = a.minY < a.start.y - 20
      if (a.sharpCorners >= 2 || (topPeak && a.isClosed)) {
        const accuracy = 92
        return { match: true, spell: 'confringo', accuracy }
      }
      return { match: false, reason: 'Cần vẽ hình tam giác góc nhọn khép kín △ 💥' }
    }

    case 'obliviate': {
      // 🌀 Circle: closed smooth loop, balanced aspect ratio
      if (!a.isClosed) return { match: false, reason: 'Obliviate yêu cầu vẽ vòng tròn ký ức khép kín ◯ 🌀' }
      if (a.aspect >= 0.65 && a.aspect <= 1.5 && a.xTurns <= 1) {
        const accuracy = 93
        return { match: true, spell: 'obliviate', accuracy }
      }
      return { match: false, reason: 'Cần vẽ vòng tròn tròn đều khép kín ◯ 🌀' }
    }

    case 'expecto_patronum': {
      // 🦌 Loop with upward flair: loop then tail shooting up
      const hasLoop = a.count > 15
      const finishesHigh = a.end.y < a.minY + a.height * 0.35 && a.end.x > a.minX + a.width * 0.5
      if (!a.isClosed && finishesHigh && a.width > 60 && a.height > 60) {
        const accuracy = 96
        return { match: true, spell: 'expecto_patronum', accuracy }
      }
      return { match: false, reason: 'Cần vẽ vòng tròn rồi vút đũa bay lên góc trên ◯↗ 🦌' }
    }

    default:
      return { match: false, reason: 'Chưa chọn thần chú' }
  }
}

// Generate test stroke points
function generateLightning(turns = 2) {
  const pts = []
  let x = 100, y = 100
  pts.push({ x, y })
  for (let t = 0; t <= turns; t++) {
    const targetX = (t % 2 === 0) ? x + 60 : x - 50
    const targetY = y + 50
    for (let step = 1; step <= 8; step++) {
      pts.push({
        x: x + (targetX - x) * (step / 8),
        y: y + (targetY - y) * (step / 8)
      })
    }
    x = targetX
    y = targetY
  }
  return pts
}

function generateDome() {
  const pts = []
  const cx = 200, cy = 200, r = 80
  for (let angle = Math.PI; angle >= 0; angle -= 0.15) {
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle) // Screen Y: -sin is up
    })
  }
  return pts
}

function generateSlash() {
  const pts = []
  for (let x = 100; x <= 260; x += 10) {
    pts.push({ x, y: 150 + Math.sin(x * 0.05) * 4 })
  }
  return pts
}

function generateThrust() {
  const pts = []
  for (let y = 100; y <= 260; y += 10) {
    pts.push({ x: 150 + Math.cos(y * 0.05) * 3, y })
  }
  return pts
}

function generateCircle() {
  const pts = []
  const cx = 200, cy = 200, r = 70
  for (let angle = 0; angle <= Math.PI * 2.05; angle += 0.2) {
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    })
  }
  return pts
}

function generateTriangle() {
  const pts = []
  // Peak (150, 80), Bottom Right (220, 200), Bottom Left (80, 200), Back to (150, 80)
  const vertices = [
    { x: 150, y: 80 },
    { x: 220, y: 200 },
    { x: 80, y: 200 },
    { x: 150, y: 80 }
  ]
  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i], v2 = vertices[i + 1]
    for (let s = 0; s < 6; s++) {
      pts.push({
        x: v1.x + (v2.x - v1.x) * (s / 6),
        y: v1.y + (v2.y - v1.y) * (s / 6)
      })
    }
  }
  pts.push(vertices[vertices.length - 1])
  return pts
}

function generatePatronus() {
  const pts = []
  const cx = 200, cy = 200, r = 60
  // Circle from 0 to 1.8 * PI
  for (let angle = 0; angle <= Math.PI * 1.8; angle += 0.2) {
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    })
  }
  // Then tail up-right
  const last = pts[pts.length - 1]
  for (let s = 1; s <= 10; s++) {
    pts.push({
      x: last.x + s * 10,
      y: last.y - s * 12 // shoots up
    })
  }
  return pts
}

function generateWave() {
  const pts = []
  for (let x = 80; x <= 240; x += 6) {
    pts.push({
      x,
      y: 150 + Math.sin((x - 80) * 0.05) * 25
    })
  }
  return pts
}

// RUN TESTS
console.log('--- TEST GESTURE MATHEMATICS ---')
const tests = [
  { name: 'expelliarmus', pts: generateLightning(2) },
  { name: 'avadakedavra', pts: generateLightning(4) },
  { name: 'protego', pts: generateDome() },
  { name: 'stupefy', pts: generateWave() },
  { name: 'sectumsempra', pts: generateSlash() },
  { name: 'petrificus', pts: generateThrust() },
  { name: 'confringo', pts: generateTriangle() },
  { name: 'obliviate', pts: generateCircle() },
  { name: 'expecto_patronum', pts: generatePatronus() },
]

for (const t of tests) {
  const res = evaluateSpellMatch(t.pts, t.name)
  console.log(`[${t.name}] Match: ${res.match} (accuracy: ${res.accuracy ?? 0}%) - Reason: ${res.reason || 'OK'}`)
}

// Cross-test: test that a wrong gesture FAILS
console.log('\n--- NEGATIVE TESTS (Wrong gesture should FAIL) ---')
const neg1 = evaluateSpellMatch(generateCircle(), 'expelliarmus')
console.log(`Circle as Expelliarmus: match=${neg1.match}, reason="${neg1.reason}"`)

const neg2 = evaluateSpellMatch(generateSlash(), 'confringo')
console.log(`Slash as Confringo: match=${neg2.match}, reason="${neg2.reason}"`)

const neg3 = evaluateSpellMatch([{x:10,y:10},{x:11,y:11}], 'stupefy')
console.log(`Tiny click as Stupefy: match=${neg3.match}, reason="${neg3.reason}"`)
