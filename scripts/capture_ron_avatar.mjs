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
  console.log('Connected to CDP!')

  const evalResult = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const dueling = window.duelingGame && window.duelingGame.instance;
        if (!dueling) throw new Error("duelingGame not found on window");
        const loader = dueling.gltfLoader;
        const THREE = window.THREE || dueling.scene.constructor.prototype.constructor.THREE;

        const file = '/assets/dueling/lego_harry_potter_ron_weasley.glb';

        // Offscreen renderer (256x256)
        const width = 256, height = 256;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const renderer = new THREE.WebGLRenderer({ canvas: offCanvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const offScene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);

        // Gryffindor-themed studio 3-point lighting
        const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
        keyLight.position.set(2, 3, 3);
        offScene.add(keyLight);

        // Golden Gryffindor rim light to bring out Ron's ginger hair
        const rimLight = new THREE.DirectionalLight(0xffbe6b, 3.2);
        rimLight.position.set(-2, 2, -2);
        offScene.add(rimLight);

        const fillLight = new THREE.AmbientLight(0xffffff, 1.0);
        offScene.add(fillLight);

        const gltf = await new Promise((res, rej) => loader.load(file, res, undefined, rej));
        const model = gltf.scene.clone();

        // Double sided materials
        model.traverse(c => {
          if (c.isMesh) {
            if (c.material) c.material.side = THREE.DoubleSide;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Head is in the top 22% of model
        const headY = box.max.y - size.y * 0.22;
        camera.position.set(0.03, headY + 0.02, 0.60);
        camera.lookAt(0, headY, 0);

        offScene.add(model);
        renderer.render(offScene, camera);
        offScene.remove(model);

        const dataUrl = offCanvas.toDataURL('image/png');
        renderer.dispose();
        return dataUrl;
      })()
    `
  })

  if (evalResult.exceptionDetails) {
    console.error('Eval error:', evalResult.exceptionDetails)
    process.exit(1)
  }

  const dataUrl = evalResult.result.value
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
  const outPath = 'public/assets/dueling/avatar_ron.png'
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  console.log(`Saved portrait: ${outPath} (${Math.round(base64Data.length / 1024)} KB)`)

  ws.close()
}

run().catch(console.error)
