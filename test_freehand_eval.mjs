import { readFileSync } from 'fs'

const code = readFileSync('./test_gesture_math.mjs', 'utf8')
const extra = `
// Override evaluateSpellMatch with yTurns === 0 on sectumsempra
const origEval = evaluateSpellMatch;
evaluateSpellMatch = function(pts, targetSpell) {
  if (targetSpell === 'sectumsempra') {
    const a = analyzeStroke(pts)
    if (a.isClosed) return { match: false, reason: 'Sectumsempra là nhát chém ngang dứt khoát 🩸' }
    if (a.width > 70 && a.height < a.width * 0.38 && a.xTurns === 0 && a.yTurns === 0) {
      return { match: true, spell: 'sectumsempra', accuracy: 95 }
    }
    return { match: false, reason: 'Cần vẽ một vạch chém ngang dứt khoát ━ 🩸' }
  }
  return origEval(pts, targetSpell);
};

function evaluateFreehand(pts) {
  const spellOrder = ['protego', 'obliviate', 'confringo', 'avadakedavra', 'expelliarmus', 'sectumsempra', 'petrificus', 'expecto_patronum', 'stupefy']
  for (const s of spellOrder) {
    const res = evaluateSpellMatch(pts, s)
    if (res.match) return { match: true, spell: s, accuracy: res.accuracy }
  }
  return { match: false }
}
console.log("--- EVALUATE FREEHAND CLASSIFICATION RESULTS ---")
let passed = 0
for (const t of tests) {
  const res = evaluateFreehand(t.pts)
  const ok = res.match && res.spell === t.name
  if (ok) passed++
  console.log("Shape: " + t.name.padEnd(18) + " => Classified as: " + (res.spell || "NONE").padEnd(18) + " [" + (ok ? "CORRECT" : "WRONG") + "]")
}
console.log("Result: " + passed + "/" + tests.length + " accurate classifications.")
`
const runner = new Function(code + extra)
runner()
