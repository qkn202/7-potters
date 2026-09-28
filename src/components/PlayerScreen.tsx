"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, 
  Shield, 
  Wand2, 
  Skull, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Sparkles,
  BookOpen,
  CheckCircle,
  Flame,
  Maximize2,
  ScrollText,
  ChevronUp,
  ChevronDown,
  Info,
  HelpCircle,
  Zap,
  Target,
  Compass,
  Ban,
  FlaskConical,
  Package,
  Eye,
  X,
  Feather
} from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { CharacterCard, CardInspectorModal } from './CharacterCard';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  CardCornerFlourish,
  BadgeIcon
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';
import { SkyEventBanner } from './SkyEventBanner';
import { ROLES } from '@/lib/roles';

// Normalize action names for comparison
const normalizeAction = (actionName: string): string => actionName.toLowerCase().trim();
const isVoteAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n === 'biểu quyết tước đũa' || n === 'bỏ phiếu treo cổ';
};
const isKillAction = (actionName: string): boolean => normalizeAction(actionName) === 'giết';
const isEscortAction = (actionName: string): boolean => normalizeAction(actionName) === 'bay hộ tống';
const isProtectAction = (actionName: string): boolean => normalizeAction(actionName) === 'bảo vệ';
const isKingsleyAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n === 'chỉ huy ứng cứu' || n === 'ứng cứu' || n === 'cứu sống' || n === 'chỉ huy phản công' || n === 'kingsley kích hoạt';
};
const isReviveAction = (actionName: string): boolean => normalizeAction(actionName).includes('hồi sinh');

// Fallback card portraits for anonymous players
const FALLBACK_PORTRAITS = [
  '/cards/harry.jpg',
  '/cards/ron.jpg',
  '/cards/hermione.jpg',
  '/cards/dumbledore.jpg',
  '/cards/lupin.jpg',
  '/cards/kingsley.jpg',
  '/cards/snape.jpg',
  '/cards/moody.jpg',
  '/cards/arthur.jpg',
  '/cards/bill.jpg',
  '/cards/fleur.jpg',
  '/cards/fred.jpg',
  '/cards/george.jpg',
  '/cards/tonks.jpg',
  '/cards/hagrid.jpg'
];

export function PlayerScreen() {
  const { 
    gameState, 
    currentPlayerId, 
    playerAction, 
    executeInstantSkill, 
    resolveInterrupt, 
    skillToast, 
    clearSkillToast, 
    consumeWeasleyItem,
    simulateBotActions,
    calculateResolution,
    applyResolution,
    roomCode,
    isHost
  } = useGame();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [inspectSelf, setInspectSelf] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const canAdvanceTurn = !roomCode || isHost;

  const handleAdvancePhase = () => {
    simulateBotActions();
    calculateResolution();
  };

  const handleConfirmAdvance = () => {
    applyResolution();
    setSelectedTarget(null);
  };

  // Skill Toast Handling
  useEffect(() => {
    if (skillToast) {
      const showTimer = setTimeout(() => setToastMessage(skillToast), 0);
      const clearTimer = setTimeout(() => {
        setToastMessage(null);
        clearSkillToast();
      }, 6000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [skillToast, clearSkillToast]);

  // Phase transition announcement
  const prevPhaseRef = useRef<string>('');
  useEffect(() => {
    if (gameState.phase && prevPhaseRef.current !== gameState.phase) {
      prevPhaseRef.current = gameState.phase;
      const msg = gameState.phase === 'DAY'
        ? '☀️ LƯỢT BAN NGÀY: Toàn bộ phù thủy cùng thảo luận & Biểu Quyết Tước Đũa!'
        : gameState.phase === 'NIGHT'
        ? '🌙 LƯỢT BAN ĐÊM: Phe Tử Thần Thực Tử ám sát & Hội Phượng Hoàng hành động!'
        : null;

      if (msg) {
        const showTimer = setTimeout(() => setToastMessage(msg), 0);
        const clearTimer = setTimeout(() => setToastMessage(null), 5000);
        return () => {
          clearTimeout(showTimer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [gameState.phase]);

  const playerLogsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isLogOpen && playerLogsEndRef.current) {
      playerLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.logs, isLogOpen]);

  const me = gameState.players.find(p => p.id === currentPlayerId);
  if (!me) return null;

  // ================= 1. EMERGENCY INTERRUPT MODAL =================
  const myInterrupt = gameState.interruptState?.playerId === me.id ? gameState.interruptState : null;
  if (myInterrupt) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-gradient-to-b from-red-950 via-gray-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center overflow-hidden shadow-2xl"
        >
          <CardCornerFlourish className="absolute top-3 left-3 w-8 h-8 text-red-500 pointer-events-none" />
          <CardCornerFlourish className="absolute top-3 right-3 w-8 h-8 text-red-500 -scale-x-100 pointer-events-none" />
          
          <AlertTriangle size={52} className="text-red-500 mx-auto mb-3 animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-red-400 uppercase block mb-1">
            TÌNH HUỐNG KHẨN CẤP · MẬT LỆNH BẢO TOÀN
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mb-2">
            {myInterrupt.type === 'MUNDUNGUS_SWAP' ? 'Mundungus Phục Kích Thoát Thân!' : 'Tonks Kế Thừa Biến Hình!'}
          </h2>
          <p className="text-sm sm:text-base text-red-300 mb-6 font-serif px-4">
            {myInterrupt.reason}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {gameState.players.filter(p => p.id !== me.id && !p.isGM).map((p, index) => {
              const isPDead = p.status === 'DEAD';
              if (myInterrupt.type === 'MUNDUNGUS_SWAP' && isPDead) return null;
              const isSelected = selectedTarget === p.id;
              
              return (
                <button
                  key={p.id ? `interrupt-btn-${p.id}` : `interrupt-btn-${index}`}
                  onClick={() => setSelectedTarget(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected 
                      ? 'bg-red-900/60 border-red-500' 
                      : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="font-serif font-bold text-gray-200 block text-sm">{p.name}</span>
                  {isPDead && <span className="text-[10px] font-mono text-red-500 block">Đã chết</span>}
                  {isSelected && <Crosshair size={14} className="absolute right-2 top-2 text-red-400" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (selectedTarget) {
                resolveInterrupt(selectedTarget);
                setSelectedTarget(null);
              }
            }}
            disabled={!selectedTarget}
            className="px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-serif font-black rounded-xl text-base tracking-wider transition-all uppercase"
          >
            XÁC NHẬN CHỌN MỤC TIÊU
          </button>
        </motion.div>
      </div>
    );
  }

  // ================= 2. END OF GAME VICTORY SCREEN =================
  if (gameState.phase === 'END') {
    const isWinner = me.role?.faction === gameState.winner;
    const isDeathEatersWon = gameState.winner === 'DEATH_EATERS';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative max-w-2xl w-full p-8 sm:p-12 rounded-3xl border-2 overflow-hidden shadow-2xl ${
            isDeathEatersWon ? 'bg-[#061e14] border-emerald-500' : 'bg-[#2b1008] border-amber-500'
          }`}
        >
          <div className="flex justify-center mb-6">
            {isDeathEatersWon ? (
              <DarkMarkCrest className="w-24 h-24 animate-pulse" />
            ) : (
              <PhoenixCrest className="w-24 h-24 animate-pulse" />
            )}
          </div>

          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#ffd88f] block mb-2">
            KẾT THÚC CHIẾN DỊCH BẢY POTTER
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-serif font-black mb-4 tracking-wide ${
            isDeathEatersWon 
              ? 'text-emerald-300' 
              : gameState.winner === 'NEUTRAL'
                ? 'text-purple-300'
                : 'text-[#ffd88f]'
          }`}>
            {isDeathEatersWon 
              ? 'TỬ THẦN THỰC TỬ CHIẾN THẮNG' 
              : gameState.winner === 'NEUTRAL'
                ? 'PHE TRUNG LẬP CHIẾN THẮNG'
                : 'HỘI PHƯỢNG HOÀNG CHIẾN THẮNG'}
          </h2>

          <p className="text-lg sm:text-xl font-serif text-[#f5eedb] mb-8">
            {isWinner 
              ? '🎉 Vinh quang bất diệt! Lực lượng của bạn đã khải hoàn thắng lợi! 🎉' 
              : '💀 Rất tiếc! Lực lượng của bạn đã thất bại trong trận không chiến! 💀'}
          </p>

          <p className="text-xs font-mono text-[#ebdcb0]/60">
            Merlin (Quản Trò) có thể cài đặt lại ván cờ từ bảng điều khiển.
          </p>
        </motion.div>
      </div>
    );
  }

  // Phase & Status Flags
  const isNight = gameState.phase === 'NIGHT';
  const isDay = gameState.phase === 'DAY';
  const isDead = me.status === 'DEAD';
  const isDeathEater = me.role?.faction === 'DEATH_EATERS';

  const isSilenced = Boolean(gameState.skillStates[`voldemort_silenced_R${gameState.round}`]);
  const isDoubleKill = Boolean(gameState.skillStates[`voldemort_double_kill_R${gameState.round}`]);

  const myAction = me ? gameState.pendingActions[me.id] : null;
  const myVotedTarget = myAction && myAction.targetId !== 'NONE' ? gameState.players.find(p => p.id === myAction.targetId) : null;
  const effectiveTargetId = selectedTarget ?? (myAction?.targetId && myAction.targetId !== 'NONE' ? myAction.targetId : null);
  const effectiveTargetPlayer = gameState.players.find(p => p.id === effectiveTargetId);

  // Live vote and kill counts
  const voteCountsByTarget: Record<string, number> = {};
  const killCountsByTarget: Record<string, number> = {};
  Object.values(gameState.pendingActions).forEach(action => {
    if (isVoteAction(action.actionName)) {
      voteCountsByTarget[action.targetId] = (voteCountsByTarget[action.targetId] || 0) + 1;
    } else if (isKillAction(action.actionName)) {
      if (action.targetId && action.targetId !== 'NONE') {
        killCountsByTarget[action.targetId] = (killCountsByTarget[action.targetId] || 0) + 1;
      }
    }
  });

  // Dynamic 1-Line Mission Prompt (Replaces 4-Tier Coaching Text Wall)
  const getMissionPrompt = () => {
    if (isDead) {
      return '💀 Bạn đã tử trận trong không chiến. Hãy quan sát và đàm đạo trên Mạng Floo!';
    }
    if (isDay) {
      if (myAction) {
        return `✓ Đã biểu quyết Tước Đũa cho [${myVotedTarget?.name}]. Bạn có thể chọn người khác để đổi phiếu.`;
      }
      return '☀️ Phiên Phán Quyết: Chạm chọn 1 kẻ khả nghi để Biểu Quyết Tước Đũa!';
    }
    // Night Phase
    if (isDeathEater) {
      if (isSilenced) {
        return '🔇 Đòn ám sát của Tử Thần Thực Tử đang bị phong ấn ma pháp đêm nay!';
      }
      if (myAction?.targetId === 'NONE') {
        return '🕊️ Đã chọn Án Binh Bất Động đêm nay (không ám sát ai).';
      }
      if (myAction) {
        return `✓ Đã nhắm ám sát [${myVotedTarget?.name}]. Có thể đổi mục tiêu hoặc chọn Án Binh.`;
      }
      return me.role?.id === 'VOLDEMORT'
        ? '🌙 Đêm 2: Chọn 1 mục tiêu để Ám Sát hoặc bấm "Án Binh" để thăm dò!'
        : '🌙 Đêm 2: Chọn mục tiêu dồn đòn ám sát cùng Chúa Tể Voldemort!';
    }
    if (me.role?.id === 'HARRY_POTTER') {
      return myAction
        ? `✓ Đang Bay Hộ Tống cùng [${myVotedTarget?.name}].`
        : '🌙 Ban Đêm: Chọn 1 đồng đội để Bay Hộ Tống hoặc ẩn mình bảo toàn mạng!';
    }
    if (me.role?.id === 'HERMIONE_GRANGER') {
      return '🌙 Ban Đêm: Chạm chọn 1 phù thủy để thi triển bùa Soi Danh Tính thật!';
    }
    if (me.role?.id === 'ALBUS_DUMBLEDORE') {
      return '🌙 Ban Đêm: Chọn 1 đồng đội để dựng Khiên Bảo Vệ (Protego) khỏi ám sát!';
    }
    if (me.role?.id === 'SEVERUS_SNAPE') {
      return '🌙 Ban Đêm: Chọn 1 người để bọc lót Sectumsempra (cứu nếu bị tấn công)!';
    }
    if (me.role?.id === 'REMUS_LUPIN') {
      return '🌙 Ban Đêm: Dùng Thuốc Hồi Sinh cho 1 đồng đội đã ngã xuống (sống lại rạng sáng)!';
    }
    if (me.role?.id === 'KINGSLEY_SHACKLEBOLT') {
      return '🌙 Ban Đêm: Bấm nút "Chỉ Huy Ứng Cứu" để giăng lưới cứu đồng đội bị ám sát!';
    }
    if (myAction) {
      return `✓ Đang Bay Hộ Tống cùng [${myVotedTarget?.name}].`;
    }
    return '🌙 Ban Đêm: Chọn 1 đồng đội để sát cánh Bay Hộ Tống né đòn bùa chú!';
  };

  // Skill definitions and cooldown checks for night
  let skillName: string | null = null;
  if (me.role?.id === 'HERMIONE_GRANGER') skillName = 'Soi Danh Tính';
  if (me.role?.id === 'PETER_PETTIGREW') skillName = 'Đánh Hơi';
  if (me.role?.id === 'FENRIR_GREYBACK') skillName = 'Cắn';
  if (me.role?.id === 'ARTHUR_WEASLEY') skillName = 'Soi Phe';
  if (me.role?.id === 'FRED_WEASLEY') skillName = 'Tặng Kẹo';
  if (me.role?.id === 'GEORGE_WEASLEY') skillName = 'Rải Bột';
  if (me.role?.id === 'BILL_WEASLEY') skillName = 'Giải Phong Ấn';
  if (me.role?.id === 'FLEUR_DELACOUR') skillName = 'Chém Kiếm';
  if (me.role?.id === 'LUCIUS_MALFOY') skillName = 'Soi Vai Trò';
  if (me.role?.id === 'POTTER_FAKE') skillName = 'Silenced Ultimate';

  const isGeorge = skillName === 'Rải Bột';
  const isSkillOnCooldown = 
    (skillName === 'Soi Danh Tính' && Boolean(gameState.skillStates[`${me.id}_HERMIONE_R${gameState.round}`])) ||
    (skillName === 'Đánh Hơi' && Boolean(gameState.skillStates[`${me.id}_PETTIGREW_R${gameState.round}`])) ||
    (skillName === 'Cắn' && Boolean(gameState.skillStates[`${me.id}_FENRIR`] || gameState.skillStates[`${me.id}_FENRIR_BITE`])) ||
    (skillName === 'Soi Phe' && Boolean(gameState.skillStates[`${me.id}_ARTHUR_R${gameState.round}`])) ||
    (skillName === 'Tặng Kẹo' && Boolean(gameState.skillStates[`${me.id}_FRED_R${gameState.round}`])) ||
    (skillName === 'Rải Bột' && Boolean(gameState.skillStates[`${me.id}_GEORGE_R${gameState.round}`] || gameState.skillStates[`${me.id}_GEORGE_R${gameState.round - 1}`])) ||
    (skillName === 'Giải Phong Ấn' && Boolean(gameState.skillStates[`${me.id}_BILL_R${gameState.round}`])) ||
    (skillName === 'Chém Kiếm' && Boolean(gameState.skillStates[`${me.id}_FLEUR_R${gameState.round}`])) ||
    (skillName === 'Soi Vai Trò' && Boolean(gameState.skillStates[`${me.id}_LUCIUS_R${gameState.round}`])) ||
    (skillName === 'Silenced Ultimate' && Boolean(gameState.skillStates[`${me.id}_POTTERFAKE_ULTIMATE`]));

  // Active Weasley Items count
  const weasleyItems = gameState.weasleyItems || [];
  const availableItemsCount = weasleyItems.filter(i => i.count > 0).length;

  return (
    <div className="min-h-screen pb-32 sm:pb-24 pt-2 px-2 sm:px-4 max-w-5xl mx-auto flex flex-col">
      {/* ============================================================== */}
      {/* FLOATING TOAST NOTIFICATION                                    */}
      {/* ============================================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 p-3 rounded-2xl bg-gradient-to-r from-amber-950/95 via-[#231508]/95 to-amber-950/95 border-2 border-amber-400 text-amber-100 text-xs sm:text-sm font-serif font-bold shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md"
            onClick={() => setToastMessage(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span className="leading-snug">{toastMessage}</span>
            </div>
            <button className="text-amber-400 hover:text-white shrink-0 p-1">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* ZONE 1: TOP FLIGHT HUD · TIẾN TRÌNH & THỜI KHẮC                */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-black/40 border border-amber-500/20 p-2.5 sm:p-3 mb-3 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between gap-2">
          {/* Stage & Sky Area */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-serif font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wider shrink-0">
              Chặng {gameState.round}/4
            </span>
            <span className="text-[11px] text-zinc-400 font-serif truncate hidden xs:inline">
              · Tầng Mây Bão Privet Drive
            </span>
          </div>

          {/* Center-Right: Phase Badge & Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-serif font-bold flex items-center gap-1.5 border shadow-inner ${
              isNight 
                ? 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-indigo-950/50' 
                : 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50'
            }`}>
              {isNight ? <Moon size={12} className="text-indigo-400" /> : <Sun size={12} className="text-amber-400" />}
              <span>{isNight ? `Đêm ${gameState.round}` : `Ngày ${gameState.round}`}</span>
            </div>

            {/* Quick Deck View */}
            <button
              onClick={() => setIsDeckOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-300 text-[11px] font-serif flex items-center gap-1 transition-all"
              title="Xem tất cả thẻ bài"
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Bí Kíp</span>
            </button>

            {/* Toggle Log View */}
            <button
              onClick={() => setIsLogOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-300 text-[11px] font-serif flex items-center gap-1 transition-all"
              title="Xem biên niên sử"
            >
              <ScrollText size={13} />
              <span className="hidden sm:inline">Nhật Ký</span>
            </button>

            {/* Solo / Host Quick Turn Advance */}
            {canAdvanceTurn && (
              <button
                type="button"
                onClick={handleAdvancePhase}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[11px] font-serif font-black flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Mô phỏng hành động các bot và tính toán kết quả chuyển pha"
              >
                <Zap size={13} className="text-black fill-black" />
                <span>Chuyển Lượt</span>
              </button>
            )}
          </div>
        </div>

        {/* Micro Progress Track */}
        <div className="mt-2 w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 transition-all duration-500" 
            style={{ width: `${Math.min(100, (gameState.round / 4) * 100)}%` }} 
          />
        </div>
      </div>

      {/* Dynamic Sky Event Banner */}
      {gameState.currentSkyEvent && (
        <div className="mb-3">
          <SkyEventBanner event={gameState.currentSkyEvent} phase={gameState.phase} />
        </div>
      )}

      {/* Active Curses & Spell Alerts */}
      <div className="space-y-1.5 mb-3">
        {Boolean(gameState.skillStates[`${me.id}_SECTUMSEMPRA_SILENCED_R${gameState.round}`]) && (
          <div className="p-2.5 bg-red-950/90 border border-red-700/80 rounded-xl text-xs text-red-200 font-serif flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <span><strong>Bùa Lạc Sectumsempra:</strong> Bạn bị mất một bên tai! Kỹ năng bị phong ấn ở vòng này!</span>
          </div>
        )}
        {Boolean(gameState.skillStates[`${me.id}_VOTE_SILENCED_R${gameState.round}`]) && (
          <div className="p-2.5 bg-amber-950/90 border border-amber-600/80 rounded-xl text-xs text-amber-200 font-serif flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span><strong>Hóa Thú Đào Tẩu:</strong> Bạn đang hóa chuột cống Scabbers! Bị cấm bỏ phiếu ban ngày vòng này!</span>
          </div>
        )}
        {isDeathEater && isSilenced && (
          <div className="p-2.5 bg-red-950/90 border border-red-700/80 rounded-xl text-xs text-red-200 font-serif flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <span><strong>Lời Nguyền Lucius Malfoy:</strong> Đòn ám sát của phe Tử Thần Thực Tử bị phong ấn đêm nay!</span>
          </div>
        )}
        {isDeathEater && isDoubleKill && (
          <div className="p-2.5 bg-emerald-950/90 border border-emerald-600/80 rounded-xl text-xs text-emerald-200 font-serif flex items-center gap-2">
            <Flame size={15} className="text-emerald-400 shrink-0" />
            <span><strong>Cơn Thịnh Nộ Bellatrix:</strong> Được quyền ám sát 2 mục tiêu đêm nay! Hãy chia phiếu cùng đồng đội.</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ZONE 2: COMPACT HERO PASSPORT (THẺ CĂN CƯỚC THU GỌN - 68px)    */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-[#140b05]/90 via-[#1c1208]/90 to-[#140b05]/90 border border-amber-500/30 p-3 mb-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Avatar with Arcane Border */}
          <div 
            className="relative cursor-pointer group shrink-0" 
            onClick={() => setInspectSelf(true)}
            title="Nhấn để xem toàn bộ Thẻ Bài Tarot"
          >
            <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 shadow-lg overflow-hidden relative ${
              isDeathEater ? 'border-emerald-400/90 shadow-emerald-950/60' : 'border-amber-400/90 shadow-amber-950/60'
            }`}>
              <Image 
                src={me.role?.image || '/cards/harry.jpg'} 
                alt={me.name} 
                fill 
                className="object-cover rounded-[14px]"
                priority
              />
              {isDead && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400">
                  <Skull size={18} />
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-black/80 border border-amber-400/70 text-amber-300">
              <Maximize2 size={10} />
            </span>
          </div>

          {/* Identity & Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-serif font-black text-sm sm:text-base text-[#ffd88f] truncate">
                {me.name}
              </h2>
              {me.role?.id === 'HARRY_POTTER' && <span title="Kẻ Được Chọn">👑</span>}
              {me.role?.id === 'VOLDEMORT' && <span title="Chúa Tể Hắc Ám">💀</span>}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] font-serif font-bold px-2 py-0.5 rounded-full border ${
                isDeathEater 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {isDeathEater ? '🐍 Tử Thần Thực Tử' : '🦅 Hội Phượng Hoàng'}
              </span>

              <span className="text-[10px] font-mono text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                {me.role?.name}
              </span>

              {isDead ? (
                <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                  Tử trận
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  Sống sót
                </span>
              )}
            </div>
          </div>

          {/* Info Details Button */}
          <button
            onClick={() => setInspectSelf(true)}
            className="py-1.5 px-2.5 rounded-xl bg-black/40 hover:bg-black/70 border border-amber-500/40 text-amber-300 text-[11px] font-serif flex flex-col items-center gap-0.5 transition-all active:scale-95 shrink-0"
            title="Xem thẻ bài và câu chuyện"
          >
            <HelpCircle size={15} />
            <span className="text-[9px]">Chi tiết</span>
          </button>
        </div>

        {/* 1-Line Dynamic Mission Banner */}
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-black/50 to-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-xs font-serif text-amber-200/90 shadow-sm">
          <span className="text-amber-400 shrink-0">👉</span>
          <span className="truncate">{getMissionPrompt()}</span>
        </div>
      </div>

      {/* Secret Allies Strip for Death Eaters */}
      {isDeathEater && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#031d13] border border-emerald-600/70 text-xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-emerald-300 font-serif font-bold text-[11px]">
            <DarkMarkCrest className="w-3.5 h-3.5" />
            <span>Liên Minh Tử Thần Thực Tử:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gameState.players
              .filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id)
              .map(ally => (
                <span 
                  key={ally.id}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 ${
                    ally.status === 'DEAD'
                      ? 'bg-red-950 text-red-400 line-through border-red-800'
                      : 'bg-emerald-950 text-emerald-200 border-emerald-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ally.status === 'DEAD' ? 'bg-red-500' : 'bg-emerald-400'}`} />
                  {ally.name} ({ally.role?.name})
                </span>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ZONE 3: FLIGHT FORMATION ARENA (ĐẤU TRƯỜNG PHI ĐỘI BẦU TRỜ)     */}
      {/* ============================================================== */}
      <div className="flex-1 space-y-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-serif font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Feather size={13} className="text-amber-400" />
            Phi Đội Bầu Trời ({gameState.players.filter(p => !p.isGM && p.id !== me.id).length} Phù Thủy)
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Chạm để nhắm mục tiêu</span>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {gameState.players.filter(p => !p.isGM && p.id !== me.id).map((player, idx) => {
            const isSelected = effectiveTargetId === player.id;
            const isMyVote = myAction?.targetId === player.id;
            const isPDead = player.status === 'DEAD';
            const isPInjured = player.status === 'INJURED';
            const isFellowDeathEater = isDeathEater && player.role?.faction === 'DEATH_EATERS';
            const canSelectDead = isNight && me.role?.id === 'REMUS_LUPIN';
            const disabled = isPDead && !canSelectDead;
            const voteCount = isDay ? (voteCountsByTarget[player.id] || 0) : 0;
            const killCount = isNight && isDeathEater ? (killCountsByTarget[player.id] || 0) : 0;

            // Player image fallback
            const portrait = player.role?.image 
              ? player.role.image 
              : player.avatarUrl 
                ? player.avatarUrl 
                : FALLBACK_PORTRAITS[idx % FALLBACK_PORTRAITS.length];

            return (
              <motion.div
                key={player.id}
                whileTap={!disabled ? { scale: 0.97 } : {}}
                onClick={() => {
                  if (disabled) {
                    setToastMessage('Người này đã ngã xuống trong trận chiến!');
                    return;
                  }
                  setSelectedTarget(player.id);
                }}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col items-center text-center select-none ${
                  disabled 
                    ? 'bg-red-950/20 border-red-900/30 opacity-40 cursor-not-allowed grayscale' 
                    : isMyVote
                      ? 'bg-gradient-to-b from-[#1b3d2b] to-[#0f241a] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400 scale-[1.02]'
                      : isSelected 
                        ? isFellowDeathEater
                          ? 'bg-gradient-to-b from-[#0a3825] to-[#052418] border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.3)] scale-[1.02]'
                          : 'bg-gradient-to-b from-[#2a1b0d] to-[#140b05] border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]' 
                        : isFellowDeathEater
                          ? 'bg-[#052418]/80 hover:bg-[#083623] border-emerald-600/80'
                          : 'bg-black/50 hover:bg-[#1a110a]/80 border-white/10'
                }`}
              >
                {/* Crosshair indicator */}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-amber-400 animate-spin-slow">
                    <Crosshair size={14} />
                  </span>
                )}

                {/* Fellow Death Eater Mark */}
                {isFellowDeathEater && (
                  <span className="absolute top-2 left-2 text-emerald-400" title="Đồng minh Tử Thần Thực Tử">
                    <DarkMarkCrest className="w-3.5 h-3.5" />
                  </span>
                )}

                {/* Avatar Portrait */}
                <div className={`w-14 h-14 rounded-full p-0.5 border-2 mb-1.5 relative overflow-hidden ${
                  isPDead 
                    ? 'border-gray-700 grayscale' 
                    : isSelected 
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md' 
                      : isFellowDeathEater
                        ? 'border-emerald-400'
                        : 'border-white/20'
                }`}>
                  <Image 
                    src={portrait} 
                    alt={player.name} 
                    fill 
                    className="object-cover rounded-full"
                  />
                  {isPDead && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-red-400">
                      <Skull size={18} />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className={`font-serif font-black text-xs truncate w-full ${
                  isPDead ? 'line-through text-zinc-500' : isFellowDeathEater ? 'text-emerald-300' : 'text-zinc-100'
                }`}>
                  {player.name}
                </div>

                {/* Affiliation / Status Badge */}
                <div className="mt-1 flex items-center justify-center gap-1 w-full flex-wrap">
                  {isPDead ? (
                    <span className="text-[9px] font-mono text-red-400 bg-red-950/70 px-1.5 py-0.2 rounded border border-red-900">
                      Tử trận
                    </span>
                  ) : isMyVote ? (
                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/90 px-1.5 py-0.2 rounded-full border border-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle size={10} /> Đã chọn
                    </span>
                  ) : isSelected ? (
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-400/60 font-bold">
                      🎯 Đang nhắm
                    </span>
                  ) : isFellowDeathEater ? (
                    <span className="text-[9px] font-mono text-emerald-300 truncate">
                      {player.role?.name} {player.role?.id === 'VOLDEMORT' ? '👑' : ''}
                    </span>
                  ) : (
                    <span className="text-[9px] font-serif text-zinc-400 truncate">
                      Phù thủy · {player.house || 'Hogwarts'}
                    </span>
                  )}

                  {/* Vote / Kill Counters */}
                  {voteCount > 0 && (
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-950 px-1 rounded border border-amber-600">
                      🗳️ {voteCount}
                    </span>
                  )}
                  {killCount > 0 && (
                    <span className="text-[9px] font-mono text-red-400 bg-red-950 px-1 rounded border border-red-800">
                      🗡️ {killCount}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ZONE 4: FLOATING BOTTOM ACTION DOCK (VÙNG NGÓN TAY CÁI)         */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-gradient-to-t from-black via-[#0e0703]/98 to-transparent border-t border-amber-500/20 backdrop-blur-lg z-40">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          
          {/* ================= DAY ACTION: VOTE TƯỚC ĐŨA ================= */}
          {isDay ? (
            <>
              {me.role?.id === 'ALASTOR_MOODY' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (effectiveTargetId) {
                      const res = executeInstantSkill('Bắn Lén', effectiveTargetId);
                      setToastMessage(res || 'Đã thi triển Bắn Lén!');
                      setTimeout(() => setToastMessage(null), 4000);
                    }
                  }}
                  disabled={!effectiveTargetId || isDead}
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-red-800 to-rose-950 border border-red-500 text-white font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-40"
                  title="Moody Bắn Lén"
                >
                  <Skull size={15} />
                  <span>Bắn Lén</span>
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (effectiveTargetId) {
                    playerAction('biểu quyết tước đũa', effectiveTargetId);
                    setSelectedTarget(effectiveTargetId);
                    const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                    setToastMessage(`✓ Đã lưu phiếu Tước Đũa cho: ${tName}!`);
                  } else {
                    setToastMessage('Vui lòng chạm chọn 1 mục tiêu trên bầu trời!');
                  }
                }}
                disabled={!effectiveTargetId || isDead}
                className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-serif font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-200/80 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
              >
                <Crosshair size={17} className="text-black shrink-0" />
                <span className="truncate">
                  {myAction?.targetId === effectiveTargetId
                    ? `✓ Đã Lưu (${effectiveTargetPlayer?.name?.split(' ')[0]})`
                    : `Tước Đũa ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}`}
                </span>
              </motion.button>
            </>
          ) : (
            /* ================= NIGHT ACTIONS: ROLE SPECIFIC SKILLS ================= */
            <>
              {/* Role Skill Button (Hermione, Pettigrew, etc.) */}
              {skillName && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const targetId = isGeorge ? (effectiveTargetId || me.id) : effectiveTargetId;
                    if (targetId && !isSkillOnCooldown) {
                      const res = executeInstantSkill(skillName!, targetId);
                      setToastMessage(res || 'Đã thi triển');
                      setTimeout(() => setToastMessage(null), 4000);
                    } else if (!targetId) {
                      setToastMessage(`Vui lòng chọn 1 mục tiêu để thi triển ${skillName}!`);
                    }
                  }}
                  disabled={(!isGeorge && !effectiveTargetId) || isDead || isSkillOnCooldown}
                  className={`flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-amber-200 ${
                    isSkillOnCooldown ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <Wand2 size={16} className="text-black shrink-0" />
                  <span className="truncate">
                    {isSkillOnCooldown ? `Đã Dùng ${skillName}` : `Thi Triển ${skillName}`}
                  </span>
                </motion.button>
              )}

              {/* Death Eater Kill Button */}
              {isDeathEater && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (effectiveTargetId) {
                        if (me.role?.id === 'PETER_PETTIGREW' && effectiveTargetPlayer?.role?.id === 'HARRY_POTTER') {
                          setToastMessage('⚠️ Bàn tay bạc của bạn bị co giật (Món Nợ Mạng với Harry)! Không thể trực tiếp hạ sát.');
                          return;
                        }
                        playerAction('giết', effectiveTargetId);
                        setSelectedTarget(effectiveTargetId);
                        const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                        setToastMessage(`✓ Đã lưu mục tiêu Ám Sát: ${tName}!`);
                      } else {
                        setToastMessage('Vui lòng chạm chọn 1 mục tiêu để ám sát!');
                      }
                    }}
                    disabled={!effectiveTargetId || isDead || isSilenced}
                    className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 text-black font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-200 disabled:opacity-40"
                  >
                    <Zap size={16} className="text-black shrink-0" />
                    <span className="truncate">
                      {myAction?.targetId === effectiveTargetId && isKillAction(myAction?.actionName || '')
                        ? `✓ Ám Sát (${effectiveTargetPlayer?.name?.split(' ')[0]})`
                        : `Ám Sát ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}`}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      playerAction('giết', 'NONE');
                      setSelectedTarget(null);
                      setToastMessage('✓ Đã chọn: Không ám sát ai đêm nay! (Án binh)');
                    }}
                    disabled={isDead || isSilenced}
                    className={`py-3 px-3 rounded-2xl font-serif font-bold text-xs flex items-center justify-center gap-1 shadow-md border ${
                      myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '')
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title="Án binh bất động"
                  >
                    <span>🕊️ Án Binh</span>
                  </motion.button>
                </>
              )}

              {/* Dumbledore Protect */}
              {me.role?.id === 'ALBUS_DUMBLEDORE' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!effectiveTargetId) {
                      setToastMessage('Vui lòng chạm chọn 1 đồng đội để bảo vệ!');
                      return;
                    }
                    const prevShieldedId = gameState.skillStates[`DUMBLEDORE_SHIELDED_R${gameState.round - 1}`];
                    if (prevShieldedId && prevShieldedId === effectiveTargetId) {
                      setToastMessage('⚠️ Dumbledore không được bảo vệ cùng 1 người 2 lượt liên tiếp!');
                      return;
                    }
                    playerAction('bảo vệ', effectiveTargetId);
                    setSelectedTarget(effectiveTargetId);
                    const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                    setToastMessage(`✓ Đã lưu khiên Bảo Vệ cho: ${tName}!`);
                  }}
                  disabled={!effectiveTargetId || isDead}
                  className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-amber-200 disabled:opacity-40"
                >
                  <Shield size={16} className="text-black shrink-0" />
                  <span className="truncate">
                    {myAction?.targetId === effectiveTargetId && isProtectAction(myAction?.actionName || '')
                      ? `✓ Bảo Vệ (${effectiveTargetPlayer?.name?.split(' ')[0]})`
                      : `Bảo Vệ ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}`}
                  </span>
                </motion.button>
              )}

              {/* Severus Snape Sectumsempra */}
              {me.role?.id === 'SEVERUS_SNAPE' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!effectiveTargetId) {
                      setToastMessage('Vui lòng chạm chọn 1 người để bọc lót!');
                      return;
                    }
                    if (effectiveTargetId === me.id) {
                      setToastMessage('⚠️ Không thể tự bọc lót cho chính mình!');
                      return;
                    }
                    playerAction('bọc lót sectumsempra', effectiveTargetId);
                    setSelectedTarget(effectiveTargetId);
                    const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                    setToastMessage(`✓ Đã bọc lót Sectumsempra cho: ${tName}!`);
                  }}
                  disabled={!effectiveTargetId || isDead || effectiveTargetId === me.id}
                  className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-950 text-white font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-purple-400 disabled:opacity-40"
                >
                  <Sparkles size={16} className="text-purple-300 shrink-0" />
                  <span className="truncate">
                    Bọc Lót Sectumsempra {effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}
                  </span>
                </motion.button>
              )}

              {/* Kingsley Shacklebolt Command */}
              {me.role?.id === 'KINGSLEY_SHACKLEBOLT' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    playerAction('chỉ huy ứng cứu', 'ALL');
                    setToastMessage('✓ Đã chỉ huy toàn quân sẵn sàng ứng cứu đêm nay!');
                  }}
                  disabled={isDead}
                  className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-amber-200 disabled:opacity-40"
                >
                  <Shield size={16} className="text-black shrink-0" />
                  <span className="truncate">
                    {isKingsleyAction(myAction?.actionName || '') ? '✓ Đã Kích Hoạt Ứng Cứu' : 'Chỉ Huy Ứng Cứu'}
                  </span>
                </motion.button>
              )}

              {/* Lupin Revive */}
              {me.role?.id === 'REMUS_LUPIN' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!effectiveTargetId) {
                      setToastMessage('Vui lòng chọn 1 đồng đội đã ngã xuống!');
                      return;
                    }
                    const target = gameState.players.find(p => p.id === effectiveTargetId);
                    if (target && target.status !== 'DEAD') {
                      setToastMessage('⚠️ Thuốc Hồi Sinh chỉ có thể dùng cho người đã ngã xuống!');
                      return;
                    }
                    if (gameState.skillStates[`${me.id}_LUPIN`]) {
                      setToastMessage('⚠️ Bạn đã dùng hết Thuốc Hồi Sinh trong ván này!');
                      return;
                    }
                    playerAction('hồi sinh', effectiveTargetId);
                    setSelectedTarget(effectiveTargetId);
                    setToastMessage(`✓ Đã lưu lựa chọn Hồi Sinh cho: ${target?.name}!`);
                  }}
                  disabled={!effectiveTargetId || isDead || Boolean(gameState.skillStates[`${me.id}_LUPIN`])}
                  className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-950 text-emerald-200 font-serif font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-emerald-400 disabled:opacity-40"
                >
                  <Sparkles size={16} className="text-emerald-300 shrink-0" />
                  <span className="truncate">
                    {Boolean(gameState.skillStates[`${me.id}_LUPIN`]) 
                      ? 'Đã Dùng Hết Thuốc' 
                      : `Hồi Sinh ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}`}
                  </span>
                </motion.button>
              )}

              {/* Universal Escort (Bay Hộ Tống) for non-special or general roles */}
              {!isDeathEater && me.role?.id !== 'ALBUS_DUMBLEDORE' && me.role?.id !== 'SEVERUS_SNAPE' && me.role?.id !== 'KINGSLEY_SHACKLEBOLT' && me.role?.id !== 'REMUS_LUPIN' && !skillName && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (effectiveTargetId) {
                      if (effectiveTargetId === me.id) {
                        setToastMessage('⚠️ Bạn không thể tự bay hộ tống chính mình!');
                        return;
                      }
                      playerAction('bay hộ tống', effectiveTargetId);
                      setSelectedTarget(effectiveTargetId);
                      const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                      setToastMessage(`✓ Đã xác nhận Bay Hộ Tống cùng: ${tName}!`);
                    } else {
                      setToastMessage('Vui lòng chạm chọn 1 đồng đội để bay hộ tống!');
                    }
                  }}
                  disabled={!effectiveTargetId || isDead || effectiveTargetId === me.id}
                  className="flex-1 py-3 px-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-serif font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <Shield size={17} className="text-black shrink-0" />
                  <span className="truncate">
                    {myAction?.targetId === effectiveTargetId && isEscortAction(myAction?.actionName || '')
                      ? `✓ Đang Hộ Tống (${effectiveTargetPlayer?.name?.split(' ')[0]})`
                      : `Hộ Tống ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name.split(' ')[0]})` : ''}`}
                  </span>
                </motion.button>
              )}
            </>
          )}

          {/* Weasley Inventory Drawer Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsInventoryOpen(true)}
            className="py-3 px-3 rounded-2xl bg-[#1c1208] hover:bg-[#2b1b0c] border border-amber-500/40 text-amber-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            title="Mở túi đồ bảo bối Weasley"
          >
            <Package size={16} className="text-amber-400" />
            <span className="hidden xs:inline">Túi Đồ</span>
            <span>({availableItemsCount})</span>
          </motion.button>

          {/* Solo / Host Turn Advance Button */}
          {canAdvanceTurn && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAdvancePhase}
              className="py-3 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-200 shrink-0 cursor-pointer"
              title="Tính toán ma pháp và chuyển sang pha tiếp theo"
            >
              <Zap size={16} className="text-black fill-black" />
              <span>Chuyển Lượt</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* DRAWER 1: WEASLEY INVENTORY DRAWER (BOTTOM SHEET)              */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isInventoryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end"
            onClick={() => setIsInventoryOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-gradient-to-b from-[#1c1208] to-[#0e0703] border-t-2 border-amber-500/50 rounded-t-3xl p-5 max-w-lg mx-auto w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-amber-400" />
                  <h3 className="font-serif font-black text-base text-[#ffd88f]">
                    Bảo Bối Tiệm Phù Thủy Weasley
                  </h3>
                </div>
                <button onClick={() => setIsInventoryOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {weasleyItems.map(item => (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.count > 0 
                        ? 'bg-black/50 border-amber-500/40 hover:border-amber-400' 
                        : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#ffd88f]">{item.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {item.count}/{item.maxCount}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-serif mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (item.count <= 0) {
                          setToastMessage(`⚠️ [${item.name}] đã hết lượt sử dụng!`);
                          return;
                        }
                        if (item.id === 'FAINTING_FANCIES' && !effectiveTargetId) {
                          setToastMessage(`⚠️ Vui lòng chọn 1 mục tiêu trên bầu trời để cho ăn Kẹo Ngất Xỉu!`);
                          return;
                        }
                        const res = consumeWeasleyItem(item.id, effectiveTargetId || undefined);
                        setToastMessage(res || `✓ Đã kích hoạt [${item.name}]!`);
                        setIsInventoryOpen(false);
                      }}
                      disabled={isDead || item.count <= 0}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-black font-serif font-black text-xs disabled:opacity-40 shrink-0"
                    >
                      Dùng Ngay
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* DRAWER 2: BATTLE CHRONICLES DRAWER                             */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isLogOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end"
            onClick={() => setIsLogOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-gradient-to-b from-[#140b05] to-black border-t-2 border-amber-500/40 rounded-t-3xl p-5 max-w-lg mx-auto w-full shadow-2xl h-[70vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <ScrollText size={20} className="text-amber-400" />
                  <h3 className="font-serif font-black text-base text-[#ffd88f]">
                    Biên Niên Sử Chiến Trường ({gameState.logs.length})
                  </h3>
                </div>
                <button onClick={() => setIsLogOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {gameState.logs.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-serif italic py-8 text-center">
                    Chưa có hành động nào được ghi nhận trên bầu trời.
                  </p>
                ) : (
                  gameState.logs.map((log, idx) => (
                    <div 
                      key={`player-log-${idx}`}
                      className="text-xs p-3 rounded-xl bg-black/60 border border-white/10 text-zinc-200 font-serif leading-relaxed"
                    >
                      {log}
                    </div>
                  ))
                )}
                <div ref={playerLogsEndRef} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* BÁO CÁO KHÔNG CHIẾN (BATTLE AFTERMATH / RESOLUTION MODAL)       */}
      {/* ============================================================== */}
      <AnimatePresence>
        {gameState.resolutionReport && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full rounded-3xl p-6 sm:p-8 hpvn-panel-gold border-2 border-amber-400 shadow-2xl space-y-4"
            >
              <CardCornerFlourish className="absolute top-2.5 left-2.5 w-6 h-6 text-amber-400 pointer-events-none" />
              <CardCornerFlourish className="absolute top-2.5 right-2.5 w-6 h-6 text-amber-400 -scale-x-100 pointer-events-none" />

              <div className="text-center">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-amber-300 block mb-1">
                  CHIẾN TRƯỜNG BẢY POTTER · KẾT QUẢ KHÔNG CHIẾN
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#ffd88f] flex items-center justify-center gap-2">
                  {isNight ? (
                    <>
                      <Sun className="text-amber-400 animate-pulse" size={24} />
                      <span>Bình Minh Khởi Sắc · Kết Quả Đêm</span>
                    </>
                  ) : (
                    <>
                      <Moon className="text-indigo-400 animate-pulse" size={24} />
                      <span>Hoàng Hôn Buông Xuống · Phán Quyết</span>
                    </>
                  )}
                </h3>
              </div>

              {/* Summary narrative lines */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar text-left">
                {gameState.resolutionReport.summary.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-serif italic text-center py-4">
                    Không có biến cố nào phát sinh trong lượt này.
                  </p>
                ) : (
                  gameState.resolutionReport.summary.map((line, idx) => (
                    <div 
                      key={`res-line-${idx}`}
                      className="p-3 rounded-xl bg-black/60 border border-amber-500/25 text-xs sm:text-sm font-serif text-amber-100 leading-relaxed"
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>

              {/* Confirm & Fly Forward Button */}
              <button
                type="button"
                onClick={handleConfirmAdvance}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-amber-200 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles size={18} className="text-black" />
                <span>TIẾP TỤC CHẶNG BAY ➔</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Full Tarot Card Inspector Modal for Self */}
      <CardInspectorModal
        role={me.role}
        isOpen={inspectSelf}
        onClose={() => setInspectSelf(false)}
      />
    </div>
  );
}
