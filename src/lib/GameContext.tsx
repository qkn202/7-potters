"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, GamePhase, Faction, Role, NetworkMessage, WeasleyItem, WeasleyItemId, SkyEvent, ActiveVisualFX, ActiveVisualFXType, InterruptState, RoleHistoryEntry } from './types';
import { ROLES } from './roles';
import { SevenPottersNetwork } from './peerNetwork';

export interface GameContextType {
  gameState: GameState;
  currentPlayerId: string | null;
  roomCode: string | null;
  isHost: boolean;
  connStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  errorMsg: string | null;
  offlinePlayerIds: string[];
  hostDisconnectedAt: number | null;
  disconnectCountdown: number | null;

  createRoom: (name: string, isGM: boolean, extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }) => Promise<string>;
  joinRoom: (roomCode: string, name: string, isGM: boolean, extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }) => Promise<boolean>;
  joinGame: (name: string, isGM: boolean, extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }) => void;
  leaveGame: () => void;
  startGame: () => void;
  setPhase: (phase: GamePhase) => void;
  assignRoles: () => void;
  addBot: () => void;
  kickPlayer: (playerId: string) => void;
  killPlayer: (playerId: string) => void;
  impersonatePlayer: (playerId: string) => void;
  playerAction: (actionName: string, targetId: string) => void;
  revivePlayer: (playerId: string) => void;
  resetGame: () => void;
  calculateResolution: () => void;
  applyResolution: () => void;
  executeInstantSkill: (actionName: string, targetId: string) => string | void;
  resolveInterrupt: (choiceId: string) => void;
  simulateBotActions: () => void;
  skillToast: string | null;
  clearSkillToast: () => void;
  consumeWeasleyItem: (itemId: WeasleyItemId, targetId?: string) => string | void;
  triggerVisualFX: (fx: ActiveVisualFX) => void;
  clearVisualFX: () => void;
  startQuickSoloGame: () => void;
}

export const INITIAL_WEASLEY_ITEMS: WeasleyItem[] = [
  {
    id: 'DARKNESS_POWDER',
    name: 'Bột Khói Mù Peru',
    count: 1,
    maxCount: 1,
    description: 'Che phủ bầu trời đêm bằng bóng tối ma thuật. Vô hiệu hóa toàn bộ các cuộc ám sát của Tử Thần Thực Tử trong đêm hiện tại.',
    flavor: 'Hàng nhập khẩu chất lượng cao từ Peru, món đồ ưa thích của Fred và George Weasley.',
    icon: 'CloudFog',
    phaseAllowed: 'ANY',
  },
  {
    id: 'FAINTING_FANCIES',
    name: 'Kẹo Ngất Xỉu Cấp Tốc',
    count: 1,
    maxCount: 1,
    description: 'Chỉ định 1 người chơi bị ngất tức thì do sốt cao. Người này mất toàn bộ quyền biểu quyết trong đêm phán quyết hiện tại.',
    flavor: 'Kẹo thuộc Hộp Bỏ Tiết Bán Chạy Nhất (Skiving Snackboxes) của tiệm Phù Thủy Quỷ Quái.',
    icon: 'Flame',
    phaseAllowed: 'ANY',
  },
];

export const SKY_EVENTS: Record<number, SkyEvent> = {
  1: {
    stage: 1,
    title: 'Bầu Trời Surrey Tĩnh Lặng',
    subtitle: 'Rời số 4 Privet Drive · Kế Sách Đa Quả Dịch',
    description: 'Bầu trời Surrey tĩnh mịch. Bảy Potter chia thành các cặp bay tản ra các hướng. Đa Quả Dịch phát huy tác dụng hoàn hảo.',
    tacticalTip: 'Tử Thần Thực Tử chưa phân biệt được ai là Harry thật. Nếu mục tiêu có người bay hộ tống, cả hai sẽ liệng chổi né đòn an toàn!',
    modifier: 'PERFECT_DISGUISE',
    icon: 'Moon',
    badgeText: '🛡️ ĐA QUẢ DỊCH BẢO VỆ',
  },
  2: {
    stage: 2,
    title: 'Tầng Mây Giông & Sấm Chớp',
    subtitle: 'Nghẽn Khí Quyển · Phục Kích Bất Ngờ',
    description: 'Mây đen cuồn cuộn kèm sấm sét dữ dội. Bầu trời tối sầm, tiếng chổi xé gió trong giông bão hỗn loạn.',
    tacticalTip: 'Tầm nhìn mù mịt: Người bay hộ tống có thể liệng vào tầng mây chắn gió, làm chệch hướng đòn tấn công nổ tung giữa không trung!',
    modifier: 'TURBULENCE_BLIND',
    icon: 'CloudLightning',
    badgeText: '⚡ MÂY BÃO HỖN LOẠN',
  },
  3: {
    stage: 3,
    title: 'Vòng Vây Hắc Ám & Phục Kích',
    subtitle: 'Tử Thần Tái Hiện · Voldemort Xuất Kích',
    description: 'Chúa tể Hắc ám đích thân bay tới không cần chổi! Bầu trời rực sáng tia chớp xanh của thần chú chết chóc Avada Kedavra.',
    tacticalTip: 'Tình thế ngàn cân treo sợi tóc: Người hộ tống sẽ dũng cảm lấy thân mình chắn đòn chí mạng để bảo vệ mục tiêu!',
    modifier: 'VOLDEMORT_AMBUSH',
    icon: 'Skull',
    badgeText: '💀 VOLDEMORT TRUY SÁT',
  },
  4: {
    stage: 4,
    title: 'Trạm Trung Chuyển Nhà Tonks',
    subtitle: 'Hạ Cánh Sơ Cứu · Đa Quả Dịch Tan Biến',
    description: 'Các cặp đôi đáp khẩn cấp xuống nhà bố mẹ Tonks để sơ cứu thương binh trước khi tiếp tục hành trình Khóa Cảng.',
    tacticalTip: 'Trạm an toàn tạm thời: Đa Quả Dịch hết tác dụng, các Harry dần hiện nguyên hình. Hãy cẩn trọng trước vòng vây tiếp theo!',
    modifier: 'SAFE_HAVEN',
    icon: 'Home',
    badgeText: '🏡 TRẠM AN TOÀN TẠM THỜI',
  },
  5: {
    stage: 5,
    title: 'Trạm Khóa Cảng Hội Ngộ',
    subtitle: 'Đếm Ngược Khóa Cảng · Vòng Vây Cuối',
    description: 'Những chiếc Khóa Cảng bí mật đang phát sáng đếm ngược. Toàn bộ phi đội dồn sức mở đường máu tiếp cận điểm chạm.',
    tacticalTip: 'Phối hợp di chuyển: Người bay hộ tống che chắn toàn lực để đưa đồng đội chạm vào Khóa Cảng an toàn!',
    modifier: 'APPROACH_SHIELD',
    icon: 'Key',
    badgeText: '🔑 KHÓA CẢNG KÍCH HOẠT',
  },
  6: {
    stage: 6,
    title: 'Hàng Rào Bảo Vệ Hang Sóc',
    subtitle: 'Trang Trại Weasley · Khóa Cảng Đích Đến',
    description: 'Hào quang bảo vệ của Trang Trại Hang Sóc đã hiện ra ngay trước mắt! Tiếp đất an toàn vào kết giới cổ xưa.',
    tacticalTip: 'Vòng Quyết Đấu Cuối Cùng: Nếu Harry Potter sống sót qua đêm phán quyết này, Hội Phượng Hoàng lập tức giành Chiến Thắng Tuyệt Đối!',
    modifier: 'BURROW_SHIELD',
    icon: 'ShieldCheck',
    badgeText: '🏰 TIẾP ĐẤT AN TOÀN',
  },
};

export const getSkyEventForStage = (stage: number, maxStages: number = 4): SkyEvent => {
  const current = Math.max(1, stage || 1);
  const total = Math.max(4, maxStages || 4);

  if (current >= total) {
    return {
      ...SKY_EVENTS[6],
      stage: total,
    };
  }
  if (total === 4) {
    if (current === 1) return SKY_EVENTS[1];
    if (current === 2) return SKY_EVENTS[2];
    if (current === 3) return SKY_EVENTS[3];
    return SKY_EVENTS[6];
  }
  if (total === 5) {
    if (current === 1) return SKY_EVENTS[1];
    if (current === 2) return SKY_EVENTS[2];
    if (current === 3) return SKY_EVENTS[3];
    if (current === 4) return SKY_EVENTS[5];
    return SKY_EVENTS[6];
  }
  // total === 6
  return SKY_EVENTS[current] || SKY_EVENTS[6];
};

const DEFAULT_STATE: GameState = {
  players: [],
  phase: 'LOBBY',
  round: 0,
  flightStage: 1,
  maxStages: 4,
  currentSkyEvent: SKY_EVENTS[1],
  escortPairs: {},
  goldenFlameUsed: false,
  weasleyItems: INITIAL_WEASLEY_ITEMS,
  logs: ['Hệ thống: Chào mừng đến với Chiến dịch Bảy Potter!'],
  winner: null,
  pendingActions: {},
  resolutionReport: null,
  skillStates: {},
  interruptState: null,
  activeFX: null,
  previousRoleMap: {},
  roleHistory: {},
};

// Helper to normalize action names for consistent comparison (case-insensitive)
const normalizeAction = (actionName: string): string => actionName.toLowerCase().trim();
const isKillAction = (actionName: string): boolean => normalizeAction(actionName) === 'giết';
const isVoteAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n === 'biểu quyết tước đũa' || n === 'bỏ phiếu treo cổ';
};
const isEscortAction = (actionName: string): boolean => normalizeAction(actionName) === 'bay hộ tống';
const isProtectAction = (actionName: string): boolean => normalizeAction(actionName) === 'bảo vệ';
const isHagridEscortAction = (actionName: string): boolean => normalizeAction(actionName) === 'bảo kê';
const isKingsleyAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n === 'chỉ huy ứng cứu' || n === 'ứng cứu' || n === 'cứu sống' || n === 'chỉ huy phản công' || n === 'kingsley kích hoạt';
};
const isSectumsempraAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n.includes('sectumsempra') || n.includes('bọc lót');
};
const isReviveAction = (actionName: string): boolean => normalizeAction(actionName).includes('hồi sinh');

const GameContext = createContext<GameContextType | undefined>(undefined);

export const checkWinCondition = (players: Player[], flightStage?: number, maxStages?: number): Faction | null => {
  const nonGmPlayers = players.filter(p => !p.isGM);
  const alivePlayers = nonGmPlayers.filter(p => p.status !== 'DEAD');
  const deathEaters = alivePlayers.filter(p => p.role?.faction === 'DEATH_EATERS');
  const others = alivePlayers.filter(p => p.role?.faction !== 'DEATH_EATERS');
  const hph = alivePlayers.filter(p => p.role?.faction === 'ORDER_OF_PHOENIX');
  const neutrals = alivePlayers.filter(p => p.role?.faction === 'NEUTRAL');

  if (nonGmPlayers.length > 0 && alivePlayers.length === 0) {
    return 'NEUTRAL';
  }

  const hadVoldemort = nonGmPlayers.some(p => p.role?.id === 'VOLDEMORT');
  const aliveVoldemort = alivePlayers.find(p => p.role?.id === 'VOLDEMORT');
  if (hadVoldemort && !aliveVoldemort) {
    return 'ORDER_OF_PHOENIX';
  }
  
  // LORE WIN CONDITION: Đạt Chặng Đích Hang Sóc (flightStage >= maxStages)
  const targetStage = maxStages || 4;
  const aliveHarry = alivePlayers.find(p => p.role?.id === 'HARRY_POTTER');
  if ((flightStage || 1) >= targetStage && hph.length > 0) {
    if (aliveHarry) {
      return 'ORDER_OF_PHOENIX';
    } else {
      return 'DEATH_EATERS';
    }
  }

  if (deathEaters.length >= others.length && deathEaters.length > 0) return 'DEATH_EATERS';
  if (deathEaters.length === 0 && hph.length > 0) return 'ORDER_OF_PHOENIX';
  if (deathEaters.length === 0 && hph.length === 0 && neutrals.length > 0) return 'NEUTRAL';
  return null;
};

export const validateWeasleyItemUse = (
  actor: Player,
  item: WeasleyItem,
  currentPhase: GamePhase
): { allowed: boolean; message?: string } => {
  if (actor.status === 'DEAD' || actor.isGM) {
    return { allowed: false, message: 'Chỉ người chơi còn sống mới có thể dùng bảo bối!' };
  }

  // Phương án A: Chỉ phe Hội Phượng Hoàng hoặc Trung Lập mới có thể kích hoạt bảo bối Weasley.
  // Tử Thần Thực Tử bị chặn lại bởi bùa chống trộm ma thuật của Fred & George Weasley.
  if (actor.role?.faction === 'DEATH_EATERS') {
    return {
      allowed: false,
      message: '⚠️ Bảo bối bị kẹt cơ quan ma pháp! Bùa chống trộm của Fred & George Weasley chỉ chấp nhận thành viên Hội Phượng Hoàng!'
    };
  }

  if (item.count <= 0) {
    return { allowed: false, message: `Vật phẩm "${item.name}" đã được sử dụng hết trong trận này!` };
  }

  if (item.phaseAllowed !== 'ANY' && item.phaseAllowed !== currentPhase) {
    return {
      allowed: false,
      message: `Vật phẩm "${item.name}" chỉ được kích hoạt trong pha ${item.phaseAllowed === 'DAY' ? 'Ban Ngày' : 'Ban Đêm'}!`
    };
  }

  return { allowed: true };
};

/**
 * Fisher-Yates (Knuth) unbiased array shuffle algorithm.
 * Guarantees every permutation has exactly 1 / n! uniform probability.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Lấy hoặc tạo mã định danh thiết bị cố định (Persistent Device ID)
 * Đảm bảo 1 thiết bị/trình duyệt luôn giữ nguyên định danh qua F5, đổi tab, chuyển phòng.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    let id = localStorage.getItem('seven-potters-device-id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('seven-potters-device-id', id);
    }
    return id;
  } catch {
    return 'temp_device';
  }
}

/**
 * Lấy lịch sử vai trò cá nhân của người chơi lưu trên Client
 */
export function getPersonalHistory(): RoleHistoryEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('seven-potters-personal-history');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Lưu lịch sử vai trò cá nhân của người chơi lên Client (bảo lưu khi đổi phòng)
 */
export function savePersonalHistory(entry: RoleHistoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('seven-potters-personal-history', JSON.stringify(entry));
  } catch {}
}

/**
 * Trích xuất định danh bền vững cho người chơi (persistent player key)
 * Ưu tiên hpvnUid -> deviceId -> userTag -> name (chuẩn hóa thường) -> id
 * Đảm bảo người chơi F5/refresh hoặc rejoin vẫn giữ nguyên lịch sử vai trò.
 */
export function getPlayerKey(player: { id: string; name: string; hpvnUid?: string; userTag?: string; deviceId?: string }): string {
  if (player.hpvnUid) return `hpvn_${player.hpvnUid}`;
  if (player.deviceId) return `dev_${player.deviceId}`;
  if (player.userTag) return `tag_${player.userTag.trim().toLowerCase()}`;
  if (player.name && player.name.trim()) return `name_${player.name.trim().toLowerCase()}`;
  return player.id;
}

/**
 * Calculates a penalty score for an assignment based on anti-repetition rules.
 * Higher penalty = more repetitive / less desirable.
 */
export function calculateAssignmentPenalty(
  assignment: Role[],
  players: Player[],
  prevMap: Record<string, string>
): number {
  let penalty = 0;
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const prevRoleId = prevMap[player.id] || player.previousRoleId;
    if (!prevRoleId) continue;

    const assignedRole = assignment[i];
    if (!assignedRole) continue;

    // Phạt cực nặng nếu cùng 1 người nhận lại đúng vai cũ liên tiếp
    if (assignedRole.id === prevRoleId) {
      if (assignedRole.id === 'HARRY_POTTER' || assignedRole.id === 'VOLDEMORT') {
        penalty += 10000; // Cực kỳ tránh lặp vai Harry hoặc Voldemort cho cùng 1 người!
      } else {
        penalty += 1000; // Tránh lặp lại đúng nhân vật cũ
      }
    }

    // CHỐNG CHUỖI 4T LIÊN TIẾP: Phạt cực nặng nếu lặp lại phe Tử Thần Thực Tử
    const prevRole = ROLES[prevRoleId];
    if (prevRole && prevRole.faction === 'DEATH_EATERS' && assignedRole.faction === 'DEATH_EATERS') {
      penalty += 5000; // Tuyệt đối không cho 1 người làm 4T 2 ván liên tiếp!
    }
  }
  return penalty;
}

/**
 * Khung cấu hình cân bằng tối ưu phân bổ 4T vs HPH & Chặng bay
 * Đã fine-tuned dựa trên simulation nhiều lần để đạt win rate 45-55% cho HPH
 *
 * LƯU Ý: Một số bàn (9-10, 12-13) có thể cần điều chỉnh thêm tùy meta game
 */
export const OPTIMAL_BALANCE_SPEC: Record<number, { evil: number; good: number; stages: number; desc: string }> = {
  4: { evil: 1, good: 3, stages: 4, desc: '1 Tử Thần Thực Tử vs 3 Hội Phượng Hoàng · 4 Chặng bay' },
  5: { evil: 2, good: 3, stages: 4, desc: '2 Tử Thần Thực Tử vs 3 Hội Phượng Hoàng · 4 Chặng bay' },
  6: { evil: 2, good: 4, stages: 4, desc: '2 Tử Thần Thực Tử vs 4 Hội Phượng Hoàng · 4 Chặng bay' },
  7: { evil: 3, good: 4, stages: 5, desc: '3 Tử Thần Thực Tử vs 4 Hội Phượng Hoàng · 5 Chặng bay' },
  8: { evil: 3, good: 5, stages: 5, desc: '3 Tử Thần Thực Tử vs 5 Hội Phượng Hoàng · 5 Chặng bay' },
  9: { evil: 3, good: 6, stages: 5, desc: '3 Tử Thần Thực Tử vs 6 Hội Phượng Hoàng · 5 Chặng bay' },
  10: { evil: 4, good: 6, stages: 5, desc: '4 Tử Thần Thực Tử vs 6 Hội Phượng Hoàng · 5 Chặng bay' },
  11: { evil: 4, good: 7, stages: 6, desc: '4 Tử Thần Thực Tử vs 7 Hội Phượng Hoàng · 6 Chặng bay' },
  12: { evil: 4, good: 8, stages: 6, desc: '4 Tử Thần Thực Tử vs 8 Hội Phượng Hoàng · 6 Chặng bay' },
  13: { evil: 4, good: 9, stages: 6, desc: '4 Tử Thần Thực Tử vs 9 Hội Phượng Hoàng · 6 Chặng bay' },
  14: { evil: 5, good: 9, stages: 6, desc: '5 Tử Thần Thực Tử vs 9 Hội Phượng Hoàng · 6 Chặng bay' },
  15: { evil: 5, good: 10, stages: 6, desc: '5 Tử Thần Thực Tử vs 10 Hội Phượng Hoàng · 6 Chặng bay' },
};

export function getOptimalBalance(N: number): { evilCount: number; goodCount: number; maxStages: number; desc: string } {
  if (OPTIMAL_BALANCE_SPEC[N]) {
    const s = OPTIMAL_BALANCE_SPEC[N];
    return { evilCount: s.evil, goodCount: s.good, maxStages: s.stages, desc: s.desc };
  }
  const evilCount = Math.max(1, Math.round(N / 3));
  const goodCount = Math.max(1, N - evilCount);
  const maxStages = N <= 6 ? 4 : N <= 10 ? 5 : 6;
  return {
    evilCount,
    goodCount,
    maxStages,
    desc: `${evilCount} Tử Thần Thực Tử vs ${goodCount} Hội Phượng Hoàng · ${maxStages} Chặng bay`,
  };
}

/**
 * Thuật toán phân bổ vai trò công bằng 2 giai đoạn (Guaranteed Fair 2-Phase Role Engine):
 * Giai đoạn 1 (Faction Balancing):
 * - Đảm bảo KHÔNG AI bị làm Tử Thần Thực Tử (4T) 2 ván liên tiếp (Streak tối đa = 1).
 * - Sử dụng điểm ưu tiên dựa trên lịch sử số lần làm 4T và số ván đã chơi để luân phiên đều cho mọi người.
 * Giai đoạn 2 (Character Assignment):
 * - Voldemort và Harry Potter luôn được luân chuyển cho người chưa từng nhận ở ván trước.
 * - Các vai trò khác được xáo ngẫu nhiên chuẩn Fisher-Yates, tránh trùng nhân vật cũ.
 * Giai đoạn 3 (Persistence & Sync):
 * - Cập nhật roleHistory và previousRoleMap, lưu vào localStorage để bền vững qua F5/reload.
 */
export function assignRolesFairly(
  players: Player[],
  previousRoleMap?: Record<string, string>,
  roleHistory?: Record<string, RoleHistoryEntry>
): { 
  players: Player[]; 
  previousRoleMap: Record<string, string>;
  roleHistory: Record<string, RoleHistoryEntry>;
} {
  const nonGmPlayers = players.filter(p => !p.isGM);
  const N = nonGmPlayers.length;
  if (N === 0) {
    return { players, previousRoleMap: previousRoleMap || {}, roleHistory: roleHistory || {} };
  }

  const balance = getOptimalBalance(N);
  const evilCount = balance.evilCount;
  const goodCount = balance.goodCount;

  // Khôi phục roleHistory từ localStorage nếu có
  let localSavedHistory: Record<string, RoleHistoryEntry> = {};
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('seven-potters-role-history');
      if (raw) localSavedHistory = JSON.parse(raw);
    }
  } catch (e) {}

  const mergedHistory: Record<string, RoleHistoryEntry> = {
    ...localSavedHistory,
    ...(roleHistory || {}),
  };

  const prevMap = previousRoleMap || {};
  const roomEvilDensity = evilCount / N;

  // GIAI ĐOẠN 1: PHÂN BỔ PHE PHÁI (FACTION PARTITIONING & ANTI-STREAK ENGINE)
  // Tính điểm ưu tiên cho từng người chơi:
  const scored = nonGmPlayers.map(p => {
    const key = getPlayerKey(p);
    
    // Tìm lịch sử từ mergedHistory hoặc từ p.personalHistory (gửi từ client handshake)
    const existingHist = mergedHistory[key] || p.personalHistory;
    
    // Kiểm tra xem ván trước người này có là 4T không (theo previousRoleMap, p.previousRoleId, p.role hoặc existingHist)
    const prevRoleId = prevMap[p.id] || p.previousRoleId || existingHist?.lastRoleId;
    const prevWasEvil = 
      existingHist?.lastFaction === 'DEATH_EATERS' ||
      (existingHist?.consecutiveEvil !== undefined && existingHist.consecutiveEvil > 0) ||
      (prevRoleId && ROLES[prevRoleId]?.faction === 'DEATH_EATERS') || 
      (p.role?.faction === 'DEATH_EATERS');

    const consecutiveEvil = existingHist 
      ? (existingHist.consecutiveEvil ?? (prevWasEvil ? 1 : 0))
      : prevWasEvil ? 1 : (p.consecutiveEvil || 0);

    const totalEvil = existingHist?.totalEvil ?? (prevWasEvil ? 1 : 0);
    const totalGames = existingHist?.totalGames ?? (prevWasEvil ? 1 : 0);
    const gamesSinceLastEvil = consecutiveEvil > 0 
      ? 0 
      : (existingHist?.gamesSinceLastEvil ?? (prevWasEvil ? 0 : 1));

    // Nhiễu ngẫu nhiên có kiểm soát (0 - 25) để bảo đảm tính bất ngờ
    let score = Math.random() * 25;

    if (consecutiveEvil > 0 || prevWasEvil) {
      // KHÓA CỨNG (HARD LOCK): Phạt -1.000.000 điểm. Tuyệt đối không cho làm 4T 2 ván liên tiếp!
      score -= 1000000 * Math.max(1, consecutiveEvil);
    } else {
      // HỒI CHIÊU & CÂN BẰNG TỶ LỆ (FAIR ROTATION & PITY SYSTEM)
      // 1. Tỷ lệ dài hạn: nếu evilRatio > roomEvilDensity thì bị trừ điểm; nếu ít hơn thì được cộng điểm
      const evilRatio = totalGames > 0 ? (totalEvil / totalGames) : roomEvilDensity;
      score += (roomEvilDensity - evilRatio) * 150;

      // 2. Điểm hạn hán / hồi chiêu (Pity drought factor):
      // Người càng nhiều ván chưa làm 4T (gamesSinceLastEvil) càng được ưu tiên đến lượt
      const drought = Math.min(gamesSinceLastEvil, 6);
      score += drought * 20;

      // 3. Xử lý triệt để bẫy Tân Binh (Newcomer Protection):
      // Nếu là người mới hoàn toàn (totalGames === 0, vừa vào phòng hoặc chuyển tab/đổi phòng):
      // Giảm nhẹ 15 điểm để ưu tiên xếp vào phe HPH trong ván đầu tiên, tránh việc luôn luôn bị làm 4T ngay khi vào phòng!
      if (totalGames === 0) {
        score -= 15;
      }
    }

    return { 
      player: p, 
      score, 
      key, 
      hist: {
        consecutiveEvil,
        totalEvil,
        totalGames,
        lastRoleId: existingHist?.lastRoleId || prevRoleId,
        lastRoleName: existingHist?.lastRoleName || (prevRoleId ? ROLES[prevRoleId]?.name : undefined),
        lastFaction: existingHist?.lastFaction || (prevWasEvil ? 'DEATH_EATERS' : 'ORDER_OF_PHOENIX'),
        gamesSinceLastEvil,
      } 
    };
  });

  // Sắp xếp giảm dần theo điểm: top evilCount người chơi sẽ nhận phe Tử Thần Thực Tử
  scored.sort((a, b) => b.score - a.score);

  const evilSelected = scored.slice(0, evilCount);
  const goodSelected = scored.slice(evilCount);

  // GIAI ĐOẠN 2: CHIA NHÂN VẬT TRONG TỪNG PHE (CHARACTER ASSIGNMENT)
  const assignments: Map<string, Role> = new Map();

  // --- PHE TỬ THẦN THỰC TỬ ---
  const baseEvilPool: Role[] = [
    ROLES.BELLATRIX_LESTRANGE,
    ROLES.LUCIUS_MALFOY,
    ROLES.PETER_PETTIGREW,
    ROLES.FENRIR_GREYBACK,
  ];
  const shuffledEvil = fisherYatesShuffle(baseEvilPool);

  // Chọn Voldemort: ưu tiên người chưa từng là Voldemort ở ván trước
  const voldemortCandidates = [...evilSelected].sort((a, b) => {
    const aWasVold = (a.hist.lastRoleId === 'VOLDEMORT' || prevMap[a.player.id] === 'VOLDEMORT') ? 1 : 0;
    const bWasVold = (b.hist.lastRoleId === 'VOLDEMORT' || prevMap[b.player.id] === 'VOLDEMORT') ? 1 : 0;
    return aWasVold - bWasVold;
  });

  const voldemortCandidate = voldemortCandidates[0];
  if (voldemortCandidate) {
    assignments.set(voldemortCandidate.player.id, ROLES.VOLDEMORT);
  }

  const remainingEvil = evilSelected.filter(x => x.player.id !== voldemortCandidate?.player.id);
  remainingEvil.forEach((item, idx) => {
    let chosenRole = shuffledEvil[idx % shuffledEvil.length];
    if (chosenRole.id === item.hist.lastRoleId && shuffledEvil.length > 1) {
      chosenRole = shuffledEvil[(idx + 1) % shuffledEvil.length];
    }
    assignments.set(item.player.id, chosenRole);
  });

  // --- PHE HỘI PHƯỢNG HOÀNG ---
  // Tạo base pool cho HPH
  let baseGoodPool: Role[] = [
    ROLES.POTTER_FAKE,
    ROLES.POTTER_FAKE,
    ROLES.ALBUS_DUMBLEDORE,
    ROLES.RON_WEASLEY,
    ROLES.HERMIONE_GRANGER,
    ROLES.SEVERUS_SNAPE,
    ROLES.REMUS_LUPIN,
    ROLES.ALASTOR_MOODY,
    ROLES.RUBEUS_HAGRID,
    ROLES.ARTHUR_WEASLEY,
    ROLES.FRED_WEASLEY,
    ROLES.GEORGE_WEASLEY,
    ROLES.MUNDUNGUS_FLETCHER,
    ROLES.KINGSLEY_SHACKLEBOLT,
    ROLES.BILL_WEASLEY,
    ROLES.FLEUR_DELACOUR,
    ROLES.NYMPHADORA_TONKS,
  ];

  // GIỚI HẠN: Trong bàn nhỏ (<=6 người), chỉ có tối đa 1 trong 2: Hermione HOẶC Arthur
  // Điều này ngăn chặn "Double Info" combo quá mạnh trong bàn nhỏ
  if (N <= 6) {
    // Random loại bỏ 1 trong 2 (Hermione hoặc Arthur)
    const keepHermione = Math.random() < 0.5;
    baseGoodPool = baseGoodPool.filter(r => {
      if (r.id === 'HERMIONE_GRANGER' && !keepHermione) return false;
      if (r.id === 'ARTHUR_WEASLEY' && keepHermione) return false;
      return true;
    });
  }

  const shuffledGood = fisherYatesShuffle(baseGoodPool);

  // Chọn Harry Potter: ưu tiên người chưa từng là Harry ở ván trước
  const harryCandidates = [...goodSelected].sort((a, b) => {
    const aWasHarry = (a.hist.lastRoleId === 'HARRY_POTTER' || prevMap[a.player.id] === 'HARRY_POTTER') ? 1 : 0;
    const bWasHarry = (b.hist.lastRoleId === 'HARRY_POTTER' || prevMap[b.player.id] === 'HARRY_POTTER') ? 1 : 0;
    return aWasHarry - bWasHarry;
  });

  const harryCandidate = harryCandidates[0];
  if (harryCandidate) {
    assignments.set(harryCandidate.player.id, ROLES.HARRY_POTTER);
  }

  const remainingGood = goodSelected.filter(x => x.player.id !== harryCandidate?.player.id);
  remainingGood.forEach((item, idx) => {
    let chosenRole = shuffledGood[idx % shuffledGood.length];
    if (chosenRole.id === item.hist.lastRoleId && shuffledGood.length > 1) {
      chosenRole = shuffledGood[(idx + 1) % shuffledGood.length];
    }
    assignments.set(item.player.id, chosenRole);
  });

  // GIAI ĐOẠN 3: ĐỒNG BỘ LỊCH SỬ VÀ GẮN VAI TRÒ
  const newRoleMap: Record<string, string> = { ...prevMap };
  const newRoleHistory: Record<string, RoleHistoryEntry> = { ...mergedHistory };

  const newPlayers = players.map(p => {
    if (p.isGM) return p;
    const assignedRole = assignments.get(p.id) || ROLES.POTTER_FAKE;
    newRoleMap[p.id] = assignedRole.id;

    const key = getPlayerKey(p);
    const oldHist = newRoleHistory[key] || p.personalHistory || {
      consecutiveEvil: 0,
      totalEvil: 0,
      totalGames: 0,
      gamesSinceLastEvil: 1,
    };
    const isEvil = assignedRole.faction === 'DEATH_EATERS';

    const updatedHist: RoleHistoryEntry = {
      consecutiveEvil: isEvil ? ((oldHist.consecutiveEvil || 0) + 1) : 0,
      totalEvil: isEvil ? ((oldHist.totalEvil || 0) + 1) : (oldHist.totalEvil || 0),
      totalGames: (oldHist.totalGames || 0) + 1,
      lastRoleId: assignedRole.id,
      lastRoleName: assignedRole.name,
      lastFaction: assignedRole.faction,
      gamesSinceLastEvil: isEvil ? 0 : ((oldHist.gamesSinceLastEvil || 0) + 1),
    };

    newRoleHistory[key] = updatedHist;

    return {
      ...p,
      role: assignedRole,
      status: 'ALIVE' as const,
      previousRoleId: assignedRole.id,
      consecutiveEvil: updatedHist.consecutiveEvil,
      personalHistory: updatedHist,
    };
  });

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('seven-potters-role-history', JSON.stringify(newRoleHistory));
    }
  } catch (e) {}

  return {
    players: newPlayers,
    previousRoleMap: newRoleMap,
    roleHistory: newRoleHistory,
  };
}

const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours session validity

const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  } catch {}
};

const removeStorageItem = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  // Networking states
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offlinePlayerIds, setOfflinePlayerIds] = useState<string[]>([]);
  const [hostDisconnectedAt, setHostDisconnectedAt] = useState<number | null>(null);
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  const [skillToast, setSkillToast] = useState<string | null>(null);
  const clearSkillToast = useCallback(() => setSkillToast(null), []);

  // Network instance ref
  const netRef = useRef<SevenPottersNetwork | null>(null);
  const stateRef = useRef<GameState>(DEFAULT_STATE);
  stateRef.current = gameState;
  const isHostRef = useRef<boolean>(false);
  isHostRef.current = isHost;
  const currentPlayerIdRef = useRef<string | null>(null);
  currentPlayerIdRef.current = currentPlayerId;
  const roomCodeRef = useRef<string | null>(null);
  roomCodeRef.current = roomCode;

  // Lobby presence eviction timers: 10s grace period for presence drop in LOBBY
  const evictionTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const sanitizePlayers = (players: any[]): Player[] => {
    if (!Array.isArray(players)) return [];
    const seenIds = new Set<string>();
    return players
      .filter(p => p && typeof p === 'object')
      .map((p, idx) => {
        let id = (p.id && typeof p.id === 'string' && p.id.trim() !== '') 
          ? p.id.trim() 
          : `player_${idx}_${Math.random().toString(36).substring(2, 7)}`;
        if (seenIds.has(id)) {
          id = `${id}_dup_${idx}`;
        }
        seenIds.add(id);
        return {
          ...p,
          id,
          name: p.name || `Phù thủy #${idx + 1}`,
          status: p.status || 'ALIVE',
          isGM: Boolean(p.isGM),
        };
      });
  };

  // Whenever gameState changes, save and broadcast if Host
  const updateState = useCallback((updater: GameState | ((prev: GameState) => GameState)) => {
    setGameState(prev => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      try {
        const stateToSave = { ...nextState, activeFX: null };
        localStorage.setItem('seven-potters-mock-state', JSON.stringify(stateToSave));
        if (roomCodeRef.current) {
          localStorage.setItem(`seven-potters-room-${roomCodeRef.current}-state`, JSON.stringify(stateToSave));
        }
      } catch (err) {
        console.error('Failed to persist game state:', err);
      }
      if (isHostRef.current && netRef.current) {
        netRef.current.broadcastRoomState(nextState);
      }
      return nextState;
    });
  }, []);

  // NOTE: Domino effect đã được xóa - Arthur, Fred, George giờ có abilities độc lập
  // Giữ function này để tránh breaking changes trong code khác
  const processDominoEffect = (players: Player[], deadIds: string[], summary: string[]) => {
    // Domino effect đã bị vô hiệu hóa
    // Các Weasley members giờ có abilities độc lập không còn liên kết domino
    return deadIds;
  };

  // Core Action Execution (used locally and on Host receiving Network messages)
  const executePlayerActionCore = useCallback((actorId: string, actionName: string, targetId: string) => {
    updateState(prev => {
      const me = prev.players.find(p => p.id === actorId);
      if (!me || me.status === 'DEAD' || me.isGM) return prev;
      const target = (targetId === 'ALL' || targetId === 'NONE') ? null : prev.players.find(p => p.id === targetId);
      if (targetId !== 'ALL' && targetId !== 'NONE' && !target) return prev;
      
      // Check if actor is silenced by stray Sectumsempra (Kingsley immune)
      const isSectumSilenced = Boolean(prev.skillStates[`${actorId}_SECTUMSEMPRA_SILENCED_R${prev.round}`]);
      const isKingsley = prev.players.find(p => p.id === actorId)?.role?.id === 'KINGSLEY_SHACKLEBOLT';
      if (isSectumSilenced && !isKingsley && actionName !== 'NONE') {
        setSkillToast('⚠️ Bạn đang bị thương do trúng bùa lạc Sectumsempra (mất một bên tai) nên không thể thi triển kỹ năng!');
        return prev;
      }

      // Check if actor is affected by Fred's Fainting Fancy candy (can only vote, no other actions)
      const isFaintedByCandy = Boolean(prev.skillStates[`${actorId}_FRED_CANDY_R${prev.round}`]);
      if (isFaintedByCandy && actionName !== 'NONE') {
        setSkillToast('⚠️ Bạn đang bị ngất xỉu do Kẹo Ngất Xỉu của Fred Weasley! Không thể thi triển kỹ năng đêm nay!');
        return prev;
      }

      // Check if actor is affected by Potter Fake silenced (Kingsley immune)
      const isPotterFakeSilenced = Boolean(prev.skillStates[`${actorId}_POTTERFAKE_SILENCED_R${prev.round}`]);
      if (isPotterFakeSilenced && !isKingsley && actionName !== 'NONE') {
        setSkillToast('⚠️ Bạn đang bị SILENCED bởi Bùa Cấm Cửa của Potter Fake! Không thể thi triển kỹ năng!');
        return prev;
      }

      // Check Peter Pettigrew's Life Debt constraint against Harry Potter
      if (me.role?.id === 'PETER_PETTIGREW' && isKillAction(actionName) && target?.role?.id === 'HARRY_POTTER') {
        setSkillToast('⚠️ BÀN TAY BẠC PHẢN PHỆ! Do Món Nợ Sinh Mệnh với Harry Potter ở Lều Hét, bàn tay của bạn bị co giật và không thể giương đũa ám sát Kẻ Được Chọn! Hãy để Voldemort hoặc đồng minh khác ra tay!');
        return {
          ...prev,
          logs: [...prev.logs, `Hệ thống: [Peter Pettigrew] Bàn tay bạc phản phệ do Món Nợ Sinh Mệnh! Không thể hạ sát Harry Potter.`]
        };
      }

      // Check Remus Lupin revive constraints
      if (me.role?.id === 'REMUS_LUPIN' && isReviveAction(actionName)) {
        if (prev.skillStates[`${me.id}_LUPIN`]) {
          setSkillToast('⚠️ Bạn đã dùng hết Thuốc Hồi Sinh quý giá trong trận này!');
          return prev;
        }
        if (target && target.status !== 'DEAD') {
          setSkillToast('⚠️ Thuốc Hồi Sinh chỉ có thể dùng cho đồng đội đã ngã xuống!');
          return prev;
        }
      }

      const normalizedAction = actionName.toLowerCase().trim();
      const isPublicVote = normalizedAction === 'biểu quyết tước đũa' || normalizedAction === 'bỏ phiếu treo cổ';
      const isEscort = normalizedAction === 'bay hộ tống';
      const logMessage = isPublicVote
        ? `[${me.name}] đã biểu quyết Tước Đũa (Expelliarmus).`
        : `[${me.name}] đã xác nhận hành động bí mật.`;

      const newEscortPairs = { ...(prev.escortPairs || {}) };
      if (isEscort && target) {
        newEscortPairs[me.id] = target.id;
      } else {
        delete newEscortPairs[me.id];
      }

      return {
        ...prev,
        pendingActions: {
          ...prev.pendingActions,
          [me.id]: { actionName, targetId }
        },
        escortPairs: newEscortPairs,
        logs: [...prev.logs, logMessage],
      };
    });
  }, [updateState]);

  // Core Instant Skill Execution
  const executeInstantSkillCore = useCallback((actorId: string, actionName: string, targetId: string): string | void => {
    const curState = stateRef.current;
    if (curState.phase === 'END') return 'Trò chơi đã kết thúc!';
    const me = curState.players.find(p => p.id === actorId);
    const target = curState.players.find(p => p.id === targetId);
    if (!me || !target) return;
    if (me.status === 'DEAD') return 'Bạn đã tử trận, không thể sử dụng kỹ năng!';

    if (curState.skillStates[`${actorId}_SECTUMSEMPRA_SILENCED_R${curState.round}`]) {
      return '⚠️ Bạn đang bị thương do trúng bùa lạc Sectumsempra (mất một bên tai) nên không thể thi triển kỹ năng!';
    }

    // Check if actor is affected by Fred's Fainting Fancy candy
    if (curState.skillStates[`${actorId}_FRED_CANDY_R${curState.round}`]) {
      return '⚠️ Bạn đang bị ngất xỉu do Kẹo Ngất Xỉu của Fred Weasley! Không thể thi triển kỹ năng đêm nay!';
    }

    if (actionName === 'Soi Danh Tính' && me.role?.id === 'HERMIONE_GRANGER') {
      if (curState.phase !== 'NIGHT') return 'Kỹ năng soi danh tính chỉ có hiệu lực vào ban đêm!';
      if (target.role?.id === 'HARRY_POTTER' || target.role?.id === 'VOLDEMORT') {
        return 'Bùa chú bị phản phệ! Bạn không thể soi danh tính của Harry Potter hoặc Chúa Tể Voldemort (theo luật thẻ bài)!';
      }

      const stateKey = `${me.id}_HERMIONE_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng soi trong lượt này rồi!';
      
      let roleName = target.role?.name || 'Không rõ';
      if (target.role?.id === 'SEVERUS_SNAPE') {
        roleName = 'Severus Snape (Bậc Thầy Bế Quan Bí Thuật - Tâm Trí Bất Khả Xâm Phạm)';
      }

      updateState({
        ...curState,
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: Hermione đã soi danh tính của ${target.name}.`]
      });
      return `Vai trò của ${target.name} là: ${roleName}`;
    }

    if ((actionName === 'Đánh Hơi' || actionName === 'Soi Đặc Biệt' || actionName === 'Soi Phe' || actionName === 'Soi Nhân Vật Đặc Biệt') && me.role?.id === 'PETER_PETTIGREW') {
      if (curState.phase !== 'NIGHT') return 'Kỹ năng đánh hơi chỉ có hiệu lực vào ban đêm!';
      const stateKey = `${me.id}_PETTIGREW_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng đánh hơi trong lượt này rồi!';

      if (target.role?.faction !== 'ORDER_OF_PHOENIX') {
        return `Mục tiêu ${target.name} không thuộc Hội Phượng Hoàng! (Chỉ có thể đánh hơi thành viên phe Hội Phượng Hoàng)`;
      }

      const inspectKey = `${me.id}_PETTIGREW_INSPECTED_${target.id}`;

      if (target.role?.id === 'HARRY_POTTER') {
        updateState({
          ...curState,
          skillStates: { 
            ...curState.skillStates, 
            [stateKey]: true,
            [inspectKey]: 'HARRY_POTTER'
          },
          logs: [...curState.logs, `Hệ thống: Pettigrew đã bí mật đánh hơi ${target.name}.`]
        });
        return `⚡ KẾT QUẢ ĐÁNH HƠI: ĐÍCH DANH HARRY POTTER THẬT! Mùi hương của Kẻ Được Chọn — người nắm giữ Món Nợ Mạng của bạn!`;
      }

      if (target.role?.id === 'RON_WEASLEY') {
        updateState({
          ...curState,
          skillStates: { 
            ...curState.skillStates, 
            [stateKey]: true,
            [inspectKey]: 'RON_WEASLEY'
          },
          logs: [...curState.logs, `Hệ thống: Pettigrew đã bí mật đánh hơi ${target.name}.`]
        });
        return `🐀 KẾT QUẢ ĐÁNH HƠI: ĐÍCH DANH RON WEASLEY! Mùi hương 12 năm sống chung trong túi áo gia đình Weasley (Cậu chủ cũ)!`;
      }

      if (target.role?.id === 'SEVERUS_SNAPE') {
        updateState({
          ...curState,
          skillStates: { 
            ...curState.skillStates, 
            [stateKey]: true,
            [inspectKey]: 'NORMAL'
          },
          logs: [...curState.logs, `Hệ thống: Pettigrew đã cố gắng đánh hơi ${target.name}.`]
        });
        return `🛡️ KẾT QUẢ ĐÁNH HƠI: Severus Snape — Bế Quan Bí Thuật chặn đứng khứu giác! Không thể phát hiện dấu vết đặc biệt.`;
      }

      // Kiểm tra xem mục tiêu có phải nhân vật đặc biệt (khác POTTER_FAKE)
      const isSpecial = target.role.id !== 'POTTER_FAKE';

      updateState({
        ...curState,
        skillStates: { 
          ...curState.skillStates, 
          [stateKey]: true,
          [inspectKey]: isSpecial ? 'SPECIAL' : 'NORMAL'
        },
        logs: [...curState.logs, `Hệ thống: Pettigrew đã bí mật đánh hơi ${target.name}.`]
      });

      if (isSpecial) {
        return `✨ KẾT QUẢ ĐÁNH HƠI: ${target.name} LÀ một Nhân Vật Đặc Biệt của Hội Phượng Hoàng!`;
      } else {
        return `✗ KẾT QUẢ ĐÁNH HƠI: ${target.name} KHÔNG PHẢI là Nhân Vật Đặc Biệt (Chỉ là Bản Sao Potter / Thành viên thông thường)!`;
      }
    }

    if (actionName === 'Hồi Sinh' && me.role?.id === 'REMUS_LUPIN') {
      return 'Kỹ năng Hồi Sinh của Remus Lupin hiện là Hành Động Ban Đêm bí mật! Hãy chọn đồng đội đã ngã xuống và bấm nút "Dùng Thuốc Hồi Sinh" để thực hiện.';
    }

    if (actionName === 'Bắn Lén' && me.role?.id === 'ALASTOR_MOODY') {
      if (curState.skillStates[`${me.id}_MOODY`]) return 'Bạn đã hết đạn!';
      if (curState.phase !== 'DAY') return 'Chỉ được bắn lén vào ban ngày (lúc biểu quyết)!';
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể bắn!';
      
      let deadIds = [targetId];
      let logs = [...curState.logs, `Hệ thống: Đoàng! Moody đã bắn lén chết ${target.name} giữa ban ngày!`];
      
      if (target.role?.faction === 'ORDER_OF_PHOENIX') {
        deadIds.push(me.id);
        logs.push(`Hệ thống: Do bắn nhầm người tốt, Moody bị phản phệ và đã lăn ra chết theo!`);
      }

      deadIds = processDominoEffect(curState.players, deadIds, logs);

      let newPlayers = [...curState.players];
      deadIds.forEach(id => {
        newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'DEAD' as const } : p);
      });

      const winner = checkWinCondition(newPlayers);
      updateState({
        ...curState,
        players: newPlayers,
        skillStates: { ...curState.skillStates, [`${me.id}_MOODY`]: true },
        logs: [...logs, ...(winner ? [`Hệ thống: Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])],
        winner,
        phase: winner ? 'END' : curState.phase
      });
      return 'Đã khai hỏa Avada Kedavra!';
    }

    // FENRIR GREYBACK: Cắn và chuyển sang phe 4T (giữ nguyên kỹ năng cũ)
    if ((actionName === 'Cắn' || actionName === 'Cắn Chuyển Hóa') && me.role?.id === 'FENRIR_GREYBACK') {
      if (curState.phase !== 'NIGHT') return 'Fenrir chỉ có thể cắn vào ban đêm!';
      const stateKey = `${me.id}_FENRIR`;
      if (curState.skillStates[stateKey] || curState.skillStates[`${me.id}_FENRIR_BITE`]) {
        return 'Bạn đã dùng vết cắn ma sói rồi (chỉ dùng 1 lần trong ván)!';
      }
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể cắn!';
      if (target.role?.faction === 'DEATH_EATERS') return 'Không thể cắn đồng minh Tử Thần Thực Tử!';
      if (target.role?.id === 'HARRY_POTTER') return 'Không thể cắn Harry Potter!';

      updateState({
        ...curState,
        players: curState.players.map(p =>
          p.id === targetId ? {
            ...p,
            role: p.role ? { ...p.role, faction: 'DEATH_EATERS' as Faction } : p.role,
            faction: 'DEATH_EATERS' as Faction
          } : p
        ),
        skillStates: { 
          ...curState.skillStates, 
          [stateKey]: true,
          [`${me.id}_FENRIR_BITE`]: true 
        },
        logs: [...curState.logs, `Hệ thống: FENRIR CẮN! ${target.name} đã bị biến thành Ma Sói và chuyển sang PHE TỬ THẦN THỰC TỬ! Họ giữ nguyên kỹ năng cũ và giờ là đồng minh của 4T!`]
      });
      return `Đã cắn và chuyển ${target.name} sang phe 4T! Họ giữ nguyên kỹ năng.`;
    }

    // ARTHUR WEASLEY: Xem phe của người chơi
    if (actionName === 'Soi Phe' && me.role?.id === 'ARTHUR_WEASLEY') {
      if (curState.phase !== 'NIGHT') return 'Kỹ năng soi phe chỉ có hiệu lực vào ban đêm!';
      const stateKey = `${me.id}_ARTHUR_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng soi phe trong lượt này rồi!';

      updateState({
        ...curState,
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: Arthur Weasley đã theo dõi ${target.name}.`]
      });

      const faction = target.role?.faction;
      if (faction === 'DEATH_EATERS') {
        return `🔍 KẾT QUẢ SOI PHE: ${target.name} thuộc phe TỬ THẦN THỰC TỬ!`;
      } else if (faction === 'ORDER_OF_PHOENIX') {
        return `🔍 KẾT QUẢ SOI PHE: ${target.name} thuộc phe HỘI PHƯỢNG HOÀNG!`;
      } else {
        return `🔍 KẾT QUẢ SOI PHE: ${target.name} thuộc phe TRUNG LẬP!`;
      }
    }

    // FRED WEASLEY: Tạo Kẹo Ngất Xỉu (vô hiệu hóa vote)
    if (actionName === 'Tặng Kẹo' && me.role?.id === 'FRED_WEASLEY') {
      if (curState.phase !== 'NIGHT') return 'Fred chỉ có thể tặng kẹo vào ban đêm!';
      const stateKey = `${me.id}_FRED_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã tặng kẹo trong lượt này rồi!';
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể tặng kẹo!';

      // Tạo trạng thái silenced tạm thời cho vòng vote tiếp theo
      updateState({
        ...curState,
        skillStates: {
          ...curState.skillStates,
          [stateKey]: true,
          [`${target.id}_FRED_CANDY_R${curState.round + 1}`]: true
        },
        logs: [...curState.logs, `Hệ thống: Fred Weasley đã lén tặng Kẹo Ngất Xỉu cho ${target.name}! Người này sẽ bị ngất xỉu ở vòng phán quyết tiếp theo!`]
      });
      return `Đã tặng Kẹo Ngất Xỉu cho ${target.name}! Họ sẽ bị mất quyền vote ở vòng phán quyết kế tiếp.`;
    }

    // GEORGE WEASLEY: Tạo Bột Khói Mù Peru (vô hiệu hóa ám sát)
    // CHỈ DÙNG ĐƯỢC CÁCH ĐÊM (cooldown 1 vòng để cân bằng)
    if (actionName === 'Rải Bột' && me.role?.id === 'GEORGE_WEASLEY') {
      if (curState.phase !== 'NIGHT') return 'George chỉ có thể rải bột vào ban đêm!';
      const stateKey = `${me.id}_GEORGE_R${curState.round}`;
      const prevStateKey = `${me.id}_GEORGE_R${curState.round - 1}`; // Kiểm tra vòng trước

      if (curState.skillStates[stateKey]) return 'Bạn đã rải bột khói trong lượt này rồi!';
      if (curState.skillStates[prevStateKey]) return 'George cần nghỉ 1 đêm trước khi rải bột lại! (50% cooldown)';

      updateState({
        ...curState,
        skillStates: {
          ...curState.skillStates,
          [stateKey]: true,
          [`GLOBAL_SULK_R${curState.round}`]: true
        },
        logs: [...curState.logs, `Hệ thống: George Weasley đã rải Bột Khói Mù Peru lên bầu trời! TOÀN BỘ Tử Thần Thực Tử bị SULK (mất quyền ám sát) đêm nay!`]
      });
      return 'Đã rải Bột Khói Mù Peru! Tất cả TTTT bị SULK đêm nay, không ai bị giết!';
    }

    // BILL WEASLEY: Giải phong ấn cho người bị silence
    if (actionName === 'Giải Phong Ấn' && me.role?.id === 'BILL_WEASLEY') {
      if (curState.phase !== 'NIGHT') return 'Bill chỉ có thể giải phong ấn vào ban đêm!';
      const stateKey = `${me.id}_BILL_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng giải phong ấn trong lượt này rồi!';

      // Kiểm tra xem target có đang bị phong ấn không
      let wasSilenced = false;
      for (let r = 1; r <= curState.round; r++) {
        if (curState.skillStates[`${target.id}_SECTUMSEMPRA_SILENCED_R${r}`]) {
          wasSilenced = true;
          break;
        }
      }

      if (!wasSilenced) return `${target.name} không bị phong ấn, không cần giải!`;

      // Xóa tất cả các trạng thái silence của target
      const newSkillStates = { ...curState.skillStates };
      for (const key of Object.keys(newSkillStates)) {
        if (key.startsWith(`${target.id}_SECTUMSEMPRA`)) {
          delete newSkillStates[key];
        }
      }

      updateState({
        ...curState,
        skillStates: {
          ...newSkillStates,
          [stateKey]: true
        },
        logs: [...curState.logs, `Hệ thống: Bill Weasley đã dùng chuyên môn Phá Bùa để giải phong ấn cho ${target.name}! Nạn nhân đã có thể sử dụng kỹ năng bình thường.`]
      });
      return `Đã giải phong ấn cho ${target.name}! Họ có thể sử dụng kỹ năng trở lại.`;
    }

    // FLEUR DELACOUR: Dùng Lưỡi Kiếm Gryffindor giết người
    if (actionName === 'Chém Kiếm' && me.role?.id === 'FLEUR_DELACOUR') {
      if (curState.phase !== 'NIGHT') return 'Fleur chỉ có thể dùng kiếm vào ban đêm!';
      const stateKey = `${me.id}_FLEUR_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng Lưỡi Kiếm trong lượt này rồi!';
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể chém!';

      // Kiểm tra xem target có phải HPH không
      if (target.role?.faction === 'ORDER_OF_PHOENIX') {
        // Chém nhầm người tốt - Fleur tự chết
        updateState({
          ...curState,
          players: curState.players.map(p =>
            p.id === me.id ? { ...p, status: 'DEAD' as const } : p
          ),
          skillStates: { ...curState.skillStates, [stateKey]: true },
          logs: [...curState.logs, `Hệ thống: TIMHE! Fleur Delacour đã chém nhầm đồng minh ${target.name}! Trong tội lỗi, cô đã tự đâm kiếm vào ngực mình!`, `Hệ thống: ${me.name} đã tử trận!`]
        });
        return `⚔️ THẢM KỊCH! Bạn đã chém nhầm đồng minh ${target.name}! Do tội lỗi, bạn phải tự sát!`;
      }

      // Chém đúng 4T - target chết ngay lập tức
      updateState({
        ...curState,
        players: curState.players.map(p =>
          p.id === targetId ? { ...p, status: 'DEAD' as const } : p
        ),
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: KIẾM! Fleur Delacour đã dùng Lưỡi Kiếm Gryffindor chém chết ${target.name} ngay lập tức! Không có cơ hội cứu chữa!`]
      });
      return `⚔️ ĐÃ XỬ TỬ! ${target.name} đã bị chém chết bởi Lưỡi Kiếm Gryffindor!`;
    }

    // LUCIUS MALFOY: Soi vai trò của người chơi
    if (actionName === 'Soi Vai Trò' && me.role?.id === 'LUCIUS_MALFOY') {
      if (curState.phase !== 'NIGHT') return 'Lucius chỉ có thể soi vào ban đêm!';
      const stateKey = `${me.id}_LUCIUS_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng soi trong lượt này rồi!';

      updateState({
        ...curState,
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: Lucius Malfoy đã bí mật soi vai trò của ${target.name}.`]
      });

      const roleName = target.role?.name || 'Không rõ';
      return `🔍 KẾT QUẢ SOI: Vai trò của ${target.name} là: ${roleName}`;
    }

    // POTTER FAKE: Silenced 1 người TTTT
    if (actionName === 'Silenced Ultimate' && me.role?.id === 'POTTER_FAKE') {
      const stateKey = `${me.id}_POTTERFAKE_ULTIMATE`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng Ultimate rồi!';

      if (target.role?.faction !== 'DEATH_EATERS') {
        return 'Bạn chỉ có thể silenced người thuộc phe Tử Thần Thực Tử!';
      }

      updateState({
        ...curState,
        skillStates: {
          ...curState.skillStates,
          [stateKey]: true,
          [`${target.id}_POTTERFAKE_SILENCED_R${curState.round + 1}`]: true
        },
        logs: [...curState.logs, `Hệ thống: ${me.name} đã REVEAL là Potter Fake và dùng Bùa Cấm Cửa để SILENCED ${target.name}! Người này sẽ bị mất kỹ năng ở vòng tiếp theo!`]
      });
      return `Đã SILENCED ${target.name}! Họ sẽ bị mất kỹ năng ở vòng kế tiếp.`;
    }

  }, [updateState]);

  // Core Interrupt Resolution
  const resolveInterruptCore = useCallback((choiceId: string, actorId?: string) => {
    const curState = stateRef.current;
    if (!curState.interruptState || !curState.resolutionReport) return;
    const { type, playerId: tonksOrMundungusId } = curState.interruptState;
    if (actorId && tonksOrMundungusId !== actorId) {
      console.warn('Unauthorized interrupt resolution attempt:', actorId);
      return;
    }

    const summary = [...curState.resolutionReport.summary];
    const deadPlayers = [...curState.resolutionReport.deadPlayers];
    let newPlayers = [...curState.players];
    const newSkillStates: Record<string, boolean | string> = {
      ...(curState.resolutionReport.newSkillStates || {})
    };

    if (type === 'MUNDUNGUS_SWAP') {
      const target = curState.players.find(p => p.id === choiceId);
      summary.push(`Mundungus đã hoảng loạn lôi ${target?.name} ra chết thay!`);
      if (!deadPlayers.includes(choiceId)) {
        deadPlayers.push(choiceId);
      }
      newSkillStates[`${tonksOrMundungusId}_SWAP_USED`] = true;
    } else if (type === 'TONKS_MORPH') {
      const target = curState.players.find(p => p.id === choiceId);
      summary.push(`Trước khi chết, Tonks đã biến hình kế thừa thân phận của ${target?.name} và tiếp tục chiến đấu!`);
      newPlayers = newPlayers.map(p => p.id === tonksOrMundungusId ? { ...p, role: target?.role || p.role } : p);
    }

    const finalDeadPlayers = processDominoEffect(newPlayers, deadPlayers, summary);

    updateState({
      ...curState,
      players: newPlayers,
      interruptState: null,
      resolutionReport: {
        ...curState.resolutionReport,
        summary,
        deadPlayers: finalDeadPlayers,
        needsInterrupt: null,
        newSkillStates
      },
      skillStates: { ...curState.skillStates, ...newSkillStates },
      logs: [...curState.logs, `Hệ thống: Kỹ năng can thiệp khẩn cấp đã được giải quyết.`]
    });
  }, [updateState]);

  // Auto-resolve interrupt with random choice after timeout (for offline players)
  const resolveInterruptAuto = useCallback(() => {
    const curState = stateRef.current;
    if (!curState.interruptState || !curState.resolutionReport) return;
    const { type, playerId } = curState.interruptState;

    // Find valid targets (alive, not GM, not self)
    const validTargets = curState.players.filter(p =>
      p.id !== playerId && p.status !== 'DEAD' && !p.isGM
    );

    if (validTargets.length === 0) {
      // No valid targets, just resolve without action
      resolveInterruptCore(playerId);
      return;
    }

    // Random target
    const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
    resolveInterruptCore(randomTarget.id);
  }, [resolveInterruptCore]);

  // Setup Network Listeners
  const attachNetworkListeners = useCallback((net: SevenPottersNetwork, asHost: boolean) => {
    net.onConnectionStatusChange = (status, error) => {
      console.log(`[7-Potters] Connection status: ${status}`, error || '');
      if (status === 'CONNECTED') {
        setConnStatus('connected');
        setErrorMsg(null);
      } else if (status === 'CONNECTING') {
        setConnStatus('connecting');
      } else if (status === 'DISCONNECTED') {
        setConnStatus('disconnected');
      } else if (status === 'ERROR') {
        setConnStatus('disconnected');
        setErrorMsg(error || 'Lỗi kết nối mạng.');
      }
    };

    net.onMessageReceived = (msg: NetworkMessage) => {
      console.log(`[7-Potters] Network message received: ${msg.type}`, msg);
      if (asHost) {
        // HOST MESSAGE HANDLING
        if (msg.type === 'JOIN_REQUEST') {
          const reqPlayer = msg.payload as Player;
          if (!reqPlayer || !reqPlayer.id) return;

          // Clear any pending eviction timer for this player
          if (evictionTimersRef.current[reqPlayer.id]) {
            clearTimeout(evictionTimersRef.current[reqPlayer.id]);
            delete evictionTimersRef.current[reqPlayer.id];
          }

          setOfflinePlayerIds(prev => prev.filter(id => id !== reqPlayer.id));

          updateState(prev => {
            const existingIdx = prev.players.findIndex(p => 
              p.id === reqPlayer.id || 
              (p.deviceId && reqPlayer.deviceId && p.deviceId === reqPlayer.deviceId) ||
              (p.hpvnUid && reqPlayer.hpvnUid && p.hpvnUid === reqPlayer.hpvnUid) ||
              p.name.trim().toLowerCase() === reqPlayer.name.trim().toLowerCase()
            );
            let nextPlayers = [...prev.players];
            let logMsg = '';

            const carriedHistory = reqPlayer.personalHistory;
            const playerKey = getPlayerKey(reqPlayer);

            const nextRoleHistory = { ...(prev.roleHistory || {}) };
            const nextPreviousRoleMap = { ...(prev.previousRoleMap || {}) };

            if (carriedHistory && !nextRoleHistory[playerKey]) {
              nextRoleHistory[playerKey] = carriedHistory;
            }
            if (reqPlayer.previousRoleId && !nextPreviousRoleMap[reqPlayer.id]) {
              nextPreviousRoleMap[reqPlayer.id] = reqPlayer.previousRoleId;
            }

            if (existingIdx >= 0) {
              const oldP = nextPlayers[existingIdx];
              // Reconnect existing player
              nextPlayers[existingIdx] = {
                ...oldP,
                id: reqPlayer.id,
                name: reqPlayer.name,
                house: reqPlayer.house || oldP.house,
                userTag: reqPlayer.userTag || oldP.userTag,
                hpvnUid: reqPlayer.hpvnUid || oldP.hpvnUid,
                deviceId: reqPlayer.deviceId || oldP.deviceId,
                personalHistory: carriedHistory || oldP.personalHistory,
                consecutiveEvil: carriedHistory?.consecutiveEvil ?? oldP.consecutiveEvil,
                previousRoleId: reqPlayer.previousRoleId || oldP.previousRoleId,
              };
              logMsg = `Hệ thống: ${reqPlayer.name} đã kết nối lại vào phòng.`;
            } else {
              // New player
              nextPlayers.push(reqPlayer);
              logMsg = `Hệ thống: ${reqPlayer.name} (${reqPlayer.isGM ? 'Merlin' : 'Phù thủy'}) đã gia nhập phòng!`;
            }

            return {
              ...prev,
              players: nextPlayers,
              roleHistory: nextRoleHistory,
              previousRoleMap: nextPreviousRoleMap,
              logs: [...prev.logs, logMsg],
            };
          });
        } else if (msg.type === 'ACTION_SUBMIT') {
          const { actionName, targetId } = msg.payload || {};
          if (actionName && targetId) {
            executePlayerActionCore(msg.senderId, actionName, targetId);
          }
        } else if (msg.type === 'INSTANT_SKILL_SUBMIT') {
          const { actionName, targetId } = msg.payload || {};
          if (actionName && targetId) {
            const skillResult = executeInstantSkillCore(msg.senderId, actionName, targetId);
            if (skillResult && netRef.current) {
              netRef.current.broadcast({
                type: 'INSTANT_SKILL_RESULT',
                senderId: netRef.current.myPlayerId,
                payload: {
                  targetPlayerId: msg.senderId,
                  result: skillResult,
                },
              });
            }
          }
        } else if (msg.type === 'INTERRUPT_CHOICE_SUBMIT') {
          const { choiceId } = msg.payload || {};
          if (choiceId) {
            resolveInterruptCore(choiceId, msg.senderId);
          }
        } else if (msg.type === 'USE_WEASLEY_ITEM') {
          const { itemId, targetId } = msg.payload || {};
          if (itemId) {
            const itemResult = executeWeasleyItemCore(msg.senderId, itemId, targetId);
            if (itemResult && netRef.current) {
              netRef.current.broadcast({
                type: 'INSTANT_SKILL_RESULT',
                senderId: netRef.current.myPlayerId,
                payload: {
                  targetPlayerId: msg.senderId,
                  result: itemResult,
                },
              });
            }
          }
        } else if (msg.type === 'ESCORT_SUBMIT') {
          const { targetId } = msg.payload || {};
          if (targetId) {
            executePlayerActionCore(msg.senderId, 'bay hộ tống', targetId);
          }
        } else if (msg.type === 'PLAYER_LEFT') {
          const leavingId = msg.payload?.playerId || msg.senderId;
          updateState(prev => {
            const target = prev.players.find(p => p.id === leavingId);
            if (!target) return prev;

            // In LOBBY, remove cleanly
            if (prev.phase === 'LOBBY') {
              const remaining = prev.players.filter(p => p.id !== leavingId);
              return {
                ...prev,
                players: remaining,
                logs: [...prev.logs, `Hệ thống: ${target.name} đã rời khỏi phòng.`],
              };
            }

            // In active game, mark offline to preserve game state
            setOfflinePlayerIds(old => [...new Set([...old, leavingId])]);
            return {
              ...prev,
              logs: [...prev.logs, `Hệ thống: ${target.name} đã ngắt kết nối.`],
            };
          });
        }
      } else {
        // CLIENT MESSAGE HANDLING
        if (msg.type === 'ROOM_STATE_SYNC') {
          const syncedState = msg.payload as GameState;
          if (syncedState) {
            setGameState({
              ...DEFAULT_STATE,
              ...syncedState,
              pendingActions: syncedState.pendingActions || {},
              skillStates: syncedState.skillStates || {},
              logs: syncedState.logs || DEFAULT_STATE.logs,
              players: sanitizePlayers(syncedState.players || []),
            });
            setConnStatus('connected');
            setErrorMsg(null);
            try {
              if (roomCodeRef.current) {
                localStorage.setItem(`seven-potters-room-${roomCodeRef.current}-state`, JSON.stringify(syncedState));
              } else {
                localStorage.setItem('seven-potters-mock-state', JSON.stringify(syncedState));
              }

              // Cập nhật lịch sử vai trò cá nhân trên Client để bảo lưu khi đổi phòng
              const myId = currentPlayerIdRef.current;
              const me = syncedState.players?.find(p => p.id === myId);
              if (me && me.role) {
                const myKey = getPlayerKey(me);
                const myHist = syncedState.roleHistory?.[myKey];
                if (myHist) {
                  savePersonalHistory(myHist);
                } else {
                  const isEvil = me.role.faction === 'DEATH_EATERS';
                  const old = getPersonalHistory() || { consecutiveEvil: 0, totalEvil: 0, totalGames: 0 };
                  savePersonalHistory({
                    consecutiveEvil: isEvil ? ((old.consecutiveEvil || 0) + 1) : 0,
                    totalEvil: isEvil ? ((old.totalEvil || 0) + 1) : (old.totalEvil || 0),
                    totalGames: (old.totalGames || 0) + 1,
                    lastRoleId: me.role.id,
                    lastRoleName: me.role.name,
                    lastFaction: me.role.faction,
                    gamesSinceLastEvil: isEvil ? 0 : ((old.gamesSinceLastEvil || 0) + 1),
                  });
                }
              }
            } catch (e) {}
          }
        } else if (msg.type === 'INSTANT_SKILL_RESULT') {
          const { targetPlayerId, result } = msg.payload || {};
          if (targetPlayerId === currentPlayerIdRef.current && result) {
            setSkillToast(result);
          }
        } else if (msg.type === 'KICK_PLAYER') {
          if (msg.payload?.targetId === currentPlayerIdRef.current) {
            setErrorMsg('Bạn đã bị Merlin mời ra khỏi phòng.');
            leaveGame();
          }
        } else if (msg.type === 'HOST_DISCONNECTED') {
          const at = msg.payload?.disconnectedAt || Date.now();
          setHostDisconnectedAt(at);
        } else if (msg.type === 'HOST_RECONNECTED') {
          setHostDisconnectedAt(null);
          setDisconnectCountdown(null);
        }
      }
    };

    net.onPeerJoined = (peerId) => {
      if (asHost) {
        if (evictionTimersRef.current[peerId]) {
          clearTimeout(evictionTimersRef.current[peerId]);
          delete evictionTimersRef.current[peerId];
        }
        setOfflinePlayerIds(prev => prev.filter(id => id !== peerId));
      }
    };

    net.onPeerLeft = (peerId) => {
      if (asHost) {
        // Presence drop detected
        setOfflinePlayerIds(prev => [...new Set([...prev, peerId])]);

        // If in LOBBY, grant 90-second grace period before evicting ghost player
        if (stateRef.current.phase === 'LOBBY') {
          if (evictionTimersRef.current[peerId]) {
            clearTimeout(evictionTimersRef.current[peerId]);
          }

          evictionTimersRef.current[peerId] = setTimeout(() => {
            delete evictionTimersRef.current[peerId];
            if (stateRef.current.phase === 'LOBBY' && !net.isPlayerInPresence(peerId)) {
              console.log(`[7-Potters Host] Evicting ghost player ${peerId} after 90s presence drop.`);
              updateState(prev => {
                const target = prev.players.find(p => p.id === peerId);
                if (!target) return prev;
                return {
                  ...prev,
                  players: prev.players.filter(p => p.id !== peerId),
                  logs: [...prev.logs, `Hệ thống: ${target.name} đã ngắt kết nối và rời phòng.`],
                };
              });
            }
          }, 90000);
        }
      }
    };

    net.onHostDisconnected = (at) => {
      if (!asHost) {
        setHostDisconnectedAt(at);
      }
    };

    net.onHostReconnected = () => {
      if (!asHost) {
        setHostDisconnectedAt(null);
        setDisconnectCountdown(null);
      }
    };
  }, [updateState, executePlayerActionCore, executeInstantSkillCore, resolveInterruptCore]);

  // Host countdown timer for 10-minute disconnection grace period
  useEffect(() => {
    if (!hostDisconnectedAt) {
      setDisconnectCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - hostDisconnectedAt) / 1000);
      const remainingSec = Math.max(0, 600 - elapsedSec);
      setDisconnectCountdown(remainingSec);

      if (remainingSec === 0) {
        clearInterval(interval);
        setErrorMsg('Phòng đã giải tán do Merlin mất kết nối quá 10 phút.');
        leaveGame();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hostDisconnectedAt]);

  // Auto-resolve interrupt after 60 seconds timeout
  useEffect(() => {
    if (!gameState.interruptState) return;

    const timeoutId = setTimeout(() => {
      console.log('[7-Potters] Interrupt timeout - auto-resolving');
      resolveInterruptAuto();
    }, 60000); // 60 seconds

    return () => clearTimeout(timeoutId);
  }, [gameState.interruptState, resolveInterruptAuto]);

  // Mobile background tab switch & network resume listener
  useEffect(() => {
    const handleVisibilityOrResume = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        console.log('[7-Potters] Tab backgrounded. Keeping session persistent.');
        return;
      }

      console.log('[7-Potters] Tab resumed / focused / online. Checking connection and state...');
      const net = netRef.current;
      const code = roomCodeRef.current;
      const myId = currentPlayerIdRef.current;
      let me = stateRef.current.players.find(p => p.id === myId);
      if (!me && myId) {
        const savedName = getStorageItem('seven-potters-player-name');
        if (savedName) {
          const myPersonalHist = getPersonalHistory();
          me = {
            id: myId,
            name: savedName,
            role: null,
            status: 'ALIVE',
            isGM: getStorageItem('seven-potters-is-gm') === 'true',
            house: getStorageItem('seven-potters-house') || undefined,
            userTag: getStorageItem('seven-potters-user-tag') || undefined,
            hpvnUid: getStorageItem('seven-potters-hpvn-uid') || undefined,
            deviceId: getOrCreateDeviceId(),
            personalHistory: myPersonalHist || undefined,
            consecutiveEvil: myPersonalHist?.consecutiveEvil || 0,
            previousRoleId: myPersonalHist?.lastRoleId,
          };
        }
      }

      if (net && code && me && myId) {
        if (isHostRef.current) {
          await net.reconnectHostIfNeeded(me);
          setHostDisconnectedAt(null);
          setDisconnectCountdown(null);
          // Broadcast authoritative room state to instantly restore truth for all clients
          net.broadcastRoomState(stateRef.current);
        } else {
          const isHealthy = net.isSocketHealthy();
          if (!isHealthy) {
            console.log('[7-Potters Client] Socket unhealthy after resume. Performing full reconnection...');
            setConnStatus('connecting');
            const ok = await net.reconnectClient(code, me);
            if (ok) {
              setConnStatus('connected');
              setErrorMsg(null);
              setHostDisconnectedAt(null);
              setDisconnectCountdown(null);
            } else {
              setConnStatus('disconnected');
            }
          } else {
            // Socket still open: request latest state from Host
            net.sendToHost({
              type: 'JOIN_REQUEST',
              senderId: myId,
              payload: me,
            });
          }
        }
      }
    };

    const handleOffline = () => {
      console.warn('[7-Potters] Device went offline.');
      setConnStatus('disconnected');
      setErrorMsg('Mất kết nối Internet tạm thời. Đang chờ có sóng để tự động kết nối lại...');
    };

    window.addEventListener('visibilitychange', handleVisibilityOrResume);
    window.addEventListener('pageshow', handleVisibilityOrResume);
    window.addEventListener('focus', handleVisibilityOrResume);
    window.addEventListener('online', handleVisibilityOrResume);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrResume);
      window.removeEventListener('pageshow', handleVisibilityOrResume);
      window.removeEventListener('focus', handleVisibilityOrResume);
      window.removeEventListener('online', handleVisibilityOrResume);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // On mount: check localStorage / sessionStorage to restore session
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('seven-potters-mock-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState({
          ...DEFAULT_STATE,
          ...parsed,
          activeFX: null,
          pendingActions: parsed.pendingActions || {},
          skillStates: parsed.skillStates || {},
          logs: parsed.logs || DEFAULT_STATE.logs,
          players: sanitizePlayers(parsed.players || []),
        });
      }
    } catch (err) {
      console.error('Failed to parse saved state:', err);
    }
    
    const sessionTime = parseInt(getStorageItem('seven-potters-session-timestamp') || '0', 10);
    const isExpired = sessionTime > 0 && Date.now() - sessionTime > SESSION_EXPIRY_MS;

    if (isExpired) {
      console.log('[7-Potters] Previous session expired (> 4 hours). Clearing.');
      removeStorageItem('seven-potters-session-id');
      removeStorageItem('seven-potters-room-code');
      removeStorageItem('seven-potters-is-host');
      removeStorageItem('seven-potters-player-name');
      removeStorageItem('seven-potters-is-gm');
      removeStorageItem('seven-potters-house');
      removeStorageItem('seven-potters-user-tag');
      removeStorageItem('seven-potters-hpvn-uid');
      removeStorageItem('seven-potters-session-timestamp');
    }

    const sessionId = !isExpired ? getStorageItem('seven-potters-session-id') : null;
    const savedRoom = !isExpired ? getStorageItem('seven-potters-room-code') : null;
    const savedIsHost = !isExpired && getStorageItem('seven-potters-is-host') === 'true';
    const savedName = !isExpired ? getStorageItem('seven-potters-player-name') : null;
    const savedIsGM = !isExpired && getStorageItem('seven-potters-is-gm') === 'true';
    const savedHouse = !isExpired ? (getStorageItem('seven-potters-house') || undefined) : undefined;
    const savedUserTag = !isExpired ? (getStorageItem('seven-potters-user-tag') || undefined) : undefined;
    const savedHpvnUid = !isExpired ? (getStorageItem('seven-potters-hpvn-uid') || undefined) : undefined;

    if (sessionId) {
      setCurrentPlayerId(sessionId);
    }

    // Auto-restore multiplayer session if available
    if (savedRoom && sessionId && savedName) {
      setRoomCode(savedRoom);
      setIsHost(savedIsHost);

      const myPersonalHist = getPersonalHistory();
      const restorePlayer: Player = {
        id: sessionId,
        name: savedName,
        role: null,
        status: 'ALIVE',
        isGM: savedIsGM,
        house: savedHouse,
        userTag: savedUserTag,
        hpvnUid: savedHpvnUid,
        deviceId: getOrCreateDeviceId(),
        personalHistory: myPersonalHist || undefined,
        consecutiveEvil: myPersonalHist?.consecutiveEvil || 0,
        previousRoleId: myPersonalHist?.lastRoleId,
      };

      const net = new SevenPottersNetwork();
      netRef.current = net;
      attachNetworkListeners(net, savedIsHost);

      if (savedIsHost) {
        net.initHost(savedRoom, restorePlayer).catch(e => {
          console.warn('[7-Potters] Auto-restore host warning:', e);
        });
      } else {
        net.initClient(savedRoom, restorePlayer).catch(e => {
          console.warn('[7-Potters] Auto-restore client warning:', e);
        });
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'seven-potters-mock-state' && e.newValue && !netRef.current) {
        try {
          const parsed = JSON.parse(e.newValue);
          setGameState({
            ...DEFAULT_STATE,
            ...parsed,
            pendingActions: parsed.pendingActions || {},
            skillStates: parsed.skillStates || {},
            logs: parsed.logs || DEFAULT_STATE.logs,
            players: sanitizePlayers(parsed.players || []),
          });
        } catch (err) {
          console.error('Failed to parse storage event state:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (netRef.current) {
        netRef.current.destroy();
        netRef.current = null;
      }
    };
  }, []);

  /**
   * Multiplayer: Host creates a new room
   */
  const createRoom = async (
    name: string, 
    isGM: boolean, 
    extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }
  ): Promise<string> => {
    // Generate a 4-letter uppercase code e.g. "POT7"
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const myDeviceId = getOrCreateDeviceId();
    const myPersonalHist = getPersonalHistory();
    const savedSessionId = getStorageItem('seven-potters-session-id');
    const hostId = savedSessionId || ('player_' + Math.random().toString(36).substring(2, 9));
    
    const hostPlayer: Player = {
      id: hostId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
      deviceId: myDeviceId,
      personalHistory: myPersonalHist || undefined,
      consecutiveEvil: myPersonalHist?.consecutiveEvil || 0,
      previousRoleId: myPersonalHist?.lastRoleId,
    };

    if (netRef.current) {
      netRef.current.destroy();
      netRef.current = null;
    }

    const net = new SevenPottersNetwork();
    netRef.current = net;
    attachNetworkListeners(net, true);

    setConnStatus('connecting');
    setErrorMsg(null);

    try {
      await net.initHost(code, hostPlayer);
      setRoomCode(code);
      setIsHost(true);
      setCurrentPlayerId(hostId);
      setConnStatus('connected');

      setStorageItem('seven-potters-session-id', hostId);
      setStorageItem('seven-potters-room-code', code);
      setStorageItem('seven-potters-is-host', 'true');
      setStorageItem('seven-potters-player-name', name);
      setStorageItem('seven-potters-is-gm', isGM ? 'true' : 'false');
      setStorageItem('seven-potters-session-timestamp', Date.now().toString());
      if (extra?.house) setStorageItem('seven-potters-house', extra.house);
      else removeStorageItem('seven-potters-house');
      if (extra?.userTag) setStorageItem('seven-potters-user-tag', extra.userTag);
      else removeStorageItem('seven-potters-user-tag');
      if (extra?.hpvnUid) setStorageItem('seven-potters-hpvn-uid', extra.hpvnUid);
      else removeStorageItem('seven-potters-hpvn-uid');

      const initialHostState: GameState = {
        ...DEFAULT_STATE,
        players: [hostPlayer],
        logs: [`Hệ thống: Phòng ${code} đã được tạo bởi ${name} (${isGM ? 'Merlin' : 'Chủ phòng'}).`],
      };

      updateState(initialHostState);
      return code;
    } catch (err: any) {
      setConnStatus('disconnected');
      setErrorMsg(err?.message || 'Không thể tạo phòng.');
      throw err;
    }
  };

  /**
   * Multiplayer: Client joins an existing room by code
   */
  const joinRoom = async (
    inputRoomCode: string, 
    name: string, 
    isGM: boolean,
    extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }
  ): Promise<boolean> => {
    const code = inputRoomCode.trim().toUpperCase();
    if (!code) throw new Error('Mã phòng không được để trống.');

    const myDeviceId = getOrCreateDeviceId();
    const myPersonalHist = getPersonalHistory();
    const savedSessionId = getStorageItem('seven-potters-session-id');
    const playerId = savedSessionId || ('player_' + Math.random().toString(36).substring(2, 9));
    const clientPlayer: Player = {
      id: playerId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
      deviceId: myDeviceId,
      personalHistory: myPersonalHist || undefined,
      consecutiveEvil: myPersonalHist?.consecutiveEvil || 0,
      previousRoleId: myPersonalHist?.lastRoleId,
    };

    if (netRef.current) {
      netRef.current.destroy();
      netRef.current = null;
    }

    const net = new SevenPottersNetwork();
    netRef.current = net;
    attachNetworkListeners(net, false);

    setConnStatus('connecting');
    setErrorMsg(null);

    try {
      await net.initClient(code, clientPlayer);
      setRoomCode(code);
      setIsHost(false);
      setCurrentPlayerId(playerId);

      setStorageItem('seven-potters-session-id', playerId);
      setStorageItem('seven-potters-room-code', code);
      setStorageItem('seven-potters-is-host', 'false');
      setStorageItem('seven-potters-player-name', name);
      setStorageItem('seven-potters-is-gm', isGM ? 'true' : 'false');
      setStorageItem('seven-potters-session-timestamp', Date.now().toString());
      if (extra?.house) setStorageItem('seven-potters-house', extra.house);
      else removeStorageItem('seven-potters-house');
      if (extra?.userTag) setStorageItem('seven-potters-user-tag', extra.userTag);
      else removeStorageItem('seven-potters-user-tag');
      if (extra?.hpvnUid) setStorageItem('seven-potters-hpvn-uid', extra.hpvnUid);
      else removeStorageItem('seven-potters-hpvn-uid');

      return true;
    } catch (err: any) {
      setConnStatus('disconnected');
      setErrorMsg(err?.message || 'Không thể vào phòng.');
      throw err;
    }
  };

  /**
   * Single-device / Mock join without networking
   */
  const joinGame = (
    name: string, 
    isGM: boolean,
    extra?: { house?: string; userTag?: string; hpvnUid?: string; avatarUrl?: string }
  ) => {
    const existingPlayer = gameState.players.find(p => p.name === name && p.isGM === isGM);
    
    if (existingPlayer) {
      setCurrentPlayerId(existingPlayer.id);
      setStorageItem('seven-potters-session-id', existingPlayer.id);
      
      updateState(prev => ({
        ...prev,
        logs: [...prev.logs, `Hệ thống: ${name} đã kết nối lại vào phòng.`],
      }));
      return;
    }

    const myDeviceId = getOrCreateDeviceId();
    const myPersonalHist = getPersonalHistory();
    const savedSessionId = getStorageItem('seven-potters-session-id');
    const newPlayerId = savedSessionId || ('player_' + Math.random().toString(36).substring(2, 9));
    const newPlayer: Player = {
      id: newPlayerId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
      deviceId: myDeviceId,
      personalHistory: myPersonalHist || undefined,
      consecutiveEvil: myPersonalHist?.consecutiveEvil || 0,
      previousRoleId: myPersonalHist?.lastRoleId,
    };
    
    setCurrentPlayerId(newPlayerId);
    setStorageItem('seven-potters-session-id', newPlayerId);
    if (extra?.house) setStorageItem('seven-potters-house', extra.house);
    if (extra?.userTag) setStorageItem('seven-potters-user-tag', extra.userTag);
    if (extra?.hpvnUid) setStorageItem('seven-potters-hpvn-uid', extra.hpvnUid);
    
    updateState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
      logs: [...prev.logs, `${name} (${isGM ? 'Merlin' : 'Phù thủy'}) đã gia nhập phòng!`],
    }));
  };

  /**
   * Leave game with 120ms network flush delay
   */
  const leaveGame = () => {
    if (netRef.current) {
      if (!isHostRef.current) {
        netRef.current.sendPlayerLeft();
      }
      setTimeout(() => {
        netRef.current?.destroy();
        netRef.current = null;
      }, 120);
    }

    if (currentPlayerId) {
      updateState(prev => {
        const target = prev.players.find(p => p.id === currentPlayerId);
        const remainingPlayers = prev.players.filter(p => p.id !== currentPlayerId);
        const newPendingActions = { ...prev.pendingActions };
        delete newPendingActions[currentPlayerId];
        Object.keys(newPendingActions).forEach(k => {
          if (newPendingActions[k].targetId === currentPlayerId) {
            delete newPendingActions[k];
          }
        });

        const winner = prev.phase !== 'LOBBY' ? checkWinCondition(remainingPlayers) : null;

        return {
          ...prev,
          players: remainingPlayers,
          pendingActions: newPendingActions,
          logs: [
            ...prev.logs, 
            `${target?.name || 'Một người chơi'} đã rời khỏi phòng.`,
            ...(winner ? [`Hệ thống: Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])
          ],
          winner: winner || prev.winner,
          phase: winner ? 'END' : prev.phase
        };
      });
    }

    setCurrentPlayerId(null);
    setRoomCode(null);
    setIsHost(false);
    setConnStatus('disconnected');
    setHostDisconnectedAt(null);
    setDisconnectCountdown(null);

    removeStorageItem('seven-potters-session-id');
    removeStorageItem('seven-potters-room-code');
    removeStorageItem('seven-potters-is-host');
    removeStorageItem('seven-potters-player-name');
    removeStorageItem('seven-potters-is-gm');
    removeStorageItem('seven-potters-house');
    removeStorageItem('seven-potters-user-tag');
    removeStorageItem('seven-potters-hpvn-uid');
    removeStorageItem('seven-potters-session-timestamp');
    removeStorageItem('seven-potters-mock-state');
  };

  const assignRoles = () => {
    updateState(prev => {
      const playersToAssign = prev.players.filter(p => !p.isGM);
      const N = playersToAssign.length;
      if (N === 0) return prev;

      const { players: newPlayers, previousRoleMap: newRoleMap, roleHistory: newRoleHistory } = assignRolesFairly(
        prev.players,
        prev.previousRoleMap,
        prev.roleHistory
      );

      // Lưu lại personalHistory của Host nếu Host cũng là người chơi
      if (currentPlayerId) {
        const hostPlayer = newPlayers.find(p => p.id === currentPlayerId);
        if (hostPlayer && hostPlayer.personalHistory) {
          savePersonalHistory(hostPlayer.personalHistory);
        }
      }

      // Thang Chặng Co Giãn Tự Động theo Bảng Cân Bằng (Game Balance Optimization)
      const balance = getOptimalBalance(N);
      const maxStages = balance.maxStages;

      // Viện trợ Bảo bối Weasley cho phòng đông (N >= 14): Tặng thêm 1 Bột Khói Mù Peru
      let updatedWeasleyItems = prev.weasleyItems || INITIAL_WEASLEY_ITEMS;
      if (N >= 14) {
        updatedWeasleyItems = updatedWeasleyItems.map(item => 
          item.id === 'DARKNESS_POWDER' ? { ...item, count: 2, maxCount: 2 } : item
        );
      }

      return {
        ...prev,
        players: newPlayers,
        previousRoleMap: newRoleMap,
        roleHistory: newRoleHistory,
        maxStages,
        weasleyItems: updatedWeasleyItems,
        logs: [
          ...prev.logs, 
          `Hệ thống: Vai trò đã được phân phát công bằng & xoay tua ma thuật! Phi đội ${N} người ➔ Hành trình thiết lập ${maxStages} Chặng bay để về Hang Sóc.`,
          ...(N >= 14 ? ['Hệ thống: 🎁 Do phòng đông người, Tiệm Phù Thủy Weasley viện trợ thêm +1 Bột Khói Mù Peru!'] : [])
        ],
      };
    });
  };

  const addBot = () => {
    const botId = 'bot_' + Math.random().toString(36).substring(2, 9);
    const botNames = ['Neville', 'Luna', 'Seamus', 'Dean', 'Cho', 'Lavender', 'Colin', 'Parvati', 'Ginny', 'Oliver'];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)] + ' (Bot)';
    
    const newBot: Player = {
      id: botId,
      name: randomName,
      role: null,
      status: 'ALIVE',
      isGM: false,
      isBot: true,
    };
    
    updateState(prev => ({
      ...prev,
      players: [...prev.players, newBot],
      logs: [...prev.logs, `${randomName} đã được thêm vào phòng.`],
    }));
  };

  const startGame = () => {
    updateState(prev => {
      const nonGm = prev.players.filter(p => !p.isGM);
      const balance = getOptimalBalance(nonGm.length);
      const maxStages = prev.maxStages || balance.maxStages;
      return {
        ...prev,
        phase: 'NIGHT',
        round: 1,
        flightStage: 1,
        maxStages,
        currentSkyEvent: getSkyEventForStage(1, maxStages),
        escortPairs: {},
        goldenFlameUsed: false,
        logs: [
          ...prev.logs, 
          `Hệ thống: Trận Không Chiến Bảy Potter bùng nổ! Chặng 1/${maxStages}: Xuất phát từ Số 4 Privet Drive!`,
          'Hệ thống: 🌙 Biến cố [Bầu Trời Surrey Tĩnh Lặng] đang kích hoạt: Đa Quả Dịch bảo vệ danh tính, hãy chọn người bay hộ tống để cùng né đòn!',
          'Hệ thống: 🌙 BAN ĐÊM (Lượt 1) bắt đầu. Đến lượt Phe TỬ THẦN THỰC TỬ (Ám sát) & Phù thủy đặc biệt HỘI PHƯỢNG HOÀNG (Hermione, Dumbledore, Lupin, Kingsley) hành động! Mọi phù thủy hãy cơ động bay hộ tống hoặc thi triển bùa chú!'
        ],
      };
    });
  };

  /**
   * One-click Instant Solo Battle Generator
   * Instantly creates a complete 8-player battle with bot companions and launches straight into the in-game HUD
   */
  const startQuickSoloGame = () => {
    const myId = 'player_hero_harry';
    const myPlayer: Player = {
      id: myId,
      name: 'Harry Potter (Bạn)',
      role: ROLES.HARRY_POTTER,
      status: 'ALIVE',
      isGM: false,
      house: 'GRYFFINDOR',
    };

    const mockBots: Player[] = [
      { id: 'bot_hermione', name: 'Hermione Granger (Bot)', role: ROLES.HERMIONE_GRANGER, status: 'ALIVE', isGM: false, isBot: true, house: 'GRYFFINDOR' },
      { id: 'bot_ron', name: 'Ron Weasley (Bot)', role: ROLES.RON_WEASLEY, status: 'ALIVE', isGM: false, isBot: true, house: 'GRYFFINDOR' },
      { id: 'bot_snape', name: 'Severus Snape (Bot)', role: ROLES.SEVERUS_SNAPE, status: 'ALIVE', isGM: false, isBot: true, house: 'SLYTHERIN' },
      { id: 'bot_dumbledore', name: 'Albus Dumbledore (Bot)', role: ROLES.ALBUS_DUMBLEDORE, status: 'ALIVE', isGM: false, isBot: true, house: 'GRYFFINDOR' },
      { id: 'bot_lupin', name: 'Remus Lupin (Bot)', role: ROLES.REMUS_LUPIN, status: 'ALIVE', isGM: false, isBot: true, house: 'GRYFFINDOR' },
      { id: 'bot_voldemort', name: 'Lord Voldemort (Bot)', role: ROLES.VOLDEMORT, status: 'ALIVE', isGM: false, isBot: true, house: 'SLYTHERIN' },
      { id: 'bot_bellatrix', name: 'Bellatrix Lestrange (Bot)', role: ROLES.BELLATRIX_LESTRANGE, status: 'ALIVE', isGM: false, isBot: true, house: 'SLYTHERIN' },
    ];

    const allPlayers = [myPlayer, ...mockBots];
    setCurrentPlayerId(myId);
    setRoomCode(null);
    setIsHost(false);
    setStorageItem('seven-potters-session-id', myId);
    setStorageItem('seven-potters-player-name', 'Harry Potter (Bạn)');
    setStorageItem('seven-potters-is-gm', 'false');

    updateState(() => ({
      players: allPlayers,
      phase: 'NIGHT',
      round: 1,
      flightStage: 1,
      maxStages: 4,
      winner: null,
      currentSkyEvent: getSkyEventForStage(1, 4),
      pendingActions: {},
      escortPairs: {},
      skillStates: {},
      resolutionReport: null,
      interruptState: null,
      weasleyItems: INITIAL_WEASLEY_ITEMS,
      goldenFlameUsed: false,
      logs: [
        'Hệ thống: ⚡ Khởi động trận chiến Bảy Potter! Bạn nhập vai Harry Potter.',
        'Hệ thống: 🌙 BAN ĐÊM (Lượt 1) bắt đầu. Hãy chọn 1 đồng đội để Bay Hộ Tống hoặc ẩn mình!'
      ],
      roleHistory: {},
      previousRoleMap: {},
    }));
  };

  const setPhase = (phase: GamePhase) => {
    updateState(prev => {
      let newRound = prev.round;
      const maxS = prev.maxStages || 4;
      let newFlightStage = prev.flightStage || 1;
      let nextSkyEvent = prev.currentSkyEvent || getSkyEventForStage(1, maxS);
      let logMsg = `Hệ thống: Chuyển sang ${phase}.`;
      
      if (phase === 'NIGHT' && prev.phase === 'DAY') {
        newRound += 1;
        newFlightStage = Math.min(maxS, newFlightStage + 1);
        nextSkyEvent = getSkyEventForStage(newFlightStage, maxS);
        logMsg = `Hệ thống: Tiến vào Chặng ${newFlightStage}/${maxS}: [${nextSkyEvent.title}] (Lượt ${newRound}). 🌙 BAN ĐÊM: Đến lượt Phe TỬ THẦN THỰC TỬ (Ám sát) & Nhân vật HỘI PHƯỢNG HOÀNG (Hermione, Dumbledore, Lupin, Kingsley) hành động! Mọi phù thủy hãy cơ động bay hộ tống hoặc thi triển bùa chú!`;
      } else if (phase === 'NIGHT') {
        logMsg = `Hệ thống: 🌙 BAN ĐÊM (Lượt ${newRound}) bắt đầu. Đến lượt Phe TỬ THẦN THỰC TỬ (Ám sát) & Nhân vật HỘI PHƯỢNG HOÀNG (Hermione, Dumbledore, Lupin, Kingsley) hành động! Mọi phù thủy hãy cơ động bay hộ tống hoặc thi triển bùa chú!`;
      } else if (phase === 'DAY') {
        logMsg = `Hệ thống: ☀️ BAN NGÀY (Lượt ${newRound}) bắt đầu. Đến lượt TOÀN BỘ PHÙ THỦY (Tất Cả Các Phe: Hội Phượng Hoàng & Tử Thần Thực Tử) cùng thức dậy tranh luận & Biểu Quyết Tước Đũa Expelliarmus!`;
      }

      const winner = checkWinCondition(prev.players, newFlightStage, maxS);

      return {
        ...prev,
        phase: winner ? 'END' : phase,
        round: newRound,
        flightStage: newFlightStage,
        maxStages: maxS,
        currentSkyEvent: nextSkyEvent,
        escortPairs: {},
        winner,
        pendingActions: {},
        resolutionReport: null,
        logs: [
          ...prev.logs, 
          logMsg,
          ...(winner ? [`Hệ thống: 🏆 CHẶNG ${maxS} - HANG SÓC! Phi đội đã an toàn hạ cánh! Phe ${winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Tử Thần Thực Tử'} chiến thắng!`] : [])
        ],
      };
    });
  };

  const kickPlayer = (playerId: string) => {
    if (netRef.current && isHostRef.current) {
      netRef.current.sendKickPlayer(playerId);
    }

    updateState(prev => {
      const target = prev.players.find(p => p.id === playerId);
      if (!target) return prev;

      const remainingPlayers = prev.players.filter(p => p.id !== playerId);
      const newPendingActions = { ...prev.pendingActions };
      delete newPendingActions[playerId];
      Object.keys(newPendingActions).forEach(k => {
        if (newPendingActions[k].targetId === playerId) {
          delete newPendingActions[k];
        }
      });

      const winner = prev.phase !== 'LOBBY' ? checkWinCondition(remainingPlayers) : null;

      return {
        ...prev,
        players: remainingPlayers,
        pendingActions: newPendingActions,
        logs: [
          ...prev.logs, 
          `Hệ thống: Merlin đã đuổi ${target.name} khỏi phòng.`,
          ...(winner ? [`Hệ thống: Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])
        ],
        winner: winner || prev.winner,
        phase: winner ? 'END' : prev.phase
      };
    });
  };

  const killPlayer = (playerId: string) => {
    updateState(prev => {
      const target = prev.players.find(p => p.id === playerId);
      if (!target) return prev;

      const newPlayers = prev.players.map(p => 
        p.id === playerId ? { ...p, status: 'DEAD' as const } : p
      );
      
      const winner = checkWinCondition(newPlayers);

      return {
        ...prev,
        players: newPlayers,
        logs: [...prev.logs, `Hệ thống: ${target.name} đã ngã xuống!`, ...(winner ? [`Hệ thống: Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])],
        winner,
        phase: winner ? 'END' : prev.phase
      };
    });
  };

  const resetGame = () => {
    updateState(prev => {
      const carriedRoleMap: Record<string, string> = { ...(prev.previousRoleMap || {}) };
      const carriedRoleHistory: Record<string, RoleHistoryEntry> = { ...(prev.roleHistory || {}) };
      prev.players.forEach(p => {
        if (p.role) {
          carriedRoleMap[p.id] = p.role.id;
        }
      });

      return {
        ...DEFAULT_STATE,
        flightStage: 1,
        currentSkyEvent: SKY_EVENTS[1],
        escortPairs: {},
        goldenFlameUsed: false,
        weasleyItems: INITIAL_WEASLEY_ITEMS,
        previousRoleMap: carriedRoleMap,
        roleHistory: carriedRoleHistory,
        players: prev.players.map(p => ({
          ...p,
          role: null,
          status: 'ALIVE',
          previousRoleId: p.role?.id || p.previousRoleId,
          consecutiveEvil: p.consecutiveEvil,
          personalHistory: p.personalHistory,
        })),
        logs: ['Hệ thống: Merlin đã reset game. Đang chờ chia lại vai trò mới (chống lặp vai)...'],
      };
    });
  };

  const impersonatePlayer = (playerId: string) => {
    setCurrentPlayerId(playerId);
  };

  /**
   * Player Action: if client in multiplayer, forwards to Host. Otherwise executes locally.
   */
  const playerAction = (actionName: string, targetId: string) => {
    if (netRef.current && !isHostRef.current) {
      netRef.current.sendAction(actionName, targetId);
      if (currentPlayerId) {
        executePlayerActionCore(currentPlayerId, actionName, targetId);
      }
      return;
    }

    if (currentPlayerId) {
      executePlayerActionCore(currentPlayerId, actionName, targetId);
    }
  };

  /**
   * Execute Instant Skill: if client in multiplayer, forwards to Host. Otherwise executes locally.
   */
  const executeInstantSkill = (actionName: string, targetId: string) => {
    if (netRef.current && !isHostRef.current) {
      netRef.current.sendInstantSkill(actionName, targetId);
      return 'Đã gửi câu chú đến Merlin...';
    }

    if (currentPlayerId) {
      return executeInstantSkillCore(currentPlayerId, actionName, targetId);
    }
  };

  /**
   * Resolve Interrupt: if client in multiplayer, forwards to Host. Otherwise executes locally.
   */
  const resolveInterrupt = (choiceId: string) => {
    if (netRef.current && !isHostRef.current) {
      netRef.current.sendInterruptChoice(choiceId);
      return;
    }

    resolveInterruptCore(choiceId, currentPlayerId || undefined);
  };

  const executeWeasleyItemCore = (actorId: string, itemId: WeasleyItemId, targetId?: string): string => {
    const itemIndex = stateRef.current.weasleyItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return 'Không tìm thấy vật phẩm!';
    const item = stateRef.current.weasleyItems[itemIndex];

    const actor = stateRef.current.players.find(p => p.id === actorId);
    if (!actor) return 'Không tìm thấy người chơi!';

    const validation = validateWeasleyItemUse(actor, item, stateRef.current.phase);
    if (!validation.allowed) {
      if (actorId === currentPlayerId && validation.message) {
        setSkillToast(validation.message);
      }
      return validation.message || 'Không thể sử dụng vật phẩm!';
    }

    const updatedItems = [...stateRef.current.weasleyItems];
    updatedItems[itemIndex] = { ...item, count: item.count - 1 };

    const newSkillStates = { ...stateRef.current.skillStates };
    let logText = '';
    let privateReturnMsg = '';
    let activeFX: ActiveVisualFX | null = stateRef.current.activeFX || null;

    if (itemId === 'DARKNESS_POWDER') {
      newSkillStates['PERUVIAN_DARKNESS_ACTIVE'] = true;
      logText = `🌑 ${actor.name} đã ném Bột Khói Mù Peru! Màn sương đêm dày đặc bao phủ tầng mây, vô hiệu hóa đòn tấn công của Tử Thần Thực Tử trong ngày hôm nay!`;
      privateReturnMsg = logText;
      activeFX = {
        id: `fx_darkness_${Date.now()}`,
        type: 'PERUVIAN_DARKNESS',
        title: '🌑 BỘT KHÓI MÙ PERU',
        subtitle: `${actor.name} đã giải phóng màn sương đêm ma thuật của Tiệm Weasley!`,
        timestamp: Date.now(),
      };
    } else if (itemId === 'FAINTING_FANCIES') {
      if (!targetId) return 'Vui lòng chọn 1 người để chuốc Kẹo Ngất Xỉu!';
      const target = stateRef.current.players.find(p => p.id === targetId);
      newSkillStates[`FAINTING_FANCIES_${targetId}_R${stateRef.current.round}`] = true;
      logText = `🍬 ${actor.name} đã lén thả Kẹo Ngất Xỉu Cấp Tốc vào túi áo của ${target?.name}! ${target?.name} đã ngất xỉu và bị tước quyền bỏ phiếu đêm nay!`;
      privateReturnMsg = logText;
    }

    updateState({
      ...stateRef.current,
      weasleyItems: updatedItems,
      skillStates: newSkillStates,
      activeFX,
      logs: [...stateRef.current.logs, `Hệ thống: ${logText}`],
    });

    if (actorId === currentPlayerId) {
      setSkillToast(privateReturnMsg || logText);
    }
    return privateReturnMsg || logText;
  };

  const consumeWeasleyItem = (itemId: WeasleyItemId, targetId?: string): string | void => {
    if (currentPlayerId) {
      const myPlayer = stateRef.current.players.find(p => p.id === currentPlayerId);
      const item = stateRef.current.weasleyItems?.find(i => i.id === itemId);
      if (myPlayer && item) {
        const validation = validateWeasleyItemUse(myPlayer, item, stateRef.current.phase);
        if (!validation.allowed) {
          if (validation.message) {
            setSkillToast(validation.message);
          }
          return validation.message || 'Không thể sử dụng vật phẩm!';
        }
      }
    }

    if (netRef.current && !isHostRef.current) {
      netRef.current.broadcast({
        type: 'USE_WEASLEY_ITEM',
        senderId: netRef.current.myPlayerId,
        payload: { itemId, targetId },
      });
      return 'Đã kích hoạt bảo bối Tiệm Phù Thủy Weasley!';
    }

    if (currentPlayerId) {
      return executeWeasleyItemCore(currentPlayerId, itemId, targetId);
    }
  };

  const simulateBotActions = () => {
    updateState(prev => {
      const aliveBots = prev.players.filter(p => (p.isBot || p.name.includes('(Bot)') || p.id.startsWith('bot_')) && p.status !== 'DEAD' && !p.isGM);
      if (aliveBots.length === 0) return prev;

      const newPendingActions = { ...prev.pendingActions };
      const newLogs = [...prev.logs];

      aliveBots.forEach(bot => {
        const possibleTargets = prev.players.filter(p => p.id !== bot.id && p.status !== 'DEAD' && !p.isGM);
        if (possibleTargets.length === 0) return;

        if (prev.phase === 'DAY') {
          const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          newPendingActions[bot.id] = { actionName: 'biểu quyết tước đũa', targetId: randomTarget.id };
          newLogs.push(`[${bot.name}] đã biểu quyết Tước Đũa (Expelliarmus).`);
        } else if (prev.phase === 'NIGHT') {
          if (bot.role?.faction === 'DEATH_EATERS') {
            const goodTargets = possibleTargets.filter(p => p.role?.faction !== 'DEATH_EATERS');
            const targetPool = goodTargets.length > 0 ? goodTargets : possibleTargets;
            const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
            newPendingActions[bot.id] = { actionName: 'giết', targetId: randomTarget.id };
            newLogs.push(`[${bot.name}] đã hoàn tất hành động bí mật.`);
          } else if (bot.role?.id === 'ALBUS_DUMBLEDORE') {
            const prevShieldedId = prev.skillStates[`DUMBLEDORE_SHIELDED_R${prev.round - 1}`];
            const validTargets = possibleTargets.filter(p => p.id !== prevShieldedId);
            const targetPool = validTargets.length > 0 ? validTargets : possibleTargets;
            const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
            newPendingActions[bot.id] = { actionName: 'bảo vệ', targetId: randomTarget.id };
            newLogs.push(`[${bot.name}] đã hoàn tất hành động bí mật.`);
          } else if (bot.role?.id === 'KINGSLEY_SHACKLEBOLT') {
            if (Math.random() > 0.5) {
              newPendingActions[bot.id] = { actionName: 'chỉ huy ứng cứu', targetId: 'ALL' };
              newLogs.push(`[${bot.name}] đã sẵn sàng thế trận ứng cứu đồng đội!`);
            } else {
              const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
              newPendingActions[bot.id] = { actionName: 'bay hộ tống', targetId: randomTarget.id };
              newLogs.push(`[${bot.name}] đã xác nhận hành động bí mật.`);
            }
          } else if (bot.role?.id === 'RUBEUS_HAGRID') {
            const harry = possibleTargets.find(p => p.role?.id === 'HARRY_POTTER');
            const target = (harry && Math.random() > 0.3) ? harry : possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            newPendingActions[bot.id] = { actionName: 'bảo kê', targetId: target.id };
            newLogs.push(`[${bot.name}] đã xác nhận hành động bí mật.`);
          } else if (bot.role?.id === 'REMUS_LUPIN') {
            const lupinUsed = Boolean(prev.skillStates[`${bot.id}_LUPIN`]);
            const deadTeammates = prev.players.filter(p => p.status === 'DEAD' && !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX');
            if (!lupinUsed && deadTeammates.length > 0 && Math.random() > 0.3) {
              const target = deadTeammates[Math.floor(Math.random() * deadTeammates.length)];
              newPendingActions[bot.id] = { actionName: 'hồi sinh', targetId: target.id };
              newLogs.push(`[${bot.name}] đã xác nhận hành động bí mật.`);
            } else {
              const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
              newPendingActions[bot.id] = { actionName: 'bay hộ tống', targetId: randomTarget.id };
              newLogs.push(`[${bot.name}] đã xác nhận hành động bí mật.`);
            }
          } else {
            const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            newPendingActions[bot.id] = { actionName: 'bay hộ tống', targetId: randomTarget.id };
            newLogs.push(`[${bot.name}] đã xác nhận hành động bí mật.`);
          }
        }
      });

      return {
        ...prev,
        pendingActions: newPendingActions,
        logs: newLogs,
      };
    });
  };

  const revivePlayer = (playerId: string) => {
    updateState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, status: 'ALIVE' as const } : p
      ),
      logs: [...prev.logs, `Hệ thống: Merlin đã hồi sinh ${prev.players.find(p => p.id === playerId)?.name}!`]
    }));
  };

  const calculateResolution = () => {
    const summary: string[] = [];
    let deadPlayers: string[] = [];
    const injuredPlayers: string[] = [];
    const revivedPlayers: string[] = [];
    let needsInterrupt: InterruptState | null = null;
    const newSkillStates: Record<string, boolean | string> = {};
    let resolvedPlayers = [...gameState.players];

    if (gameState.phase === 'DAY') {
      const voteCounts: Record<string, number> = {};
      Object.entries(gameState.pendingActions).forEach(([playerId, action]) => {
        const voter = gameState.players.find(p => p.id === playerId);
        const target = gameState.players.find(p => p.id === action.targetId);
        if (!voter || voter.status === 'DEAD' || voter.isGM) return;
        if (!target || target.status === 'DEAD' || target.isGM) return;

        const isFainted = Boolean(gameState.skillStates[`FAINTING_FANCIES_${playerId}_R${gameState.round}`]);
        if (isFainted) {
          summary.push(`${voter.name} đang ngất xỉu do Kẹo Ngất Xỉu Cấp Tốc nên không thể bỏ phiếu!`);
          return;
        }

        const isPettigrewSilenced = Boolean(gameState.skillStates[`${playerId}_VOTE_SILENCED_R${gameState.round}`]);
        if (isPettigrewSilenced) {
          summary.push(`${voter.name} đang lẩn trốn dưới hình dạng chuột cống nên không thể bỏ phiếu hôm nay!`);
          return;
        }

        const normalizedActionName = action.actionName.toLowerCase().trim();
        const isVoteAction = normalizedActionName === 'biểu quyết tước đũa' || normalizedActionName === 'bỏ phiếu treo cổ';
        if (isVoteAction) {
          voteCounts[action.targetId] = (voteCounts[action.targetId] || 0) + 1;
        }
      });

      let maxVotes = 0;
      let topTargetId: string | null = null;
      let isTie = false;

      Object.entries(voteCounts).forEach(([targetId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          topTargetId = targetId;
          isTie = false;
        } else if (count === maxVotes) {
          isTie = true;
        }
      });

      if (!topTargetId) {
        summary.push("Không có ai bỏ phiếu hôm nay.");
      } else if (isTie) {
        summary.push(`Có sự hòa phiếu (cao nhất ${maxVotes} phiếu). Không ai bị tước đũa phép!`);
      } else {
        const target = gameState.players.find(p => p.id === topTargetId);

        if (target?.role?.id === 'PETER_PETTIGREW' && !gameState.skillStates[`${target.id}_RAT_ESCAPED`]) {
          summary.push(`🐀 HÓA THÚ ĐÀO TẨU! Khi bùa Expelliarmus giáng xuống, Peter Pettigrew hoảng loạn tự cắt một ngón tay, kích nổ khói mù và hóa thành chuột cống chui tọt vào bóng tối tẩu thoát! Đuôi Trùn thoát chết ngoạn mục nhưng bị cấm bỏ phiếu ban ngày ở vòng kế tiếp!`);
          newSkillStates[`${target.id}_RAT_ESCAPED`] = true;
          newSkillStates[`${target.id}_VOTE_SILENCED_R${gameState.round + 1}`] = true;
        } else {
          summary.push(`Với ${maxVotes} phiếu, ${target?.name} đã trúng Bùa Tước Khí Giới (Expelliarmus) và bị loại khỏi trận không chiến!`);
          
          if (target?.role?.id === 'BELLATRIX_LESTRANGE') {
            summary.push(`CẢNH BÁO: Bellatrix đã chết! Đêm nay Voldemort được quyền giết 2 người (Cơn Thịnh Nộ Bellatrix).`);
            newSkillStates[`voldemort_double_kill_R${gameState.round + 1}`] = true;
          } else if (target?.role?.id === 'LUCIUS_MALFOY') {
            summary.push(`CẢNH BÁO: Lucius đã chết! Đêm nay Voldemort bị phong ấn ma pháp (Lời Nguyền Lucius Malfoy).`);
            newSkillStates[`voldemort_silenced_R${gameState.round + 1}`] = true;
          } else if (target?.role?.id === 'NYMPHADORA_TONKS') {
            if (target.name.includes('(Bot)')) {
              const morphCandidates = gameState.players.filter(p => p.id !== target.id && !p.isGM && p.role);
              if (morphCandidates.length > 0) {
                const morphTarget = morphCandidates[Math.floor(Math.random() * morphCandidates.length)];
                summary.push(`Trước khi chết, Tonks (Bot) đã sao chép thân phận của ${morphTarget.name} và tiếp tục chiến đấu!`);
                resolvedPlayers = resolvedPlayers.map(p => p.id === target.id ? { ...p, role: morphTarget.role } : p);
              } else {
                deadPlayers.push(topTargetId);
              }
            } else {
              needsInterrupt = {
                playerId: target.id,
                type: 'TONKS_MORPH' as const,
                reason: 'Bạn đã chết. Hãy chọn 1 người để biến hình kế thừa!'
              };
            }
          }

          if (!needsInterrupt && !deadPlayers.includes(topTargetId)) {
            deadPlayers.push(topTargetId);
          }
        }
      }
      
      if (!needsInterrupt) {
        deadPlayers = processDominoEffect(gameState.players, deadPlayers, summary);
      }
    } else {
      // Ban Đêm (NIGHT): 4T Ám sát, Dumbledore bảo vệ, Snape bọc lót, Kingsley phản công, Hộ tống & Vật phẩm
      let shieldTargetId: string | null = null;
      let snapeShieldTargetId: string | null = null;
      let isKingsleyActive: boolean = false;
      let lupinReviveTargetId: string | null = null;
      let lupinActorId: string | null = null;
      
      const killVoteCounts: Record<string, number> = {};
      let voldemortKillTargetId: string | null = null;

      Object.entries(gameState.pendingActions).forEach(([playerId, action]) => {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player || player.status === 'DEAD' || player.isGM) return;

        // Check silencing (Kingsley is immune)
        const isKingsley = player.role?.id === 'KINGSLEY_SHACKLEBOLT';
        const isSectumSilenced = Boolean(gameState.skillStates[`${playerId}_SECTUMSEMPRA_SILENCED_R${gameState.round}`]);
        const isPotterFakeSilenced = Boolean(gameState.skillStates[`${playerId}_POTTERFAKE_SILENCED_R${gameState.round}`]);
        if ((isSectumSilenced || isPotterFakeSilenced) && !isKingsley && action.actionName !== 'NONE') {
          const reason = isSectumSilenced ? 'bùa lạc Sectumsempra' : 'Bùa Cấm Cửa của Potter Fake';
          summary.push(`${player.name} bị SILENCED bởi ${reason} nên không thể thi triển kỹ năng đêm nay!`);
          return;
        }

        const target = action.targetId === 'ALL' ? null : gameState.players.find(p => p.id === action.targetId);

        if (isProtectAction(action.actionName) && player.role?.id === 'ALBUS_DUMBLEDORE') {
          shieldTargetId = action.targetId;
          summary.push(`Cụ Dumbledore đã giăng màn bảo vệ lên ${target?.name}.`);
          newSkillStates[`DUMBLEDORE_SHIELDED_R${gameState.round}`] = shieldTargetId;
        } else if (isSectumsempraAction(action.actionName) && player.role?.id === 'SEVERUS_SNAPE') {
          snapeShieldTargetId = action.targetId;
          summary.push(`Giáo sư Severus Snape đã âm thầm giương đũa niệm Sectumsempra bọc lót cho ${target?.name}.`);
        } else if (isReviveAction(action.actionName) && player.role?.id === 'REMUS_LUPIN') {
          if (!gameState.skillStates[`${player.id}_LUPIN`]) {
            lupinReviveTargetId = action.targetId;
            lupinActorId = player.id;
          }
        } else if (isHagridEscortAction(action.actionName) && player.role?.id === 'RUBEUS_HAGRID') {
          summary.push(`Bác Hagrid đã đưa ${target?.name} lên chiếc mô-tô bay hộ tống!`);
        } else if (isKingsleyAction(action.actionName) && player.role?.id === 'KINGSLEY_SHACKLEBOLT') {
          isKingsleyActive = true;
          summary.push(`Thần Sáng Kingsley Shacklebolt đã sẵn sàng thế trận ứng cứu đồng đội (100% cứu sống)!`);
        } else if (isKillAction(action.actionName)) {
          if (player.role?.id === 'VOLDEMORT') {
            voldemortKillTargetId = action.targetId;
          } else {
            killVoteCounts[action.targetId] = (killVoteCounts[action.targetId] || 0) + 1;
          }
        }
      });

      // Determine Death Eater targets (supports Bellatrix Double Kill & Large Room Ambush for N >= 12)
      const isAmbushStage = gameState.currentSkyEvent?.modifier === 'VOLDEMORT_AMBUSH';
      const nonGmCount = gameState.players.filter(p => !p.isGM).length;
      const isVoldemortAlive = gameState.players.some(p => p.role?.id === 'VOLDEMORT' && p.status !== 'DEAD' && !deadPlayers.includes(p.id));
      const isLargeRoomAmbush = nonGmCount >= 12 && isAmbushStage && isVoldemortAlive;
      const isDoubleKill = Boolean(gameState.skillStates[`voldemort_double_kill_R${gameState.round}`]) || isLargeRoomAmbush;
      const sortedKillTargets = Object.entries(killVoteCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([targetId]) => targetId);

      const deathEaterTargetIds: string[] = [];

      if (voldemortKillTargetId === 'NONE') {
        summary.push("Chúa Tể Voldemort đã hạ lệnh án binh bất động: Phe Tử Thần Thực Tử không ra tay ám sát ai đêm nay!");
      } else if (voldemortKillTargetId) {
        deathEaterTargetIds.push(voldemortKillTargetId);
        if (isDoubleKill) {
          const secondTarget = sortedKillTargets.find(tId => tId !== 'NONE' && !deathEaterTargetIds.includes(tId));
          if (secondTarget) deathEaterTargetIds.push(secondTarget);
        }
      } else {
        // Voldemort is dead or did not submit an action
        const noneVotes = killVoteCounts['NONE'] || 0;
        const validPlayerTargets = sortedKillTargets.filter(tId => tId !== 'NONE');
        if (validPlayerTargets.length > 0) {
          const topTarget = validPlayerTargets[0];
          const topVotes = killVoteCounts[topTarget] || 0;
          if (topVotes > noneVotes) {
            deathEaterTargetIds.push(topTarget);
            if (isDoubleKill && validPlayerTargets.length > 1 && (killVoteCounts[validPlayerTargets[1]] || 0) > noneVotes) {
              deathEaterTargetIds.push(validPlayerTargets[1]);
            }
          } else {
            summary.push("Phe Tử Thần Thực Tử đã quyết định án binh bất động: Không ám sát ai đêm nay!");
          }
        } else if (noneVotes > 0) {
          summary.push("Phe Tử Thần Thực Tử đã quyết định án binh bất động: Không ám sát ai đêm nay!");
        }
      }

      // Check Lucius Malfoy's silence curse
      const isSilenced = Boolean(gameState.skillStates[`voldemort_silenced_R${gameState.round}`]);
      if (isSilenced) {
        summary.push("Chúa Tể Voldemort bị phong ấn ma pháp (Lời Nguyền Lucius Malfoy) và không thể ra đòn đêm nay!");
        deathEaterTargetIds.length = 0;
      }

      // Check Peruvian Instant Darkness Powder
      if (gameState.skillStates['PERUVIAN_DARKNESS_ACTIVE']) {
        summary.push("🌑 BỘT KHÓI MÙ PERU: Màn đêm ma thuật dày đặc bao phủ toàn bộ bầu trời! Đòn ám sát của Tử Thần Thực Tử bị mất phương hướng hoàn toàn và đánh trượt vào khoảng không!");
        deathEaterTargetIds.length = 0;
      }

      const maxKills = isDoubleKill ? 2 : 1;
      const targetsToProcess = deathEaterTargetIds.slice(0, maxKills);

      if (targetsToProcess.length > 0) {
        if (isDoubleKill && targetsToProcess.length > 1) {
          if (isLargeRoomAmbush) {
            summary.push("⚡ VÒNG VÂY PHỤC KÍCH: Bầu trời rực lửa, Chúa Tể Voldemort chỉ huy Tử Thần Thực Tử phát động ám sát dồn dập 2 mục tiêu!");
          } else {
            summary.push("⚡ CƠN THỊNH NỘ BELLATRIX: Tử Thần Thực Tử phát động ám sát liên hoàn 2 mục tiêu đêm nay!");
          }
        }

        targetsToProcess.forEach(deathEaterTargetId => {
          const victim = gameState.players.find(p => p.id === deathEaterTargetId);
          if (!victim || victim.status === 'DEAD' || deadPlayers.includes(victim.id)) return;
          
          if (deathEaterTargetId === shieldTargetId) {
            summary.push(`Tử Thần Thực Tử tấn công ${victim.name}, nhưng đã bị Màn chắn Dumbledore chặn đứng hoàn toàn!`);
          } else if (deathEaterTargetId === snapeShieldTargetId) {
            summary.push(`⚔️ SECTUMSEMPRA CAN THIỆP! Trong bóng đêm, bùa chém của Severus Snape đã rạch nát đòn tấn công của Tử Thần Thực Tử, cứu sống ${victim.name} trong gang tấc!`);
          } else {
            let escortShielded = false;
            let ronShielded = false;
            let goldenFlameShielded = false;

            // Check if Hagrid is escorting this target
            const hagrid = gameState.players.find(p => p.role?.id === 'RUBEUS_HAGRID' && p.status !== 'DEAD' && !deadPlayers.includes(p.id));
            const hagridProtecting = Boolean(
              hagrid && Object.entries(gameState.pendingActions).some(([pId, act]) => 
                pId === hagrid.id && (isHagridEscortAction(act.actionName) || isEscortAction(act.actionName)) && act.targetId === deathEaterTargetId
              )
            );

            // Check active Escort from formation flying (excluding Hagrid to avoid double count)
            const activeEscorts = Object.entries(gameState.pendingActions)
              .filter(([pId, act]) => isEscortAction(act.actionName) && act.targetId === deathEaterTargetId && pId !== hagrid?.id)
              .map(([pId]) => gameState.players.find(p => p.id === pId))
              .filter((p): p is Player => Boolean(p && p.status !== 'DEAD' && !deadPlayers.includes(p.id)));

            const primaryEscort = hagridProtecting ? hagrid : (activeEscorts[0] || null);
            const modifier = gameState.currentSkyEvent?.modifier || 'PERFECT_DISGUISE';

            // 1. Evade Stages (Stage 1 & 2): Escort evades successfully, Golden Flame preserved! (No escort identity revealed)
            if (primaryEscort && (modifier === 'PERFECT_DISGUISE' || modifier === 'TURBULENCE_BLIND')) {
              escortShielded = true;
              if (modifier === 'PERFECT_DISGUISE') {
                summary.push(`Đòn tấn công của Tử Thần Thực Tử nhắm vào ${victim.name} đã bị chệch hướng hoàn toàn giữa màn đêm! ${victim.name} an toàn thoát nạn!`);
              } else {
                summary.push(`Cơn bão sấm chớp mù mịt làm đòn tấn công nhắm vào ${victim.name} bị nổ tung giữa không trung! ${victim.name} an toàn thoát nạn!`);
              }
            } 
            // 2. Golden Flame Wand Retaliation (Tia Lửa Vàng): CHỈ cứu Harry Potter khi bị tấn công trực diện (không cứu người khác, không silence Voldemort)
            else if (!gameState.goldenFlameUsed && !newSkillStates['GOLDEN_FLAME_TRIGGERED'] && victim.role?.id === 'HARRY_POTTER') {
              goldenFlameShielded = true;
              newSkillStates['GOLDEN_FLAME_TRIGGERED'] = true;
              summary.push(`⚡ TIA LỬA VÀNG BÙNG NỔ! Chiếc đũa phép lông đuôi phượng hoàng của Harry tự động nhận diện và phản pháo Chúa Tể Voldemort! Đòn chí mạng bị thiêu rụi, cứu sống Harry Potter trong gang tấc!`);
            }
            // 3. Hagrid Sacrifice (when Golden Flame already spent)
            else if (hagridProtecting && hagrid) {
              summary.push(`Tử Thần Thực Tử tấn công trong đêm! Bác Hagrid đã dũng cảm tử trận!`);
              if (!deadPlayers.includes(hagrid.id)) {
                deadPlayers.push(hagrid.id);
              }
              escortShielded = true;
            }
            // 4. Bay Hộ Tống Heroic Sacrifice (Stage 3+, when Golden Flame already spent)
            else if (activeEscorts.length > 0) {
              escortShielded = true;
              const escort = activeEscorts[0];
              summary.push(`Tử Thần Thực Tử tấn công trong đêm! ${escort.name} đã trúng đòn tử thương và tử trận!`);
              if (!deadPlayers.includes(escort.id)) {
                deadPlayers.push(escort.id);
              }
            }
            // 5. Ron Weasley Sacrifice (when Golden Flame already spent and no escort)
            else if (victim.role?.id === 'HARRY_POTTER' && resolvedPlayers.find(p => p.role?.id === 'RON_WEASLEY' && p.status !== 'DEAD' && !deadPlayers.includes(p.id))) {
              const ron = resolvedPlayers.find(p => p.role?.id === 'RON_WEASLEY' && p.status !== 'DEAD' && !deadPlayers.includes(p.id))!;
              summary.push(`Tử Thần Thực Tử tấn công Harry Potter thật! Nhưng Ron Weasley đã dũng cảm lao ra đỡ đòn chí mạng thay cho Harry! Ron Weasley tử trận!`);
              deadPlayers.push(ron.id);
              ronShielded = true;
            }
            // 6. Direct Attack Hits
            else {
              if (victim.role?.id === 'HARRY_POTTER') {
                summary.push(`Chúa Tể Voldemort đã tấn công trúng Harry Potter thật! Tia Chớp Định Mệnh giáng xuống!`);
              } else if (victim.role?.id === 'POTTER_FAKE') {
                summary.push(`Tử Thần Thực Tử đã bắn trúng một Potter Giả mạo (${victim.name})!`);
              } else {
                summary.push(`Tử Thần Thực Tử đã hạ sát ${victim.name}!`);
              }

              if (victim.role?.id === 'SEVERUS_SNAPE') {
                summary.push(`Giáo sư Snape đã trúng Lời Nguyền Hắc Ám và gục ngã!`);
              }

              if (victim.role?.id === 'MUNDUNGUS_FLETCHER') {
                const alreadyUsed = Boolean(gameState.skillStates[`${victim.id}_SWAP_USED`]);
                if (alreadyUsed) {
                  summary.push(`Mundungus Fletcher đã từng dùng quyền tráo đổi sinh mệnh trước đó, nay không thể chạy trốn và tử trận!`);
                  if (!deadPlayers.includes(victim.id)) deadPlayers.push(victim.id);
                } else if (victim.name.includes('(Bot)')) {
                  const swapCandidates = gameState.players.filter(p => p.id !== victim.id && !p.isGM && p.status !== 'DEAD' && !deadPlayers.includes(p.id));
                  if (swapCandidates.length > 0) {
                    const swapTarget = swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
                    summary.push(`Mundungus Fletcher (Bot) đã hoảng loạn Độn Thổ và lôi ${swapTarget.name} ra chết thay!`);
                    deadPlayers.push(swapTarget.id);
                    newSkillStates[`${victim.id}_SWAP_USED`] = true;
                  } else {
                    deadPlayers.push(victim.id);
                  }
                } else {
                  needsInterrupt = {
                    playerId: victim.id,
                    type: 'MUNDUNGUS_SWAP' as const,
                    reason: 'Mundungus bị bắn trúng! Hãy chọn 1 người chết thay!'
                  };
                }
              }

              // NOTE: Bill & Fleur couple protection đã được xóa
              // Bill giờ có kỹ năng giải phong ấn + reveal 4T khi chết
              // Fleur giờ có kỹ năng chém người với Lưỡi Kiếm Gryffindor

              if (victim.role?.id === 'NYMPHADORA_TONKS') {
                if (victim.name.includes('(Bot)')) {
                  const morphCandidates = gameState.players.filter(p => p.id !== victim.id && !p.isGM && p.role && !deadPlayers.includes(p.id));
                  if (morphCandidates.length > 0) {
                    const morphTarget = morphCandidates[Math.floor(Math.random() * morphCandidates.length)];
                    summary.push(`Trước khi ngã xuống, Tonks (Bot) đã biến hình thành ${morphTarget.name} và tiếp tục chiến đấu!`);
                    resolvedPlayers = resolvedPlayers.map(p => p.id === victim.id ? { ...p, role: morphTarget.role } : p);
                  } else {
                    deadPlayers.push(victim.id);
                  }
                } else {
                  needsInterrupt = {
                    playerId: victim.id,
                    type: 'TONKS_MORPH' as const,
                    reason: 'Tonks trúng đòn tử thương! Hãy chọn 1 người để sao chép thân phận!'
                  };
                }
              }
            }

            if (!needsInterrupt &&
                victim.role?.id !== 'MUNDUNGUS_FLETCHER' &&
                !ronShielded &&
                !goldenFlameShielded &&
                !escortShielded) {
              if (!deadPlayers.includes(deathEaterTargetId)) {
                deadPlayers.push(deathEaterTargetId);
              }
            }
          }
        });
      } else {
        if (!isSilenced) {
          summary.push("Tử Thần Thực Tử không thống nhất được mục tiêu tấn công hoặc không ra đòn!");
        }
      }

      // Check Snape's Sectumsempra collateral damage (stray spell)
      if (snapeShieldTargetId && snapeShieldTargetId !== 'NONE' && !targetsToProcess.includes(snapeShieldTargetId)) {
        const strayVictim = gameState.players.find(p => p.id === snapeShieldTargetId && p.status !== 'DEAD' && !deadPlayers.includes(p.id));
        if (strayVictim) {
          summary.push(`🩸 BÙA LẠC SECTUMSEMPRA: Do bay tốc độ cao trong đêm tối, bùa chú của Snape đã vô tình cắt đứt tai và làm bị thương ${strayVictim.name} (như George Weasley)! Mục tiêu bị phong ấn kỹ năng ở vòng kế tiếp!`);
          newSkillStates[`${strayVictim.id}_SECTUMSEMPRA_SILENCED_R${gameState.round + 1}`] = true;
        }
      }

      if (isKingsleyActive) {
        // Kỹ năng Thần Sáng (buffed): Nếu có 1 HPH bị TTTT giết ban đêm, Kingsley CỨU SỐNG người đó (100% thay vì 50%)
        const fallenOrderMemberIds = deadPlayers.filter(id => {
          const p = gameState.players.find(x => x.id === id);
          return p && p.role?.faction === 'ORDER_OF_PHOENIX';
        });

        if (fallenOrderMemberIds.length > 0) {
          // Cứu sống 1 thành viên Hội bị TTTT hạ sát (100% success)
          const rescuedId = fallenOrderMemberIds[0];
          const rescuedPlayer = gameState.players.find(p => p.id === rescuedId);
          deadPlayers = deadPlayers.filter(id => id !== rescuedId);
          summary.push(`🛡️ [THÀNH CÔNG - 100%] Thần Sáng Kingsley Shacklebolt đã kịp thời xuất hiện, tung bùa hộ mệnh giải cứu ${rescuedPlayer?.name || 'đồng đội'} thoát chết trong gang tấc và hồi phục an toàn!`);
        }
      }

      if (lupinReviveTargetId && lupinActorId) {
        const lupin = gameState.players.find(p => p.id === lupinActorId);
        if (lupin && lupin.status !== 'DEAD' && !deadPlayers.includes(lupin.id)) {
          const target = gameState.players.find(p => p.id === lupinReviveTargetId);
          const isTargetDead = target?.status === 'DEAD' || deadPlayers.includes(lupinReviveTargetId);
          if (target && isTargetDead) {
            newSkillStates[`${lupin.id}_LUPIN`] = true;
            if (deadPlayers.includes(lupinReviveTargetId)) {
              deadPlayers = deadPlayers.filter(id => id !== lupinReviveTargetId);
            }
            if (!revivedPlayers.includes(lupinReviveTargetId)) {
              revivedPlayers.push(lupinReviveTargetId);
            }
            resolvedPlayers = resolvedPlayers.map(p => p.id === lupinReviveTargetId ? { ...p, status: 'ALIVE' as const } : p);
            summary.push(`⚡ PHÉP MÀU LUPIN: Đêm qua, Remus Lupin đã dùng Thuốc Hồi Sinh độc dược quý giá, cứu sống ${target.name} trở lại trận chiến!`);
          }
        }
      }

      if (!needsInterrupt) {
        deadPlayers = processDominoEffect(gameState.players, deadPlayers, summary);
      }
    }

    updateState({
      ...gameState,
      players: resolvedPlayers,
      resolutionReport: {
        deadPlayers,
        injuredPlayers,
        revivedPlayers,
        summary,
        needsInterrupt,
        newSkillStates
      },
      interruptState: needsInterrupt
    });
  };

  const applyResolution = () => {
    if (!gameState.resolutionReport) return;
    const { deadPlayers, injuredPlayers, revivedPlayers, summary, newSkillStates } = gameState.resolutionReport;
    
    let newPlayers = [...gameState.players];
    (revivedPlayers || []).forEach(id => {
      newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'ALIVE' as const } : p);
    });
    deadPlayers.forEach(id => {
      newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'DEAD' as const } : p);
    });
    (injuredPlayers || []).forEach(id => {
      if (!deadPlayers.includes(id)) {
        newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'INJURED' as const } : p);
      }
    });

    const isNextDay = gameState.phase === 'NIGHT';
    const isNextNight = gameState.phase === 'DAY';
    const maxS = gameState.maxStages || 4;
    const nextFlightStage = isNextNight ? Math.min(maxS, (gameState.flightStage || 1) + 1) : (gameState.flightStage || 1);
    const winner = checkWinCondition(newPlayers, nextFlightStage, maxS);
    const nextRound = winner ? gameState.round : (isNextNight ? gameState.round + 1 : gameState.round);
    const resolutionLogs = summary.map(line => `Hệ thống: ${line}`);

    const isGoldenFlameTriggered = Boolean(newSkillStates?.['GOLDEN_FLAME_TRIGGERED']);
    const updatedGoldenFlameUsed = gameState.goldenFlameUsed || isGoldenFlameTriggered;

    // Reset night buffs like Peruvian darkness when day arrives
    const nextSkillStates = { ...gameState.skillStates, ...(newSkillStates || {}) };
    if (isNextDay) {
      delete nextSkillStates['PERUVIAN_DARKNESS_ACTIVE'];
    }

    const nextSkyEvent = getSkyEventForStage(nextFlightStage, maxS);
    const flightLog = (isNextNight && !winner) 
      ? [`Hệ thống: ✈️ Phi đội vượt qua hiểm nguy, tiến vào Chặng ${nextFlightStage}/${maxS}: [${nextSkyEvent.title}]! (Lượt ${nextRound})`] 
      : [];

    // Cinematic Visual FX Selection
    let activeFX: ActiveVisualFX | null = null;
    const now = Date.now();

    if (isGoldenFlameTriggered) {
      activeFX = {
        id: `fx_golden_flame_${now}`,
        type: 'GOLDEN_FLAME',
        title: '⚡ TIA LỬA VÀNG BÙNG NỔ',
        subtitle: 'Lõi Kép Phượng Hoàng Tự Vệ · Đũa Phép Lucius Malfoy Nổ Tung!',
        timestamp: now,
      };
    } else if (deadPlayers.some(id => gameState.players.find(p => p.id === id)?.role?.id === 'HARRY_POTTER')) {
      activeFX = {
        id: `fx_lightning_${now}`,
        type: 'LIGHTNING_STRIKE',
        title: '⚡ TIA CHỚP ĐỊNH MỆNH',
        subtitle: 'Chúa Tể Voldemort Đã Tìm Thấy & Tấn Công Harry Potter Thật!',
        timestamp: now,
      };
    } else if (deadPlayers.length > 0) {
      const deadNames = deadPlayers
        .map(id => gameState.players.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      activeFX = {
        id: `fx_avada_${now}`,
        type: 'AVADA_KEDAVRA',
        title: '🟢 AVADA KEDAVRA',
        subtitle: `Tia chớp lục sắc xé toạc màn đêm: ${deadNames} đã tử nạn!`,
        timestamp: now,
      };
    } else if (isNextNight && !winner) {
      if (nextFlightStage >= maxS) {
        activeFX = {
          id: `fx_burrow_${now}`,
          type: 'BURROW_SHIELD',
          title: '🏡 HẠ CÁNH AN TOÀN HANG SÓC',
          subtitle: 'Hàng Rào Bùa Chú Cổ Xưa Kích Hoạt · Chiến Dịch Thắng Lợi!',
          timestamp: now,
        };
      } else if (nextFlightStage === 3) {
        activeFX = {
          id: `fx_darkmark_${now}`,
          type: 'DARK_MARK_AMBUSH',
          title: '💀 VÒNG VÂY HẮC ÁM & PHỤC KÍCH',
          subtitle: 'Chúa Tể Voldemort Đích Thân Xuất Kích · Dấu Hiệu Hắc Ám Rực Sáng!',
          timestamp: now,
        };
      } else if (nextFlightStage === 2) {
        activeFX = {
          id: `fx_thunder_${now}`,
          type: 'THUNDERSTORM_STAGE',
          title: '⚡ TẦNG MÂY GIÔNG & SẤM CHỚP',
          subtitle: 'Nghẽn Khí Quyển · Tầm Nhìn Mù Mịt Giữa Bão Táp Sấm Chớp!',
          timestamp: now,
        };
      }
    }

    updateState({
      ...gameState,
      players: newPlayers,
      flightStage: nextFlightStage,
      maxStages: maxS,
      currentSkyEvent: nextSkyEvent,
      escortPairs: {},
      goldenFlameUsed: updatedGoldenFlameUsed,
      pendingActions: {},
      resolutionReport: null,
      skillStates: nextSkillStates,
      activeFX,
      logs: [
        ...gameState.logs,
        ...resolutionLogs,
        ...flightLog,
        ...(winner ? [`Hệ thống: 🏆 Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])
      ],
      winner,
      phase: winner ? 'END' : (gameState.phase === 'DAY' ? 'NIGHT' : 'DAY'),
      round: nextRound
    });
  };

  const triggerVisualFX = useCallback((fx: ActiveVisualFX) => {
    updateState(prev => ({
      ...prev,
      activeFX: fx,
    }));
  }, [updateState]);

  const clearVisualFX = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeFX: null,
    }));
  }, [updateState]);

  return (
    <GameContext.Provider value={{
      gameState,
      currentPlayerId,
      roomCode,
      isHost,
      connStatus,
      errorMsg,
      offlinePlayerIds,
      hostDisconnectedAt,
      disconnectCountdown,
      createRoom,
      joinRoom,
      joinGame,
      leaveGame,
      startGame,
      setPhase,
      assignRoles,
      addBot,
      kickPlayer,
      killPlayer,
      impersonatePlayer,
      playerAction,
      revivePlayer,
      resetGame,
      calculateResolution,
      applyResolution,
      executeInstantSkill,
      resolveInterrupt,
      simulateBotActions,
      skillToast,
      clearSkillToast,
      consumeWeasleyItem,
      triggerVisualFX,
      clearVisualFX,
      startQuickSoloGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
