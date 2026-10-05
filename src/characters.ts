import * as THREE from 'three'

export interface DuelistCharacter {
  id: string
  name: string
  fullName: string
  title: string
  house: 'GRYFFINDOR' | 'SLYTHERIN' | 'AUROR' | 'DARK'
  houseIcon: string
  houseTagClass: string // 'gryffindor-tag' | 'slytherin-tag' | 'auror-tag' | 'dark-tag'
  badgeText: string
  modelFile: string
  avatarUrl: string
  wandName: string
  wandColor: number
  wandMetalness: number
  wandRoughness: number
  specialty: string
  quote: string
  themeColor: string
}

export const CHARACTER_ROSTER: Record<string, DuelistCharacter> = {
  harry: {
    id: 'harry',
    name: 'HARRY POTTER',
    fullName: 'Harry James Potter',
    title: 'Cậu Bé Sống Sót · Nhà Gryffindor',
    house: 'GRYFFINDOR',
    houseIcon: '🦁',
    houseTagClass: 'gryffindor-tag',
    badgeText: 'LV.7',
    modelFile: 'lego_harry_potter_harry_potter2019-1st_task.glb',
    avatarUrl: '/assets/dueling/avatar_harry.png',
    wandName: 'Gỗ Cây Nhựa Ruồi & Lông Phượng Hoàng (Holly 11")',
    wandColor: 0x5d3a1a,
    wandMetalness: 0.05,
    wandRoughness: 0.35,
    specialty: 'Bùa Giải Giới Expelliarmus & Thần Hộ Mệnh Patronus',
    quote: 'Expelliarmus!',
    themeColor: '#e74c3c',
  },
  ron: {
    id: 'ron',
    name: 'RON WEASLEY',
    fullName: 'Ronald Bilius Weasley',
    title: 'Hiệp Sĩ Bàn Cờ Phù Thủy · Nhà Gryffindor',
    house: 'GRYFFINDOR',
    houseIcon: '🦁',
    houseTagClass: 'gryffindor-tag',
    badgeText: 'CHESS',
    modelFile: 'lego_harry_potter_ron_weasley.glb',
    avatarUrl: '/assets/dueling/avatar_ron.png',
    wandName: 'Gỗ Cây Liễu & Lông Kỳ Lân (Willow 14")',
    wandColor: 0x8a5229,
    wandMetalness: 0.06,
    wandRoughness: 0.32,
    specialty: 'Bùa Đẩy Lùi Flipendo & Quả Cảm Gryffindor',
    quote: 'Bloody hell! Chiếu tướng!',
    themeColor: '#ea580c',
  },
  voldemort: {
    id: 'voldemort',
    name: 'LORD VOLDEMORT',
    fullName: 'Lord Voldemort (Chúa Tể Hắc Ám)',
    title: 'Kẻ Mà Ai Cũng Biết Là Ai · Slytherin',
    house: 'DARK',
    houseIcon: '🐍',
    houseTagClass: 'slytherin-tag',
    badgeText: 'DARK',
    modelFile: 'lego_harry_potter_voldemort_2005.glb',
    avatarUrl: '/assets/dueling/avatar_voldemort.png',
    wandName: 'Gỗ Cây Thủy Tùng Trắng Xương (Yew 13½")',
    wandColor: 0xedebe6,
    wandMetalness: 0.08,
    wandRoughness: 0.22,
    specialty: 'Lời Nguyền Chết Chóc Avada Kedavra & Hắc Ám',
    quote: 'Avada Kedavra!',
    themeColor: '#2ed573',
  },
  death_eater: {
    id: 'death_eater',
    name: 'TỬ THẦN THỰC TỬ',
    fullName: 'Death Eater (Môn Đồ Hắc Ám)',
    title: 'Môn Đồ Hắc Ám · Phục Kích Tối Thượng',
    house: 'DARK',
    houseIcon: '💀',
    houseTagClass: 'dark-tag',
    badgeText: 'ELITE',
    modelFile: 'lego_harry_potter_death_eater_2019.glb',
    avatarUrl: '/assets/dueling/avatar_death_eater.png',
    wandName: 'Gỗ Hắc Đàn Khắc Phù Chú Cốt (Blackwood 12")',
    wandColor: 0x181818,
    wandMetalness: 0.25,
    wandRoughness: 0.40,
    specialty: 'Lời Nguyền Hắc Khí & Tia Phép Chớp Nhoáng',
    quote: 'Morsmordre!',
    themeColor: '#a855f7',
  },
  moody: {
    id: 'moody',
    name: 'ALASTOR MOODY',
    fullName: 'Alastor "Mad-Eye" Moody',
    title: 'Mắt Điên Moody · Huyền Thoại Thần Sáng',
    house: 'AUROR',
    houseIcon: '👁️',
    houseTagClass: 'auror-tag',
    badgeText: 'AUROR',
    modelFile: 'lego_harry_potter_mad-eye_moody_2018.glb',
    avatarUrl: '/assets/dueling/avatar_moody.png',
    wandName: 'Gỗ Sồi Cổ Khắc Ấn Pháp Thuật & Trượng Chiến',
    wandColor: 0x4a3219,
    wandMetalness: 0.15,
    wandRoughness: 0.30,
    specialty: 'Phản Đòn Khiên Protego Tuyệt Đối & Phản Xạ Cực Nhanh',
    quote: 'Cảnh giác cao độ!',
    themeColor: '#38bdf8',
  },
  lupin: {
    id: 'lupin',
    name: 'REMUS LUPIN',
    fullName: 'Professor Remus John Lupin',
    title: 'Giáo Sư Lupin · DADA Hogwarts',
    house: 'GRYFFINDOR',
    houseIcon: '🐺',
    houseTagClass: 'gryffindor-tag',
    badgeText: 'PROF',
    modelFile: 'lego_harry_potter_professor_lupin_2004.glb',
    avatarUrl: '/assets/dueling/avatar_lupin.png',
    wandName: 'Gỗ Bách Hổ Phách & Lông Kỳ Lân (Cypress 10¼")',
    wandColor: 0x784f2b,
    wandMetalness: 0.05,
    wandRoughness: 0.32,
    specialty: 'Bùa Trục Xuất & Thần Hộ Mệnh Bạch Lang',
    quote: 'Expecto Patronum!',
    themeColor: '#f59e0b',
  },
  tom_riddle: {
    id: 'tom_riddle',
    name: 'TOM RIDDLE',
    fullName: 'Tom Marvolo Riddle',
    title: 'Huynh Trưởng Slytherin · Người Thừa Kế',
    house: 'SLYTHERIN',
    houseIcon: '🐍',
    houseTagClass: 'slytherin-tag',
    badgeText: 'HEIR',
    modelFile: 'lego_harry_potter_tom_riddle_classic.glb',
    avatarUrl: '/assets/dueling/avatar_tom_riddle.png',
    wandName: 'Đũa Thủy Tùng Cổ Điển Thời Niên Thiếu (Classic Yew)',
    wandColor: 0xc2b9a7,
    wandMetalness: 0.10,
    wandRoughness: 0.25,
    specialty: 'Ma Thuật Biến Hình Cổ Điển & Độc Dược Tinh Thông',
    quote: 'Ta biết những bí mật cổ xưa nhất...',
    themeColor: '#10b981',
  },
}

export function getCharacter(id: string): DuelistCharacter {
  return CHARACTER_ROSTER[id] || CHARACTER_ROSTER.harry
}

export function getAllCharacters(): DuelistCharacter[] {
  return Object.values(CHARACTER_ROSTER)
}

/**
 * Creates an authentic duelist wand mesh attached with its spellcasting emitter tip.
 */
export function createCharacterWand(char: DuelistCharacter): { wandGroup: THREE.Group; wandTip: THREE.Group } {
  const wandMat = new THREE.MeshStandardMaterial({
    color: char.wandColor,
    roughness: char.wandRoughness,
    metalness: char.wandMetalness,
  })

  const wandGroup = new THREE.Group()
  wandGroup.name = `${char.id}_Wand`

  // Pommel sphere
  const pommelGeo = new THREE.SphereGeometry(0.008, 12, 12)
  wandGroup.add(new THREE.Mesh(pommelGeo, wandMat))

  // Shaft cylinder tapering towards tip
  const shaftGeo = new THREE.CylinderGeometry(0.003, 0.006, 0.14, 16)
  shaftGeo.translate(0, 0.07, 0)
  wandGroup.add(new THREE.Mesh(shaftGeo, wandMat))

  // Minifig hand grip rotation and position (right hand)
  wandGroup.rotation.x = Math.PI / 2 + 0.15
  wandGroup.rotation.z = -0.22
  wandGroup.position.set(-0.11, 0.17, 0.05)

  // Wand emitter tip
  const wandTip = new THREE.Group()
  wandTip.name = `${char.id}_WandTip`
  wandTip.position.set(0, 0.15, 0)
  wandGroup.add(wandTip)

  return { wandGroup, wandTip }
}

export interface GauntletTier {
  tierNumber: number
  tierName: string
  tierEnglish: string
  tierBadge: string
  tagClass: string
  color: string
  maxHp: number
  actionIntervalMin: number
  actionIntervalMax: number
  telegraphTime: number
  dodgeChance: number
  shieldChance: number
  damageMultiplier: number
  spellPool: string[]
  advice: string
}

export const GAUNTLET_TIERS: GauntletTier[] = [
  {
    tierNumber: 1,
    tierName: 'Nhập Môn',
    tierEnglish: 'Novice',
    tierBadge: 'ẢI 1 · NHẬP MÔN',
    tagClass: 'tier-novice',
    color: '#38bdf8',
    maxHp: 80,
    actionIntervalMin: 4.5,
    actionIntervalMax: 6.0,
    telegraphTime: 2.0,
    dodgeChance: 0.15,
    shieldChance: 0.10,
    damageMultiplier: 0.80,
    spellPool: ['expelliarmus', 'stupefy'],
    advice: 'Đối thủ còn non tay, hãy luyện tập vẽ thủ ấn thật chuẩn xác để hạ gục nhanh.',
  },
  {
    tierNumber: 2,
    tierName: 'Tập Sự',
    tierEnglish: 'Apprentice',
    tierBadge: 'ẢI 2 · TẬP SỰ',
    tagClass: 'tier-apprentice',
    color: '#34d399',
    maxHp: 100,
    actionIntervalMin: 3.8,
    actionIntervalMax: 5.0,
    telegraphTime: 1.6,
    dodgeChance: 0.35,
    shieldChance: 0.25,
    damageMultiplier: 0.95,
    spellPool: ['expelliarmus', 'stupefy', 'confringo'],
    advice: 'Coi chừng Bùa Nổ Confringo! Chú ý bật Protego khi thấy vầng sáng màu cam.',
  },
  {
    tierNumber: 3,
    tierName: 'Tinh Anh',
    tierEnglish: 'Adept',
    tierBadge: 'ẢI 3 · TINH ANH',
    tagClass: 'tier-adept',
    color: '#fbbf24',
    maxHp: 120,
    actionIntervalMin: 3.0,
    actionIntervalMax: 4.2,
    telegraphTime: 1.3,
    dodgeChance: 0.50,
    shieldChance: 0.40,
    damageMultiplier: 1.10,
    spellPool: ['expelliarmus', 'stupefy', 'confringo', 'sectumsempra', 'petrificus'],
    advice: 'Đối thủ biết dùng Bùa Trói Petrificus và Chém Ngang Sectumsempra. Né trái/phải linh hoạt!',
  },
  {
    tierNumber: 4,
    tierName: 'Cao Thủ',
    tierEnglish: 'Master',
    tierBadge: 'ẢI 4 · CAO THỦ',
    tagClass: 'tier-master',
    color: '#fb923c',
    maxHp: 140,
    actionIntervalMin: 2.3,
    actionIntervalMax: 3.2,
    telegraphTime: 1.05,
    dodgeChance: 0.65,
    shieldChance: 0.55,
    damageMultiplier: 1.25,
    spellPool: ['expelliarmus', 'stupefy', 'confringo', 'sectumsempra', 'petrificus', 'obliviate'],
    advice: 'Tốc độ thi triển cực nhanh và có khả năng xóa trí nhớ Obliviate. Hãy giữ khoảng cách và phản đòn!',
  },
  {
    tierNumber: 5,
    tierName: 'BOSS Tối Thượng',
    tierEnglish: 'Supreme Boss',
    tierBadge: 'ẢI 5 · BOSS',
    tagClass: 'tier-boss',
    color: '#ef4444',
    maxHp: 175,
    actionIntervalMin: 1.8,
    actionIntervalMax: 2.5,
    telegraphTime: 0.85,
    dodgeChance: 0.80,
    shieldChance: 0.70,
    damageMultiplier: 1.45,
    spellPool: ['expelliarmus', 'stupefy', 'confringo', 'sectumsempra', 'petrificus', 'obliviate', 'avadakedavra', 'expecto_patronum'],
    advice: 'TRẬN CHIẾN SINH TỬ! Đại ma đầu thi triển Lời Nguyền Tử Thần liên tiếp. Tập trung tối đa!',
  },
]

export interface GauntletEntry {
  charId: string
  char: DuelistCharacter
  tier: GauntletTier
}

export function generateGauntletRoster(playerCharId: string): GauntletEntry[] {
  const allIds = Object.keys(CHARACTER_ROSTER).filter(id => id !== playerCharId)
  // Randomly shuffle remaining 6 characters
  const shuffled = [...allIds].sort(() => Math.random() - 0.5)
  // Pick 5 unique opponents
  const chosen5 = shuffled.slice(0, 5)

  // Epic boss placement:
  // If Voldemort was drafted, he deserves to be the final BOSS at Tier 5!
  // If player is Voldemort and Harry/Moody was drafted, place Harry/Moody at Tier 5!
  if (chosen5.includes('voldemort')) {
    const vIdx = chosen5.indexOf('voldemort')
    chosen5.splice(vIdx, 1)
    chosen5.push('voldemort')
  } else if (playerCharId === 'voldemort' && chosen5.includes('harry')) {
    const hIdx = chosen5.indexOf('harry')
    chosen5.splice(hIdx, 1)
    chosen5.push('harry')
  } else if (playerCharId === 'voldemort' && chosen5.includes('moody')) {
    const mIdx = chosen5.indexOf('moody')
    chosen5.splice(mIdx, 1)
    chosen5.push('moody')
  }

  return chosen5.map((charId, idx) => ({
    charId,
    char: getCharacter(charId),
    tier: GAUNTLET_TIERS[idx],
  }))
}

