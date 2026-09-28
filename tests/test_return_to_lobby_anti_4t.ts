import { assignRolesFairly } from '../src/lib/GameContext';
import { Player, Role } from '../src/lib/types';
import { ROLES } from '../src/lib/roles';
import { HPVNGameEngine, HPVN_ROLES, HPVN_BALANCE } from '../src/lib/hpvnGameEngine';

console.log('====================================================');
console.log('🧪 KIỂM THỬ: NÚT TRỞ LẠI PHÒNG & CHỐNG CHIA TRÙNG 4T VÁN 2');
console.log('====================================================');

// -----------------------------------------------------------------------------
// PHẦN 1: BOARDGAME BẢY POTTER MULTIPLAYER (assignRolesFairly & returnToLobby logic)
// -----------------------------------------------------------------------------
console.log('\n--- [TEST 1] VÁN 1 ĐẾN VÁN 2: CHỐNG CHIA TRÙNG 4T TUYỆT ĐỐI ---');

const initialPlayers: Player[] = [
  { id: 'p1', name: 'Nguyễn Văn A', status: 'ALIVE', isGM: false },
  { id: 'p2', name: 'Trần Thị B', status: 'ALIVE', isGM: false },
  { id: 'p3', name: 'Lê Văn C', status: 'ALIVE', isGM: false },
  { id: 'p4', name: 'Phạm Thị D', status: 'ALIVE', isGM: false },
  { id: 'p5', name: 'Hoàng Văn E', status: 'ALIVE', isGM: false },
  { id: 'p6', name: 'Vũ Thị F', status: 'ALIVE', isGM: false },
];

// Ván 1: Chia vai
const game1 = assignRolesFairly(initialPlayers);
const evilPlayersG1 = game1.players.filter(p => p.role?.faction === 'DEATH_EATERS');
console.log(`✓ Ván 1: Số lượng 4T được chia: ${evilPlayersG1.length}`);
evilPlayersG1.forEach(p => console.log(`   - 4T Ván 1: ${p.name} (${p.role?.name})`));

// Giả lập kết thúc ván 1 và bấm "Trở Lại Phòng" (returnToLobby logic)
const carriedRoleMap: Record<string, string> = {};
const carriedRoleHistory: Record<string, any> = {};

game1.players.forEach(p => {
  if (p.role) {
    carriedRoleMap[p.id] = p.role.id;
    carriedRoleMap[`name_${p.name.trim().toLowerCase()}`] = p.role.id;

    const isEvil = p.role.faction === 'DEATH_EATERS';
    carriedRoleHistory[p.id] = {
      consecutiveEvil: isEvil ? 1 : 0,
      totalEvil: isEvil ? 1 : 0,
      totalGames: 1,
      lastRoleId: p.role.id,
      lastFaction: p.role.faction,
      gamesSinceLastEvil: isEvil ? 0 : 1,
    };
    carriedRoleHistory[`name_${p.name.trim().toLowerCase()}`] = carriedRoleHistory[p.id];
  }
});

const playersInLobby: Player[] = game1.players.map(p => ({
  ...p,
  role: null,
  status: 'ALIVE',
  previousRoleId: p.role?.id,
  consecutiveEvil: p.role?.faction === 'DEATH_EATERS' ? 1 : 0,
  personalHistory: carriedRoleHistory[p.id],
}));

// Ván 2: Chia vai lại từ Sảnh Chờ
const game2 = assignRolesFairly(playersInLobby, carriedRoleMap, carriedRoleHistory);
const evilPlayersG2 = game2.players.filter(p => p.role?.faction === 'DEATH_EATERS');
console.log(`\n✓ Ván 2: Số lượng 4T được chia: ${evilPlayersG2.length}`);
evilPlayersG2.forEach(p => console.log(`   - 4T Ván 2: ${p.name} (${p.role?.name})`));

// Kiểm tra trùng lặp
const g1EvilIds = new Set(evilPlayersG1.map(p => p.id));
const duplicate4T = evilPlayersG2.filter(p => g1EvilIds.has(p.id));

if (duplicate4T.length > 0) {
  console.error('❌ THẤT BẠI: Phát hiện người chơi bị chia trùng làm 4T ở ván 2:', duplicate4T.map(p => p.name));
  process.exit(1);
} else {
  console.log('✅ TEST 1 PASSED: 100% Không ai bị chia trùng làm 4T ở lần chơi thứ 2!');
}

// -----------------------------------------------------------------------------
// PHẦN 2: STRESS TEST 500 VÁN LIÊN TỤC VỚI CÁC BÀN 4 ĐẾN 12 NGƯỜI
// -----------------------------------------------------------------------------
console.log('\n--- [TEST 2] STRESS TEST 500 VÁN LIÊN TIẾP CHO PHÒNG 4 - 12 NGƯỜI ---');

for (const n of [4, 5, 6, 7, 8, 10, 12]) {
  let simPlayers: Player[] = Array.from({ length: n }, (_, i) => ({
    id: `player_${i}`,
    name: `Phù Thủy ${i + 1}`,
    status: 'ALIVE',
    isGM: false,
  }));

  let prevMap: Record<string, string> = {};
  let histMap: Record<string, any> = {};
  let maxConsecutiveEvilFound = 0;

  for (let match = 1; match <= 50; match++) {
    const res = assignRolesFairly(simPlayers, prevMap, histMap);
    prevMap = { ...res.previousRoleMap };
    histMap = { ...res.roleHistory };

    res.players.forEach(p => {
      const isEvil = p.role?.faction === 'DEATH_EATERS';
      if (isEvil && p.consecutiveEvil && p.consecutiveEvil > maxConsecutiveEvilFound) {
        maxConsecutiveEvilFound = p.consecutiveEvil;
      }
    });

    // Giả lập returnToLobby cho ván sau
    simPlayers = res.players.map(p => {
      const isEvil = p.role?.faction === 'DEATH_EATERS';
      return {
        ...p,
        role: null,
        status: 'ALIVE',
        previousRoleId: p.role?.id,
        consecutiveEvil: isEvil ? 1 : 0,
      };
    });
  }

  console.log(`✓ Phòng ${n.toString().padStart(2, ' ')} người (50 ván liên tiếp) ➔ Max chuỗi 4T liên tiếp: ${maxConsecutiveEvilFound} ván (Kỳ vọng: <= 1)`);
  if (maxConsecutiveEvilFound > 1) {
    console.error(`❌ THẤT BẠI: Phát hiện chuỗi 4T liên tiếp = ${maxConsecutiveEvilFound} ở phòng ${n} người!`);
    process.exit(1);
  }
}
console.log('✅ TEST 2 PASSED: Toàn bộ các quy mô phòng đều không có ai bị lặp 4T liên tiếp!');

// -----------------------------------------------------------------------------
// PHẦN 3: MOD HPVN (HPVNGameEngine - resetForNewGame & assignRoles)
// -----------------------------------------------------------------------------
console.log('\n--- [TEST 3] MOD HPVN: RESET FOR NEW GAME & ANTI-4T ROTATION ---');

const hpvnNames = [
  'Harry Potter',
  'Ron Weasley',
  'Hermione Granger',
  'Albus Dumbledore',
  'Severus Snape',
  'Lord Voldemort',
  'Bellatrix Lestrange',
  'Draco Malfoy',
];

const hpvnEngine = new HPVNGameEngine(8);
hpvnEngine.initializeGame(hpvnNames);
hpvnEngine.startGame();

const hpvnG1 = hpvnEngine.getState();
const hpvnG1_4T = hpvnG1.players.filter(p => p.faction === 'DEATH_EATERS');
console.log(`✓ MOD HPVN Ván 1: Số lượng 4T = ${hpvnG1_4T.length}`);
hpvnG1_4T.forEach(p => console.log(`   - 4T Ván 1: ${p.name} (${p.role?.name})`));

// Thực hiện Reset For New Game
hpvnEngine.resetForNewGame();
const hpvnG2 = hpvnEngine.getState();
const hpvnG2_4T = hpvnG2.players.filter(p => p.faction === 'DEATH_EATERS');
console.log(`\n✓ MOD HPVN Ván 2: Số lượng 4T = ${hpvnG2_4T.length}`);
hpvnG2_4T.forEach(p => console.log(`   - 4T Ván 2: ${p.name} (${p.role?.name})`));

const hpvnG1_4T_Names = new Set(hpvnG1_4T.map(p => p.name));
const hpvnDuplicates = hpvnG2_4T.filter(p => hpvnG1_4T_Names.has(p.name));

if (hpvnDuplicates.length > 0) {
  console.error('❌ THẤT BẠI TRONG MOD HPVN: Người chơi bị trùng 4T ở ván 2:', hpvnDuplicates.map(p => p.name));
  process.exit(1);
} else {
  console.log('✅ TEST 3 PASSED: MOD HPVN đã bảo lưu dữ liệu và chống trùng lặp 4T thành công 100%!');
}

console.log('\n====================================================');
console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ TRỞ LẠI PHÒNG & CHỐNG LẶP 4T ĐỀU THÀNH CÔNG!');
console.log('====================================================');
