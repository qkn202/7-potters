import { writeFileSync } from 'fs';

async function capture() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(':5180'));
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 820,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate back to menu if in duel
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.getElementById('btn-return-menu');
      if (btn) btn.click();
      else if (window.duelingGame && window.duelingGame.showMainMenu) window.duelingGame.showMainMenu();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('screenshot_gauntlet_menu_refined.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot_gauntlet_menu_refined.png');
  ws.close();
}

capture().catch(console.error);
