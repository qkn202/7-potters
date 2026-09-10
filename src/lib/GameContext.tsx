"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, GamePhase, Faction, Role, NetworkMessage, WeasleyItem, WeasleyItemId, SkyEvent, ActiveVisualFX, ActiveVisualFXType } from './types';
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
  useWeasleyItem: (itemId: WeasleyItemId, targetId?: string) => string | void;
  triggerVisualFX: (fx: ActiveVisualFX) => void;
  clearVisualFX: () => void;
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
  {
    id: 'TWO_WAY_MIRROR',
    name: 'Gương Hai Chiều Của Sirius',
    count: 1,
    maxCount: 1,
    description: 'Chiếu gương về phía 1 người chơi trên bầu trời để soi rõ phe phái bí mật (Hội Phượng Hoàng hay Tử Thần Thực Tử).',
    flavor: 'Bộ gương liên lạc bí mật từng được James Potter và Sirius Black sử dụng tại Hogwarts.',
    icon: 'Eye',
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
};

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
  
  // LORE WIN CONDITION: Đạt Chặng Đích Hang Sóc (flightStage >= maxStages) và Harry Potter vẫn sống!
  const targetStage = maxStages || 4;
  const aliveHarry = alivePlayers.find(p => p.role?.id === 'HARRY_POTTER');
  if ((flightStage || 1) >= targetStage && aliveHarry && hph.length > 0) {
    return 'ORDER_OF_PHOENIX';
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

  const processDominoEffect = (players: Player[], deadIds: string[], summary: string[]) => {
    let newDeadIds = [...deadIds];
    let changed = true;
    const weasleyRoles = ['ARTHUR_WEASLEY', 'FRED_WEASLEY', 'GEORGE_WEASLEY'];
    
    while (changed) {
      changed = false;
      for (const deadId of newDeadIds) {
        const p = players.find(x => x.id === deadId);
        if (p && p.role && weasleyRoles.includes(p.role.id)) {
          const otherWeasleys = players.filter(
            x => x.role && weasleyRoles.includes(x.role.id) && !newDeadIds.includes(x.id) && x.status !== 'DEAD'
          );
          if (otherWeasleys.length > 0) {
            otherWeasleys.forEach(w => {
              newDeadIds.push(w.id);
              summary.push(`Hệ thống: Do ${p.name} đã chết, ${w.name} cũng bị chết theo (Hiệu ứng Domino Weasley)!`);
              changed = true;
            });
          }
        }
      }
    }
    return newDeadIds;
  };

  // Core Action Execution (used locally and on Host receiving Network messages)
  const executePlayerActionCore = useCallback((actorId: string, actionName: string, targetId: string) => {
    updateState(prev => {
      const me = prev.players.find(p => p.id === actorId);
      if (!me) return prev;
      const target = targetId === 'ALL' ? null : prev.players.find(p => p.id === targetId);
      if (targetId !== 'ALL' && !target) return prev;
      
      const isPublicVote = actionName === 'Bỏ phiếu Treo Cổ' || actionName === 'Biểu quyết Tước Đũa';
      const isEscort = actionName === 'Bay Hộ Tống';
      const logMessage = isPublicVote
        ? `[${me.name}] đã biểu quyết Tước Đũa (Expelliarmus).`
        : isEscort
          ? `[${me.name}] đã cơ động bay hộ tống sát cánh cùng [${target?.name}].`
          : `[${me.name}] đã xác nhận hành động bí mật.`;

      const newEscortPairs = isEscort && target
        ? { ...(prev.escortPairs || {}), [me.id]: target.id }
        : prev.escortPairs;

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

    if (actionName === 'Soi Danh Tính' && me.role?.id === 'HERMIONE_GRANGER') {
      if (target.role?.id === 'HARRY_POTTER' || target.role?.id === 'VOLDEMORT') {
        return 'Bùa chú bị phản phệ! Bạn không thể soi danh tính của Harry Potter hoặc Chúa Tể Voldemort (theo luật thẻ bài)!';
      }

      const stateKey = `${me.id}_HERMIONE_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng soi trong lượt này rồi!';
      
      let roleName = target.role?.name || 'Không rõ';
      if (target.role?.id === 'SEVERUS_SNAPE') roleName = 'Tử Thần Thực Tử';

      updateState({
        ...curState,
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: Hermione đã soi danh tính của ${target.name}.`]
      });
      return `Vai trò của ${target.name} là: ${roleName}`;
    }

    if (actionName === 'Soi Phe' && me.role?.id === 'PETER_PETTIGREW') {
      const stateKey = `${me.id}_PETTIGREW_R${curState.round}`;
      if (curState.skillStates[stateKey]) return 'Bạn đã dùng kỹ năng soi phe trong lượt này rồi!';

      let faction = target.role?.faction === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 
                    target.role?.faction === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : 'Trung Lập';
      if (target.role?.id === 'SEVERUS_SNAPE') faction = 'Hội Phượng Hoàng';

      updateState({
        ...curState,
        skillStates: { ...curState.skillStates, [stateKey]: true },
        logs: [...curState.logs, `Hệ thống: Pettigrew đã soi phe của ${target.name}.`]
      });
      return `Phe của ${target.name} là: ${faction}`;
    }

    if (actionName === 'Hồi Sinh' && me.role?.id === 'REMUS_LUPIN') {
      if (curState.skillStates[`${me.id}_LUPIN`]) return 'Bạn đã hết thuốc hồi sinh!';
      if (target.status === 'ALIVE') return 'Mục tiêu đang hoàn toàn khỏe mạnh, không cần dùng thuốc!';
      updateState({
        ...curState,
        players: curState.players.map(p => p.id === targetId ? { ...p, status: 'ALIVE' as const } : p),
        skillStates: { ...curState.skillStates, [`${me.id}_LUPIN`]: true },
        logs: [...curState.logs, `Hệ thống: Lupin đã dùng thuốc hồi sinh lên ${target.name}!`]
      });
      return 'Đã hồi phục sinh lực thành công!';
    }

    if (actionName === 'Bắn Lén' && me.role?.id === 'ALASTOR_MOODY') {
      if (curState.skillStates[`${me.id}_MOODY`]) return 'Bạn đã hết đạn!';
      if (curState.phase !== 'NIGHT') return 'Chỉ được bắn lén vào ban đêm!';
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể bắn!';
      
      let deadIds = [targetId];
      let logs = [...curState.logs, `Hệ thống: Đoàng! Moody đã bắn lén chết ${target.name} trong đêm!`];
      
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

    if (actionName === 'Cắn' && me.role?.id === 'FENRIR_GREYBACK') {
      if (curState.skillStates[`${me.id}_FENRIR`]) return 'Bạn đã dùng vết cắn ma sói rồi (chỉ dùng 1 lần trong ván)!';
      if (target.status === 'DEAD') return 'Mục tiêu đã chết, không thể cắn!';
      if (target.role?.faction === 'DEATH_EATERS') return 'Không thể cắn đồng minh Tử Thần Thực Tử!';

      const updatedTargetRole: Role = {
        ...(target.role || {
          id: 'WEREWOLF',
          name: 'Người Sói',
          description: 'Đã bị Fenrir cắn thành Ma Sói',
          badge: 'wolf'
        }),
        faction: 'NEUTRAL',
        title: 'Ma Sói Lang Thang · Cursed Werewolf',
        ability: 'Bạn đã bị Fenrir cắn thành Ma Sói! Bạn mất toàn bộ năng lực cũ và nay chiến đấu độc lập (Phe Trung Lập).'
      };
      
      updateState({
        ...curState,
        players: curState.players.map(p => p.id === targetId ? { ...p, role: updatedTargetRole } : p),
        skillStates: { ...curState.skillStates, [`${me.id}_FENRIR`]: true },
        logs: [...curState.logs, `Hệ thống: 1 tiếng sói hú rợn người... Fenrir Greyback đã gieo vết cắn lên ${target.name}! Mục tiêu nay thuộc phe Trung Lập.`]
      });
      return `Đã cắn ${target.name}! Mục tiêu nay chuyển sang phe Trung Lập.`;
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
            const existingIdx = prev.players.findIndex(p => p.id === reqPlayer.id || p.name === reqPlayer.name);
            let nextPlayers = [...prev.players];
            let logMsg = '';

            if (existingIdx >= 0) {
              // Reconnect existing player
              nextPlayers[existingIdx] = {
                ...nextPlayers[existingIdx],
                id: reqPlayer.id,
                name: reqPlayer.name,
                house: reqPlayer.house || nextPlayers[existingIdx].house,
                userTag: reqPlayer.userTag || nextPlayers[existingIdx].userTag,
                hpvnUid: reqPlayer.hpvnUid || nextPlayers[existingIdx].hpvnUid,
              };
              logMsg = `Hệ thống: ${reqPlayer.name} đã kết nối lại vào phòng.`;
            } else {
              // New player
              nextPlayers.push(reqPlayer);
              logMsg = `Hệ thống: ${reqPlayer.name} (${reqPlayer.isGM ? 'Quản trò' : 'Phù thủy'}) đã gia nhập phòng!`;
            }

            return {
              ...prev,
              players: nextPlayers,
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
            const itemResult = useWeasleyItemCore(msg.senderId, itemId, targetId);
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
            executePlayerActionCore(msg.senderId, 'Bay Hộ Tống', targetId);
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
              localStorage.setItem('seven-potters-mock-state', JSON.stringify(syncedState));
            } catch (e) {}
          }
        } else if (msg.type === 'INSTANT_SKILL_RESULT') {
          const { targetPlayerId, result } = msg.payload || {};
          if (targetPlayerId === currentPlayerIdRef.current && result) {
            setSkillToast(result);
          }
        } else if (msg.type === 'KICK_PLAYER') {
          if (msg.payload?.targetId === currentPlayerIdRef.current) {
            setErrorMsg('Bạn đã bị Quản trò mời ra khỏi phòng.');
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
        setErrorMsg('Phòng đã giải tán do Quản trò mất kết nối quá 10 phút.');
        leaveGame();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hostDisconnectedAt]);

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
          me = {
            id: myId,
            name: savedName,
            role: null,
            status: 'ALIVE',
            isGM: getStorageItem('seven-potters-is-gm') === 'true',
            house: getStorageItem('seven-potters-house') || undefined,
            userTag: getStorageItem('seven-potters-user-tag') || undefined,
            hpvnUid: getStorageItem('seven-potters-hpvn-uid') || undefined,
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

      const restorePlayer: Player = {
        id: sessionId,
        name: savedName,
        role: null,
        status: 'ALIVE',
        isGM: savedIsGM,
        house: savedHouse,
        userTag: savedUserTag,
        hpvnUid: savedHpvnUid,
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
    const hostId = 'player_' + Math.random().toString(36).substring(2, 9);
    
    const hostPlayer: Player = {
      id: hostId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
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
        logs: [`Hệ thống: Phòng ${code} đã được tạo bởi ${name} (${isGM ? 'Quản trò' : 'Chủ phòng'}).`],
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

    const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
    const clientPlayer: Player = {
      id: playerId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
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

    const newPlayerId = 'player_' + Math.random().toString(36).substring(2, 9);
    const newPlayer: Player = {
      id: newPlayerId,
      name,
      role: null,
      status: 'ALIVE',
      isGM,
      house: extra?.house,
      userTag: extra?.userTag,
      hpvnUid: extra?.hpvnUid,
    };
    
    setCurrentPlayerId(newPlayerId);
    setStorageItem('seven-potters-session-id', newPlayerId);
    if (extra?.house) setStorageItem('seven-potters-house', extra.house);
    if (extra?.userTag) setStorageItem('seven-potters-user-tag', extra.userTag);
    if (extra?.hpvnUid) setStorageItem('seven-potters-hpvn-uid', extra.hpvnUid);
    
    updateState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
      logs: [...prev.logs, `${name} (${isGM ? 'Quản trò' : 'Phù thủy'}) đã gia nhập phòng!`],
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

      let evilCount = Math.max(1, Math.floor(N / 3));
      let goodCount = N - evilCount;

      const evilPool = [
        ROLES.BELLATRIX_LESTRANGE,
        ROLES.LUCIUS_MALFOY,
        ROLES.PETER_PETTIGREW,
        ROLES.FENRIR_GREYBACK,
      ].sort(() => Math.random() - 0.5);

      const goodPool = [
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
      ].sort(() => Math.random() - 0.5);

      const selectedRoles: Role[] = [];
      
      if (goodCount > 0) {
        selectedRoles.push(ROLES.HARRY_POTTER);
        goodCount--;
      }
      if (evilCount > 0) {
        selectedRoles.push(ROLES.VOLDEMORT);
        evilCount--;
      }

      for (let i = 0; i < evilCount; i++) {
        selectedRoles.push(evilPool[i] || ROLES.PETER_PETTIGREW);
      }
      for (let i = 0; i < goodCount; i++) {
        selectedRoles.push(goodPool[i] || ROLES.POTTER_FAKE);
      }

      selectedRoles.sort(() => Math.random() - 0.5);

      const newPlayers = prev.players.map(p => {
        if (p.isGM) return p;
        return { ...p, role: selectedRoles.pop() || ROLES.POTTER_FAKE };
      });

      // Thang Chặng Co Giãn Tự Động theo Sĩ Số Phòng (Game Balance Optimization)
      // N <= 8: 4 Chặng | N <= 13: 5 Chặng | N >= 14: 6 Chặng
      const maxStages = N <= 8 ? 4 : N <= 13 ? 5 : 6;

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
        maxStages,
        weasleyItems: updatedWeasleyItems,
        logs: [
          ...prev.logs, 
          `Hệ thống: Vai trò đã được phân phát! Phi đội ${N} người ➔ Hành trình thiết lập ${maxStages} Chặng bay để về Hang Sóc.`,
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
      const maxStages = prev.maxStages || (nonGm.length <= 8 ? 4 : nonGm.length <= 13 ? 5 : 6);
      return {
        ...prev,
        phase: 'DAY',
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
          'Hệ thống: Ban Ngày (Lượt 1) bắt đầu. Mọi phù thủy hãy cơ động bay hộ tống hoặc thi triển bùa chú!'
        ],
      };
    });
  };

  const setPhase = (phase: GamePhase) => {
    updateState(prev => {
      let newRound = prev.round;
      const maxS = prev.maxStages || 4;
      let newFlightStage = prev.flightStage || 1;
      let nextSkyEvent = prev.currentSkyEvent || getSkyEventForStage(1, maxS);
      let logMsg = `Hệ thống: Chuyển sang ${phase}.`;
      
      if (phase === 'DAY') {
        newRound += 1;
        newFlightStage = Math.min(maxS, newFlightStage + 1);
        nextSkyEvent = getSkyEventForStage(newFlightStage, maxS);
        logMsg = `Hệ thống: Tiến vào Chặng ${newFlightStage}/${maxS}: [${nextSkyEvent.title}] (Lượt ${newRound}). Biến cố kích hoạt!`;
      } else if (phase === 'NIGHT') {
        logMsg = `Hệ thống: Ban Đêm (Lượt ${newRound}) bắt đầu. Toàn bộ người sống thức dậy Hội ý Khẩn cấp & Thẩm vấn Tước Đũa Expelliarmus!`;
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
          `Hệ thống: Quản trò đã đuổi ${target.name} khỏi phòng.`,
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
    updateState(prev => ({
      ...DEFAULT_STATE,
      flightStage: 1,
      currentSkyEvent: SKY_EVENTS[1],
      escortPairs: {},
      goldenFlameUsed: false,
      weasleyItems: INITIAL_WEASLEY_ITEMS,
      players: prev.players.map(p => ({
        ...p,
        role: null,
        status: 'ALIVE',
      })),
      logs: ['Hệ thống: Quản trò đã reset game. Đang chờ chia lại vai trò...'],
    }));
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
      return 'Đã gửi câu chú đến Quản trò...';
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

  const useWeasleyItemCore = (actorId: string, itemId: WeasleyItemId, targetId?: string): string => {
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
    } else if (itemId === 'TWO_WAY_MIRROR') {
      if (!targetId) return 'Vui lòng chọn 1 người để kết nối Gương Hai Chiều!';
      const target = stateRef.current.players.find(p => p.id === targetId);
      if (!target) return 'Không tìm thấy người chơi mục tiêu!';

      let targetFaction = target.role?.faction === 'ORDER_OF_PHOENIX' 
        ? 'Hội Phượng Hoàng 🦅' 
        : target.role?.faction === 'DEATH_EATERS' 
        ? 'Tử Thần Thực Tử 🐍' 
        : 'Trung Lập ⚖️';

      // Severus Snape: Bậc thầy Bế Quan Bí Thuật (Occlumency) - Luôn hiển thị phe Hội Phượng Hoàng khi soi
      if (target.role?.id === 'SEVERUS_SNAPE') {
        targetFaction = 'Hội Phượng Hoàng 🦅';
      }

      logText = `🪞 ${actor.name} đã chiếu Gương Hai Chiều về phía ${target.name}! Kênh liên lạc bí mật đã được mở giữa hai người.`;
      privateReturnMsg = `🪞 Qua Gương Hai Chiều của Sirius, bạn nhìn thấu tâm can của ${target.name}: Người này thuộc phe [${targetFaction}]!`;
      activeFX = {
        id: `fx_mirror_${Date.now()}`,
        type: 'TWO_WAY_MIRROR',
        title: '🪞 GƯƠNG HAI CHIỀU SIRIUS',
        subtitle: `Kênh liên lạc bí thuật kết nối tới ${target.name}!`,
        timestamp: Date.now(),
      };
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

  const useWeasleyItem = (itemId: WeasleyItemId, targetId?: string): string | void => {
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
      return useWeasleyItemCore(currentPlayerId, itemId, targetId);
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

        if (prev.phase === 'NIGHT') {
          const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          newPendingActions[bot.id] = { actionName: 'Biểu quyết Tước Đũa', targetId: randomTarget.id };
          newLogs.push(`[${bot.name}] đã biểu quyết Tước Đũa (Expelliarmus).`);
        } else if (prev.phase === 'DAY') {
          if (bot.role?.faction === 'DEATH_EATERS') {
            const goodTargets = possibleTargets.filter(p => p.role?.faction !== 'DEATH_EATERS');
            const targetPool = goodTargets.length > 0 ? goodTargets : possibleTargets;
            const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
            newPendingActions[bot.id] = { actionName: 'Giết', targetId: randomTarget.id };
            newLogs.push(`[${bot.name}] đã hoàn tất hành động bí mật.`);
          } else if (bot.role?.id === 'ALBUS_DUMBLEDORE') {
            const prevShieldedId = prev.skillStates[`DUMBLEDORE_SHIELDED_R${prev.round - 1}`];
            const validTargets = possibleTargets.filter(p => p.id !== prevShieldedId);
            const targetPool = validTargets.length > 0 ? validTargets : possibleTargets;
            const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
            newPendingActions[bot.id] = { actionName: 'Bảo vệ', targetId: randomTarget.id };
            newLogs.push(`[${bot.name}] đã hoàn tất hành động bí mật.`);
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
      logs: [...prev.logs, `Hệ thống: GM đã hồi sinh ${prev.players.find(p => p.id === playerId)?.name}!`]
    }));
  };

  const calculateResolution = () => {
    const summary: string[] = [];
    let deadPlayers: string[] = [];
    const injuredPlayers: string[] = [];
    let needsInterrupt = null;
    const newSkillStates: Record<string, boolean | string> = {};
    let resolvedPlayers = [...gameState.players];

    if (gameState.phase === 'NIGHT') {
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

        if (action.actionName === 'Bỏ phiếu Treo Cổ' || action.actionName === 'Biểu quyết Tước Đũa') {
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
        summary.push("Không có ai bỏ phiếu đêm nay.");
      } else if (isTie) {
        summary.push(`Có sự hòa phiếu (cao nhất ${maxVotes} phiếu). Không ai bị tước đũa phép!`);
      } else {
        const target = gameState.players.find(p => p.id === topTargetId);
        summary.push(`Với ${maxVotes} phiếu, ${target?.name} đã trúng Bùa Tước Khí Giới (Expelliarmus) và bị loại khỏi trận không chiến!`);
        
        if (target?.role?.id === 'BELLATRIX_LESTRANGE') {
          summary.push(`CẢNH BÁO: Bellatrix đã chết! Sáng mai Voldemort được quyền giết 2 người.`);
          newSkillStates[`voldemort_double_kill_R${gameState.round + 1}`] = true;
        } else if (target?.role?.id === 'LUCIUS_MALFOY') {
          summary.push(`CẢNH BÁO: Lucius đã chết! Sáng mai Voldemort bị phong ấn ma pháp (không thể ra đòn).`);
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
      
      if (!needsInterrupt) {
        deadPlayers = processDominoEffect(gameState.players, deadPlayers, summary);
      }
    } else {
      // Ban Ngày (DAY)
      let shieldTargetId: string | null = null;
      let isKingsleyActive: boolean = false;
      
      const killVoteCounts: Record<string, number> = {};
      let voldemortKillTargetId: string | null = null;

      Object.entries(gameState.pendingActions).forEach(([playerId, action]) => {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player || player.status === 'DEAD' || player.isGM) return;

        const target = action.targetId === 'ALL' ? null : gameState.players.find(p => p.id === action.targetId);

        if (action.actionName === 'Bảo vệ' && player.role?.id === 'ALBUS_DUMBLEDORE') {
          shieldTargetId = action.targetId;
          summary.push(`Cụ Dumbledore đã giăng màn bảo vệ lên ${target?.name}.`);
          newSkillStates[`DUMBLEDORE_SHIELDED_R${gameState.round}`] = shieldTargetId;
        } else if (action.actionName === 'Bảo kê' && player.role?.id === 'RUBEUS_HAGRID') {
          summary.push(`Bác Hagrid đã đưa ${target?.name} lên chiếc mô-tô bay hộ tống!`);
        } else if (action.actionName === 'Chỉ huy Phản công' && player.role?.id === 'KINGSLEY_SHACKLEBOLT') {
          isKingsleyActive = true;
          summary.push(`Kingsley Shacklebolt đã chỉ huy toàn quân phản công!`);
        } else if (action.actionName === 'Giết') {
          if (player.role?.id === 'VOLDEMORT') {
            voldemortKillTargetId = action.targetId;
          } else {
            killVoteCounts[action.targetId] = (killVoteCounts[action.targetId] || 0) + 1;
          }
        }
      });

      let deathEaterTargetId: string | null = voldemortKillTargetId;
      if (!deathEaterTargetId) {
        let maxVotes = 0;
        Object.entries(killVoteCounts).forEach(([targetId, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            deathEaterTargetId = targetId;
          }
        });
      }

      // Check Lucius Malfoy's silence curse
      const isSilenced = Boolean(gameState.skillStates[`voldemort_silenced_R${gameState.round}`]);
      if (isSilenced) {
        summary.push("Chúa Tể Voldemort bị phong ấn ma pháp (Lời Nguyền Lucius Malfoy) và không thể ra đòn hôm nay!");
        deathEaterTargetId = null;
      }

      // Check Peruvian Instant Darkness Powder
      if (gameState.skillStates['PERUVIAN_DARKNESS_ACTIVE']) {
        summary.push("🌑 BỘT KHÓI MÙ PERU: Màn đêm ma thuật dày đặc bao phủ toàn bộ bầu trời! Đòn ám sát của Tử Thần Thực Tử bị mất phương hướng hoàn toàn và đánh trượt vào khoảng không!");
        deathEaterTargetId = null;
      }

      if (deathEaterTargetId) {
        const victim = gameState.players.find(p => p.id === deathEaterTargetId);
        
        if (deathEaterTargetId === shieldTargetId) {
          summary.push(`Tử Thần Thực Tử tấn công ${victim?.name}, nhưng đã bị Màn chắn Dumbledore chặn đứng hoàn toàn!`);
        } else {
          let hagridProtecting = false;
          Object.entries(gameState.pendingActions).forEach(([pId, act]) => {
            const actor = gameState.players.find(p => p.id === pId);
            if (actor?.role?.id === 'RUBEUS_HAGRID' && act.actionName === 'Bảo kê' && act.targetId === deathEaterTargetId) {
              hagridProtecting = true;
            }
          });

          if (hagridProtecting) {
            summary.push(`Tử Thần Thực Tử tấn công ${victim?.name}! Bác Hagrid đã lấy thân mình đỡ đòn hộ tống an toàn! Bác Hagrid tử trận!`);
            const hagrid = gameState.players.find(p => p.role?.id === 'RUBEUS_HAGRID');
            if (hagrid && !deadPlayers.includes(hagrid.id)) {
              deadPlayers.push(hagrid.id);
            }
          } else {
            let escortShielded = false;
            let ronShielded = false;
            let goldenFlameShielded = false;

            // Check active Escort from formation flying
            const activeEscorts = Object.entries(gameState.pendingActions)
              .filter(([pId, act]) => act.actionName === 'Bay Hộ Tống' && act.targetId === deathEaterTargetId)
              .map(([pId]) => gameState.players.find(p => p.id === pId))
              .filter((p): p is Player => Boolean(p && p.status !== 'DEAD' && !deadPlayers.includes(p.id)));

            if (activeEscorts.length > 0) {
              escortShielded = true;
              const escort = activeEscorts[0];
              const modifier = gameState.currentSkyEvent?.modifier || 'PERFECT_DISGUISE';

              if (modifier === 'PERFECT_DISGUISE') {
                summary.push(`🛡️ BAY HỘ TỐNG: ${escort.name} đã liệng chổi bay áp sát chắn đòn cho ${victim?.name}! Nhờ Đa Quả Dịch che giấu, đòn tấn công của Tử Thần Thực Tử bị chệch hướng hoàn toàn! Cả hai an toàn thoát nạn!`);
              } else if (modifier === 'TURBULENCE_BLIND') {
                summary.push(`⚡ MÂY BÃO CHẮN GIÓ: ${escort.name} dũng cảm liệng vào tầng mây chắn gió cho ${victim?.name}! Cơn bão sấm chớp làm đòn đánh bị nổ tung giữa không trung! Cả hai an toàn!`);
              } else {
                summary.push(`🛡️ ANH HÙNG HỘ TỐNG: ${escort.name} đã dũng cảm lấy thân mình lao ra chắn đòn chí mạng cho ${victim?.name}! ${victim?.name} được bảo toàn tính mạng, ${escort.name} tử trận!`);
                if (!deadPlayers.includes(escort.id)) {
                  deadPlayers.push(escort.id);
                }
              }
            } else {
              const ron = resolvedPlayers.find(p => p.role?.id === 'RON_WEASLEY' && p.status !== 'DEAD' && !deadPlayers.includes(p.id));

              if (victim?.role?.id === 'HARRY_POTTER' && ron) {
                summary.push(`Tử Thần Thực Tử tấn công Harry Potter thật! Nhưng Ron Weasley đã dũng cảm lao ra đỡ đòn chí mạng thay cho Harry! Ron Weasley tử trận!`);
                deadPlayers.push(ron.id);
                ronShielded = true;
              } else if (victim?.role?.id === 'HARRY_POTTER' && !gameState.goldenFlameUsed) {
                // TWIN CORES / GOLDEN FLAME TRIGGER!
                goldenFlameShielded = true;
                newSkillStates['GOLDEN_FLAME_TRIGGERED'] = true;
                newSkillStates[`voldemort_silenced_R${gameState.round + 1}`] = true;
                summary.push(`⚡ TIA LỬA VÀNG BÙNG NỔ! Chiếc đũa phép lông đuôi phượng hoàng của Harry tự động nhận diện và phản pháo Chúa Tể Voldemort! Harry thoát chết trong gang tấc! Đũa phép mượn của Lucius Malfoy bị thiêu rụi nổ tung!`);
              } else {
                if (victim?.role?.id === 'HARRY_POTTER') {
                  summary.push(`Chúa Tể Voldemort đã tấn công trúng Harry Potter thật! Tia Chớp Định Mệnh giáng xuống!`);
                } else if (victim?.role?.id === 'POTTER_FAKE') {
                  summary.push(`Tử Thần Thực Tử đã bắn trúng một Potter Giả mạo (${victim?.name})!`);
                } else {
                  summary.push(`Tử Thần Thực Tử đã hạ sát ${victim?.name}!`);
                }

                if (victim?.role?.id === 'SEVERUS_SNAPE') {
                  summary.push(`Giáo sư Snape đã trúng Lời Nguyền Hắc Ám và gục ngã!`);
                }

                if (victim?.role?.id === 'MUNDUNGUS_FLETCHER') {
                  if (victim.name.includes('(Bot)')) {
                    const swapCandidates = gameState.players.filter(p => p.id !== victim.id && !p.isGM && p.status !== 'DEAD');
                    if (swapCandidates.length > 0) {
                      const swapTarget = swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
                      summary.push(`Mundungus Fletcher (Bot) đã hoảng loạn Độn Thổ và lôi ${swapTarget.name} ra chết thay!`);
                      deadPlayers.push(swapTarget.id);
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

                if (victim?.role?.id === 'BILL_WEASLEY') {
                  if (victim.status === 'INJURED') {
                    summary.push(`Bill Weasley đã bị thương từ trước, nay trúng thêm đòn chí mạng và tử trận!`);
                    if (!deadPlayers.includes(victim.id)) deadPlayers.push(victim.id);
                  } else {
                    summary.push(`Bill Weasley với thể chất người sói kiên cường đã đỡ đòn và chỉ bị THƯƠNG nặng (chưa chết)!`);
                    injuredPlayers.push(victim.id);
                  }
                }

                if (victim?.role?.id === 'NYMPHADORA_TONKS') {
                  if (victim.name.includes('(Bot)')) {
                    const morphCandidates = gameState.players.filter(p => p.id !== victim.id && !p.isGM && p.role);
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
            }

            if (!needsInterrupt && victim?.role?.id !== 'BILL_WEASLEY' && !ronShielded && !goldenFlameShielded && !escortShielded) {
              if (!deadPlayers.includes(deathEaterTargetId)) {
                deadPlayers.push(deathEaterTargetId);
              }
            }
          }
        }
      } else {
        if (!isSilenced) {
          summary.push("Tử Thần Thực Tử không thống nhất được mục tiêu tấn công hoặc không ra đòn!");
        }
      }

      if (isKingsleyActive) {
        const dePlayers = gameState.players.filter(p => p.role?.faction === 'DEATH_EATERS' && p.status !== 'DEAD' && !deadPlayers.includes(p.id));
        if (dePlayers.length > 0) {
          const deVictim = dePlayers[Math.floor(Math.random() * dePlayers.length)];
          summary.push(`Phản công thành công! Kingsley đã dẫn đầu bắn hạ Tử Thần Thực Tử ${deVictim.name}!`);
          deadPlayers.push(deVictim.id);
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
        summary,
        needsInterrupt,
        newSkillStates
      },
      interruptState: needsInterrupt
    });
  };

  const applyResolution = () => {
    if (!gameState.resolutionReport) return;
    const { deadPlayers, injuredPlayers, summary, newSkillStates } = gameState.resolutionReport;
    
    let newPlayers = [...gameState.players];
    deadPlayers.forEach(id => {
      newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'DEAD' as const } : p);
    });
    (injuredPlayers || []).forEach(id => {
      if (!deadPlayers.includes(id)) {
        newPlayers = newPlayers.map(p => p.id === id ? { ...p, status: 'INJURED' as const } : p);
      }
    });

    const isNextDay = gameState.phase === 'NIGHT';
    const maxS = gameState.maxStages || 4;
    const nextFlightStage = isNextDay ? Math.min(maxS, (gameState.flightStage || 1) + 1) : (gameState.flightStage || 1);
    const winner = checkWinCondition(newPlayers, nextFlightStage, maxS);
    const resolutionLogs = summary.map(line => `Hệ thống: ${line}`);

    const isGoldenFlameTriggered = Boolean(newSkillStates?.['GOLDEN_FLAME_TRIGGERED']);
    const updatedGoldenFlameUsed = gameState.goldenFlameUsed || isGoldenFlameTriggered;

    // Reset daytime buffs like Peruvian darkness when night arrives
    const nextSkillStates = { ...gameState.skillStates, ...(newSkillStates || {}) };
    if (isNextDay) {
      delete nextSkillStates['PERUVIAN_DARKNESS_ACTIVE'];
    }

    const nextSkyEvent = getSkyEventForStage(nextFlightStage, maxS);
    const flightLog = (isNextDay && !winner) 
      ? [`Hệ thống: ✈️ Phi đội vượt qua hiểm nguy, tiến vào Chặng ${nextFlightStage}/${maxS}: [${nextSkyEvent.title}]!`] 
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
    } else if (isNextDay && !winner) {
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
      round: winner ? gameState.round : (isNextDay ? gameState.round + 1 : gameState.round)
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
      useWeasleyItem,
      triggerVisualFX,
      clearVisualFX
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
