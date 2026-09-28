/**
 * MOD HPVN - Ultimate Mode Game Board
 * Giao diện bàn cờ ma thuật Hogwarts - Tích hợp Nút Merlin (Host) & Chuyển đổi Góc Nhìn Của Bot
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Skull, 
  Heart, 
  Ghost, 
  Zap, 
  Shield, 
  Sword, 
  Eye, 
  Vote, 
  ChevronRight, 
  AlertTriangle, 
  Crown, 
  Sparkles,
  Sun,
  Moon,
  Crosshair,
  ScrollText,
  Clock,
  LogOut,
  Maximize2,
  CheckCircle,
  HelpCircle,
  Bot,
  RotateCcw,
  ChevronLeft
} from 'lucide-react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  CardCornerFlourish,
  WaxSeal
} from '@/components/ArtAssets';
import { 
  HPVNGameEngine, 
  GameState, 
  Player, 
  Role, 
  HPVNGameSettings, 
  HPVN_ROLES, 
  HPVN_BALANCE,
  NightAction
} from './hpvnGameEngine';

// ============================================================================
// TYPES & ASSETS
// ============================================================================

interface HPVNGameBoardProps {
  playerNames: string[];
  settings: HPVNGameSettings;
  currentPlayerId: string;
  initialIsMerlin?: boolean;
}

const ROLE_CARD_IMAGES: Record<string, string> = {
  HARRY_POTTER: '/cards/harry.jpg',
  RON_WEASLEY: '/cards/ron.jpg',
  RON_WESLEY: '/cards/ron.jpg',
  HERMIONE_GRANGER: '/cards/hermione.jpg',
  DUMBLEDORE: '/cards/dumbledore.jpg',
  SNAPE: '/cards/snape.jpg',
  LUPIN: '/cards/lupin.jpg',
  MOODY: '/cards/moody.jpg',
  HAGRID: '/cards/hagrid.jpg',
  KINGSLEY: '/cards/kingsley.jpg',
  FRED: '/cards/fred.jpg',
  GEORGE: '/cards/george.jpg',
  BILL: '/cards/bill.jpg',
  TONKS: '/cards/tonks.jpg',
  FLEUR: '/cards/fleur.jpg',
  MCGONAGALL: '/cards/mcgonagall.jpg',
  McGONAGALL: '/cards/mcgonagall.jpg',
  NEVILLE: '/cards/neville.jpg',
  VOLDEMORT: '/cards/voldemort.jpg',
  BELLATRIX: '/cards/bellatrix.jpg',
  LUCIUS: '/cards/lucius.jpg',
  LUCIFUS_MALFORY: '/cards/lucius.jpg',
  PETTIGREW: '/cards/pettigrew.jpg',
  WORMTAIL: '/cards/pettigrew.jpg',
  FENRIR: '/cards/greyback.jpg',
  DRACO: '/cards/draco.jpg',
  JESTER: '/cards/jester.jpg',
  POLYJUICE: '/cards/potter_fake.jpg',
  POLYJUICE_POTION: '/cards/potter_fake.jpg',
  DOLORES: '/cards/dolores.jpg',
  DOLORES_UMBRIDGE: '/cards/dolores.jpg',
  MUNDUNGUS: '/cards/mundungus.jpg',
  ARTHUR: '/cards/arthur.jpg',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HPVNGameBoard({ 
  playerNames, 
  settings, 
  currentPlayerId,
  initialIsMerlin = false
}: HPVNGameBoardProps) {
  const isHostMerlinConfig = Boolean(settings.isMerlin || initialIsMerlin);
  
  const [game] = useState(() => new HPVNGameEngine(playerNames.length, {
    enableGhostVoting: settings.enableGhostVoting,
    enableChaosEvents: settings.enableChaosEvents,
    darkPactProtection: settings.darkPactProtection,
  }));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [timer, setTimer] = useState(25);
  const [mobileTab, setMobileTab] = useState<'battle' | 'card' | 'log'>('battle');
  
  // Merlin & Perspective States
  const [isMerlinVision, setIsMerlinVision] = useState<boolean>(isHostMerlinConfig);
  const [activePerspectiveId, setActivePerspectiveId] = useState<string>(isHostMerlinConfig ? 'MERLIN' : currentPlayerId);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Initialize game
  useEffect(() => {
    game.initializeGame(playerNames);
    game.startGame();
    const st = game.getState();
    setGameState(st);
    addLog('Trận đại chiến MOD HPVN chính thức khai hỏa! Màn đêm buông xuống...');
    if (isHostMerlinConfig) {
      addLog('👑 Bạn đang điều khiển với tư cách Host Merlin (Thần Nhãn Quản Trò).');
    }
    setTimer(getPhaseTime(st.phase));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameState || gameState.phase === 'GAME_OVER') return;

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handlePhaseComplete();
          return getPhaseTime(gameState.phase);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Keep state synchronized
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState({ ...game.getState() });
    }, 1000);
    return () => clearInterval(interval);
  }, [game]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [actionLog]);

  const addLog = (message: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${message}`, ...prev.slice(0, 59)]);
  };

  const getPhaseTime = (phase: string): number => {
    switch (phase) {
      case 'NIGHT': return 25;
      case 'CHAOS_EVENT': return 10;
      case 'DEATH_RESOLUTION': return 10;
      case 'GHOST_REVELATION': return 8;
      case 'VOTE': return 35;
      default: return 20;
    }
  };

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'NIGHT':
        return {
          name: 'Ban Đêm · Ám Sát & Ma Pháp',
          sub: 'Tử Thần Thực Tử chọn mục tiêu ám sát, Hội Phượng Hoàng thi triển bùa hộ thân & soi rọi.',
          icon: <Moon size={20} className="text-cyan-300" />,
          isDay: false,
        };
      case 'CHAOS_EVENT':
        return {
          name: 'Biến Cố Bầu Trời (Chaos Event)',
          sub: 'Dị tượng ma thuật giáng xuống bầu trời Hogwarts, đảo lộn quy luật tự nhiên.',
          icon: <Zap size={20} className="text-yellow-400 animate-pulse" />,
          isDay: false,
        };
      case 'DEATH_RESOLUTION':
        return {
          name: 'Phán Quyết Tử Thần',
          sub: 'Bộ Pháp Thuật kiểm tra thương vong sau đêm ma thuật.',
          icon: <Skull size={20} className="text-red-400 animate-pulse" />,
          isDay: true,
        };
      case 'GHOST_REVELATION':
        return {
          name: 'Linh Hồn Thức Tỉnh (Ghost Voting)',
          sub: 'Các phù thủy đã hy sinh hóa thành bóng ma, chuẩn bị 0.5 quyền biểu quyết.',
          icon: <Ghost size={20} className="text-cyan-300" />,
          isDay: true,
        };
      case 'VOTE':
        return {
          name: 'Hội Đồng Biểu Quyết Tước Đũa',
          sub: 'Toàn bộ phù thủy cùng bàn thảo, bỏ phiếu trục xuất kẻ tình nghi.',
          icon: <Sun size={20} className="text-amber-400 animate-spin-slow" />,
          isDay: true,
        };
      case 'GAME_OVER':
        return {
          name: 'Đại Chiến Khép Lại',
          sub: 'Kết quả ván đấu đã phân định rõ ràng.',
          icon: <Crown size={20} className="text-amber-400" />,
          isDay: true,
        };
      default:
        return {
          name: phase,
          sub: '',
          icon: <Sparkles size={20} />,
          isDay: false,
        };
    }
  };

  const ensureBotNightActions = () => {
    if (!gameState) return;
    const alive = game.getAlivePlayers();
    const effectivePlayer = game.getPlayer(currentPlayerId)?.id || gameState.players[0]?.id || 'player_0';
    const isMerlinActive = activePerspectiveId === 'MERLIN';

    // 1. Death Eaters kill action
    const existingKill = gameState.nightActions.some(a => a.actionType === 'KILL');
    if (!existingKill) {
      const deathEaters = alive.filter(p => p.role?.faction === 'DEATH_EATERS');
      if (deathEaters.length > 0) {
        const leadDE = deathEaters.find(p => isMerlinActive || p.id !== effectivePlayer) || deathEaters[0];
        const validTargets = alive.filter(p => p.role?.faction !== 'DEATH_EATERS');
        if (validTargets.length > 0) {
          const harry = validTargets.find(p => p.role?.id === 'HARRY_POTTER');
          const target = (harry && Math.random() < 0.45) ? harry : validTargets[Math.floor(Math.random() * validTargets.length)];
          game.submitNightAction(leadDE.id, {
            playerId: leadDE.id,
            actionType: 'KILL',
            targetId: target.id,
            isProtected: false,
          });
          addLog(`🐍 [${leadDE.name}] đã âm thầm thi triển Lời Nguyền Chết Chóc!`);
        }
      }
    }

    // 2. Dumbledore protection
    const dumbledore = alive.find(p => p.role?.id === 'DUMBLEDORE');
    if (dumbledore && (isMerlinActive || dumbledore.id !== effectivePlayer)) {
      const hasActed = gameState.nightActions.some(a => a.playerId === dumbledore.id);
      if (!hasActed) {
        const harry = alive.find(p => p.role?.id === 'HARRY_POTTER');
        const target = (harry && Math.random() < 0.6) ? harry : alive[Math.floor(Math.random() * alive.length)];
        game.submitNightAction(dumbledore.id, {
          playerId: dumbledore.id,
          actionType: 'PROTECT',
          targetId: target.id,
          isProtected: false,
        });
        addLog(`🛡️ [Dumbledore] đã bí mật thi triển Bùa Hộ Thân cho [${target.name}]!`);
      }
    }

    // 3. Hermione scan
    const hermione = alive.find(p => p.role?.id === 'HERMIONE_GRANGER');
    if (hermione && (isMerlinActive || hermione.id !== effectivePlayer)) {
      const hasActed = gameState.nightActions.some(a => a.playerId === hermione.id);
      if (!hasActed) {
        const scanTargets = alive.filter(p => p.id !== hermione.id);
        if (scanTargets.length > 0) {
          const target = scanTargets[Math.floor(Math.random() * scanTargets.length)];
          game.submitNightAction(hermione.id, {
            playerId: hermione.id,
            actionType: 'SCAN',
            targetId: target.id,
            isProtected: false,
          });
          addLog(`🔍 [Hermione] đã bí mật thi triển Bùa Soi Sáng lên [${target.name}]!`);
        }
      }
    }
  };

  const ensureBotVotes = () => {
    if (!gameState) return;
    const alive = game.getAlivePlayers();
    const effectivePlayer = game.getPlayer(currentPlayerId)?.id || gameState.players[0]?.id || 'player_0';
    const isMerlinActive = activePerspectiveId === 'MERLIN';

    const voters = gameState.players.filter(p => 
      (p.status === 'ALIVE' || (p.status === 'GHOST' && settings.enableGhostVoting)) &&
      !p.isSilenced &&
      (isMerlinActive || p.id !== effectivePlayer)
    );

    voters.forEach(voter => {
      const hasVoted = gameState.votes.some(v => v.playerId === voter.id);
      if (hasVoted) return;

      const candidates = alive.filter(p => p.id !== voter.id);
      if (candidates.length === 0) return;

      let target: Player | null = null;
      if (voter.role?.faction === 'DEATH_EATERS') {
        const orderMembers = candidates.filter(c => c.role?.faction !== 'DEATH_EATERS');
        target = orderMembers.length > 0 && Math.random() < 0.75
          ? orderMembers[Math.floor(Math.random() * orderMembers.length)]
          : candidates[Math.floor(Math.random() * candidates.length)];
      } else if (voter.role?.id === 'JESTER') {
        target = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        target = candidates[Math.floor(Math.random() * candidates.length)];
      }

      if (target) {
        game.submitVote(voter.id, target.id);
      } else {
        game.submitVote(voter.id, 'NONE');
      }
    });
  };

  const handlePhaseComplete = () => {
    if (!gameState || gameState.phase === 'GAME_OVER') return;
    const currentPhase = gameState.phase;

    switch (currentPhase) {
      case 'NIGHT':
        ensureBotNightActions();
        game.processNightPhase();
        addLog('Màn đêm kết thúc. Xử lý các bùa chú ma thuật...');
        break;
      case 'CHAOS_EVENT':
        game.processDeathResolution();
        addLog('Biến cố bầu trời hoàn tất, giải quyết thương vong...');
        break;
      case 'DEATH_RESOLUTION': {
        const hasGhosts = game.getState().ghosts.length > 0 && settings.enableGhostVoting;
        if (hasGhosts) {
          game.processGhostPhase();
          addLog('Linh hồn các phù thủy đã tử trận thức tỉnh...');
        } else {
          game.processVotePhase();
          addLog('Chuyển sang giai đoạn Biểu Quyết Tước Đũa...');
        }
        break;
      }
      case 'GHOST_REVELATION':
        game.processVotePhase();
        addLog('Chuyển sang giai đoạn Biểu Quyết Tước Đũa...');
        break;
      case 'VOTE':
        ensureBotVotes();
        game.processVotes();
        addLog('Kiểm phiếu hội đồng và phân định kết quả biểu quyết...');
        break;
    }

    const newState = game.getState();
    setGameState({ ...newState });
    setTimer(getPhaseTime(newState.phase));
  };

  const handleAdvancePhase = () => {
    handlePhaseComplete();
  };

  // Automated decisions for all bots
  const handleAutoBotActions = () => {
    if (!gameState) return;
    if (gameState.phase === 'NIGHT') {
      ensureBotNightActions();
      addLog('🤖 Toàn bộ Bot đã tự động thi triển ma pháp đêm!');
    } else if (gameState.phase === 'VOTE') {
      ensureBotVotes();
      addLog('🗳️ Toàn bộ Bot đã tự động bỏ phiếu biểu quyết!');
    }
    setGameState({ ...game.getState() });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#120904] text-[#ebdcb0] flex items-center justify-center">
        <div className="flex items-center gap-3 font-serif">
          <Sparkles className="animate-spin text-amber-400" />
          <span>Đang khai mở bàn cờ ma thuật MOD HPVN...</span>
        </div>
      </div>
    );
  }

  // Perspective resolution
  const effectivePlayerId = game.getPlayer(currentPlayerId)?.id || gameState.players[0]?.id || 'player_0';
  const isMerlinActive = activePerspectiveId === 'MERLIN';
  const activePlayer = isMerlinActive 
    ? (game.getPlayer(effectivePlayerId) || gameState.players[0]) 
    : (game.getPlayer(activePerspectiveId) || game.getPlayer(effectivePlayerId) || gameState.players[0]);

  const handleAction = (action: string, targetId?: string) => {
    if (!gameState) return;
    const effectivePlayer = game.getPlayer(currentPlayerId)?.id || gameState.players[0]?.id || 'player_0';

    let actorId = activePerspectiveId;
    if (isMerlinActive) {
      if (action === 'KILL') {
        const de = game.getAlivePlayers().find(p => p.role?.faction === 'DEATH_EATERS');
        actorId = de?.id || effectivePlayer;
      } else if (action === 'PROTECT') {
        const dumbledore = game.getAlivePlayers().find(p => p.role?.id === 'DUMBLEDORE');
        actorId = dumbledore?.id || effectivePlayer;
      } else if (action === 'SCAN') {
        const hermione = game.getAlivePlayers().find(p => p.role?.id === 'HERMIONE_GRANGER');
        actorId = hermione?.id || effectivePlayer;
      } else {
        actorId = effectivePlayer;
      }
    }

    const actor = game.getPlayer(actorId) || game.getPlayer(effectivePlayer) || gameState.players[0];
    if (!actor) return;

    if (gameState.phase === 'NIGHT') {
      game.submitNightAction(actor.id, {
        playerId: actor.id,
        actionType: action as any,
        targetId,
        isProtected: false,
      });
      const targetName = targetId ? (game.getPlayer(targetId)?.name || 'mục tiêu') : '';
      addLog(`⚡ [${actor.name}] đã thi triển ${action} lên [${targetName}]!`);
    } else if (gameState.phase === 'VOTE') {
      game.submitVote(actor.id, targetId || 'NONE');
      const targetName = targetId && targetId !== 'NONE' ? (game.getPlayer(targetId)?.name || '') : 'Bỏ phiếu trắng';
      addLog(`🗳️ [${actor.name}] biểu quyết tước đũa: [${targetName}]`);
    }

    setGameState({ ...game.getState() });
    setSelectedTarget(null);
  };

  // Perspective navigation helpers
  const handleNextPerspective = () => {
    const list = ['MERLIN', ...gameState.players.map(p => p.id)];
    const currIdx = list.indexOf(activePerspectiveId);
    const nextIdx = (currIdx + 1) % list.length;
    const nextId = list[nextIdx];
    setActivePerspectiveId(nextId);
    if (nextId === 'MERLIN') {
      setIsMerlinVision(true);
      addLog('👑 Chuyển sang góc nhìn Thần Nhãn Merlin.');
    } else {
      const p = game.getPlayer(nextId);
      addLog(`👁️ Chuyển góc nhìn sang: ${p?.name} (${p?.role?.name || ''})`);
    }
  };

  const handlePrevPerspective = () => {
    const list = ['MERLIN', ...gameState.players.map(p => p.id)];
    const currIdx = list.indexOf(activePerspectiveId);
    const prevIdx = (currIdx - 1 + list.length) % list.length;
    const prevId = list[prevIdx];
    setActivePerspectiveId(prevId);
    if (prevId === 'MERLIN') {
      setIsMerlinVision(true);
      addLog('👑 Chuyển sang góc nhìn Thần Nhãn Merlin.');
    } else {
      const p = game.getPlayer(prevId);
      addLog(`👁️ Chuyển góc nhìn sang: ${p?.name} (${p?.role?.name || ''})`);
    }
  };

  const phaseInfo = getPhaseInfo(gameState.phase);
  const isNight = gameState.phase === 'NIGHT';
  const isVote = gameState.phase === 'VOTE';

  return (
    <div className="min-h-screen bg-[#120904] text-[#ebdcb0] flex flex-col justify-between selection:bg-amber-900 selection:text-white pb-safe">
      
      {/* Top Magical Header */}
      <header className="sticky top-0 z-40 hpvn-header-banner px-2 sm:px-5 py-2 flex items-center justify-between backdrop-blur-md gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <PhoenixCrest className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-title-magical font-bold text-xs sm:text-base text-[#ffd88f] flex items-center gap-1.5 leading-none">
              <span className="truncate">⚡ MOD HPVN</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-[#120803] px-1.5 py-0.2 rounded border border-[#7a5229] shrink-0">
                R{gameState.currentRound}/{gameState.minRounds}
              </span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-mono text-[#bd8436] tracking-wider hidden md:block truncate">
              CHIẾN DỊCH BẢY POTTER · PHÒNG #{settings.roomCode}
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* =========================================================================
           * NÚT MERLIN (HOST) & GÓC NHÌN BOT
           * ========================================================================= */}
          <button
            onClick={() => {
              const next = !isMerlinVision;
              setIsMerlinVision(next);
              if (next) {
                setActivePerspectiveId('MERLIN');
                addLog('👑 Kích hoạt Thần Nhãn Merlin! Toàn bộ thẻ bài bí mật và góc nhìn của Bot đã được hiển thị.');
              } else {
                setActivePerspectiveId(currentPlayerId);
                addLog('Đã tắt Thần Nhãn Merlin, trở về góc nhìn người chơi bình thường.');
              }
            }}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              isMerlinVision
                ? 'bg-gradient-to-r from-purple-900 to-indigo-950 text-purple-200 border-purple-400 ring-1 ring-purple-400'
                : 'bg-[#24150c] text-[#ffd88f] border-[#7a5229] hover:border-[#ffd88f]'
            }`}
            title="Bật/Tắt quyền Host Thần Nhãn Merlin để xem bài bí mật & đổi góc nhìn"
          >
            <Eye size={13} className={isMerlinVision ? "text-purple-300 animate-pulse shrink-0" : "text-amber-400 shrink-0"} />
            <span className="text-[11px] sm:text-xs">{isMerlinVision ? '👑 Merlin ON' : 'Nút Merlin'}</span>
          </button>

          {/* Perspective Dropdown (Góc Nhìn Của Bot) */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#140b05] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-[#7a5229] text-xs">
            <button
              onClick={handlePrevPerspective}
              className="text-[#bd8436] hover:text-[#ffd88f] px-0.5 text-xs font-mono"
              title="Góc nhìn trước"
            >
              ◀
            </button>

            <Bot size={12} className="text-cyan-400 shrink-0 hidden xs:block" />
            
            <select
              value={activePerspectiveId}
              onChange={(e) => {
                const newId = e.target.value;
                setActivePerspectiveId(newId);
                if (newId === 'MERLIN') {
                  setIsMerlinVision(true);
                  addLog('👑 Đang ở góc nhìn Merlin (Toàn cảnh Quản Trò).');
                } else {
                  const p = game.getPlayer(newId);
                  addLog(`👁️ Đã chuyển sang góc nhìn của: ${p?.name || newId} (${p?.role?.name || ''})`);
                }
              }}
              className="bg-transparent text-[10px] sm:text-xs text-[#ffd88f] font-serif font-bold focus:outline-none cursor-pointer truncate max-w-[90px] sm:max-w-[150px]"
            >
              <option value="MERLIN" className="bg-[#1a0e07] text-purple-300 font-bold">
                👑 Merlin (Quản Trò)
              </option>
              {gameState.players.map((p) => (
                <option key={`persp-${p.id}`} value={p.id} className="bg-[#1a0e07] text-[#ffd88f]">
                  {p.name} {p.role && isMerlinVision ? `· ${p.role.name}` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextPerspective}
              className="text-[#bd8436] hover:text-[#ffd88f] px-0.5 text-xs font-mono"
              title="Góc nhìn kế tiếp"
            >
              ▶
            </button>
          </div>

          {/* Phase Countdown Timer */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#140b05] border border-[#bd8436] text-[11px] sm:text-xs font-mono font-bold text-[#ffd88f]">
            <Clock size={12} className="text-amber-400 animate-pulse" />
            <span>{timer}s</span>
          </div>

          {/* Forward Phase Button */}
          <button
            onClick={handleAdvancePhase}
            title="Đẩy nhanh giai đoạn (Chế độ Giả Lập)"
            className="hpvn-btn-gold px-2 py-1 rounded-xl text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">Chuyển Giai Đoạn ➔</span>
            <span className="sm:hidden">➔</span>
          </button>

          {/* Leave match button */}
          <button
            onClick={() => window.location.href = '/hpvn'}
            className="p-1 sm:px-2.5 sm:py-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/70 rounded-xl text-xs font-serif font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Rời khỏi bàn cờ"
          >
            <LogOut size={12} className="text-red-400" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex-1 w-full space-y-4">
        
        {/* MERLIN OMNISCIENT ACTIVE ALERT BANNER */}
        {isMerlinVision && (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#2c133f] via-[#1a0c28] to-[#12051d] border-2 border-purple-500/80 flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-2 min-w-0">
              <Eye size={18} className="text-purple-300 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="font-serif font-black text-xs sm:text-sm text-purple-200 block truncate">
                  {isMerlinActive 
                    ? '👑 ĐANG Ở GÓC NHÌN MERLIN (QUẢN TRÒ · THẦN NHÃN)' 
                    : `👁️ ĐANG XEM QUA GÓC NHÌN CỦA: ${activePlayer.name} (${activePlayer.role?.name || 'Phù thủy'})`}
                </span>
                <p className="text-[10px] text-purple-300/80 font-lora truncate">
                  Toàn bộ vai trò bí mật của các Bot đã được tiết lộ. Bạn có thể tự do thi triển phép thuật thay mặt Bot!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!isMerlinActive && (
                <button
                  onClick={() => setActivePerspectiveId('MERLIN')}
                  className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-serif font-bold cursor-pointer transition-all"
                >
                  ← Về Merlin
                </button>
              )}
              <button
                onClick={handleAutoBotActions}
                className="px-2.5 py-1 bg-[#24150c] hover:bg-[#382013] text-[#ffd88f] border border-[#bd8436] rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                title="Tự động chọn hành động ngẫu nhiên theo phe cho tất cả Bot"
              >
                <Bot size={12} className="text-cyan-400" />
                <span className="hidden sm:inline">Bot Tự Quyết</span>
              </button>
            </div>
          </div>
        )}

        {/* Atmospheric Day/Night Tracker & Action Order Banner */}
        <div 
          className="relative rounded-2xl border-2 border-[#bd8436] p-3 sm:p-4 overflow-hidden"
          style={{
            background: phaseInfo.isDay
              ? 'linear-gradient(90deg, #3d2412 0%, #26160c 50%, #170c06 100%)'
              : 'linear-gradient(90deg, #1c0f24 0%, #15091c 50%, #0d0612 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl border shrink-0 bg-[#28150c] border-[#bd8436]">
                {phaseInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#ffd88f]">
                    VÒNG {gameState.currentRound} · {phaseInfo.name}
                  </span>
                </div>
                <h2 className="text-sm sm:text-lg font-title-magical font-bold text-[#ffd88f] leading-tight">
                  {phaseInfo.name}
                </h2>
                <p className="text-[11px] text-[#ebdcb0]/80 font-lora italic hidden sm:block">
                  {phaseInfo.sub}
                </p>
              </div>
            </div>

            {/* Quick Faction Balance Badges */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-lg bg-[#240e0c] border border-red-800 text-amber-300 font-bold" title="Hội Phượng Hoàng còn sống">
                ⚡ HPH: {gameState.hphAlive}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#092217] border border-emerald-800 text-emerald-300 font-bold" title="Tử Thần Thực Tử còn sống">
                🐍 4T: {gameState.fourTAlive}
              </span>
              {gameState.ghosts.length > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-indigo-950 border border-indigo-700 text-cyan-300 font-bold" title="Hồn ma tham gia vote">
                  👻 Ma: {gameState.ghosts.length}
                </span>
              )}
            </div>
          </div>

          {/* Action Callout Sub-banner */}
          <div className="mt-2.5 pt-2 border-t border-[#7a5229]/60 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 font-serif">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400">LƯỢT HÀNH ĐỘNG:</span>
              <span className="text-[#ffd88f]">
                {isNight 
                  ? '🌙 Tử Thần Thực Tử (Ám sát) & Các Phù Thủy Có Ma Pháp Đêm'
                  : '☀️ Toàn Thể Phù Thủy (Bàn Thảo & Biểu Quyết Tước Đũa)'}
              </span>
            </div>

            <div>
              {isMerlinActive ? (
                <span className="text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1">
                  👑 Thần Nhãn Merlin: Bạn có thể can thiệp hoặc đổi góc nhìn Bot
                </span>
              ) : activePlayer?.status === 'DEAD' ? (
                <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                  <Skull size={11} /> Bot này đã tử trận
                </span>
              ) : activePlayer?.status === 'GHOST' ? (
                <span className="text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1 animate-pulse">
                  <Ghost size={11} /> Góc nhìn linh hồn (Có 0.5 quyền biểu quyết)
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles size={11} className="text-amber-400" /> 👉 Đến lượt [{activePlayer.name}] hành động
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chaos Event Active Alert */}
        {gameState.currentEvent && (
          <div className="hpvn-panel-gold p-3 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold uppercase text-yellow-300 block">
                  🎲 BIẾN CỐ BẦU TRỜI: {gameState.currentEvent.name}
                </span>
                <span className="text-xs text-[#ebdcb0] font-lora">
                  {gameState.currentEvent.description}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 shrink-0">
              Hiệu lực vòng này
            </span>
          </div>
        )}

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden flex items-center gap-1 bg-[#140b05] p-1 rounded-xl border border-[#7a5229]">
          <button
            onClick={() => setMobileTab('battle')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'battle'
                ? 'hpvn-btn-gold text-[#ffd88f]'
                : 'text-[#ebdcb0]/70 hover:text-white'
            }`}
          >
            <Crosshair size={13} />
            <span>Tác Chiến</span>
          </button>

          <button
            onClick={() => setMobileTab('card')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'card'
                ? 'hpvn-btn-gold text-[#ffd88f]'
                : 'text-[#ebdcb0]/70 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Thẻ Bài</span>
          </button>

          <button
            onClick={() => setMobileTab('log')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'log'
                ? 'hpvn-btn-gold text-[#ffd88f]'
                : 'text-[#ebdcb0]/70 hover:text-white'
            }`}
          >
            <ScrollText size={13} />
            <span>Nhật Ký</span>
          </button>
        </div>

        {/* Main Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Role Identity & Logs (col-span-4) */}
          <div className={`space-y-4 lg:col-span-4 ${mobileTab === 'card' ? 'block' : mobileTab === 'log' ? 'hidden' : 'hidden lg:block'}`}>
            
            {/* Active Perspective Identity Card */}
            <div className="hpvn-panel-gold rounded-2xl p-4 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none" />
              <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none" />

              <div className="flex items-center justify-between mb-3 border-b border-[#7a5229]/60 pb-2">
                <span className="text-xs font-serif font-bold text-[#ffd88f] flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" />
                  {isMerlinActive ? 'THẦN NHÃN MERLIN (QUẢN TRÒ)' : `VAI TRÒ: ${activePlayer.name}`}
                </span>
                <button
                  onClick={() => setShowRoleCard(true)}
                  className="text-[11px] font-serif text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 size={12} />
                  <span>Phóng to</span>
                </button>
              </div>

              {isMerlinActive ? (
                <div>
                  <div className="relative w-full h-52 rounded-xl overflow-hidden border-2 border-purple-500 mb-3 bg-gradient-to-b from-[#2a133f] to-[#0c0512] flex flex-col items-center justify-center text-center p-4">
                    <Eye size={48} className="text-purple-300 animate-pulse mb-2" />
                    <h3 className="font-title-magical font-bold text-lg text-purple-200">
                      Thần Nhãn Chiêm Tinh Merlin
                    </h3>
                    <p className="text-[11px] text-purple-300/80 font-lora italic mt-1">
                      Toàn bộ {gameState.players.length} phù thủy và số phận đang nằm trong tầm quan sát của bạn.
                    </p>
                    <span className="mt-2 text-[10px] font-mono bg-purple-950 text-purple-200 px-2 py-0.5 rounded-full border border-purple-600">
                      QUYỀN QUẢN TRÒ TOÀN NĂNG
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120803] border border-[#7a5229] text-xs text-[#ebdcb0] font-lora mb-3">
                    <strong className="text-purple-300 font-serif block mb-0.5 flex items-center gap-1">
                      <Sparkles size={11} /> Năng Lực Quản Trò:
                    </strong>
                    Chọn bất kỳ Bot nào từ bảng bên cạnh để chuyển góc nhìn quan sát bí mật hoặc thi triển phép thuật thay mặt Bot đó!
                  </div>

                  <button
                    onClick={handleAutoBotActions}
                    className="w-full py-2 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-purple-100 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-purple-400/80 transition-all"
                  >
                    <Bot size={13} className="text-cyan-400" />
                    <span>🎲 Tự Động Kích Hoạt Quyết Định Cho Bot</span>
                  </button>
                </div>
              ) : activePlayer?.role ? (
                <div>
                  <div className="relative w-full h-52 rounded-xl overflow-hidden border-2 border-[#bd8436] mb-3 bg-black">
                    <img
                      src={ROLE_CARD_IMAGES[activePlayer.role.id] || '/cards/harry.jpg'}
                      alt={activePlayer.role.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    
                    {/* Faction Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        activePlayer.role.faction === 'ORDER_OF_PHOENIX'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-600'
                          : activePlayer.role.faction === 'DEATH_EATERS'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                          : 'bg-purple-950/90 text-purple-300 border-purple-600'
                      }`}>
                        {activePlayer.role.faction === 'ORDER_OF_PHOENIX' ? 'Hội Phượng Hoàng' : activePlayer.role.faction === 'DEATH_EATERS' ? 'Tử Thần Thực Tử' : 'Phe Trung Lập'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="font-title-magical font-bold text-base text-[#ffd88f] leading-tight">
                        {activePlayer.role.name}
                      </h3>
                      <p className="text-[11px] text-[#ebdcb0]/80 font-lora italic truncate">
                        {activePlayer.role.title}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#120803] border border-[#7a5229] text-xs text-[#ebdcb0] font-lora mb-3">
                    <strong className="text-amber-400 font-serif block mb-0.5 flex items-center gap-1">
                      <Sparkles size={11} /> Năng Lực Ma Thuật:
                    </strong>
                    {activePlayer.role.ability}
                  </div>

                  <button
                    onClick={() => setShowRoleCard(true)}
                    className="w-full py-2 hpvn-btn-gold rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Chi Tiết Bí Kíp Thẻ Bài →</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-serif">Đang phân phát vai trò bí mật...</p>
              )}
            </div>

            {/* Desktop Chronicle / Log Box */}
            <div className="hpvn-panel rounded-2xl p-4">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-[#ffd88f] mb-2 flex items-center justify-between border-b border-[#7a5229]/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ScrollText size={14} className="text-amber-400" />
                  <span>NHẬT KÝ CHIẾN DỊCH</span>
                </span>
                <span className="text-[10px] font-mono text-[#ebdcb0]/60">
                  {actionLog.length} Sự kiện
                </span>
              </h3>
              <div 
                ref={logsContainerRef}
                className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar text-[11px] font-mono text-[#ebdcb0]/80"
              >
                {actionLog.map((log, i) => (
                  <p key={i} className="leading-snug border-b border-[#28170c] pb-1">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* MOBILE LOGS ONLY VIEW */}
          {mobileTab === 'log' && (
            <div className="lg:hidden col-span-12 hpvn-panel rounded-2xl p-4">
              <h3 className="font-serif font-bold text-sm text-[#ffd88f] mb-3 flex items-center justify-between border-b border-[#7a5229]/60 pb-2">
                <span className="flex items-center gap-2">
                  <ScrollText size={16} className="text-amber-400" />
                  <span>NHẬT KÝ CHIẾN DỊCH ({actionLog.length})</span>
                </span>
                <button
                  onClick={() => setMobileTab('battle')}
                  className="hpvn-btn-gold px-2.5 py-1 rounded-lg text-xs font-serif"
                >
                  ← Về Bàn Đấu
                </button>
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar text-xs font-mono text-[#ebdcb0]/90">
                {actionLog.map((log, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#140b05] border border-[#2b170c]">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: ACTION PANEL ON TOP + TARGETS GRID (col-span-8) */}
          <div className={`space-y-4 lg:col-span-8 ${mobileTab === 'log' ? 'hidden lg:block' : 'block'}`}>
            
            {/* =========================================================================
             * BÀN THI TRIỂN MA PHÁP & BIỂU QUYẾT (ĐẨY LÊN TRÊN DANH SÁCH MỤC TIÊU)
             * ========================================================================= */}
            <div className="hpvn-panel-gold rounded-2xl p-4 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none" />
              <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#7a5229]/70 pb-2.5 mb-3">
                <h3 className="font-title-magical font-bold text-sm sm:text-base text-[#ffd88f] flex items-center gap-2">
                  <Wand2Icon size={16} className="text-amber-400" />
                  <span>
                    {isMerlinActive 
                      ? 'BÀN QUẢN TRÒ MERLIN & THẦN NHÃN' 
                      : `BÀN THI PHÁP: ${activePlayer.name}`}
                  </span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#120803] border border-[#bd8436] text-[#ffd88f]">
                  {isNight ? '🌙 Thi Pháp Đêm' : '☀️ Biểu Quyết Ngày'}
                </span>
              </div>

              {/* Action Arsenal Sub-controller */}
              <div className="space-y-3">
                
                {/* Target Selection Feedback Prompt */}
                <div className="flex items-center justify-between bg-[#140b05] p-2.5 rounded-xl border border-[#7a5229]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Crosshair size={15} className="text-amber-400 shrink-0" />
                    <span className="text-xs font-serif text-[#ebdcb0] truncate">
                      Mục tiêu đã chọn:{' '}
                      <strong className="text-[#ffd88f]">
                        {selectedTarget ? (game.getPlayer(selectedTarget)?.name || 'Chưa chọn') : 'Chưa chọn'}
                      </strong>
                    </span>
                  </div>
                  {selectedTarget && (
                    <button
                      onClick={() => setSelectedTarget(null)}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-black/50"
                    >
                      Bỏ chọn ✕
                    </button>
                  )}
                </div>

                {/* Merlin Special Control Strip */}
                {isMerlinActive ? (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-serif text-purple-200">
                      👑 <strong>Quyền Quản Trò Merlin:</strong> Bạn có thể thi triển lệnh hoặc đổi góc nhìn Bot.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutoBotActions}
                        className="py-1.5 px-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md"
                      >
                        <Bot size={13} className="text-cyan-300" />
                        <span>Bot Tự Quyết Định</span>
                      </button>
                      <button
                        onClick={handleAdvancePhase}
                        className="py-1.5 px-3 hpvn-btn-gold rounded-xl text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Chuyển Phase ➔</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Available Action Triggers */}
                {isNight ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {/* Voldemort / Death Eater Kill */}
                      {(activePlayer?.role?.faction === 'DEATH_EATERS' || isMerlinActive) && (
                        <button
                          onClick={() => handleAction('KILL', selectedTarget || undefined)}
                          disabled={!selectedTarget}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            selectedTarget
                              ? 'hpvn-btn-phoenix text-white shadow-md'
                              : 'bg-[#24150c] text-zinc-500 border-[#5a3a1f] cursor-not-allowed'
                          }`}
                        >
                          <Skull size={14} className="text-red-300" />
                          <span>Ám Sát Lời Nguyền Chết</span>
                        </button>
                      )}

                      {/* Dumbledore / Escort Protect */}
                      {(activePlayer?.role?.faction === 'ORDER_OF_PHOENIX' || isMerlinActive) && (
                        <button
                          onClick={() => handleAction('PROTECT', selectedTarget || undefined)}
                          disabled={!selectedTarget}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            selectedTarget
                              ? 'hpvn-btn-floo text-white shadow-md'
                              : 'bg-[#24150c] text-zinc-500 border-[#5a3a1f] cursor-not-allowed'
                          }`}
                        >
                          <Shield size={14} className="text-emerald-300" />
                          <span>Bảo Vệ / Bay Hộ Tống</span>
                        </button>
                      )}

                      {/* Hermione / Lupin Scan */}
                      {(activePlayer?.role?.faction === 'ORDER_OF_PHOENIX' || isMerlinActive) && (
                        <button
                          onClick={() => handleAction('SCAN', selectedTarget || undefined)}
                          disabled={!selectedTarget}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            selectedTarget
                              ? 'hpvn-btn-gold text-[#ffd88f] shadow-md'
                              : 'bg-[#24150c] text-zinc-500 border-[#5a3a1f] cursor-not-allowed'
                          }`}
                        >
                          <Eye size={14} />
                          <span>Bùa Soi Danh Tính</span>
                        </button>
                      )}
                    </div>

                    {/* Passive notification for Harry / Order members */}
                    {activePlayer?.role?.phaseType === 'PASSIVE' && !isMerlinActive && (
                      <div className="p-2 rounded-xl bg-[#1a0e07] border border-[#7a5229]/60 text-[11px] font-lora text-amber-200/90 flex items-center justify-between gap-2">
                        <span>⚡ Bạn đang ẩn nấp an toàn dưới Áo Choàng Tàng Hình và chờ đồng minh hộ tống.</span>
                        <button
                          onClick={handleAdvancePhase}
                          className="px-2.5 py-1 hpvn-btn-gold text-xs font-serif font-bold rounded-lg shrink-0 cursor-pointer"
                        >
                          Chờ Đợi ➔
                        </button>
                      </div>
                    )}
                  </div>
                ) : isVote ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAction('VOTE', selectedTarget || undefined)}
                      disabled={!selectedTarget}
                      className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        selectedTarget
                          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black border-amber-300 font-black shadow-md'
                          : 'bg-[#24150c] text-zinc-500 border-[#5a3a1f] cursor-not-allowed'
                      }`}
                    >
                      <Vote size={15} />
                      <span>Biểu Quyết Tước Đũa {selectedTarget ? `(${game.getPlayer(selectedTarget)?.name})` : ''}</span>
                    </button>

                    <button
                      onClick={() => handleAction('VOTE', 'NONE')}
                      className="py-2.5 px-4 bg-[#24150c] hover:bg-[#382013] text-[#ebdcb0] border border-[#7a5229] rounded-xl text-xs font-serif font-bold transition-all cursor-pointer"
                    >
                      Bỏ Phiếu Trắng
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-[#140b05] border border-[#7a5229]">
                    <span className="text-xs text-[#ebdcb0]/90 font-lora italic">
                      Đang xử lý giai đoạn {phaseInfo.name}... Bạn có thể chuyển tiếp ngay.
                    </span>
                    <button
                      onClick={handleAdvancePhase}
                      className="hpvn-btn-gold px-3 py-1 rounded-xl text-xs font-serif font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles size={12} />
                      <span>Tiếp tục ➔</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TARGETS GRID: DANH SÁCH MỤC TIÊU PHÙ THỦY */}
            <div className="hpvn-panel rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-[#7a5229]/60 pb-2.5 mb-3">
                <h3 className="font-serif font-bold text-xs sm:text-sm text-[#ffd88f] flex items-center gap-2">
                  <Crosshair size={15} className="text-amber-400" />
                  <span>DANH SÁCH PHÙ THỦY ({gameState.players.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-[#ebdcb0]/70">
                  {isMerlinVision ? '👑 Thần Nhãn: Thẻ bài & mục tiêu đã mở' : 'Chạm vào thẻ để chọn mục tiêu'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {gameState.players.map(player => {
                  const isCurrentPerspective = player.id === activePerspectiveId;
                  const isUserOriginal = player.id === effectivePlayerId;
                  const isSelected = selectedTarget === player.id;
                  const isDead = player.status === 'DEAD';
                  const isGhost = player.status === 'GHOST';

                  // Check if this player has submitted a night action
                  const submittedAction = gameState.nightActions.find(a => a.playerId === player.id);

                  return (
                    <div
                      key={player.id}
                      onClick={() => {
                        if (!isDead) {
                          setSelectedTarget(prev => prev === player.id ? null : player.id);
                        }
                      }}
                      className={`relative p-2.5 rounded-xl border transition-all select-none cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#381e0e] border-[#ffd88f] ring-2 ring-[#ffd88f] shadow-[0_0_15px_rgba(255,216,143,0.35)] scale-[1.02] z-10'
                          : isCurrentPerspective
                          ? 'bg-[#21112e] border-purple-400 ring-2 ring-purple-400/70'
                          : isUserOriginal
                          ? 'bg-[#1f1208] border-[#bd8436]'
                          : isDead
                          ? 'bg-[#100705] border-red-950 opacity-50 cursor-not-allowed'
                          : 'bg-[#160d07] border-[#5a3a1f] hover:border-[#bd8436]'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-1.5 gap-1">
                        <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                          isDead
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : isGhost
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        }`}>
                          {isDead ? '💀 Tử Trận' : isGhost ? '👻 Hồn Ma' : '✓ Sống'}
                        </span>

                        {isSelected && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black">
                            Mục tiêu ✓
                          </span>
                        )}

                        {/* Faction or Identity Badge */}
                        {isMerlinVision && player.role ? (
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                            player.role.faction === 'ORDER_OF_PHOENIX'
                              ? 'bg-amber-950 text-amber-300 border-amber-600'
                              : player.role.faction === 'DEATH_EATERS'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : 'bg-purple-950 text-purple-300 border-purple-600'
                          }`}>
                            {player.role.faction === 'ORDER_OF_PHOENIX' ? 'HPH' : player.role.faction === 'DEATH_EATERS' ? '4T' : 'Neutral'}
                          </span>
                        ) : isUserOriginal ? (
                          <span className="text-[9px] font-serif font-bold text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-600">
                            Bạn
                          </span>
                        ) : null}
                      </div>

                      {/* Portrait & Identity */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden border border-[#bd8436]/60 shrink-0 bg-black">
                          <img
                            src={(player.role && ROLE_CARD_IMAGES[player.role.id]) || '/cards/harry.jpg'}
                            alt={player.name}
                            className="w-full h-full object-cover object-top"
                          />
                          {isDead && (
                            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                              <Skull className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-serif font-bold text-xs text-[#ffd88f] truncate">
                            {player.name}
                          </p>
                          {(isMerlinVision || isCurrentPerspective || isDead || player.isRevealed) && player.role && (
                            <span className="text-[10px] font-serif text-[#ebdcb0]/90 block truncate font-semibold">
                              {player.role.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Merlin Night Action Inspector Badge */}
                      {isMerlinVision && isNight && submittedAction && (
                        <div className="mb-1 text-[8px] font-mono text-cyan-300 bg-[#0c1524] px-1 py-0.5 rounded border border-cyan-800 truncate">
                          ⚡ {submittedAction.actionType}: {game.getPlayer(submittedAction.targetId || '')?.name || 'Mục tiêu'}
                        </div>
                      )}

                      {/* Vote tally during voting phase */}
                      {isVote && !isDead && (
                        <div className="mb-1 text-[10px] font-mono flex items-center justify-between text-zinc-400">
                          <span>Phiếu:</span>
                          <span className="font-bold text-amber-300 bg-black/50 px-1 rounded">
                            {player.voteCount.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Direct Perspective Switch Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePerspectiveId(player.id);
                          addLog(`👁️ Chuyển góc nhìn sang: ${player.name} (${player.role?.name || ''})`);
                        }}
                        className={`w-full py-0.5 rounded text-[9px] font-serif font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isCurrentPerspective
                            ? 'bg-purple-800 text-purple-200 border-purple-400'
                            : 'bg-[#24150c] hover:bg-purple-950 text-[#ffd88f] border-[#7a5229]'
                        }`}
                        title={`Đổi sang góc nhìn của ${player.name}`}
                      >
                        <Eye size={10} />
                        <span>{isCurrentPerspective ? 'Góc Nhìn Này' : 'Xem Góc Nhìn'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Role Card Modal */}
      {showRoleCard && (
        <HPVNRoleModal
          role={activePlayer.role || HPVN_ROLES.HARRY_POTTER}
          isMerlin={isMerlinActive}
          onClose={() => setShowRoleCard(false)}
        />
      )}

      {/* Game Over Proclamation Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <HPVNGameOverModal
          winners={gameState.winners}
          players={gameState.players}
        />
      )}
    </div>
  );
}

// ============================================================================
// ROLE MODAL SUBCOMPONENT
// ============================================================================

function HPVNRoleModal({ 
  role, 
  isMerlin, 
  onClose 
}: { 
  role: Role; 
  isMerlin?: boolean; 
  onClose: () => void 
}) {
  const cardImg = ROLE_CARD_IMAGES[role.id] || '/cards/harry.jpg';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="relative bg-gradient-to-b from-[#1c1008] via-[#140b05] to-[#0a0503] border-2 border-[#bd8436] rounded-3xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
        <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white text-sm w-7 h-7 rounded-full bg-[#120803] border border-[#7a5229] flex items-center justify-center z-20 cursor-pointer"
        >
          ✕
        </button>

        {/* Card Artwork */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-[#bd8436] mb-4 bg-black">
          <img
            src={cardImg}
            alt={role.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-xl font-title-magical font-bold text-[#ffd88f]">{role.name}</h2>
            <p className="text-xs text-amber-200/80 font-lora italic">{role.title}</p>
          </div>
        </div>

        <div className="bg-[#120803] rounded-xl p-3 border border-[#7a5229] mb-3 text-xs text-[#ebdcb0] font-lora leading-relaxed">
          {role.description}
        </div>

        <div className="bg-[#24150c] rounded-xl p-3 border border-[#bd8436] mb-4">
          <h4 className="text-[10px] font-serif font-black text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles size={12} /> Năng Lực Ma Thuật
          </h4>
          <p className="text-xs text-[#ebdcb0] font-lora leading-relaxed">{role.ability}</p>
        </div>

        <div className="flex gap-2 text-[11px] font-mono justify-center">
          <span className={`px-2.5 py-1 rounded-full font-bold ${
            role.phaseType === 'NIGHT' 
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' 
              : 'bg-amber-950 text-amber-300 border border-amber-700'
          }`}>
            {role.phaseType === 'NIGHT' ? '🌙 Thi Pháp Đêm' : '☀️ Ban Ngày'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#140b05] border border-[#7a5229] text-[#ffd88f]">
            Biểu Quyết: {role.canVote ? '✓' : '✕'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#140b05] border border-[#7a5229] text-[#ffd88f]">
            Sát Thương: {role.canKill ? '✓' : '✕'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GAME OVER MODAL SUBCOMPONENT
// ============================================================================

function HPVNGameOverModal({ winners, players }: { winners: string[]; players: Player[] }) {
  const isPhoenixWin = winners.includes('HPH');
  const isDarkWin = winners.includes('FOUR_T');
  const isJesterWin = winners.includes('JESTER');

  const winnerTitle = isPhoenixWin ? 'HỘI PHƯỢNG HOÀNG CHIẾN THẮNG' :
                      isDarkWin ? 'TỬ THẦN THỰC TỬ CHIẾN THẮNG' :
                      isJesterWin ? 'KẺ HỀ MA QUÁI CHIẾN THẮNG' : 'HÒA HOÃN CẢ HAI PHE';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#1c1008] border-2 border-[#bd8436] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl">
        <CardCornerFlourish className="absolute top-2 left-2 w-8 h-8 text-[#bd8436] pointer-events-none" />
        <CardCornerFlourish className="absolute top-2 right-2 w-8 h-8 text-[#bd8436] -scale-x-100 pointer-events-none" />

        <div className="flex items-center justify-center gap-3 mb-3">
          {isPhoenixWin ? (
            <PhoenixCrest className="w-12 h-12 text-amber-400" />
          ) : isDarkWin ? (
            <DarkMarkCrest className="w-12 h-12 text-emerald-400" />
          ) : (
            <DeathlyHallowsSymbol className="w-12 h-12 text-purple-300" />
          )}
        </div>

        <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 block mb-1">
          KẾT QUẢ ĐẠI CHIẾN CHÍNH THỨC
        </span>
        <h2 className="text-2xl sm:text-3xl font-title-magical font-black text-[#ffd88f] mb-4">
          {winnerTitle}
        </h2>

        {/* Players Roster Reveal */}
        <div className="bg-[#120803] rounded-2xl p-4 border border-[#7a5229] mb-5 max-h-60 overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-serif font-bold text-amber-300 mb-2 text-left border-b border-[#7a5229]/60 pb-1">
            DANH TÍNH TOÀN BỘ PHÙ THỦY:
          </h4>
          <div className="space-y-1.5 text-left text-xs">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-[#180e07] border border-[#2b170c]">
                <span className="font-serif font-bold text-[#ffd88f]">{p.name}</span>
                <span className={`text-[11px] font-mono font-bold ${
                  p.role?.faction === 'ORDER_OF_PHOENIX'
                    ? 'text-amber-300'
                    : p.role?.faction === 'DEATH_EATERS'
                    ? 'text-emerald-300'
                    : 'text-purple-300'
                }`}>
                  {p.role?.name || 'Chưa rõ'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 hpvn-btn-gold rounded-2xl font-serif font-black text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
        >
          <Sparkles size={16} />
          <span>BẮT ĐẦU VÁN MỚI</span>
        </button>
      </div>
    </div>
  );
}

function Wand2Icon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/>
      <path d="m14 7 3 3"/>
      <path d="M5 6v4"/>
      <path d="M19 14v4"/>
      <path d="M10 2v2"/>
      <path d="M7 8H3"/>
      <path d="M21 16h-4"/>
      <path d="M11 3H9"/>
    </svg>
  );
}
