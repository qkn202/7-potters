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
  Feather,
  Clock
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
import { ChocolateFrogPentagonCard, HouseCrestShield } from './ChocolateFrogPentagonCard';

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
  '/cards/hagrid.jpg',
  '/cards/mcgonagall.jpg',
  '/cards/neville.jpg',
  '/cards/draco.jpg',
  '/cards/dolores.jpg',
  '/cards/jester.jpg'
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
  // Dynamic Concise Mobile Mission Prompt (Minimal text, maximum clarity)
  const getMissionPrompt = () => {
    if (isDead) return 'Bạn đã tử trận';
    if (isDay) {
      if (myAction) return `Đã chọn: ${myVotedTarget?.name}`;
      return 'Chọn mục tiêu để Tước Đũa';
    }
    // Night Phase
    if (isDeathEater) {
      if (isSilenced) return 'Đòn ám sát bị phong ấn!';
      if (myAction?.targetId === 'NONE') return 'Đã chọn Án Binh';
      if (myAction) return `Đã nhắm: ${myVotedTarget?.name}`;
      return me.role?.id === 'VOLDEMORT' ? 'Chọn mục tiêu Ám Sát' : 'Dồn lực Ám Sát cùng Chúa Tể';
    }
    if (me.role?.id === 'HERMIONE_GRANGER') return 'Chọn phù thủy để Soi Danh Tính';
    if (me.role?.id === 'ALBUS_DUMBLEDORE') return 'Chọn đồng đội để Dựng Khiên';
    if (me.role?.id === 'SEVERUS_SNAPE') return 'Chọn người để Bọc Lót Sectumsempra';
    if (me.role?.id === 'REMUS_LUPIN') return 'Chọn đồng đội để Hồi Sinh';
    if (me.role?.id === 'KINGSLEY_SHACKLEBOLT') return 'Kích hoạt lưới Ứng Cứu';
    if (me.role?.id === 'MINERVA_MCGONAGALL') return 'Chọn đồng minh để Hóa Mèo Bọc Lót';
    if (me.role?.id === 'NEVILLE_LONGBOTTOM') return 'Chọn đồng đội để Thức Tỉnh';
    if (me.role?.id === 'DOLORES_UMBRIDGE') return 'Chọn phù thủy để Ban Sắc Lệnh';
    if (me.role?.id === 'JESTER') return 'Ẩn mình ban đêm';
    if (myAction) return `Đang Hộ Tống: ${myVotedTarget?.name}`;
    return 'Chọn đồng đội để Bay Hộ Tống';
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
  if (me.role?.id === 'MINERVA_MCGONAGALL') skillName = 'Hóa Mèo Bọc Lót';
  if (me.role?.id === 'NEVILLE_LONGBOTTOM') skillName = 'Thức Tỉnh';
  if (me.role?.id === 'DOLORES_UMBRIDGE') skillName = 'Ban Sắc Lệnh';

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
    <div className="w-full max-w-[440px] mx-auto min-h-screen px-2.5 pt-1.5 pb-28 flex flex-col select-none relative">
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
      {/* ZONE 1: TOP FLIGHT HUD (EXACT MATCH OF USER'S SCREENSHOT)     */}
      {/* ============================================================== */}
      <div className="relative mb-3 flex items-center justify-between px-1 pt-1 select-none">
        {/* Left Side: Glowing Blue Dot + Golden Progress Dash Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8,0_0_20px_#0284c7] animate-pulse" />
          <div className="flex items-center gap-1">
            <span className="w-6 h-1 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="w-4 h-1 rounded-full bg-[#d97706]/70" />
            <span className="w-2.5 h-1 rounded-full bg-[#b45309]/50" />
          </div>
        </div>

        {/* Center: Hanging Arch Shield Badge (Chặng 2/4) */}
        <div className="relative -mt-1 flex flex-col items-center">
          <div className="px-5 sm:px-6 py-1.5 rounded-b-2xl bg-gradient-to-b from-[#131d2e] via-[#0d1624] to-[#070c16] border-x border-b-2 border-[#d4af37]/80 shadow-[0_8px_25px_rgba(0,0,0,0.9)] flex flex-col items-center">
            <span className="font-serif font-black text-sm sm:text-base text-[#fef08a] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Chặng {gameState.round || 2}/4
            </span>
            <div className="text-[#ffd88f] text-[9px] -mt-0.5 leading-none">
              ✦
            </div>
          </div>
          {/* Subtle hanging fleur drop below badge */}
          <div className="w-2.5 h-2.5 rotate-45 bg-[#d4af37]/90 -mt-1 shadow-sm" />
        </div>

        {/* Right Side: Night Phase Pill & Pocket Watch + Open Trigger */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0a121e]/90 border border-[#b45309]/60 text-xs font-serif text-[#ffd88f] shadow-inner">
            {isNight ? <Moon size={11} className="text-[#38bdf8]" /> : <Sun size={11} className="text-[#f59e0b]" />}
            <span className="font-bold">{isNight ? `Đêm ${gameState.round || 2}` : `Ngày ${gameState.round || 2}`}</span>
          </div>

          {/* Golden Pocket Watch Button */}
          <button
            onClick={() => setIsDeckOpen(true)}
            className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#fef08a] via-[#d4af37] to-[#854d0e] p-[1.5px] shadow-[0_0_10px_rgba(212,175,55,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Bí Kíp 27 Thẻ Bài"
          >
            <div className="w-full h-full rounded-full bg-[#0b172a] flex items-center justify-center text-[#ffd88f]">
              <Clock size={13} className="text-[#ffd88f]" />
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-t-full border border-[#fef08a]" />
          </button>

          {/* Open Menu Trigger with Green Notification Dot */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-[#0e192a]/90 hover:bg-[#14233a] border border-[#1e3452] text-xs font-serif text-[#7dd3fc] flex items-center gap-0.5 cursor-pointer relative shadow transition-colors"
            title="Bảo Bối & Menu Mật"
          >
            <span>Open</span>
            <ChevronDown size={11} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-sm bg-[#10b981] shadow-[0_0_6px_#10b981]" />
          </button>
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
      {/* ZONE 2: HERO PASSPORT (EXACT MATCH OF USER'S SCREENSHOT)       */}
      {/* ============================================================== */}
      <div className="arcane-card-glass rounded-2xl p-3 sm:p-3.5 mb-3 border border-amber-400/30 relative overflow-hidden flex items-center justify-between gap-2.5 shadow-xl">
        {/* Subtle ambient golden lighting */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left: Square Card Portrait with Glowing Gold Rim */}
        <div 
          onClick={() => setInspectSelf(true)}
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-0.5 bg-gradient-to-b from-[#fef08a] via-[#d4af37] to-[#854d0e] shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0 overflow-hidden cursor-pointer group hover:scale-105 transition-transform"
          title="Chạm để xem toàn bộ Thẻ Bài"
        >
          <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-black">
            <Image
              src={me.role?.image || '/cards/harry.jpg'}
              alt={me.name}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-black/30 pointer-events-none" />
            {isDead && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400">
                <Skull size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Middle: Hero Passport Subtitle + Character Name + Tactical Pill */}
        <div className="flex-1 min-w-0 pr-0.5">
          <span className="text-[10px] sm:text-[11px] font-cinzel uppercase tracking-widest text-amber-300/80 block mb-0.5 font-bold">
            Hero Passport
          </span>
          <h2 className="font-cinzel font-black text-lg sm:text-xl text-white tracking-wide truncate leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {me.role?.name || me.name}
          </h2>

          {/* Tactical Prompt Pill */}
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-amber-400/40 text-amber-200 text-[10px] sm:text-[11px] font-sans flex items-center gap-1.5 shadow-inner max-w-full">
            <span className="text-amber-400 shrink-0 text-xs">{isDay ? '☀️' : '🌙'}</span>
            <span className="truncate">{getMissionPrompt()}</span>
          </div>
        </div>

        {/* Right: Gryffindor Shield Crest */}
        <div className="shrink-0 flex items-center justify-center">
          <HouseCrestShield 
            house={me.role?.faction === 'DEATH_EATERS' ? 'SLYTHERIN' : (me.house || 'GRYFFINDOR')} 
            className="w-11 h-13 sm:w-12 sm:h-14 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" 
          />
        </div>
      </div>

      {/* Secret Allies Strip for Death Eaters */}
      {isDeathEater && (
        <div className="mb-2.5 p-2 rounded-xl bg-[#031d13] border border-emerald-600/70 text-xs flex flex-col gap-1">
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
      <div className="flex-1 space-y-2 mb-3">
        {/* 2-Column Responsive Grid matching user's exact mockup */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
          {gameState.players.filter(p => !p.isGM && p.id !== me.id).map((player, idx) => {
            const isSelected = effectiveTargetId === player.id;
            const isMyVote = myAction?.targetId === player.id;
            const isPDead = player.status === 'DEAD';
            const isFellowDeathEater = isDeathEater && player.role?.faction === 'DEATH_EATERS';
            const canSelectDead = isNight && me.role?.id === 'REMUS_LUPIN';
            const disabled = isPDead && !canSelectDead;
            const voteCount = isDay ? (voteCountsByTarget[player.id] || 0) : 0;
            const killCount = isNight && isDeathEater ? (killCountsByTarget[player.id] || 0) : 0;

            const portrait = player.role?.image 
              ? player.role.image 
              : player.avatarUrl 
                ? player.avatarUrl 
                : FALLBACK_PORTRAITS[idx % FALLBACK_PORTRAITS.length];

            // Status Badge to attach to the side (matching Hermione's 🛡️ Hộ tống in screenshot)
            let statusBadgeNode: React.ReactNode = null;
            if (isMyVote) {
              statusBadgeNode = (
                <span className="px-2 py-0.5 rounded-full bg-[#0a1829] border border-cyan-400 text-cyan-200 text-[10px] font-serif font-bold shadow-[0_0_10px_rgba(34,211,238,0.5)] flex items-center gap-1 shrink-0 animate-pulse">
                  🛡️ Hộ tống
                </span>
              );
            } else if (voteCount > 0) {
              statusBadgeNode = (
                <span className="px-2 py-0.5 rounded-full bg-[#1e1307] border border-amber-400 text-amber-300 text-[10px] font-mono font-bold shadow-md shrink-0">
                  🗳️ {voteCount}
                </span>
              );
            } else if (killCount > 0) {
              statusBadgeNode = (
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300 text-[10px] font-mono font-bold shadow-md shrink-0">
                  🗡️ {killCount}
                </span>
              );
            }

            return (
              <ChocolateFrogPentagonCard
                key={player.id}
                image={portrait}
                name={player.name}
                roleName={isFellowDeathEater ? `${player.role?.name || 'Tử Thần'} 🐍` : (player.house || undefined)}
                isSelected={isSelected}
                isFellowDeathEater={isFellowDeathEater}
                isDead={isPDead}
                statusBadge={statusBadgeNode}
                onClick={() => {
                  if (disabled) {
                    setToastMessage('Người này đã ngã xuống trong trận chiến!');
                    return;
                  }
                  setSelectedTarget(player.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ZONE 4: FLOATING BOTTOM ACTION DOCK (VÙNG NGÓN TAY CÁI)         */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-2.5 bg-gradient-to-t from-black via-[#060b13]/98 to-transparent border-t border-[#1e2f47]/50 backdrop-blur-lg z-40">
        <div className="max-w-[440px] mx-auto flex items-center gap-2">
          
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
              className="bg-gradient-to-b from-[#0f172a] via-[#0a0f1d] to-[#050811] border-t border-amber-400/40 rounded-t-3xl p-5 max-w-lg mx-auto w-full shadow-2xl backdrop-blur-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-400/20">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-amber-400" />
                  <h3 className="font-cinzel font-black text-base text-amber-300">
                    Bảo Bối Weasley
                  </h3>
                </div>
                <button onClick={() => setIsInventoryOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {weasleyItems.map(item => (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.count > 0 
                        ? 'bg-slate-900/80 border-amber-400/30 hover:border-amber-400/60' 
                        : 'bg-slate-950/40 border-slate-800 opacity-40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-sm text-amber-300">{item.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          {item.count}/{item.maxCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
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
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-cinzel font-black text-xs disabled:opacity-40 shrink-0 cursor-pointer shadow-md"
                    >
                      Dùng
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
              className="bg-gradient-to-b from-[#0f172a] via-[#0a0f1d] to-[#050811] border-t border-amber-400/40 rounded-t-3xl p-5 max-w-lg mx-auto w-full shadow-2xl h-[70vh] flex flex-col backdrop-blur-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-400/20">
                <div className="flex items-center gap-2">
                  <ScrollText size={20} className="text-amber-400" />
                  <h3 className="font-cinzel font-black text-base text-amber-300">
                    Nhật Ký Chiến Trường ({gameState.logs.length})
                  </h3>
                </div>
                <button onClick={() => setIsLogOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {gameState.logs.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans italic py-8 text-center">
                    Chưa có hành động nào được ghi nhận.
                  </p>
                ) : (
                  gameState.logs.map((log, idx) => (
                    <div 
                      key={`player-log-${idx}`}
                      className="text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 font-sans leading-relaxed"
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
