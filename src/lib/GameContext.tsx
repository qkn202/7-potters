"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, GamePhase, Faction, Role, NetworkMessage } from './types';
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
}

const DEFAULT_STATE: GameState = {
  players: [],
  phase: 'LOBBY',
  round: 0,
  logs: ['Hệ thống: Chào mừng đến với Chiến dịch Bảy Potter!'],
  winner: null,
  pendingActions: {},
  resolutionReport: null,
  skillStates: {},
  interruptState: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const checkWinCondition = (players: Player[]): Faction | null => {
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
  
  if (deathEaters.length >= others.length && deathEaters.length > 0) return 'DEATH_EATERS';
  if (deathEaters.length === 0 && hph.length > 0) return 'ORDER_OF_PHOENIX';
  if (deathEaters.length === 0 && hph.length === 0 && neutrals.length > 0) return 'NEUTRAL';
  return null;
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
        localStorage.setItem('seven-potters-mock-state', JSON.stringify(nextState));
        if (roomCodeRef.current) {
          localStorage.setItem(`seven-potters-room-${roomCodeRef.current}-state`, JSON.stringify(nextState));
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
      
      const isPublicVote = actionName === 'Bỏ phiếu Treo Cổ';
      const logMessage = isPublicVote
        ? `[${me.name}] đã bỏ phiếu biểu quyết Treo Cổ.`
        : `[${me.name}] đã xác nhận hành động bí mật.`;

      return {
        ...prev,
        pendingActions: {
          ...prev.pendingActions,
          [me.id]: { actionName, targetId }
        },
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
            executeInstantSkillCore(msg.senderId, actionName, targetId);
          }
        } else if (msg.type === 'INTERRUPT_CHOICE_SUBMIT') {
          const { choiceId } = msg.payload || {};
          if (choiceId) {
            resolveInterruptCore(choiceId, msg.senderId);
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

        // If in LOBBY, grant 10-second grace period before evicting ghost player
        if (stateRef.current.phase === 'LOBBY') {
          if (evictionTimersRef.current[peerId]) {
            clearTimeout(evictionTimersRef.current[peerId]);
          }

          evictionTimersRef.current[peerId] = setTimeout(() => {
            delete evictionTimersRef.current[peerId];
            if (stateRef.current.phase === 'LOBBY' && !net.isPlayerInPresence(peerId)) {
              console.log(`[7-Potters Host] Evicting ghost player ${peerId} after 10s presence drop.`);
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
          }, 10000);
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
    const handleVisibilityOrResume = () => {
      if (document.visibilityState === 'visible' || navigator.onLine) {
        const net = netRef.current;
        const code = roomCodeRef.current;
        const myId = currentPlayerIdRef.current;
        const me = stateRef.current.players.find(p => p.id === myId);

        if (net && code && me) {
          console.log('[7-Potters] App resumed/focused, checking connection health...');
          if (isHostRef.current) {
            net.reconnectHostIfNeeded(me);
          } else {
            net.reconnectClient(code, me);
          }
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrResume);
    window.addEventListener('pageshow', handleVisibilityOrResume);
    window.addEventListener('focus', handleVisibilityOrResume);
    window.addEventListener('online', handleVisibilityOrResume);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrResume);
      window.removeEventListener('pageshow', handleVisibilityOrResume);
      window.removeEventListener('focus', handleVisibilityOrResume);
      window.removeEventListener('online', handleVisibilityOrResume);
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
          pendingActions: parsed.pendingActions || {},
          skillStates: parsed.skillStates || {},
          logs: parsed.logs || DEFAULT_STATE.logs,
          players: sanitizePlayers(parsed.players || []),
        });
      }
    } catch (err) {
      console.error('Failed to parse saved state:', err);
    }
    
    const sessionId = sessionStorage.getItem('seven-potters-session-id');
    const savedRoom = sessionStorage.getItem('seven-potters-room-code');
    const savedIsHost = sessionStorage.getItem('seven-potters-is-host') === 'true';
    const savedName = sessionStorage.getItem('seven-potters-player-name');
    const savedIsGM = sessionStorage.getItem('seven-potters-is-gm') === 'true';
    const savedHouse = sessionStorage.getItem('seven-potters-house') || undefined;
    const savedUserTag = sessionStorage.getItem('seven-potters-user-tag') || undefined;
    const savedHpvnUid = sessionStorage.getItem('seven-potters-hpvn-uid') || undefined;

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

      sessionStorage.setItem('seven-potters-session-id', hostId);
      sessionStorage.setItem('seven-potters-room-code', code);
      sessionStorage.setItem('seven-potters-is-host', 'true');
      sessionStorage.setItem('seven-potters-player-name', name);
      sessionStorage.setItem('seven-potters-is-gm', isGM ? 'true' : 'false');
      if (extra?.house) sessionStorage.setItem('seven-potters-house', extra.house);
      else sessionStorage.removeItem('seven-potters-house');
      if (extra?.userTag) sessionStorage.setItem('seven-potters-user-tag', extra.userTag);
      else sessionStorage.removeItem('seven-potters-user-tag');
      if (extra?.hpvnUid) sessionStorage.setItem('seven-potters-hpvn-uid', extra.hpvnUid);
      else sessionStorage.removeItem('seven-potters-hpvn-uid');

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

      sessionStorage.setItem('seven-potters-session-id', playerId);
      sessionStorage.setItem('seven-potters-room-code', code);
      sessionStorage.setItem('seven-potters-is-host', 'false');
      sessionStorage.setItem('seven-potters-player-name', name);
      sessionStorage.setItem('seven-potters-is-gm', isGM ? 'true' : 'false');
      if (extra?.house) sessionStorage.setItem('seven-potters-house', extra.house);
      else sessionStorage.removeItem('seven-potters-house');
      if (extra?.userTag) sessionStorage.setItem('seven-potters-user-tag', extra.userTag);
      else sessionStorage.removeItem('seven-potters-user-tag');
      if (extra?.hpvnUid) sessionStorage.setItem('seven-potters-hpvn-uid', extra.hpvnUid);
      else sessionStorage.removeItem('seven-potters-hpvn-uid');

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
      sessionStorage.setItem('seven-potters-session-id', existingPlayer.id);
      
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
    sessionStorage.setItem('seven-potters-session-id', newPlayerId);
    if (extra?.house) sessionStorage.setItem('seven-potters-house', extra.house);
    if (extra?.userTag) sessionStorage.setItem('seven-potters-user-tag', extra.userTag);
    if (extra?.hpvnUid) sessionStorage.setItem('seven-potters-hpvn-uid', extra.hpvnUid);
    
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

    sessionStorage.removeItem('seven-potters-session-id');
    sessionStorage.removeItem('seven-potters-room-code');
    sessionStorage.removeItem('seven-potters-is-host');
    sessionStorage.removeItem('seven-potters-player-name');
    sessionStorage.removeItem('seven-potters-is-gm');
    sessionStorage.removeItem('seven-potters-house');
    sessionStorage.removeItem('seven-potters-user-tag');
    sessionStorage.removeItem('seven-potters-hpvn-uid');
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

      return {
        ...prev,
        players: newPlayers,
        logs: [...prev.logs, 'Hệ thống: Vai trò đã được phân phát!'],
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
    };
    
    updateState(prev => ({
      ...prev,
      players: [...prev.players, newBot],
      logs: [...prev.logs, `${randomName} đã được thêm vào phòng.`],
    }));
  };

  const startGame = () => {
    updateState(prev => ({
      ...prev,
      phase: 'DAY',
      round: 1,
      logs: [...prev.logs, 'Hệ thống: Trò chơi bắt đầu. Ban Ngày (Lượt 1).'],
    }));
  };

  const setPhase = (phase: GamePhase) => {
    updateState(prev => {
      let newRound = prev.round;
      let logMsg = `Hệ thống: Chuyển sang ${phase}.`;
      
      if (phase === 'DAY') {
        newRound += 1;
        logMsg = `Hệ thống: Ban Ngày (Lượt ${newRound}) bắt đầu. Tử Thần Thực Tử Mật đàm! HPH đi ngủ!`;
      } else if (phase === 'NIGHT') {
        logMsg = `Hệ thống: Ban Đêm (Lượt ${newRound}) bắt đầu. Toàn bộ người sống thức dậy biểu quyết Treo Cổ!`;
      }

      return {
        ...prev,
        phase,
        round: newRound,
        pendingActions: {},
        resolutionReport: null,
        logs: [...prev.logs, logMsg],
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

  const simulateBotActions = () => {
    updateState(prev => {
      const aliveBots = prev.players.filter(p => p.name.includes('(Bot)') && p.status !== 'DEAD' && !p.isGM);
      if (aliveBots.length === 0) return prev;

      const newPendingActions = { ...prev.pendingActions };
      const newLogs = [...prev.logs];

      aliveBots.forEach(bot => {
        const possibleTargets = prev.players.filter(p => p.id !== bot.id && p.status !== 'DEAD' && !p.isGM);
        if (possibleTargets.length === 0) return;

        if (prev.phase === 'NIGHT') {
          const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          newPendingActions[bot.id] = { actionName: 'Bỏ phiếu Treo Cổ', targetId: randomTarget.id };
          newLogs.push(`[${bot.name}] đã bỏ phiếu biểu quyết Treo Cổ.`);
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
    let injuredPlayers: string[] = [];
    let needsInterrupt = null;
    const newSkillStates: Record<string, boolean | string> = {};

    if (gameState.phase === 'NIGHT') {
      const voteCounts: Record<string, number> = {};
      Object.entries(gameState.pendingActions).forEach(([playerId, action]) => {
        const voter = gameState.players.find(p => p.id === playerId);
        const target = gameState.players.find(p => p.id === action.targetId);
        if (!voter || voter.status === 'DEAD' || voter.isGM) return;
        if (!target || target.status === 'DEAD' || target.isGM) return;

        if (action.actionName === 'Bỏ phiếu Treo Cổ') {
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
        summary.push(`Có sự hòa phiếu (cao nhất ${maxVotes} phiếu). Không ai bị treo cổ!`);
      } else {
        const target = gameState.players.find(p => p.id === topTargetId);
        summary.push(`Với ${maxVotes} phiếu, ${target?.name} đã bị treo cổ!`);
        
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
              gameState.players = gameState.players.map(p => p.id === target.id ? { ...p, role: morphTarget.role } : p);
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
                  gameState.players = gameState.players.map(p => p.id === victim.id ? { ...p, role: morphTarget.role } : p);
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

            if (!needsInterrupt && victim?.role?.id !== 'BILL_WEASLEY') {
              if (!deadPlayers.includes(deathEaterTargetId)) {
                deadPlayers.push(deathEaterTargetId);
              }
            }
          }
        }
      } else {
        summary.push("Tử Thần Thực Tử không thống nhất được mục tiêu tấn công hoặc không ra đòn!");
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

    const winner = checkWinCondition(newPlayers);
    const resolutionLogs = summary.map(line => `Hệ thống: ${line}`);

    updateState({
      ...gameState,
      players: newPlayers,
      pendingActions: {},
      resolutionReport: null,
      skillStates: { ...gameState.skillStates, ...(newSkillStates || {}) },
      logs: [
        ...gameState.logs,
        ...resolutionLogs,
        ...(winner ? [`Hệ thống: Trò chơi kết thúc! Phe ${winner === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : winner === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : 'Trung Lập'} chiến thắng.`] : [])
      ],
      winner,
      phase: winner ? 'END' : (gameState.phase === 'DAY' ? 'NIGHT' : 'DAY'),
      round: winner ? gameState.round : (gameState.phase === 'NIGHT' ? gameState.round + 1 : gameState.round)
    });
  };

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
      simulateBotActions
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
