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

  console.log('Extracting Confringo panel from concept sheet...')
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          // Bottom-left quadrant: x: 0 to 688, y: 384 to 768
          // The blast is located at roughly x: 260 to 680, y: 390 to 760
          const cv = document.createElement('canvas');
          const cropW = 420;
          const cropH = 370;
          cv.width = cropW;
          cv.height = cropH;
          const ctx = cv.getContext('2d');
          
          // Draw raw crop first to inspect exact boundaries
          ctx.drawImage(img, 260, 390, cropW, cropH, 0, 0, cropW, cropH);
          resolve(cv.toDataURL('image/png'));
        };
        img.src = '/assets/dueling/vfx_concept_sheet_one.jpg';
      })
    `,
    awaitPromise: true,
    returnByValue: true
  })

  const dataUrl = evalRes.result.value
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
  const outPath = '/Users/khang/hogwarts-duel-3d/docs/screenshots/concept_confringo_raw_crop.png'
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  console.log(`Saved raw crop to ${outPath}`)
  ws.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
