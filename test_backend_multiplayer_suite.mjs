// test_backend_multiplayer_suite.mjs
import { spawn } from 'node:child_process'
import http from 'node:http'
import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fxucyrofcsuqtlkukcrx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_zEiG2Py5kDmGhkTgw0uWIA_We0rOCGu'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  console.log('========================================================')
  console.log('🧪 BẮT ĐẦU BỘ KIỂM THỬ BACKEND HOGWARTS DUEL 3D')
  console.log('========================================================\n')

  // --------------------------------------------------------------------------
  // TEST SUITE 1: STANDALONE LOCAL NODE.JS WEBSOCKET GAME SERVER (server/index.mjs)
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: KHỞI CHẠY VÀ KIỂM TRA LOCAL GAME SERVER (PORT 5181) ---')
  const serverProcess = spawn('node', ['server/index.mjs'], {
    env: { ...process.env, PORT: '5181' },
    stdio: 'pipe',
  })

  serverProcess.stdout.on('data', (d) => {
    // console.log('[Server log]:', d.toString().trim())
  })

  await sleep(1000)

  // 1.1 Test Health Endpoint
  console.log('1.1 Gửi request GET /api/health...')
  const healthData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5181/api/health', (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => resolve(JSON.parse(body)))
    }).on('error', reject)
  })
  console.log('✅ Health Response:', healthData)
  if (healthData.status !== 'ok') throw new Error('Health check failed')

  // 1.2 Test WebSocket Duel Match on Port 5181
  console.log('\n1.2 Kết nối 2 WebSocket Clients mô phỏng Chủ Phòng & Khách Đấu...')
  const hostWs = new WebSocket('ws://127.0.0.1:5181')
  const guestWs = new WebSocket('ws://127.0.0.1:5181')

  await Promise.all([
    new Promise((r) => hostWs.on('open', r)),
    new Promise((r) => guestWs.on('open', r)),
  ])

  console.log('Host & Guest WebSocket connections opened.')

  // Host creates room
  const roomCode = 'TEST-NODE-88'
  let hostReceivedOpponent = false
  let guestJoinedRoom = false
  let guestReceivedSpell = false

  hostWs.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.type === 'opponent_joined') {
      hostReceivedOpponent = true
      console.log('✅ [Host WS] Nhận thông báo đối thủ đã vào phòng:', msg.payload?.opponent?.name)
    }
  })

  guestWs.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.type === 'room_joined') {
      guestJoinedRoom = true
      console.log('✅ [Guest WS] Đã vào phòng thành công, gặp chủ phòng:', msg.payload?.opponent?.name)
    }
    if (msg.type === 'game_message' && msg.payload?.type === 'cast') {
      guestReceivedSpell = true
      console.log('✅ [Guest WS] Nhận được phép thuật từ Host:', msg.payload?.payload)
    }
  })

  hostWs.send(JSON.stringify({
    type: 'create_room',
    code: roomCode,
    payload: {
      name: 'Harry Potter (Host)',
      deck: ['expelliarmus', 'protego', 'stupefy', 'confringo'],
    },
  }))

  await sleep(400)

  // Verify room is visible in /api/rooms
  const roomsRes = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5181/api/rooms', (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => resolve(JSON.parse(body)))
    }).on('error', reject)
  })
  console.log('✅ Open Rooms in Server API:', roomsRes)
  const foundInApi = roomsRes.rooms?.some((r) => r.code === roomCode)
  if (!foundInApi) throw new Error(`Room ${roomCode} not listed in /api/rooms!`)

  // Guest joins room
  guestWs.send(JSON.stringify({
    type: 'join_room',
    code: roomCode,
    payload: {
      name: 'Draco Malfoy (Guest)',
      deck: ['expelliarmus', 'protego', 'petrificus', 'avadakedavra'],
    },
  }))

  await sleep(600)

  // Host casts spell
  hostWs.send(JSON.stringify({
    type: 'game_message',
    code: roomCode,
    payload: {
      type: 'cast',
      sender: 'host',
      payload: { spell: 'expelliarmus', accuracy: 98 },
      timestamp: Date.now(),
    },
  }))

  await sleep(500)

  hostWs.close()
  guestWs.close()
  serverProcess.kill('SIGTERM')

  if (!hostReceivedOpponent || !guestJoinedRoom || !guestReceivedSpell) {
    throw new Error('Local server WebSocket message exchange failed!')
  }
  console.log('🎉 TEST 1 PASSED: Local Dedicated Game Server hoạt động xuất sắc!\n')

  // --------------------------------------------------------------------------
  // TEST SUITE 2: SUPABASE REALTIME CLOUD BACKEND (DUEL ROOM & GLOBAL LOBBY)
  // --------------------------------------------------------------------------
  console.log('--- TEST 2: KIỂM TRA SUPABASE REALTIME CLOUD BACKEND ---')
  const sbHost = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 20 } },
  })
  const sbGuest = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 20 } },
  })

  const testRoomChannelName = `duel-room-test-${Date.now()}`
  const hostChannel = sbHost.channel(testRoomChannelName, {
    config: { presence: { key: 'host-player-id' }, broadcast: { self: false } },
  })
  const guestChannel = sbGuest.channel(testRoomChannelName, {
    config: { presence: { key: 'guest-player-id' }, broadcast: { self: false } },
  })

  let sbGuestReceivedWelcome = false
  let sbHostReceivedSpell = false
  let pingLatencyMs = 0

  hostChannel.on('broadcast', { event: 'game_message' }, (payload) => {
    const msg = payload.payload
    if (msg.type === 'cast') {
      sbHostReceivedSpell = true
      console.log('✅ [Supabase Host] Nhận được chiêu thức từ đối thủ:', msg.payload)
    }
  })

  guestChannel.on('broadcast', { event: 'game_message' }, (payload) => {
    const msg = payload.payload
    if (msg.type === 'welcome') {
      sbGuestReceivedWelcome = true
      console.log('✅ [Supabase Guest] Nhận được gói tin chào mừng từ Host:', msg.payload)
    }
  })

  console.log('2.1 Đăng ký Supabase Realtime Channels...')
  await new Promise((resolve) => {
    hostChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Host channel subscribed!')
        resolve()
      }
    })
  })

  await new Promise((resolve) => {
    guestChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Guest channel subscribed!')
        resolve()
      }
    })
  })

  // Track presence
  await hostChannel.track({ name: 'Harry Potter', role: 'host', deck: ['expelliarmus', 'protego', 'stupefy', 'confringo'] })
  await guestChannel.track({ name: 'Voldemort', role: 'guest', deck: ['avadakedavra', 'protego', 'crucio', 'obliviate'] })
  await sleep(400)

  // Host sends welcome
  const t0 = Date.now()
  hostChannel.send({
    type: 'broadcast',
    event: 'game_message',
    payload: {
      type: 'welcome',
      sender: 'host',
      payload: { message: 'Chào mừng vào sàn đấu pháp thuật Hogwarts!' },
      timestamp: Date.now(),
    },
  })

  // Guest casts Avada Kedavra
  guestChannel.send({
    type: 'broadcast',
    event: 'game_message',
    payload: {
      type: 'cast',
      sender: 'guest',
      payload: { spell: 'avadakedavra', accuracy: 100 },
      timestamp: Date.now(),
    },
  })

  await sleep(800)
  pingLatencyMs = Date.now() - t0

  console.log(`⏱️ Độ trễ thời gian thực Supabase WebSocket Round-Trip: ~${pingLatencyMs / 2} ms`)

  sbHost.removeChannel(hostChannel)
  sbGuest.removeChannel(guestChannel)

  if (!sbGuestReceivedWelcome || !sbHostReceivedSpell) {
    throw new Error('Supabase Realtime message exchange failed!')
  }
  console.log('🎉 TEST 2 PASSED: Supabase Realtime Cloud Backend hoạt động hoàn hảo!\n')

  // --------------------------------------------------------------------------
  // TEST SUITE 3: GLOBAL LOBBY PRESENCE & MATCH DISCOVERY
  // --------------------------------------------------------------------------
  console.log('--- TEST 3: KIỂM TRA SẢNH CHỜ TOÀN CẦU (GLOBAL LOBBY PRESENCE) ---')
  const lobbyHost = sbHost.channel('duel-global-lobby', {
    config: { presence: { key: 'host-presence-test' }, broadcast: { self: false } },
  })
  const lobbyGuest = sbGuest.channel('duel-global-lobby', {
    config: { presence: { key: 'guest-presence-test' }, broadcast: { self: false } },
  })

  let lobbyRoomDiscovered = false

  lobbyGuest.on('broadcast', { event: 'room_event' }, (payload) => {
    const { action, room } = payload.payload || {}
    if (action === 'room_opened' && room?.code === 'HOGW-TEST-LOBBY') {
      lobbyRoomDiscovered = true
      console.log('✅ [Lobby Guest] Đã phát hiện phòng công khai mới xuất hiện:', room)
    }
  })

  await new Promise((r) => lobbyHost.subscribe((s) => s === 'SUBSCRIBED' && r()))
  await new Promise((r) => lobbyGuest.subscribe((s) => s === 'SUBSCRIBED' && r()))

  // Host broadcasts room_opened
  lobbyHost.send({
    type: 'broadcast',
    event: 'room_event',
    payload: {
      action: 'room_opened',
      room: {
        code: 'HOGW-TEST-LOBBY',
        hostName: 'Harry Potter',
        hostDeck: ['expelliarmus', 'protego', 'stupefy', 'confringo'],
        createdAt: Date.now(),
      },
    },
  })

  await sleep(600)

  sbHost.removeChannel(lobbyHost)
  sbGuest.removeChannel(lobbyGuest)

  if (!lobbyRoomDiscovered) {
    throw new Error('Global Lobby room broadcast discovery failed!')
  }
  console.log('🎉 TEST 3 PASSED: Sảnh chờ toàn cầu tự động phát hiện phòng thành công!\n')

  console.log('========================================================')
  console.log('🏆 TẤT CẢ 3 BỘ KIỂM THỬ BACKEND ĐỀU THÀNH CÔNG VANG DỘI!')
  console.log('========================================================')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Kiểm thử thất bại:', err)
  process.exit(1)
})
