const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ElfEngine = require('../engine.cjs');

test('Supabase credentials and configuration match sibling games', () => {
  const gameJs = fs.readFileSync(path.join(__dirname, '../dist/game.js'), 'utf8');
  assert.match(gameJs, /https:\/\/fxucyrofcsuqtlkukcrx\.supabase\.co/);
  assert.match(gameJs, /sb_publishable_zEiG2Py5kDmGhkTgw0uWIA_We0rOCGu/);
});

test('dist/index.html includes Supabase script and online multiplayer UI', () => {
  const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
  assert.match(html, /src="supabase\.js"/);
  assert.match(html, /id="online-tab"/);
  assert.match(html, /id="online-setup"/);
  assert.match(html, /id="online-create"/);
  assert.match(html, /id="online-join"/);
  assert.match(html, /id="online-spectate"/);
  assert.match(html, /id="online-rooms-list"/);
});

test('Online simulation host loop ticks players and generates authoritative snapshots', () => {
  const onlineRoom = {
    code: 'ELVES1',
    host: 'host_p0',
    players: [
      { id: 'host_p0', name: 'Dobby', house: 0, connected: true, keys: {} },
      { id: 'guest_p1', name: 'Winky', house: 1, connected: true, keys: {} }
    ],
    spectators: [],
    level: 0,
    status: 'lobby',
    deaths: 0
  };

  ElfEngine.init(onlineRoom);
  onlineRoom.status = 'playing';
  assert.equal(onlineRoom.status, 'playing');
  assert.equal(onlineRoom.players.length, 2);

  const startX0 = onlineRoom.players[0].x;
  for (let i = 0; i < 30; i++) {
    onlineRoom.players[0].keys = { right: true };
    onlineRoom.players[1].keys = { right: true };
    ElfEngine.tick(onlineRoom);
  }

  // Players should move right under positive input
  assert.ok(onlineRoom.players[0].x > startX0, 'Player 0 should advance right');
  assert.ok(onlineRoom.players[1].x > startX0, 'Player 1 should advance right');

  const snap = ElfEngine.snapshot(onlineRoom);
  assert.equal(snap.code, 'ELVES1');
  assert.equal(snap.status, 'playing');
  assert.equal(snap.players.length, 2);
  assert.equal(snap.players[0].name, 'Dobby');
  assert.equal(snap.players[1].name, 'Winky');
});

test('Supabase channel name and presence events follow Hogwarts protocol', () => {
  const gameJs = fs.readFileSync(path.join(__dirname, '../dist/game.js'), 'utf8');
  assert.match(gameJs, /sockbound-room-/);
  assert.match(gameJs, /sockbound-global-lobby/);
  assert.match(gameJs, /becomeHost/);
  assert.match(gameJs, /broadcastState/);
});
