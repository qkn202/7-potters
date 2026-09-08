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
  avatarUrl?: string;
}

export type GamePhase = 'LOBBY' | 'DAY' | 'NIGHT' | 'END';

export interface GameState {
  players: Player[];
  phase: GamePhase;
  round: number;
  logs: string[];
  winner: Faction | null;
  pendingActions: Record<string, { actionName: string, targetId: string }>;
  resolutionReport: ResolutionReport | null;
  skillStates: Record<string, boolean | string>; // Lưu trạng thái dùng skill (VD: 'playerID_LUPIN': true, 'DUMBLEDORE_R1': 'targetId')
  interruptState: InterruptState | null;
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
  | 'INTERRUPT_CHOICE_SUBMIT'
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


