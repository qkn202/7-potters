import * as THREE from 'three'

function testSetup(camPos, lookTarget, harryPos, voldyPos, skullPos, ronPos) {
  const camera = new THREE.PerspectiveCamera(55, 1920 / 1080, 0.1, 100)
  camera.position.copy(camPos)
  camera.lookAt(lookTarget)
  camera.updateMatrixWorld()

  function project(pos) {
    const p = pos.clone().project(camera)
    const screenX = Math.round(((p.x + 1) / 2) * 1920)
    const screenY = Math.round(((-p.y + 1) / 2) * 1080)
    return { x: screenX, y: screenY }
  }

  return {
    harry: project(harryPos),
    voldy: project(voldyPos),
    skull: project(skullPos),
    ron: project(ronPos)
  }
}

console.log("Setup 6 (turn camera slightly right):")
console.log(testSetup(
  new THREE.Vector3(-1.05, 0.22, 3.50),
  new THREE.Vector3(-0.25, -0.15, -3.45),
  new THREE.Vector3(-1.42, -0.85, 1.40),
  new THREE.Vector3(1.75, -0.85, -3.20),
  new THREE.Vector3(0.30, 0.35, -1.0),
  new THREE.Vector3(0.70, -0.85, 2.15)
))

console.log("Setup 7:")
console.log(testSetup(
  new THREE.Vector3(-0.95, 0.20, 3.50),
  new THREE.Vector3(-0.45, -0.15, -3.45),
  new THREE.Vector3(-1.40, -0.85, 1.40),
  new THREE.Vector3(1.65, -0.85, -3.20),
  new THREE.Vector3(0.20, 0.35, -1.0),
  new THREE.Vector3(0.65, -0.85, 2.15)
))
