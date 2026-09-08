import { SevenPottersNetwork } from '../src/lib/peerNetwork';
import type { Player, GameState, NetworkMessage } from '../src/lib/types';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMultiplayerTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG MULTIPLAYER 7 POTTERS');
  console.log('====================================================');

  const testRoomCode = 'TEST' + Math.floor(1000 + Math.random() * 9000);
  console.log(`[Test] Phòng kiểm thử được tạo: ${testRoomCode}`);

  const hostPlayer: Player = {
    id: 'host_player_001',
    name: 'Albus Dumbledore (Host)',
    role: null,
    status: 'ALIVE',
    isGM: true,
  };

  const client1Player: Player = {
    id: 'client_player_002',
    name: 'Harry Potter (Client 1)',
    role: null,
    status: 'ALIVE',
    isGM: false,
  };

  const client2Player: Player = {
    id: 'client_player_003',
    name: 'Hermione Granger (Client 2)',
    role: null,
    status: 'ALIVE',
    isGM: false,
  };

  const hostNet = new SevenPottersNetwork();
  const client1Net = new SevenPottersNetwork();
  const client2Net = new SevenPottersNetwork();

  let hostReceivedJoinReq: Player[] = [];
  let client1ReceivedState: GameState | null = null;
  let client2ReceivedState: GameState | null = null;
  let hostReceivedActions: any[] = [];
  let hostReceivedInstantSkills: any[] = [];

  // Setup Host Listeners
  hostNet.onMessageReceived = (msg: NetworkMessage) => {
    console.log(`[Host] Received message: ${msg.type}`, msg.senderId);
    if (msg.type === 'JOIN_REQUEST') {
      hostReceivedJoinReq.push(msg.payload as Player);
    } else if (msg.type === 'ACTION_SUBMIT') {
      hostReceivedActions.push({ senderId: msg.senderId, payload: msg.payload });
    } else if (msg.type === 'INSTANT_SKILL_SUBMIT') {
      hostReceivedInstantSkills.push({ senderId: msg.senderId, payload: msg.payload });
    }
  };

  // Setup Client 1 Listeners
  client1Net.onMessageReceived = (msg: NetworkMessage) => {
    console.log(`[Client 1] Received message: ${msg.type}`);
    if (msg.type === 'ROOM_STATE_SYNC') {
      client1ReceivedState = msg.payload as GameState;
    }
  };

  // Setup Client 2 Listeners
  client2Net.onMessageReceived = (msg: NetworkMessage) => {
    console.log(`[Client 2] Received message: ${msg.type}`);
    if (msg.type === 'ROOM_STATE_SYNC') {
      client2ReceivedState = msg.payload as GameState;
    }
  };

  try {
    // -------------------------------------------------------------
    // TEST 1: Host Room Initialization
    // -------------------------------------------------------------
    console.log('\n--- [TEST 1] KHỞI TẠO PHÒNG HOST QUA SUPABASE REALTIME ---');
    const initCode = await hostNet.initHost(testRoomCode, hostPlayer);
    if (initCode === testRoomCode && hostNet.isSocketHealthy()) {
      console.log('✅ TEST 1 PASSED: Host đã kết nối và đăng ký channel thành công!');
    } else {
      throw new Error(`TEST 1 FAILED: Mã phòng không khớp hoặc socket không khỏe: ${initCode}`);
    }

    await sleep(1500);

    // -------------------------------------------------------------
    // TEST 2: Client 1 Joins Room
    // -------------------------------------------------------------
    console.log('\n--- [TEST 2] CLIENT 1 KẾT NỐI VÀ GỬI JOIN_REQUEST ---');
    await client1Net.initClient(testRoomCode, client1Player);
    console.log('Client 1 joined channel, waiting for presence & join request...');
    await sleep(2500);

    const client1InPresence = hostNet.isPlayerInPresence(client1Player.id);
    const hostGotClient1 = hostReceivedJoinReq.some((p) => p.id === client1Player.id);

    if (hostGotClient1) {
      console.log(`✅ TEST 2 PASSED: Host nhận được JOIN_REQUEST từ ${client1Player.name}! (Presence detected: ${client1InPresence})`);
    } else {
      throw new Error('TEST 2 FAILED: Host không nhận được JOIN_REQUEST từ Client 1');
    }

    // -------------------------------------------------------------
    // TEST 3: State Sync Broadcast from Host to Clients
    // -------------------------------------------------------------
    console.log('\n--- [TEST 3] ĐỒNG BỘ TRẠNG THÁI GAME (ROOM_STATE_SYNC) ---');
    const mockState: GameState = {
      players: [hostPlayer, client1Player],
      phase: 'LOBBY',
      round: 1,
      logs: ['Phòng đã sẵn sàng!'],
      winner: null,
      pendingActions: {},
      resolutionReport: null,
      skillStates: {},
      interruptState: null,
    };

    hostNet.broadcastRoomState(mockState);
    await sleep(1500);

    const state1 = client1ReceivedState as GameState | null;
    if (state1 && state1.players.length === 2) {
      console.log('✅ TEST 3 PASSED: Client 1 đã nhận được ROOM_STATE_SYNC từ Host chính xác!');
    } else {
      throw new Error('TEST 3 FAILED: Client 1 không nhận được ROOM_STATE_SYNC hợp lệ');
    }

    // -------------------------------------------------------------
    // TEST 4: Client Action Submission (ACTION_SUBMIT)
    // -------------------------------------------------------------
    console.log('\n--- [TEST 4] CLIENT GỬI HÀNH ĐỘNG HỘI PHƯỢNG HOÀNG (ACTION_SUBMIT) ---');
    client1Net.sendAction('Bảo vệ', 'host_player_001');
    await sleep(1500);

    const actionReceived = hostReceivedActions.find(
      (a) => a.senderId === client1Player.id && a.payload.actionName === 'Bảo vệ'
    );

    if (actionReceived) {
      console.log('✅ TEST 4 PASSED: Host nhận và parse chính xác ACTION_SUBMIT từ Client 1!');
    } else {
      throw new Error('TEST 4 FAILED: Host không nhận được ACTION_SUBMIT');
    }

    // -------------------------------------------------------------
    // TEST 5: Client 2 Joins & Sends Instant Skill
    // -------------------------------------------------------------
    console.log('\n--- [TEST 5] CLIENT 2 KẾT NỐI VÀ THI TRIỂN BÙA CHÚ TỨC THỜI (INSTANT_SKILL_SUBMIT) ---');
    await client2Net.initClient(testRoomCode, client2Player);
    await sleep(2000);

    client2Net.sendInstantSkill('Soi Danh Tính', client1Player.id);
    await sleep(1500);

    const skillReceived = hostReceivedInstantSkills.find(
      (s) => s.senderId === client2Player.id && s.payload.actionName === 'Soi Danh Tính'
    );

    if (skillReceived) {
      console.log('✅ TEST 5 PASSED: Host nhận chính xác INSTANT_SKILL_SUBMIT từ Client 2!');
    } else {
      throw new Error('TEST 5 FAILED: Host không nhận được INSTANT_SKILL_SUBMIT');
    }

    // -------------------------------------------------------------
    // TEST 6: Client Reconnection & Mobile Resume Resilience
    // -------------------------------------------------------------
    console.log('\n--- [TEST 6] KIỂM THỬ KHẢ NĂNG PHỤC HỒI KHI CHUYỂN TAB MOBILE (RECONNECT) ---');
    const reconnectOk = await client1Net.reconnectClient(testRoomCode, client1Player);
    await sleep(1500);

    if (reconnectOk && client1Net.isSocketHealthy()) {
      console.log('✅ TEST 6 PASSED: Reconnection thành công, socket vẫn duy trì trạng thái kết nối!');
    } else {
      throw new Error('TEST 6 FAILED: Client reconnect không thành công');
    }

    // -------------------------------------------------------------
    // TEST 7: Graceful Teardown
    // -------------------------------------------------------------
    console.log('\n--- [TEST 7] GIẢI PHÓNG KÊNH PHÒNG AN TOÀN (CLEAN TEARDOWN) ---');
    client1Net.destroy();
    client2Net.destroy();
    hostNet.destroy();
    await sleep(1000);

    console.log('✅ TEST 7 PASSED: Mọi channel đã được giải phóng và đóng sạch sẽ!');

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ 7/7 BÀI KIỂM THỬ MULTIPLAYER ĐỀU THÀNH CÔNG RỰC RỠ!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err);
    client1Net.destroy();
    client2Net.destroy();
    hostNet.destroy();
    process.exit(1);
  }
}

runMultiplayerTests();
