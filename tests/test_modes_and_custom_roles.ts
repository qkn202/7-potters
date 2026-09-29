import { assignRolesFairly } from '../src/lib/GameContext';
import { Player, Role } from '../src/lib/types';
import { ROLES } from '../src/lib/roles';

function createMockPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `p_${index + 1}`,
    name,
    role: null,
    status: 'ALIVE',
    isGM: false,
    consecutiveEvil: 0,
    previousRoleId: undefined,
  }));
}

console.log('====================================================');
console.log('🧪 KIỂM THỬ: 3 CHẾ ĐỘ CHƠI (CLASSIC, MOD HPVN, CUSTOM)');
console.log('====================================================\n');

// --- [TEST 1] CHẾ ĐỘ CLASSIC (22 VAI TRÒ CHUẨN) ---
console.log('--- [TEST 1] CHẾ ĐỘ CLASSIC: CHỈ XUẤT HIỆN 22 VAI TRÒ GỐC ---');
const players6 = createMockPlayers(['An', 'Bình', 'Châu', 'Dũng', 'Em', 'Giang']);
const expansionIds = ['MINERVA_MCGONAGALL', 'NEVILLE_LONGBOTTOM', 'DRACO_MALFOY', 'DOLORES_UMBRIDGE', 'JESTER'];

let hasExpansionInClassic = false;
for (let i = 0; i < 50; i++) {
  const result = assignRolesFairly(players6, {}, {}, 'CLASSIC');
  for (const p of result.players) {
    if (p.role && expansionIds.includes(p.role.id)) {
      hasExpansionInClassic = true;
      break;
    }
  }
}

if (!hasExpansionInClassic) {
  console.log('✅ TEST 1 PASSED: Chế độ Classic qua 50 lần chia bài hoàn toàn KHÔNG xuất hiện nhân vật mở rộng!');
} else {
  console.error('❌ TEST 1 FAILED: Xuất hiện nhân vật mở rộng trong chế độ Classic!');
  process.exit(1);
}

// --- [TEST 2] CHẾ ĐỘ MOD HPVN (ĐẦY ĐỦ 27 VAI TRÒ) ---
console.log('\n--- [TEST 2] CHẾ ĐỘ MOD HPVN: CÓ XUẤT HIỆN NHÂN VẬT MỞ RỘNG ---');
const players10 = createMockPlayers(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10']);
let foundExpansionInModHpvn = false;

for (let i = 0; i < 50; i++) {
  const result = assignRolesFairly(players10, {}, {}, 'MOD_HPVN');
  for (const p of result.players) {
    if (p.role && expansionIds.includes(p.role.id)) {
      foundExpansionInModHpvn = true;
      break;
    }
  }
  if (foundExpansionInModHpvn) break;
}

if (foundExpansionInModHpvn) {
  console.log('✅ TEST 2 PASSED: Chế độ MOD HPVN có xuất hiện các vai trò mở rộng phong phú!');
} else {
  console.error('❌ TEST 2 FAILED: Không thấy vai trò mở rộng trong MOD HPVN!');
  process.exit(1);
}

// --- [TEST 3] CHẾ ĐỘ CUSTOM: MERLIN CHỌN ĐÍCH DANH NHÂN VẬT ---
console.log('\n--- [TEST 3] CHẾ ĐỘ CUSTOM: CHỈ XUẤT HIỆN DUY NHẤT NHÂN VẬT MERLIN CHỌN ---');
const customSelection = [
  'HARRY_POTTER',
  'ALBUS_DUMBLEDORE',
  'SEVERUS_SNAPE',
  'MINERVA_MCGONAGALL',
  'VOLDEMORT',
  'BELLATRIX_LESTRANGE'
];

let customLeak = false;
for (let i = 0; i < 50; i++) {
  const result = assignRolesFairly(players6, {}, {}, 'CUSTOM', customSelection);
  const assignedRoleIds = result.players.map(p => p.role?.id).filter(Boolean);
  
  for (const id of assignedRoleIds) {
    if (!customSelection.includes(id!)) {
      customLeak = true;
      console.error(`Phát hiện vai trò ngoài danh sách: ${id}`);
      break;
    }
  }
}

if (!customLeak) {
  console.log('✅ TEST 3 PASSED: Chế độ Custom 100% chỉ chia trong số các nhân vật Merlin đã chọn!');
} else {
  console.error('❌ TEST 3 FAILED: Xuất hiện vai trò ngoài danh sách custom của Merlin!');
  process.exit(1);
}

// --- [TEST 4] CUSTOM VỚI ĐÚNG N NHÂN VẬT CHO N NGƯỜI CHƠI ---
console.log('\n--- [TEST 4] CUSTOM: CHỌN ĐÚNG N NHÂN VẬT THÌ TẤT CẢ N NHÂN VẬT ĐỀU ĐƯỢC CHIA ---');
const exactNSelection = [
  'HARRY_POTTER',
  'RON_WEASLEY',
  'DRACO_MALFOY',
  'MINERVA_MCGONAGALL',
  'VOLDEMORT',
  'LUCIUS_MALFOY'
];

const exactResult = assignRolesFairly(players6, {}, {}, 'CUSTOM', exactNSelection);
const assignedSet = new Set(exactResult.players.map(p => p.role?.id));

console.log('Các vai trò được chia:');
exactResult.players.forEach(p => console.log(`   - ${p.name}: ${p.role?.name} (${p.role?.id})`));

let allCovered = true;
for (const reqId of exactNSelection) {
  if (!assignedSet.has(reqId)) {
    allCovered = false;
    console.error(`Thiếu vai trò: ${reqId}`);
  }
}

if (allCovered) {
  console.log('✅ TEST 4 PASSED: Đúng 6/6 vai trò Merlin chọn đã được chia đủ cho 6 người chơi!');
} else {
  console.error('❌ TEST 4 FAILED: Không chia đủ các vai trò được chọn!');
  process.exit(1);
}

// --- [TEST 5] CUSTOM MODE: VẪN ĐẢM BẢO CHỐNG TRÙNG 4T VÁN 2 ---
console.log('\n--- [TEST 5] CUSTOM MODE: ĐẢM BẢO CHỐNG TRÙNG 4T VÁN 2 ---');
const prevRoleMap: Record<string, string> = {};
exactResult.players.forEach(p => {
  if (p.role) prevRoleMap[p.id] = p.role.id;
});

const v1EvilPlayerIds = exactResult.players
  .filter(p => p.role?.faction === 'DEATH_EATERS')
  .map(p => p.id);

console.log(`4T ván 1: ${v1EvilPlayerIds.join(', ')}`);

const round2Players = exactResult.players.map(p => ({
  ...p,
  role: null,
  previousRoleId: prevRoleMap[p.id],
  consecutiveEvil: p.role?.faction === 'DEATH_EATERS' ? 1 : 0
}));

const round2Result = assignRolesFairly(round2Players, prevRoleMap, {}, 'CUSTOM', exactNSelection);
const v2EvilPlayerIds = round2Result.players
  .filter(p => p.role?.faction === 'DEATH_EATERS')
  .map(p => p.id);

console.log(`4T ván 2: ${v2EvilPlayerIds.join(', ')}`);

const hasDuplicate4T = v1EvilPlayerIds.some(id => v2EvilPlayerIds.includes(id));
if (!hasDuplicate4T) {
  console.log('✅ TEST 5 PASSED: Ở chế độ Custom, ván 2 vẫn đảm bảo 100% không trùng người làm 4T!');
} else {
  console.error('❌ TEST 5 FAILED: Bị trùng người làm 4T ở ván 2 trong chế độ Custom!');
  process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 TẤT CẢ 5/5 BÀI KIỂM THỬ 3 CHẾ ĐỘ CHƠI & CUSTOM DECK ĐỀU THÀNH CÔNG!');
console.log('====================================================\n');
