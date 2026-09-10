export type Faction = 'ORDER_OF_PHOENIX' | 'DEATH_EATERS' | 'NEUTRAL';

export type RoleId = string;

export interface Role {
  id: RoleId;
  name: string;
  faction: Faction;
  description: string;
  ability?: string;
  title?: string;
  phaseType?: 'DAY' | 'NIGHT' | 'PASSIVE' | 'SPECIAL';
  tacticalTip?: string;
  flavorQuote?: string;
  badge?: string;
  cardNumber?: string;
  image?: string;
}



export type PlayerStatus = 'ALIVE' | 'INJURED' | 'DEAD';

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  status: PlayerStatus;
  isGM: boolean;
  isBot?: boolean;
  avatarUrl?: string;
  house?: string;
  userTag?: string;
  hpvnUid?: string;
}

export type GamePhase = 'LOBBY' | 'DAY' | 'NIGHT' | 'END';

export type WeasleyItemId = 'DARKNESS_POWDER' | 'FAINTING_FANCIES' | 'TWO_WAY_MIRROR';

export interface WeasleyItem {
  id: WeasleyItemId;
  name: string;
  count: number;
  maxCount: number;
  description: string;
  flavor: string;
  icon: string;
  phaseAllowed: 'DAY' | 'NIGHT' | 'ANY';
}

export interface SkyEvent {
  stage: number;
  title: string;
  subtitle: string;
  description: string;
  tacticalTip: string;
  modifier: 'PERFECT_DISGUISE' | 'TURBULENCE_BLIND' | 'VOLDEMORT_AMBUSH' | 'BURROW_SHIELD' | 'SAFE_HAVEN' | 'APPROACH_SHIELD';
  icon: string;
  badgeText: string;
}

export type ActiveVisualFXType = 
  | 'GOLDEN_FLAME'          // Tia Lửa Vàng Phượng Hoàng & Đũa phép Lucius nổ
  | 'LIGHTNING_STRIKE'      // Tia chớp định mệnh giáng xuống Harry
  | 'AVADA_KEDAVRA'         // Lời nguyền chết chóc xanh lục
  | 'PERUVIAN_DARKNESS'     // Bột khói mù Peru tím đen cuộn trào
  | 'THUNDERSTORM_STAGE'    // Chặng 2: Mây giông sấm chớp rạch trời
  | 'DARK_MARK_AMBUSH'      // Chặng 3: Voldemort phục kích & Dấu hiệu Hắc Ám
  | 'BURROW_SHIELD'         // Chặng Đích: Hàng rào bùa chú Hang Sóc vàng kim
  | 'TWO_WAY_MIRROR';       // Gương hai chiều gợn sóng ma thuật

export interface ActiveVisualFX {
  id: string;
  type: ActiveVisualFXType;
  title: string;
  subtitle?: string;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  phase: GamePhase;
  round: number;
  flightStage: number; // Chặng hiện tại
  maxStages: number; // Tổng số chặng (4, 5, hoặc 6 tùy theo sĩ số phòng)
  currentSkyEvent?: SkyEvent;
  escortPairs?: Record<string, string>; // Mapping: actorId -> targetId (ai đang bay hộ tống ai)
  goldenFlameUsed: boolean; // Kích hoạt 1 lần duy nhất khi Harry bị tấn công chí mạng
  weasleyItems: WeasleyItem[];
  logs: string[];
  winner: Faction | null;
  pendingActions: Record<string, { actionName: string, targetId: string }>;
  resolutionReport: ResolutionReport | null;
  skillStates: Record<string, boolean | string>; // Lưu trạng thái dùng skill (VD: 'playerID_LUPIN': true, 'DUMBLEDORE_R1': 'targetId')
  interruptState: InterruptState | null;
  activeFX?: ActiveVisualFX | null;
}

export interface InterruptState {
  playerId: string;
  type: 'MUNDUNGUS_SWAP' | 'TONKS_MORPH';
  reason: string;
}

export interface ResolutionReport {
  summary: string[];
  deadPlayers: string[];
  injuredPlayers?: string[];
  needsInterrupt: InterruptState | null;
  newSkillStates?: Record<string, boolean | string>;
}

export type NetworkMessageType =
  | 'JOIN_REQUEST'
  | 'ROOM_STATE_SYNC'
  | 'ACTION_SUBMIT'
  | 'INSTANT_SKILL_SUBMIT'
  | 'INSTANT_SKILL_RESULT'
  | 'INTERRUPT_CHOICE_SUBMIT'
  | 'USE_WEASLEY_ITEM'
  | 'ESCORT_SUBMIT'
  | 'KICK_PLAYER'
  | 'PLAYER_LEFT'
  | 'HOST_DISCONNECTED'
  | 'HOST_RECONNECTED'
  | 'PING';

export interface NetworkMessage {
  type: NetworkMessageType;
  senderId: string;
  payload: any;
}


