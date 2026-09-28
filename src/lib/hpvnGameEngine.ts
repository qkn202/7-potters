/**
 * MOD HPVN - Ultimate Mode Game Engine
 * Kết hợp tinh hoa từ Classic + Chaos
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type Faction = 'ORDER_OF_PHOENIX' | 'DEATH_EATERS' | 'NEUTRAL';
export type GamePhase = 'LOBBY' | 'NIGHT' | 'CHAOS_EVENT' | 'DEATH_RESOLUTION' | 'GHOST_REVELATION' | 'VOTE' | 'GAME_OVER';
export type PlayerStatus = 'ALIVE' | 'DEAD' | 'GHOST';
export type WinCondition = 'HPH' | 'FOUR_T' | 'JESTER' | 'DRAW';

export interface Role {
  id: string;
  name: string;
  faction: Faction;
  title: string;
  description: string;
  ability: string;
  phaseType: 'NIGHT' | 'DAY' | 'PASSIVE' | 'SPECIAL';
  canVote: boolean;
  canKill: boolean;
  isTargetable: boolean;
  isProtected: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  faction: Faction;
  status: PlayerStatus;
  hp: number;
  isProtected: boolean;
  isSilenced: boolean;
  isRevealed: boolean;
  hasVoted: boolean;
  voteCount: number;
  ghostClue?: string;
  // Role-specific state
  abilities: {
    ronSacrificeUsed: boolean;
    goldenFlameUsed: boolean;
    snapeBladeActive: boolean;
    lupinPotionUsed: boolean;
    moodyBulletUsed: boolean;
    billRevealUsed: boolean;
    mcGonagallSealUsed: boolean;
    mcGonagallSealTarget: string | null;
    mcGonagallSealRounds: number;
    dracoScanUsed: boolean;
    dracoFaction: Faction | null;
  };
}

export interface ChaosEvent {
  id: string;
  name: string;
  description: string;
  effect: 'SHIELD' | 'INFO' | 'SILENCE' | 'NONE';
  probability: number;
}

export interface GameState {
  mode: 'HPVN';
  roomCode: string;
  players: Player[];
  currentRound: number;
  minRounds: number;
  phase: GamePhase;
  maxPlayers: number;

  // Settings
  enableGhostVoting: boolean;
  enableChaosEvents: boolean;
  darkPactProtection: boolean;

  // Round state
  currentEvent: ChaosEvent | null;
  nightActions: NightAction[];
  votes: Vote[];
  deaths: Death[];
  protectedThisRound: string[];

  // Win state
  winners: WinCondition[];
  logs: GameLog[];

  // Stats
  hphAlive: number;
  fourTAlive: number;
  neutralAlive: number;
  ghosts: string[];
}

export interface NightAction {
  playerId: string;
  actionType: 'KILL' | 'SCAN' | 'PROTECT' | 'BLOCK' | 'ESCAPE' | 'SEAL' | 'REVEAL' | 'NONE';
  targetId?: string;
  isProtected: boolean;
}

export interface Vote {
  playerId: string;
  targetId: string | 'NONE';
  isGhostVote: boolean;
  power: number;
}

export interface Death {
  playerId: string;
  reason: 'KILL' | 'VOTE' | 'SACRIFICE' | 'REVENGE' | 'CHAOS' | 'FENRIR_BITE';
  killerId?: string;
  revealedRole?: string;
}

export interface GameLog {
  round: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
}

export interface HPVNGameSettings {
  playerCount: number;
  hostName: string;
  roomCode: string;
  enableGhostVoting: boolean;
  enableChaosEvents: boolean;
  darkPactProtection: boolean;
  minRounds: number;
}

export const HPVN_BALANCE: Record<number, { hph: number; fourT: number; neutral: number; minRounds: number }> = {
  4:  { hph: 2, fourT: 2, neutral: 0, minRounds: 4 },
  5:  { hph: 2, fourT: 2, neutral: 1, minRounds: 4 },
  6:  { hph: 3, fourT: 2, neutral: 1, minRounds: 4 },
  7:  { hph: 4, fourT: 2, neutral: 1, minRounds: 5 },
  8:  { hph: 4, fourT: 3, neutral: 1, minRounds: 5 },
  9:  { hph: 4, fourT: 3, neutral: 2, minRounds: 5 },
  10: { hph: 5, fourT: 3, neutral: 2, minRounds: 5 },
  11: { hph: 5, fourT: 4, neutral: 2, minRounds: 6 },
  12: { hph: 5, fourT: 4, neutral: 3, minRounds: 6 },
  13: { hph: 6, fourT: 4, neutral: 3, minRounds: 6 },
  14: { hph: 6, fourT: 5, neutral: 3, minRounds: 6 },
  15: { hph: 6, fourT: 5, neutral: 4, minRounds: 7 },
  16: { hph: 7, fourT: 5, neutral: 4, minRounds: 7 },
  17: { hph: 7, fourT: 6, neutral: 4, minRounds: 7 },
  18: { hph: 7, fourT: 6, neutral: 5, minRounds: 7 },
  19: { hph: 8, fourT: 6, neutral: 5, minRounds: 8 },
  20: { hph: 8, fourT: 6, neutral: 6, minRounds: 8 },
};

// ============================================================================
// ROLES DEFINITION
// ============================================================================

export const HPVN_ROLES: Record<string, Role> = {
  // ========== HPH ROLES (15) ==========

  HARRY_POTTER: {
    id: 'HARRY_POTTER',
    name: 'Harry Potter',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Kẻ Được Chọn',
    description: 'Trái tim của chiến dịch. Nếu Harry chết, HPH vẫn thắng nếu giết được Voldemort.',
    ability: 'Target chính. Có Golden Flame bảo vệ 1 lần.',
    phaseType: 'PASSIVE',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  RON_WEASLEY: {
    id: 'RON_WEASLEY',
    name: 'Ron Weasley',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Người Bạn Trung Thành',
    description: 'Lá chắn sống của Harry.',
    ability: 'Tự động chết thay Harry khi Harry bị tấn công (1 lần).',
    phaseType: 'PASSIVE',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  HERMIONE_GRANGER: {
    id: 'HERMIONE_GRANGER',
    name: 'Hermione Granger',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Phù Thủy Uyên Bác',
    description: 'Scan danh tính mỗi đêm.',
    ability: 'Mỗi đêm, scan 1 người để biết role của họ (trừ Harry & Voldemort).',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  DUMBLEDORE: {
    id: 'DUMBLEDORE',
    name: 'Dumbledore',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Hiệu Trưởng Vĩ Đại',
    description: 'Phù thủy vĩ đại nhất.',
    ability: 'Mỗi đêm, bảo vệ 1 người khỏi bị giết (không bảo vệ 1 người 2 lần liên tiếp).',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  SNAPE: {
    id: 'SNAPE',
    name: 'Severus Snape',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Bậc Thầy Bế Quan Bí Thuật',
    description: 'Điệp viên hai mang.',
    ability: 'Bọc lót 1 người. Nếu họ bị tấn công, Snape cứu họ. Nếu không, người đó bị phong ấn 1 vòng.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  LUPIN: {
    id: 'LUPIN',
    name: 'Remus Lupin',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Người Sói Hào Hiệp',
    description: 'Sở hữu thuốc hồi sinh.',
    ability: 'Hồi sinh 1 người đã chết (1 lần duy nhất).',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  MOODY: {
    id: 'MOODY',
    name: 'Alastor Moody',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Thần Sáng Khét Tiếng',
    description: 'Sở hữu 1 phát súng.',
    ability: 'Bắn chết 1 người (1 lần). Nếu bắn nhầm HPH, Moody tự chết.',
    phaseType: 'DAY',
    canVote: true,
    canKill: true,
    isTargetable: true,
    isProtected: false,
  },

  HAGRID: {
    id: 'HAGRID',
    name: 'Rubeus Hagrid',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Người Lai Khổng Lồ',
    description: 'Thể lực phi thường.',
    ability: 'Phải bị tấn công 2 lần mới chết.',
    phaseType: 'PASSIVE',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  KINGSLEY: {
    id: 'KINGSLEY',
    name: 'Kingsley Shacklebolt',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Thần Sáng Hoàng Gia',
    description: 'Cứu sống đồng đội.',
    ability: 'Nếu HPH bị giết, Kingsley cứu họ (100%). Kingsley miễn nhiễm silence.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  FRED: {
    id: 'FRED',
    name: 'Fred Weasley',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Anh Em Sinh Đôi',
    description: 'Tặng kẹo ngất xỉu.',
    ability: 'Mỗi đêm, chọn 1 người. Họ mất quyền vote ở vòng tiếp theo.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  GEORGE: {
    id: 'GEORGE',
    name: 'George Weasley',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Anh Em Sinh Đôi',
    description: 'Rải bột khói Peru.',
    ability: 'Mỗi đêm, rải bột khói. 4T không giết được ai đêm đó. (Cooldown 1 đêm).',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  FLEUR: {
    id: 'FLEUR',
    name: 'Fleur Delacour',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Tình Yêu Veela',
    description: 'Lưỡi kiếm Gryffindor.',
    ability: 'Chặt 1 người (instant death). Nếu chặt nhầm, Fleur tự chết.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: true,
    isTargetable: true,
    isProtected: false,
  },

  BILL: {
    id: 'BILL',
    name: 'Bill Weasley',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Phá Bùa Cổ Xưa',
    description: 'Giải phong ấn.',
    ability: 'Giải phong ấn cho 1 người. Khi Bill chết, reveal 1 người 4T.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  TONKS: {
    id: 'TONKS',
    name: 'Nymphadora Tonks',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Phù Thủy Biến Hình',
    description: 'Kế thừa vai trò.',
    ability: 'Khi chết, chọn 1 người đã chết để kế thừa vai trò của họ.',
    phaseType: 'SPECIAL',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  POTTER_FAKE: {
    id: 'POTTER_FAKE',
    name: 'Bản Sao Harry',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Người Bảo Vệ',
    description: 'Đóng vai trò nghi binh.',
    ability: 'Chỉ vote. 1 lần, reveal làm 1 người 4T bị silenced vòng tiếp theo.',
    phaseType: 'SPECIAL',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  // ========== NEW HPH ROLES (2) ==========

  MCGONAGALL: {
    id: 'MCGONAGALL',
    name: 'McGonagall',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Giáo Sư McGonagall',
    description: 'Phong ấn kẻ thù.',
    ability: '1 lần, phong ấn 1 người 2 vòng. Người bị phong ấn không hành động được.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  NEVILLE: {
    id: 'NEVILLE',
    name: 'Neville Longbottom',
    faction: 'ORDER_OF_PHOENIX',
    title: 'Chàng Trai Dũng Cảm',
    description: 'Sức bền bất ngờ.',
    ability: 'Nếu sắp chết, 50% sống sót. Nếu sống, reveal 1 người 4T gần nhất.',
    phaseType: 'SPECIAL',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  // ========== 4T ROLES (5) ==========

  VOLDEMORT: {
    id: 'VOLDEMORT',
    name: 'Voldemort',
    faction: 'DEATH_EATERS',
    title: 'Chúa Tể Hắc Ám',
    description: 'Kẻ thống trị phe 4T.',
    ability: 'Kill 1 người mỗi đêm. Biết mặt đồng minh. Nếu Voldemort chết, 4T thua.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: true,
    isTargetable: true,
    isProtected: false,
  },

  BELLATRIX: {
    id: 'BELLATRIX',
    name: 'Bellatrix Lestrange',
    faction: 'DEATH_EATERS',
    title: 'Nữ Tử Thần Cuồng Tín',
    description: 'Báo thù khi chết.',
    ability: 'Khi bị vote, Voldemort được +1 kill đêm đó.',
    phaseType: 'PASSIVE',
    canVote: true,
    canKill: true,
    isTargetable: true,
    isProtected: false,
  },

  LUCIUS: {
    id: 'LUCIUS',
    name: 'Lucius Malfoy',
    faction: 'DEATH_EATERS',
    title: 'Quý Tộc Xảo Quyệt',
    description: 'Giáo sĩ thông minh.',
    ability: 'Scan 1 người mỗi đêm. Khi Lucius bị vote, Voldemort bị lock 1 đêm.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  PETTIGREW: {
    id: 'PETTIGREW',
    name: 'Peter Pettigrew',
    faction: 'DEATH_EATERS',
    title: 'Đuôi Trùn',
    description: 'Khứu giác chuột.',
    ability: 'Scan để biết Harry hoặc Ron. Khi sắp bị vote, có thể escape.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  DRACO: {
    id: 'DRACO',
    name: 'Draco Malfoy',
    faction: 'DEATH_EATERS',
    title: 'Kẻ Giả Dối',
    description: 'Điệp viên hai mang.',
    ability: 'Xem như HPH (fake role: Hagrid). Scan như Hermione nhưng cho kết quả giả.',
    phaseType: 'NIGHT',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },

  // ========== NEUTRAL ROLES (2) ==========

  JESTER: {
    id: 'JESTER',
    name: 'Jester',
    faction: 'NEUTRAL',
    title: 'Kẻ Hề Điên',
    description: 'Muốn bị treo cổ.',
    ability: 'WIN nếu bị VOTE treo cổ (không phải kill đêm).',
    phaseType: 'PASSIVE',
    canVote: true,
    canKill: false,
    isTargetable: true,
    isProtected: false,
  },
};

// ============================================================================
// CHAOS EVENTS
// ============================================================================

export const CHAOS_EVENTS: ChaosEvent[] = [
  {
    id: 'LIGHT_SHIELD',
    name: 'Shield of Light',
    description: '1 người random được bảo vệ đêm nay!',
    effect: 'SHIELD',
    probability: 0.20,
  },
  {
    id: 'DARK_VISION',
    name: 'Dark Vision',
    description: '1 người random biết 1 role!',
    effect: 'INFO',
    probability: 0.15,
  },
  {
    id: 'VOTE_SILENCE',
    name: 'Voice Curse',
    description: '1 người random mất quyền vote!',
    effect: 'SILENCE',
    probability: 0.15,
  },
  {
    id: 'NO_EVENT',
    name: 'Peaceful Night',
    description: 'Đêm nay yên bình...',
    effect: 'NONE',
    probability: 0.50,
  },
];

// ============================================================================
// ROLE POOLS
// ============================================================================

const HPH_POOL = [
  'HARRY_POTTER', 'RON_WEASLEY', 'HERMIONE_GRANGER', 'DUMBLEDORE',
  'SNAPE', 'LUPIN', 'MOODY', 'HAGRID', 'KINGSLEY',
  'FRED', 'GEORGE', 'FLEUR', 'BILL', 'TONKS', 'POTTER_FAKE',
  'MCGONAGALL', 'NEVILLE'
];

const FOURT_POOL = ['VOLDEMORT', 'BELLATRIX', 'LUCIUS', 'PETTIGREW', 'DRACO'];

const NEUTRAL_POOL = ['JESTER'];

// ============================================================================
// GAME ENGINE
// ============================================================================

export class HPVNGameEngine {
  private state: GameState;

  constructor(playerCount: number, settings?: Partial<GameState>) {
    const balance = HPVN_BALANCE[playerCount] || HPVN_BALANCE[10];

    this.state = {
      mode: 'HPVN',
      roomCode: this.generateRoomCode(),
      players: [],
      currentRound: 1,
      minRounds: balance.minRounds,
      phase: 'LOBBY',
      maxPlayers: playerCount,
      enableGhostVoting: settings?.enableGhostVoting ?? true,
      enableChaosEvents: settings?.enableChaosEvents ?? true,
      darkPactProtection: settings?.darkPactProtection ?? true,
      currentEvent: null,
      nightActions: [],
      votes: [],
      deaths: [],
      protectedThisRound: [],
      winners: [],
      logs: [],
      hphAlive: 0,
      fourTAlive: 0,
      neutralAlive: 0,
      ghosts: [],
    };
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // Shuffle array
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Initialize game with players
  initializeGame(playerNames: string[]): void {
    const balance = HPVN_BALANCE[this.state.maxPlayers];

    // Create players
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player_${index}`,
      name,
      role: null,
      faction: 'ORDER_OF_PHOENIX' as Faction,
      status: 'ALIVE' as PlayerStatus,
      hp: 1,
      isProtected: false,
      isSilenced: false,
      isRevealed: false,
      hasVoted: false,
      voteCount: 0,
      abilities: {
        ronSacrificeUsed: false,
        goldenFlameUsed: false,
        snapeBladeActive: false,
        lupinPotionUsed: false,
        moodyBulletUsed: false,
        billRevealUsed: false,
        mcGonagallSealUsed: false,
        mcGonagallSealTarget: null,
        mcGonagallSealRounds: 0,
        dracoScanUsed: false,
        dracoFaction: null,
      },
    }));

    // Assign roles
    this.assignRoles(players, balance);

    this.state.players = players;
    this.updateFactionCounts();
    this.addLog('Game initialized', 'NIGHT');
  }

  private assignRoles(players: Player[], balance: typeof HPVN_BALANCE[10]): void {
    // Shuffle players
    const shuffledPlayers = this.shuffle(players);

    // Always include Harry and Ron
    const harry = shuffledPlayers.find(p => p.name.includes('Harry')) || shuffledPlayers[0];
    const ron = shuffledPlayers.find(p => p.name.includes('Ron')) || shuffledPlayers[1];

    harry.role = HPVN_ROLES.HARRY_POTTER;
    harry.faction = 'ORDER_OF_PHOENIX';
    ron.role = HPVN_ROLES.RON_WEASLEY;
    ron.faction = 'ORDER_OF_PHOENIX';

    // Assign 4T roles
    const available4T = this.shuffle(FOURT_POOL);
    let fourTAssigned = 0;
    for (const player of shuffledPlayers) {
      if (fourTAssigned >= balance.fourT) break;
      if (player.role) continue;

      player.role = HPVN_ROLES[available4T[fourTAssigned]];
      player.faction = 'DEATH_EATERS';
      fourTAssigned++;
    }

    // Assign Neutral roles
    const availableNeutral = this.shuffle(NEUTRAL_POOL);
    let neutralAssigned = 0;
    for (const player of shuffledPlayers) {
      if (neutralAssigned >= balance.neutral) break;
      if (player.role) continue;

      player.role = HPVN_ROLES[availableNeutral[neutralAssigned]];
      player.faction = 'NEUTRAL';
      neutralAssigned++;
    }

    // Assign remaining HPH roles
    const availableHPH = this.shuffle(HPH_POOL).filter(r => r !== 'HARRY_POTTER' && r !== 'RON_WEASLEY');
    let hphAssigned = 2; // Harry and Ron already assigned
    for (const player of shuffledPlayers) {
      if (hphAssigned >= balance.hph + 2) break;
      if (player.role) continue;

      player.role = HPVN_ROLES[availableHPH[hphAssigned - 2]];
      player.faction = 'ORDER_OF_PHOENIX';
      hphAssigned++;
    }

    // Draco special: fake as Hagrid
    const draco = this.state.players.find(p => p.role?.id === 'DRACO');
    if (draco) {
      draco.abilities.dracoFaction = 'ORDER_OF_PHOENIX'; // Fake as HPH
    }
  }

  private updateFactionCounts(): void {
    const alive = this.state.players.filter(p => p.status === 'ALIVE');
    this.state.hphAlive = alive.filter(p => p.faction === 'ORDER_OF_PHOENIX').length;
    this.state.fourTAlive = alive.filter(p => p.faction === 'DEATH_EATERS').length;
    this.state.neutralAlive = alive.filter(p => p.faction === 'NEUTRAL').length;
  }

  private addLog(message: string, phase: GamePhase): void {
    this.state.logs.push({
      round: this.state.currentRound,
      phase,
      message,
      timestamp: Date.now(),
    });
  }

  // ============================================================================
  // PHASE MANAGEMENT
  // ============================================================================

  startGame(): void {
    this.state.phase = 'NIGHT';
    this.addLog('Night begins - 4T choose their target', 'NIGHT');
  }

  // Night phase: collect actions
  submitNightAction(playerId: string, action: NightAction): void {
    const existingIndex = this.state.nightActions.findIndex(a => a.playerId === playerId);
    if (existingIndex >= 0) {
      this.state.nightActions[existingIndex] = action;
    } else {
      this.state.nightActions.push(action);
    }
  }

  // Process night phase
  processNightPhase(): void {
    this.state.phase = 'CHAOS_EVENT';
    this.addLog('Night actions collected', 'NIGHT');

    // Check for chaos events
    if (this.state.enableChaosEvents) {
      this.processChaosEvent();
    }
  }

  // Chaos event
  private processChaosEvent(): void {
    const roll = Math.random();
    let cumulative = 0;

    for (const event of CHAOS_EVENTS) {
      cumulative += event.probability;
      if (roll < cumulative) {
        this.state.currentEvent = event;
        this.addLog(`🎲 CHAOS EVENT: ${event.description}`, 'CHAOS_EVENT');

        // Apply event effects
        this.applyChaosEvent(event);
        break;
      }
    }

    this.state.phase = 'DEATH_RESOLUTION';
  }

  private applyChaosEvent(event: ChaosEvent): void {
    const alivePlayers = this.state.players.filter(p => p.status === 'ALIVE');
    if (alivePlayers.length === 0) return;

    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

    switch (event.effect) {
      case 'SHIELD':
        this.state.protectedThisRound.push(randomPlayer.id);
        randomPlayer.isProtected = true;
        break;
      case 'SILENCE':
        randomPlayer.isSilenced = true;
        this.addLog(`🔇 ${randomPlayer.name} bị nguyền rủa - mất quyền vote!`, 'CHAOS_EVENT');
        break;
      case 'INFO':
        // Info effect handled separately
        this.addLog(`👁️ ${randomPlayer.name} nhận được thị kiến...`, 'CHAOS_EVENT');
        break;
    }
  }

  // Death resolution
  processDeathResolution(): void {
    this.state.deaths = [];

    // Process 4T kill
    const fourTActions = this.state.nightActions.filter(a => a.actionType === 'KILL');
    if (fourTActions.length > 0 && !this.state.protectedThisRound.includes(fourTActions[0].targetId || '')) {
      this.processKill(fourTActions[0].targetId!, 'KILL', fourTActions[0].playerId);
    }

    // Check protected
    // Check golden flame
    // Check Ron sacrifice
    // Check Kingsley save
    // Check McGonagall seal

    this.updateFactionCounts();
    this.state.phase = 'GHOST_REVELATION';
  }

  private processKill(targetId: string, reason: Death['reason'], killerId: string): void {
    const target = this.state.players.find(p => p.id === targetId);
    if (!target || target.status !== 'ALIVE') return;

    // Check protection layers
    if (target.isProtected) {
      this.addLog(`🛡️ ${target.name} được bảo vệ!`, 'DEATH_RESOLUTION');
      return;
    }

    // Check Golden Flame (Harry)
    if (target.role?.id === 'HARRY_POTTER' && !target.abilities.goldenFlameUsed) {
      target.abilities.goldenFlameUsed = true;
      this.addLog(`🔥 TIA LỬA VÀNG cứu Harry!`, 'DEATH_RESOLUTION');
      return;
    }

    // Check Ron Sacrifice
    if (target.role?.id === 'HARRY_POTTER') {
      const ron = this.state.players.find(p => p.role?.id === 'RON_WEASLEY' && p.status === 'ALIVE');
      if (ron && !ron.abilities.ronSacrificeUsed) {
        ron.abilities.ronSacrificeUsed = true;
        ron.status = 'DEAD';
        this.state.deaths.push({ playerId: ron.id, reason: 'SACRIFICE', killerId: killerId });
        this.addLog(`💀 Ron hy sinh thay Harry!`, 'DEATH_RESOLUTION');
      }
    }

    // Check Kingsley save
    const kingsley = this.state.players.find(p => p.role?.id === 'KINGSLEY' && p.status === 'ALIVE');
    if (kingsley && target.faction === 'ORDER_OF_PHOENIX') {
      this.addLog(`🛡️ Kingsley cứu ${target.name}!`, 'DEATH_RESOLUTION');
      return;
    }

    // Check McGonagall seal
    if (target.abilities.mcGonagallSealRounds > 0) {
      this.addLog(`🔒 ${target.name} bị phong ấn - không thể chết!`, 'DEATH_RESOLUTION');
      return;
    }

    // Kill target
    target.status = 'DEAD';
    this.state.deaths.push({ playerId: targetId, reason, killerId });
    this.addLog(`💀 ${target.name} chết (${reason})`, 'DEATH_RESOLUTION');

    // Ghost conversion
    if (this.state.enableGhostVoting) {
      target.status = 'GHOST';
      this.state.ghosts.push(targetId);
    }
  }

  // Vote phase
  processVotePhase(): void {
    this.state.phase = 'VOTE';
    this.addLog('Day vote begins', 'VOTE');
  }

  submitVote(playerId: string, targetId: string): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return;

    // Check if can vote
    if (player.status === 'DEAD' && !this.state.enableGhostVoting) return;
    if (player.isSilenced) return;

    const isGhost = player.status === 'GHOST';
    const votePower = isGhost ? 0.5 : 1;

    this.state.votes.push({
      playerId,
      targetId,
      isGhostVote: isGhost,
      power: votePower,
    });

    player.hasVoted = true;

    if (targetId !== 'NONE') {
      const target = this.state.players.find(p => p.id === targetId);
      if (target) {
        target.voteCount += votePower;
      }
    }
  }

  processVotes(): void {
    // Find highest vote
    let maxVotes = 0;
    let lynchedId: string | null = null;

    for (const player of this.state.players) {
      if (player.voteCount > maxVotes) {
        maxVotes = player.voteCount;
        lynchedId = player.id;
      }
    }

    // Check for majority
    const alivePlayers = this.state.players.filter(p => p.status === 'ALIVE').length;
    const neededVotes = Math.ceil(alivePlayers / 2);

    if (lynchedId && maxVotes >= neededVotes) {
      const lynched = this.state.players.find(p => p.id === lynchedId);
      if (lynched) {
        // Jester win condition
        if (lynched.role?.id === 'JESTER') {
          this.state.winners = ['JESTER'];
          this.addLog(`🎭 JESTER THẮNG! Bị vote treo cổ!`, 'GAME_OVER');
          this.state.phase = 'GAME_OVER';
          return;
        }

        // Bellatrix revenge
        if (lynched.role?.id === 'BELLATRIX') {
          // Extra kill from Voldemort
          this.addLog(`🗡️ Bellatrix báo thù! Voldemort được +1 kill!`, 'VOTE');
        }

        // Process death
        this.processKill(lynchedId, 'VOTE', 'VOTE');
      }
    }

    this.updateFactionCounts();
    this.checkWinCondition();
  }

  private checkWinCondition(): void {
    const harry = this.state.players.find(p => p.role?.id === 'HARRY_POTTER');
    const voldemort = this.state.players.find(p => p.role?.id === 'VOLDEMORT');

    // Harry dead = 4T wins
    if (harry?.status === 'DEAD' || harry?.status === 'GHOST') {
      this.state.winners = ['FOUR_T'];
      this.addLog(`🐍 4T THẮNG! Harry đã chết!`, 'GAME_OVER');
      this.state.phase = 'GAME_OVER';
      return;
    }

    // Voldemort dead = HPH wins
    if (voldemort?.status === 'DEAD' || voldemort?.status === 'GHOST') {
      this.state.winners = ['HPH'];
      this.addLog(`🦅 HPH THẮNG! Voldemort đã bị tiêu diệt!`, 'GAME_OVER');
      this.state.phase = 'GAME_OVER';
      return;
    }

    // Min rounds reached
    if (this.state.currentRound >= this.state.minRounds) {
      this.state.winners = ['HPH'];
      this.addLog(`🦅 HPH THẮNG! Harry sống đến Round ${this.state.minRounds}!`, 'GAME_OVER');
      this.state.phase = 'GAME_OVER';
      return;
    }

    // 4T >= HPH (after round 2)
    if (this.state.currentRound >= 2 && this.state.fourTAlive >= this.state.hphAlive) {
      this.state.winners = ['FOUR_T'];
      this.addLog(`🐍 4T THẮNG! Số lượng áp đảo!`, 'GAME_OVER');
      this.state.phase = 'GAME_OVER';
      return;
    }

    // Continue to next round
    this.nextRound();
  }

  private nextRound(): void {
    this.state.currentRound++;
    this.state.phase = 'NIGHT';
    this.state.votes = [];
    this.state.nightActions = [];
    this.state.currentEvent = null;
    this.state.protectedThisRound = [];

    // Reset player states
    for (const player of this.state.players) {
      player.hasVoted = false;
      player.voteCount = 0;
      player.isProtected = false;
      player.isSilenced = false;

      // Decrease McGonagall seal
      if (player.abilities.mcGonagallSealRounds > 0) {
        player.abilities.mcGonagallSealRounds--;
      }
    }

    // Reset George cooldown (every other round)
    // This would be handled in actions

    this.addLog(`🌅 Round ${this.state.currentRound} begins`, 'NIGHT');
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  getState(): GameState {
    return this.state;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.state.players.find(p => p.id === playerId);
  }

  getAlivePlayers(): Player[] {
    return this.state.players.filter(p => p.status === 'ALIVE');
  }

  getHPHPlayers(): Player[] {
    return this.state.players.filter(p =>
      (p.status === 'ALIVE' || p.status === 'GHOST') &&
      p.faction === 'ORDER_OF_PHOENIX'
    );
  }

  get4TPlayers(): Player[] {
    return this.state.players.filter(p =>
      (p.status === 'ALIVE' || p.status === 'GHOST') &&
      p.faction === 'DEATH_EATERS'
    );
  }

  getNeutralPlayers(): Player[] {
    return this.state.players.filter(p =>
      (p.status === 'ALIVE' || p.status === 'GHOST') &&
      p.faction === 'NEUTRAL'
    );
  }
}
