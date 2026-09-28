"use client";

import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { 
  Crosshair, 
  Shield, 
  Wand2, 
  Skull, 
  Activity, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Sparkles,
  BookOpen,
  CheckCircle,
  Flame,
  Maximize2,
  ScrollText,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Zap,
  Target,
  Ban,
  FlaskConical,
  LogOut
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

// Helper to normalize action names for consistent comparison
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
const isSectumsempraAction = (actionName: string): boolean => {
  const n = normalizeAction(actionName);
  return n.includes('sectumsempra') || n.includes('bọc lót');
};
const isReviveAction = (actionName: string): boolean => normalizeAction(actionName).includes('hồi sinh');

export function PlayerScreen() {
  const { gameState, currentPlayerId, playerAction, executeInstantSkill, resolveInterrupt, skillToast, clearSkillToast, consumeWeasleyItem, leaveGame } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [inspectSelf, setInspectSelf] = useState(false);
  const [mobileTab, setMobileTab] = useState<'battle' | 'card' | 'log'>('battle');
  const [showChronicle, setShowChronicle] = useState(true);
  const [copiedChronicle, setCopiedChronicle] = useState(false);

  useEffect(() => {
    if (skillToast) {
      const showTimer = setTimeout(() => {
        setToastMessage(skillToast);
      }, 0);
      const clearTimer = setTimeout(() => {
        setToastMessage(null);
        clearSkillToast();
      }, 7000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [skillToast, clearSkillToast]);

  const prevPhaseRef = useRef<string>('');
  useEffect(() => {
    if (gameState.phase && prevPhaseRef.current !== gameState.phase) {
      prevPhaseRef.current = gameState.phase;
      const msg = gameState.phase === 'DAY'
        ? '☀️ LƯỢT BAN NGÀY: Đến lượt TOÀN BỘ PHÙ THỦY (Hội Phượng Hoàng & Tử Thần Thực Tử) cùng thảo luận & Biểu Quyết Tước Đũa!'
        : gameState.phase === 'NIGHT'
        ? '🌙 LƯỢT BAN ĐÊM: Đến lượt Phe TỬ THẦN THỰC TỬ (Ám sát) & Phù thủy HỘI PHƯỢNG HOÀNG (Hermione, Dumbledore, Lupin, Kingsley)!'
        : null;

      if (msg) {
        const showTimer = setTimeout(() => {
          setToastMessage(msg);
        }, 0);
        const clearTimer = setTimeout(() => {
          setToastMessage(null);
        }, 6500);
        return () => {
          clearTimeout(showTimer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [gameState.phase]);

  const playerLogsEndRef = useRef<HTMLDivElement>(null);
  const playerLogsContainerRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn đến log mới nhất trên màn hình người chơi
  useEffect(() => {
    if (playerLogsContainerRef.current) {
      playerLogsContainerRef.current.scrollTop = playerLogsContainerRef.current.scrollHeight;
    }
    if (playerLogsEndRef.current) {
      playerLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.logs, mobileTab]);

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
          className="relative bg-gradient-to-b from-red-950 via-gray-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center overflow-hidden"
        >
          <CardCornerFlourish className="absolute top-3 left-3 w-8 h-8 text-red-500 pointer-events-none" />
          <CardCornerFlourish className="absolute top-3 right-3 w-8 h-8 text-red-500 -scale-x-100 pointer-events-none" />
          
          <AlertTriangle size={56} className="text-red-500 mx-auto mb-3 animate-pulse" />
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
          className={`relative max-w-2xl w-full p-8 sm:p-12 rounded-3xl border-3 overflow-hidden ${
            isDeathEatersWon ? 'hpvn-panel-emerald' : 'hpvn-panel-crimson'
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
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-title-magical font-black mb-4 tracking-wide ${
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

          <p className="text-lg sm:text-xl font-lora text-[#f5eedb] mb-6">
            {isWinner 
              ? '🎉 Vinh quang bất diệt! Phe của bạn đã khải hoàn thắng lợi! 🎉' 
              : '💀 Rất tiếc! Lực lượng của bạn đã thất bại trong trận không chiến! 💀'}
          </p>

          {gameState.winReason && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#bd8436]/60 mb-6 text-sm sm:text-base font-serif text-[#ffd88f] leading-relaxed shadow-lg max-w-lg mx-auto text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ebdcb0]/70 block mb-1">
                📜 LÝ DO CHIẾN THẮNG:
              </span>
              <p className="italic text-[#f5eedb]">{gameState.winReason}</p>
            </div>
          )}

          {/* Detailed Match Chronicle Scroll (Biên Niên Sử Ván Đấu) */}
          {gameState.matchChronicle && gameState.matchChronicle.length > 0 && (
            <div className="mb-6 text-left max-w-xl mx-auto w-full">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowChronicle(!showChronicle)}
                  className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#ffd88f] hover:text-white transition-colors cursor-pointer"
                >
                  <ScrollText size={16} className="text-[#ffd88f]" />
                  <span>📜 BIÊN NIÊN SỬ CHIẾN TRƯỜNG</span>
                  <span className="text-[11px] font-mono text-[#ebdcb0]/60">
                    {showChronicle ? '▼ Thu gọn' : '▶ Xem chi tiết từ đầu đến cuối'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    const text = gameState.matchChronicle?.join('\n') || '';
                    navigator.clipboard.writeText(text);
                    setCopiedChronicle(true);
                    setTimeout(() => setCopiedChronicle(false), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black/60 border border-[#bd8436]/50 hover:bg-[#3a2213] text-[11px] font-mono font-bold text-[#ffd88f] transition-all flex items-center gap-1 cursor-pointer"
                  title="Sao chép toàn bộ biên niên sử ván đấu"
                >
                  {copiedChronicle ? '✓ Đã chép!' : '📋 Sao chép'}
                </button>
              </div>

              {showChronicle && (
                <div className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-[#bd8436]/60 shadow-2xl max-h-[42vh] overflow-y-auto space-y-1.5 font-mono text-xs text-[#ebdcb0] leading-relaxed scrollbar-thin scrollbar-thumb-[#bd8436]/50 scrollbar-track-transparent">
                  {gameState.matchChronicle.map((line, idx) => {
                    const isHeader = line.includes('═══') || line.includes('───');
                    const isTitle = line.includes('BIÊN NIÊN SỬ') || line.includes('KẾT THÚC TRẬN CHIẾN');
                    const isSection = line.includes('1. XUẤT PHÁT ĐIỂM') || line.includes('2. DIỄN BIẾN') || line.includes('3. BÌNH LUẬN');
                    const isEventHeader = line.trim().startsWith('📍') || line.trim().startsWith('⚡');
                    const isWinHighlight = line.includes('GIÀNH CHIẾN THẮNG');
                    const isHarry = line.includes('Harry Potter');

                    if (isHeader) {
                      return <div key={idx} className="text-[#bd8436]/40 select-none py-0.5">{line}</div>;
                    }
                    if (isTitle) {
                      return (
                        <div key={idx} className={`font-bold font-serif text-center sm:text-sm py-1 ${isWinHighlight ? 'text-[#ffd88f] text-sm sm:text-base animate-pulse' : 'text-amber-300'}`}>
                          {line}
                        </div>
                      );
                    }
                    if (isSection) {
                      return (
                        <div key={idx} className="font-bold text-[#ffd88f] border-b border-[#bd8436]/30 pt-2 pb-1 mt-2 text-xs font-serif">
                          {line}
                        </div>
                      );
                    }
                    if (isEventHeader) {
                      return (
                        <div key={idx} className="font-bold text-amber-200 pt-1.5 text-xs">
                          {line}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={`pl-2 sm:pl-3 ${isHarry ? 'text-amber-100 font-semibold' : 'text-[#ebdcb0]/90'}`}>
                        {line}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Exit Game */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 mb-4">
            <button
              onClick={() => leaveGame()}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:brightness-110 active:scale-95 text-white font-serif font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer transition-all uppercase"
            >
              <LogOut size={16} />
              <span>THOÁT GAME (VỀ TRANG CHỦ)</span>
            </button>
          </div>

          <p className="text-xs font-mono text-[#ebdcb0]/60">
            Merlin (Quản Trò) có thể cài đặt lại ván cờ từ bảng điều khiển.
          </p>
        </motion.div>
      </div>
    );
  }

  const isNight = gameState.phase === 'NIGHT';
  const isDay = gameState.phase === 'DAY';
  const isDead = me.status === 'DEAD';

  const hasNightSkill = me.role?.faction === 'DEATH_EATERS' || 
    ['ALBUS_DUMBLEDORE', 'SEVERUS_SNAPE', 'HERMIONE_GRANGER', 'REMUS_LUPIN', 'KINGSLEY_SHACKLEBOLT', 'PETER_PETTIGREW', 'FENRIR_GREYBACK'].includes(me.role?.id || '');

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


  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Floating Global Announcement Toast: Luôn hiển thị nổi bật ở đỉnh màn hình */}
      {toastMessage && (
        <motion.div 
          key="player-floating-toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg shadow-2xl pointer-events-auto"
          onClick={() => setToastMessage(null)}
        >
          <div className={`p-3 sm:p-4 border-2 rounded-2xl text-center font-serif text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 backdrop-blur-md cursor-pointer ${
            toastMessage.startsWith('⚠️')
              ? 'bg-[#3d1800]/95 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : toastMessage.includes('BAN NGÀY')
                ? 'bg-gradient-to-r from-[#2a1305]/95 via-[#3f1f0a]/95 to-[#2a1305]/95 border-amber-400 text-[#ffd88f] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : toastMessage.includes('BAN ĐÊM')
                  ? 'bg-gradient-to-r from-[#0d071a]/95 via-[#1d0e33]/95 to-[#0d071a]/95 border-indigo-400 text-cyan-200 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                  : 'bg-[#044e36]/95 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
          }`}>
            <div className="flex items-center gap-2 text-left min-w-0">
              {toastMessage.startsWith('⚠️') ? (
                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              ) : toastMessage.includes('BAN NGÀY') ? (
                <Sun size={18} className="text-amber-400 shrink-0 animate-spin-slow" />
              ) : toastMessage.includes('BAN ĐÊM') ? (
                <Moon size={18} className="text-cyan-300 shrink-0" />
              ) : (
                <CheckCircle size={18} className="text-emerald-300 shrink-0" />
              )}
              <span className="leading-snug">{toastMessage}</span>
            </div>
            <span className="text-[10px] font-mono text-white/50 shrink-0 px-1 hover:text-white">✕</span>
          </div>
        </motion.div>
      )}

      {/* Top Banner: Atmospheric Day/Night Tracker & Global Actions */}
      <div className="relative rounded-2xl border-2 border-[#bd8436] p-3 sm:p-5 mb-3 sm:mb-6 overflow-hidden"
        style={{
          background: isDay 
            ? 'linear-gradient(90deg, #3d2412 0%, #26160c 50%, #170c06 100%)' 
            : 'linear-gradient(90deg, #1c0f24 0%, #15091c 50%, #0d0612 100%)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border shrink-0 ${
              isDay 
                ? 'bg-[#5c3f1f] text-[#ffd88f] border-[#ebdcb0]/60' 
                : 'bg-[#2f143d] text-cyan-300 border-indigo-500/50'
            }`}>
              {isDay ? <Sun size={22} className="animate-spin-slow text-[#ffd88f]" /> : <Moon size={22} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#ffd88f]">
                  Lượt {gameState.round}
                </span>
                <span className="text-[#7a5229]">•</span>
                <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                  isDay ? 'bg-[#180e07] text-[#ffd88f] border-[#7a5229]' : 'bg-[#120617] text-cyan-300 border-indigo-800'
                }`}>
                  {isDay ? 'Ban Ngày · Diễn Đàn & Biểu Quyết Tước Đũa' : 'Ban Đêm · Ám Sát & Thi Triển Ma Pháp'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-title-magical font-bold text-[#ffd88f] mt-0.5 tracking-wide truncate">
                {isDay ? 'Bầu Trời Ngày · Hội Đồng Phán Quyết' : 'Bầu Trời Đêm · Ám Sát & Ma Pháp'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#ebdcb0] font-lora mt-0.5 hidden xs:block">
                {isDay 
                  ? 'Toàn bộ các phù thủy thức dậy. Tranh luận, vạch trần kẻ ác và biểu quyết Bùa Tước Khí Giới (Expelliarmus)!' 
                  : 'Màn đêm buông xuống. Tử Thần Thực Tử săn lùng Harry thật, Hội Phượng Hoàng thi triển ma pháp bảo vệ và hộ tống.'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="hpvn-btn-gold px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5"
            >
              <BookOpen size={14} /> Bí Kíp Thẻ Bài
            </button>
            <button
              onClick={() => leaveGame()}
              className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/70 text-red-200 text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Thoát Game / Về Trang Chủ"
            >
              <LogOut size={14} className="text-red-400" />
              <span>Thoát</span>
            </button>
          </div>
        </div>

        {/* THÔNG BÁO RÕ RÀNG: LƯỢT PHE NÀO ĐANG HÀNH ĐỘNG */}
        <div className={`mt-3 p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
          isDay
            ? 'bg-gradient-to-r from-[#211005]/95 via-[#331a0a]/95 to-[#1c0e05]/95 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
            : 'bg-gradient-to-r from-[#0d071a]/95 via-[#180e2b]/95 to-[#0b0517]/95 border-indigo-500/70 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
        }`}>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[10px] font-mono text-[#ebdcb0]/80 uppercase font-bold tracking-wider shrink-0">
              LƯỢT HÀNH ĐỘNG:
            </span>
            {isDay ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-[#ffd88f] border border-amber-500 font-mono font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wide">
                  <Sun size={12} className="text-amber-400" />
                  Toàn Thể Phù Thủy (Tất Cả Các Phe)
                </span>
                <span className="text-[10px] sm:text-[11px] font-serif font-bold text-amber-200/90">
                  Biểu Quyết Bùa Tước Khí Giới (Expelliarmus) {me.role?.id === 'ALASTOR_MOODY' ? '+ Moody Bắn Lén' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 font-mono font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wide">
                  <DarkMarkCrest className="w-3.5 h-3.5" />
                  Tử Thần Thực Tử (Ám sát)
                </span>
                <span className="text-[10px] sm:text-[11px] font-serif font-bold text-cyan-200">
                  + Hội Phượng Hoàng (Dumbledore, Hermione, Lupin, Kingsley, Bay Hộ Tống)
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            {isDead ? (
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800 flex items-center gap-1">
                <Skull size={11} /> Bạn đã tử trận, không thể hành động
              </span>
            ) : isDay ? (
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-600 flex items-center gap-1 animate-pulse">
                <Sparkles size={11} className="text-amber-400" /> 👉 ĐẾN LƯỢT BẠN (Biểu quyết Tước Đũa)
              </span>
            ) : (
              me.role?.faction === 'DEATH_EATERS' ? (
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-600 flex items-center gap-1 animate-pulse">
                  <Sparkles size={11} className="text-emerald-400" /> 👉 ĐẾN LƯỢT BẠN (Tử Thần Thực Tử ám sát)
                </span>
              ) : hasNightSkill ? (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-600 flex items-center gap-1 animate-pulse">
                  <Sparkles size={11} className="text-cyan-300" /> 👉 ĐẾN LƯỢT BẠN (Thi triển kỹ năng đêm)
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-200/80 bg-black/40 px-2 py-0.5 rounded border border-amber-900/60 flex items-center gap-1">
                  🛡️ Bạn có thể "Bay Hộ Tống" che chắn đồng đội
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Dynamic In-Flight Sky Event Banner */}
      <div className="mb-3 sm:mb-6">
        <SkyEventBanner event={gameState.currentSkyEvent} phase={gameState.phase} />
      </div>

      {/* Mobile Navigation Tab Bar (hidden on lg screens) */}
      <div className="lg:hidden flex items-center bg-[#120803] p-1 rounded-xl border border-[#7a5229] mb-3">
        <button
          onClick={() => setMobileTab('battle')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'battle'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Crosshair size={14} /> Tác Chiến ({gameState.phase === 'DAY' ? 'Ngày' : 'Đêm'})
        </button>
        <button
          onClick={() => setMobileTab('card')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all relative ${
            mobileTab === 'card'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Sparkles size={14} className="text-amber-400" /> Thẻ Của Bạn
          {me.role && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse absolute top-1 right-2" />
          )}
        </button>
        <button
          onClick={() => setMobileTab('log')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'log'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <ScrollText size={14} /> Nhật Ký ({gameState.logs.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Player's Deluxe 3D Character Card (col-span-5) */}
        <div className={`space-y-4 lg:col-span-5 ${mobileTab === 'card' ? 'block' : 'hidden lg:block'}`}>
          {/* Mobile Quick Return Button */}
          <div className="lg:hidden flex items-center justify-between pb-2 mb-1 border-b border-[#7a5229]/60">
            <button
              onClick={() => setMobileTab('battle')}
              className="hpvn-btn-gold px-3 py-1.5 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Crosshair size={13} />
              <span>← Quay lại Bàn Tác Chiến</span>
            </button>
            <span className="text-[10px] font-mono text-[#ffd88f]/80">
              Nhấn thẻ để lật mặt sau ↻
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles size={14} /> Thẻ Bài Của Bạn
            </span>
            <button
              onClick={() => setInspectSelf(true)}
              className="text-xs text-gray-400 hover:text-amber-300 flex items-center gap-1 transition-colors font-mono"
            >
              <Maximize2 size={12} /> Phóng to thẻ
            </button>
          </div>

          <CharacterCard
            role={me.role}
            playerStatus={me.status}
            playerName={me.name}
            isOwner={true}
            size="tarot"
            allowFlip={true}
            onInspect={() => setInspectSelf(true)}
          />

          {isDead && (
            <div className="rounded-2xl border-2 border-red-900/50 bg-red-950/40 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-red-400 font-serif font-bold mb-1">
                <Skull size={18} /> Bạn Đã Tử Trận
              </div>
              <p className="text-xs text-gray-400 font-serif">
                Bạn đã ngã xuống trong trận không chiến. Không thể phát biểu hay bỏ phiếu (trừ khi được Lupin hồi sinh).
              </p>
            </div>
          )}

          {/* Death Eaters Secret Allied Roster (Voldemort / TTTT Biết Mặt Nhau) */}
          {me.role?.faction === 'DEATH_EATERS' && (
            <div className="rounded-xl border border-emerald-600/60 bg-[#081a12] p-3.5">
              <div className="flex items-center gap-2 text-emerald-300 font-title font-bold text-sm mb-2 border-b border-emerald-900/60 pb-1.5">
                <DarkMarkCrest className="w-4 h-4" />
                <span>Hội Kín Tử Thần Thực Tử (Đồng Minh)</span>
              </div>
              <div className="space-y-1.5">
                {gameState.players
                  .filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id)
                  .map((ally, idx) => (
                    <div key={ally.id ? `de-ally-item-${ally.id}` : `de-ally-item-${idx}`} className="flex items-center justify-between text-xs font-mono text-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${ally.status === 'DEAD' ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
                        <span className={ally.status === 'DEAD' ? 'line-through text-emerald-600' : ''}>{ally.name}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400/90 font-serif font-bold">
                        {ally.role?.name} {ally.role?.id === 'VOLDEMORT' ? '👑' : ''}
                      </span>
                    </div>
                  ))}
                {gameState.players.filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id).length === 0 && (
                  <p className="text-[11px] text-emerald-400/60 font-lora italic">
                    Bạn là Tử Thần Thực Tử duy nhất trong trận không chiến này!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Severus Snape Special Characters Network (Thân Tín Dumbledore) */}
          {me.role?.id === 'SEVERUS_SNAPE' && (
            <div className="rounded-xl border border-purple-500/60 bg-[#160a1e] p-3.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="flex items-center gap-2 text-purple-300 font-title font-bold text-sm mb-2 border-b border-purple-900/60 pb-1.5">
                <FlaskConical className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Mạng Lưới Thân Tín Dumbledore</span>
              </div>
              <p className="text-[11px] text-purple-200/80 font-lora italic mb-2.5 leading-relaxed">
                Bạn biết danh tính tất cả nhân vật đặc biệt của cả hai phe (ngoại trừ Harry Potter & Voldemort). Phe phái được ẩn hoàn toàn: bạn không được biết ai ở phía Tử Thần Thực Tử!
              </p>
              <div className="space-y-1.5">
                {gameState.players
                  .filter(p => !p.isGM && p.id !== me.id && p.role && p.role.id !== 'HARRY_POTTER' && p.role.id !== 'VOLDEMORT' && p.role.id !== 'POTTER_FAKE')
                  .map((spec, idx) => (
                    <div key={spec.id ? `snape-spec-item-${spec.id}` : `snape-spec-item-${idx}`} className="flex items-center justify-between text-xs font-mono text-purple-200 bg-purple-950/40 px-2 py-1.5 rounded-lg border border-purple-800/40">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${spec.status === 'DEAD' ? 'bg-red-500' : 'bg-purple-400 animate-pulse'}`} />
                        <span className={spec.status === 'DEAD' ? 'line-through text-purple-400/50' : 'font-serif font-bold'}>{spec.name}</span>
                      </span>
                      <span className="text-[10px] text-purple-300/90 font-mono bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-500/40">
                        Nhân Vật Đặc Biệt
                      </span>
                    </div>
                  ))}
                {gameState.players.filter(p => !p.isGM && p.id !== me.id && p.role && p.role.id !== 'HARRY_POTTER' && p.role.id !== 'VOLDEMORT' && p.role.id !== 'POTTER_FAKE').length === 0 && (
                  <p className="text-[11px] text-purple-400/60 font-lora italic">
                    Không có nhân vật đặc biệt nào khác trong ván này!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Peter Pettigrew Spy Journal (Đánh Hơi Nhà Hang Sóc) */}
          {me.role?.id === 'PETER_PETTIGREW' && (
            <div className="rounded-xl border border-emerald-600/60 bg-[#071911] p-3.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2 text-emerald-300 font-title font-bold text-sm mb-2 border-b border-emerald-900/60 pb-1.5">
                <Target className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Khứu Giác Chuột Scabbers (Đánh Hơi)</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-lora italic mb-2.5 leading-relaxed">
                12 năm sống ở Nhà Hang Sóc: Bạn nhận diện đích danh Harry Potter thật và Ron Weasley! Tuy nhiên, do mang Món Nợ Mạng (Life Debt), bạn không thể tự tay ám sát Harry Potter.
              </p>
              <div className="space-y-1.5">
                {gameState.players
                  .filter(p => !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX' && gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`])
                  .map((insp, idx) => {
                    const status = gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${insp.id}`];
                    const isHarry = status === 'HARRY_POTTER';
                    const isRon = status === 'RON_WEASLEY';
                    const isSpec = status === 'SPECIAL';
                    return (
                      <div key={insp.id ? `pettigrew-insp-item-${insp.id}` : `pettigrew-insp-item-${idx}`} className="flex items-center justify-between text-xs font-mono text-emerald-200 bg-emerald-950/40 px-2 py-1.5 rounded-lg border border-emerald-800/40">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${insp.status === 'DEAD' ? 'bg-red-500' : isHarry ? 'bg-rose-500 animate-pulse' : isRon ? 'bg-orange-400' : isSpec ? 'bg-amber-400 animate-pulse' : 'bg-gray-400'}`} />
                          <span className={insp.status === 'DEAD' ? 'line-through text-emerald-600' : 'font-serif font-bold'}>{insp.name}</span>
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isHarry 
                            ? 'text-rose-200 bg-rose-950/90 border-rose-500 font-bold'
                            : isRon 
                              ? 'text-orange-200 bg-orange-950/90 border-orange-500 font-bold'
                              : isSpec 
                                ? 'text-amber-300 bg-amber-950/80 border-amber-500/50' 
                                : 'text-gray-400 bg-gray-900/80 border-gray-700'
                        }`}>
                          {isHarry ? '⚡ Harry Thật (Nợ Mạng)' : isRon ? '🐀 Ron Weasley' : isSpec ? '✨ Đặc Biệt' : '👤 Bản Sao / Thường'}
                        </span>
                      </div>
                    );
                  })}
                {gameState.players.filter(p => !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX' && gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`]).length === 0 && (
                  <p className="text-[11px] text-emerald-400/60 font-lora italic">
                    Chưa đánh hơi ai. Đêm nay hãy chọn 1 người phe Hội rồi bấm &quot;Thi Triển Đánh Hơi&quot;!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Battle Grid & Spell Arsenal (col-span-7) */}
        <div className={`space-y-6 lg:col-span-7 ${mobileTab === 'battle' ? 'block' : 'hidden lg:block'}`}>
          
          {/* ================= MOBILE EXCLUSIVE: PLAYER IDENTITY HERO CARD ================= */}
          {/* Luôn hiển thị trên màn hình mobile khi ở tab Tác Chiến để người chơi biết rõ mình là ai, phe nào, bùa chú gì */}
          <div 
            className="lg:hidden relative rounded-2xl border-2 overflow-hidden shadow-xl"
            style={{
              background: me.role?.faction === 'DEATH_EATERS'
                ? 'linear-gradient(135deg, #041f15 0%, #083323 50%, #03140e 100%)'
                : me.role?.faction === 'NEUTRAL'
                  ? 'linear-gradient(135deg, #1b0c26 0%, #291238 50%, #0e0514 100%)'
                  : 'linear-gradient(135deg, #2b170c 0%, #3e2212 50%, #1a0e07 100%)',
              borderColor: me.role?.faction === 'DEATH_EATERS'
                ? '#10b981'
                : me.role?.faction === 'NEUTRAL'
                  ? '#a855f7'
                  : '#bd8436',
            }}
          >
            <CardCornerFlourish className={`absolute top-2 left-2 w-4 h-4 pointer-events-none opacity-80 ${
              me.role?.faction === 'DEATH_EATERS' ? 'text-emerald-400' : 'text-[#bd8436]'
            }`} />
            <CardCornerFlourish className={`absolute top-2 right-2 w-4 h-4 pointer-events-none -scale-x-100 opacity-80 ${
              me.role?.faction === 'DEATH_EATERS' ? 'text-emerald-400' : 'text-[#bd8436]'
            }`} />

            <div className="p-3 sm:p-4">
              {/* Header Strip: Label + Status */}
              <div 
                className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2.5"
                style={{
                  borderColor: me.role?.faction === 'DEATH_EATERS' ? 'rgba(16,185,129,0.3)' : 'rgba(189,132,54,0.3)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className={me.role?.faction === 'DEATH_EATERS' ? 'text-emerald-400 animate-pulse' : 'text-[#ffd88f] animate-pulse'} />
                  <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${
                    me.role?.faction === 'DEATH_EATERS' ? 'text-emerald-300' : 'text-[#ffd88f]'
                  }`}>
                    Thẻ Danh Tính Của Bạn
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isDead ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-300 bg-red-950/90 px-1.5 py-0.5 rounded border border-red-700">
                      <Skull size={10} /> Tử Trận
                    </span>
                  ) : me.status === 'INJURED' ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-700">
                      <AlertTriangle size={10} /> Bị Thương
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">
                      <Activity size={10} /> Còn Sống
                    </span>
                  )}
                </div>
              </div>

              {/* Main Profile Info Row */}
              <div className="flex items-start gap-3">
                {/* Chocolate Frog Portrait Thumbnail (Tap to inspect) */}
                <div 
                  onClick={() => setInspectSelf(true)}
                  className={`relative w-14 h-18 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 bg-black cursor-pointer group shadow-lg transition-transform active:scale-95 ${
                    me.role?.faction === 'DEATH_EATERS'
                      ? 'border-emerald-400 ring-2 ring-emerald-500/40'
                      : 'border-[#ffd88f] ring-2 ring-amber-500/40'
                  }`}
                  title="Nhấn để xem thẻ bài 3D và điển tích"
                >
                  {me.role?.image ? (
                    <img 
                      src={me.role.image} 
                      alt={me.role.name}
                      className={`w-full h-full object-cover object-top transition-transform group-hover:scale-105 duration-300 ${
                        isDead ? 'grayscale contrast-125' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <BadgeIcon badge={me.role?.badge} className="w-7 h-7 text-amber-400" />
                    </div>
                  )}
                  {/* Subtle 3D Inspect hint on image */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[9px] font-mono text-white font-bold">
                    <Maximize2 size={14} />
                  </div>
                </div>

                {/* Identity Text Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#ebdcb0]/75">
                      Tài khoản: <strong className="text-white">{me.name}</strong>
                    </span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-title-magical font-black tracking-wide leading-tight mt-0.5 ${
                    me.role?.faction === 'DEATH_EATERS'
                      ? 'text-emerald-300'
                      : me.role?.faction === 'NEUTRAL'
                        ? 'text-purple-300'
                        : 'text-[#ffd88f]'
                  }`}>
                    {me.role?.name || 'Chưa nhận vai'}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] font-serif text-[#ebdcb0]/85 italic line-clamp-1">
                    {me.role?.title || me.role?.description}
                  </p>

                  {/* Faction Badge */}
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {me.role?.faction === 'DEATH_EATERS' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/70">
                        <DarkMarkCrest className="w-2.5 h-2.5" />
                        Tử Thần Thực Tử
                      </span>
                    ) : me.role?.faction === 'NEUTRAL' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/70">
                        <DeathlyHallowsSymbol className="w-2.5 h-2.5" />
                        Phe Trung Lập
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/70">
                        <PhoenixCrest className="w-2.5 h-2.5" />
                        Hội Phượng Hoàng
                      </span>
                    )}

                    <button
                      onClick={() => setInspectSelf(true)}
                      className="text-[9px] font-serif font-bold text-[#ffd88f] hover:text-white bg-[#140b05] px-2 py-0.5 rounded-full border border-[#7a5229] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <Maximize2 size={9} />
                      <span>Xem thẻ 3D</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Ability Box */}
              {me.role && (
                <div className="mt-2.5 p-2 rounded-xl bg-black/45 border border-[#7a5229]/50 text-xs font-lora">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-serif font-bold text-[#ffd88f] mb-0.5">
                    <Wand2 size={11} className={me.role?.faction === 'DEATH_EATERS' ? 'text-emerald-400' : 'text-amber-400'} />
                    <span>Quyền Năng: {me.role.name}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#ebdcb0]/90 leading-relaxed font-lora">
                    {me.role.ability || me.role.description}
                  </p>

                  {/* Phase cue for player with explicit faction turn notification */}
                  <div className="mt-2 pt-2 border-t border-[#7a5229]/50 flex flex-col gap-1 text-[9px] sm:text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap font-bold">
                      <span className="text-[#ebdcb0]/75 uppercase">LƯỢT HIỆN TẠI:</span>
                      {isDay ? (
                        <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60 inline-flex items-center gap-1">
                          ☀️ Ban Ngày: Toàn Bộ Phù Thủy (Cả 2 phe biểu quyết)
                        </span>
                      ) : (
                        <span className="text-cyan-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-600/60 inline-flex items-center gap-1">
                          🌙 Ban Đêm: Tử Thần Thực Tử Ám Sát &amp; Hội Phượng Hoàng Dùng Kỹ Năng
                        </span>
                      )}
                    </div>

                    <div>
                      {isDead ? (
                        <span className="text-red-400">Bạn đã tử trận (quan sát và thảo luận trên Mạng Floo).</span>
                      ) : isDay ? (
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          ✨ Đến lượt bạn: Toàn thể phù thủy cùng biểu quyết Tước Đũa Expelliarmus bên dưới!
                        </span>
                      ) : (
                        me.role?.faction === 'DEATH_EATERS' ? (
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            ⚡ Đến lượt bạn: Phe Tử Thần Thực Tử chọn mục tiêu Ám sát bên dưới!
                          </span>
                        ) : hasNightSkill ? (
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            ⚡ Đến lượt bạn: Thi triển kỹ năng đêm của nhân vật bên dưới!
                          </span>
                        ) : (
                          <span className="text-amber-200/80">
                            🛡️ Bạn có thể chọn 1 người để "Bay Hộ Tống" hoặc dùng Bảo Bối Tiệm Weasley!
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Death Eater Allies Quick Strip (Chỉ hiển thị cho Tử Thần Thực Tử) */}
              {me.role?.faction === 'DEATH_EATERS' && (
                <div className="mt-2 p-1.5 rounded-lg bg-[#02180e] border border-emerald-600/60 text-[10px]">
                  <div className="flex items-center gap-1 text-emerald-300 font-mono font-bold text-[9px] uppercase mb-1">
                    <DarkMarkCrest className="w-2.5 h-2.5" />
                    <span>Đồng Minh Cùng Hội ({gameState.players.filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id).length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gameState.players
                      .filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id)
                      .map((ally, idx) => (
                        <span
                          key={`mobile-ally-${ally.id || idx}`}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                            ally.status === 'DEAD'
                              ? 'bg-red-950/80 text-red-400 line-through border border-red-800'
                              : 'bg-emerald-950 text-emerald-200 border border-emerald-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${ally.status === 'DEAD' ? 'bg-red-500' : 'bg-emerald-400'}`} />
                          {ally.name} ({ally.role?.name})
                        </span>
                      ))}
                    {gameState.players.filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS' && p.id !== me.id).length === 0 && (
                      <span className="text-[9px] text-emerald-400/60 italic font-lora">
                        Bạn là Tử Thần Thực Tử duy nhất trận này!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Snape Special Network Quick Strip (Mobile) */}
              {me.role?.id === 'SEVERUS_SNAPE' && (
                <div className="mt-2 p-1.5 rounded-lg bg-[#14081c] border border-purple-600/60 text-[10px]">
                  <div className="flex items-center gap-1 text-purple-300 font-mono font-bold text-[9px] uppercase mb-1">
                    <FlaskConical className="w-2.5 h-2.5 text-purple-400" />
                    <span>Nhân Vật Đặc Biệt Cả Hai Phe ({gameState.players.filter(p => !p.isGM && p.id !== me.id && p.role && p.role.id !== 'HARRY_POTTER' && p.role.id !== 'VOLDEMORT' && p.role.id !== 'POTTER_FAKE').length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gameState.players
                      .filter(p => !p.isGM && p.id !== me.id && p.role && p.role.id !== 'HARRY_POTTER' && p.role.id !== 'VOLDEMORT' && p.role.id !== 'POTTER_FAKE')
                      .map((spec, idx) => (
                        <span
                          key={`mobile-snape-spec-${spec.id || idx}`}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                            spec.status === 'DEAD'
                              ? 'bg-red-950/80 text-red-400 line-through border border-red-800'
                              : 'bg-purple-950 text-purple-200 border border-purple-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${spec.status === 'DEAD' ? 'bg-red-500' : 'bg-purple-400'}`} />
                          {spec.name} (Đặc Biệt)
                        </span>
                      ))}
                    {gameState.players.filter(p => !p.isGM && p.id !== me.id && p.role && p.role.id !== 'HARRY_POTTER' && p.role.id !== 'VOLDEMORT' && p.role.id !== 'POTTER_FAKE').length === 0 && (
                      <span className="text-[9px] text-purple-400/60 italic font-lora">
                        Không có nhân vật đặc biệt nào khác!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pettigrew Inspected Quick Strip (Mobile) */}
              {me.role?.id === 'PETER_PETTIGREW' && (
                <div className="mt-2 p-1.5 rounded-lg bg-[#071911] border border-emerald-600/60 text-[10px]">
                  <div className="flex items-center gap-1 text-emerald-300 font-mono font-bold text-[9px] uppercase mb-1">
                    <Target className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Đã Đánh Hơi ({gameState.players.filter(p => !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX' && gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`]).length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gameState.players
                      .filter(p => !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX' && gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`])
                      .map((insp, idx) => {
                        const status = gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${insp.id}`];
                        const isHarry = status === 'HARRY_POTTER';
                        const isRon = status === 'RON_WEASLEY';
                        const isSpec = status === 'SPECIAL';
                        return (
                          <span
                            key={`mobile-pettigrew-insp-${insp.id || idx}`}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              isHarry
                                ? 'bg-rose-950 text-rose-200 border border-rose-600 font-bold'
                                : isRon
                                  ? 'bg-orange-950 text-orange-200 border border-orange-600 font-bold'
                                  : isSpec
                                    ? 'bg-amber-950 text-amber-200 border border-amber-600'
                                    : 'bg-gray-900 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {insp.name}: {isHarry ? '⚡ Harry Thật' : isRon ? '🐀 Ron' : isSpec ? '✨ Đặc Biệt' : 'Bản Sao'}
                          </span>
                        );
                      })}
                    {gameState.players.filter(p => !p.isGM && p.role?.faction === 'ORDER_OF_PHOENIX' && gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`]).length === 0 && (
                      <span className="text-[9px] text-emerald-400/60 italic font-lora">
                        Chưa đánh hơi ai đêm nay!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          


          {/* 1. Spell Arsenal: Action Console - Bàn Thi Triển Ma Pháp & Biểu Quyết */}
          <div className="relative rounded-2xl hpvn-panel p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#7a5229] pb-3 mb-4 gap-2">
              <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2 tracking-wide">
                <Wand2 size={18} className="text-[#bd8436]" />
                Bàn Thi Triển Ma Pháp & Biểu Quyết
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                {effectiveTargetPlayer ? (
                  <span className="text-xs font-mono font-bold text-[#ffd88f] bg-[#3a2213] px-3 py-1 rounded-full border border-[#ffd88f] flex items-center gap-1.5 shadow-sm">
                    <Crosshair size={13} className="text-[#bd8436]" />
                    Đang chọn: {effectiveTargetPlayer.name}
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#ebdcb0]/70 italic bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                    Chưa chọn mục tiêu ở danh sách bên dưới
                  </span>
                )}
              </div>
            </div>

            {/* Persistent Confirmed Vote Box */}
            {myAction && (
              <div className="p-4 rounded-xl border-2 border-emerald-500/70 bg-gradient-to-r from-[#0c2a1a] to-[#121c16] mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-300">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                        PHIẾU BẦU ĐÃ ĐƯỢC LƯU VÀO MÁY CHỦ
                      </span>
                      <p className="font-serif text-sm sm:text-base text-[#f5eedb] font-bold">
                        {myAction.targetId === 'NONE' ? (
                          <span className="text-emerald-300 font-extrabold text-base">
                            🚫 Án Binh Bất Động (Không Ám Sát Đêm Nay)
                          </span>
                        ) : (
                          <>
                            {isVoteAction(myAction.actionName) ? 'Biểu quyết Tước Đũa' : `Hành động: ${myAction.actionName}`}:{' '}
                            <span className="text-[#ffd88f] underline decoration-[#bd8436] font-extrabold text-base">
                              {myVotedTarget?.name || 'Mục tiêu'}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="self-start sm:self-center">
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-700/80">
                      ✓ Đã chốt phiếu (có thể đổi)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isDead ? (
              <div className="p-8 text-center bg-[#120803]/80 rounded-xl border border-[#5a3a1f]">
                <Skull className="w-10 h-10 mx-auto text-red-500/60 mb-2 animate-pulse" />
                <p className="font-lora text-sm text-red-200">
                  Bạn đã tử trận trong trận không chiến trên bầu trời Privet Drive.
                </p>
                <p className="text-xs text-[#ebdcb0]/60 mt-1 font-mono">
                  Bạn có thể tiếp tục quan sát và đàm đạo trên Mạng Floo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isDay ? (
                  /* Day Phase Actions: Vote Tước Đũa & Moody Avada */
                  <div className="flex flex-wrap gap-3">
                    {me.role?.id === 'ALASTOR_MOODY' && (
                      <button
                        onClick={() => {
                          if (effectiveTargetId) {
                            const res = executeInstantSkill('Bắn Lén', effectiveTargetId);
                            setToastMessage(res || 'Đã thi triển Bắn Lén!');
                            setTimeout(() => setToastMessage(null), 4000);
                          }
                        }}
                        disabled={!effectiveTargetId || isDead}
                        className="flex-1 py-3 px-4 rounded-xl hpvn-btn-phoenix flex items-center justify-between sm:justify-start gap-3 shadow-lg disabled:opacity-40"
                      >
                        <div className="p-2 rounded-lg bg-black/40 border border-red-400/40 text-red-300 shrink-0">
                          <Skull size={20} />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                            Bắn Lén (Avada Kedavra)
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                            Thần Sáng kết liễu bí mật 1 mục tiêu khả nghi ngay ban ngày
                          </span>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (effectiveTargetId) {
                          playerAction('biểu quyết tước đũa', effectiveTargetId);
                          setSelectedTarget(effectiveTargetId);
                          const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                          setToastMessage(`✓ Đã lưu phiếu biểu quyết Tước Đũa cho: ${tName}!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }
                      }}
                      disabled={!effectiveTargetId || isDead}
                      className="flex-1 py-3 px-4 rounded-xl hpvn-btn-phoenix flex items-center justify-between sm:justify-start gap-3 shadow-lg disabled:opacity-40"
                    >
                      <div className="p-2 rounded-lg bg-black/40 border border-amber-400/40 text-[#ffd88f] shrink-0">
                        <Crosshair size={20} />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                          {myAction?.targetId === effectiveTargetId
                            ? `✓ Đã Lưu Phiếu Tước Đũa (${effectiveTargetPlayer?.name})`
                            : myAction
                              ? `🔄 Đổi Phiếu Sang: ${effectiveTargetPlayer?.name}`
                              : `Biểu Quyết Tước Đũa ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                          Bỏ phiếu trục xuất kẻ tình nghi ra khỏi trận không chiến
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  // Night Phase Actions: Role-specific abilities & kills
                  (() => {
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

                // Check skill cooldowns
                const hermioneUsed = Boolean(gameState.skillStates[`${me.id}_HERMIONE_R${gameState.round}`]);
                const pettigrewUsed = Boolean(gameState.skillStates[`${me.id}_PETTIGREW_R${gameState.round}`]);
                const fenrirUsed = Boolean(gameState.skillStates[`${me.id}_FENRIR`] || gameState.skillStates[`${me.id}_FENRIR_BITE`]);
                const arthurUsed = Boolean(gameState.skillStates[`${me.id}_ARTHUR_R${gameState.round}`]);
                const fredUsed = Boolean(gameState.skillStates[`${me.id}_FRED_R${gameState.round}`]);
                const georgeUsed = Boolean(gameState.skillStates[`${me.id}_GEORGE_R${gameState.round}`] || gameState.skillStates[`${me.id}_GEORGE_R${gameState.round - 1}`]);
                const billUsed = Boolean(gameState.skillStates[`${me.id}_BILL_R${gameState.round}`]);
                const fleurUsed = Boolean(gameState.skillStates[`${me.id}_FLEUR_R${gameState.round}`]);
                const luciusUsed = Boolean(gameState.skillStates[`${me.id}_LUCIUS_R${gameState.round}`]);
                const potterFakeUsed = Boolean(gameState.skillStates[`${me.id}_POTTERFAKE_ULTIMATE`]);

                // Determine if current skill is on cooldown
                const isSkillOnCooldown = 
                  (skillName === 'Soi Danh Tính' && hermioneUsed) ||
                  ((skillName === 'Đánh Hơi' || skillName === 'Soi Đặc Biệt') && pettigrewUsed) ||
                  (skillName === 'Cắn' && fenrirUsed) ||
                  (skillName === 'Soi Phe' && arthurUsed) ||
                  (skillName === 'Tặng Kẹo' && fredUsed) ||
                  (skillName === 'Rải Bột' && georgeUsed) ||
                  (skillName === 'Giải Phong Ấn' && billUsed) ||
                  (skillName === 'Chém Kiếm' && fleurUsed) ||
                  (skillName === 'Soi Vai Trò' && luciusUsed) ||
                  (skillName === 'Silenced Ultimate' && potterFakeUsed);

                const isGeorge = skillName === 'Rải Bột';

                return (
                  <div className="space-y-3">
                    {Boolean(gameState.skillStates[`${me.id}_SECTUMSEMPRA_SILENCED_R${gameState.round}`]) && (
                      <div className="p-3 bg-red-950/90 border border-red-700 rounded-xl text-xs text-red-200 font-serif flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400 shrink-0" />
                        <span><strong>Bùa Lạc Sectumsempra:</strong> Bạn đã bị trúng bùa lạc trong đêm tối (mất một bên tai như George Weasley)! Bạn bị phong ấn kỹ năng trong vòng này!</span>
                      </div>
                    )}

                    {Boolean(gameState.skillStates[`${me.id}_VOTE_SILENCED_R${gameState.round}`]) && (
                      <div className="p-3 bg-amber-950/90 border border-amber-600 rounded-xl text-xs text-amber-200 font-serif flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        <span><strong>Hóa Thú Đào Tẩu:</strong> Bạn đang lẩn trốn dưới hình dạng chuột cống Scabbers (mất một ngón tay)! Bạn bị cấm bỏ phiếu ban ngày vòng này!</span>
                      </div>
                    )}

                    {me.role?.faction === 'DEATH_EATERS' && isSilenced && (
                      <div className="p-3 bg-red-950/90 border border-red-700 rounded-xl text-xs text-red-200 font-serif flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400 shrink-0" />
                        <span><strong>Lời Nguyền Lucius Malfoy:</strong> Đòn ám sát của Tử Thần Thực Tử bị phong ấn ma pháp đêm nay!</span>
                      </div>
                    )}

                    {me.role?.faction === 'DEATH_EATERS' && isDoubleKill && (
                      <div className="p-3 bg-emerald-950/90 border border-emerald-600 rounded-xl text-xs text-emerald-200 font-serif flex items-center gap-2">
                        <Flame size={16} className="text-emerald-400 shrink-0" />
                        <span><strong>Cơn Thịnh Nộ Bellatrix:</strong> Tử Thần Thực Tử được quyền ám sát tới 2 mục tiêu đêm nay! Hãy phối hợp bỏ phiếu các mục tiêu khác nhau.</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {skillName && (
                        <button
                          onClick={() => {
                            const targetId = isGeorge ? (effectiveTargetId || me.id) : effectiveTargetId;
                            if (targetId && !isSkillOnCooldown) {
                              const res = executeInstantSkill(skillName!, targetId);
                              setToastMessage(res || 'Đã thi triển');
                              setTimeout(() => setToastMessage(null), 5000);
                            }
                          }}
                          disabled={(!isGeorge && !effectiveTargetId) || isDead || isSkillOnCooldown}
                          className={`flex-1 py-3 px-4 rounded-xl hpvn-btn-gold flex items-center justify-between sm:justify-start gap-3 shadow-lg ${isSkillOnCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSkillOnCooldown ? 'Đã dùng kỹ năng này trong lượt này!' : ''}
                        >
                          <div className="p-2 rounded-lg bg-black/40 border border-amber-400/40 text-[#ffd88f] shrink-0">
                            <Wand2 size={20} />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                              {isSkillOnCooldown 
                                ? (skillName === 'Rải Bột' && Boolean(gameState.skillStates[`${me.id}_GEORGE_R${gameState.round - 1}`]) 
                                    ? 'Đang Nghỉ 1 Đêm (Cooldown)' 
                                    : `Đã Dùng: ${skillName}`)
                                : `Thi Triển ${skillName}`}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                              {skillName === 'Soi Danh Tính'
                                ? 'Soi biết chính xác thẻ bài thật của người này'
                                : skillName === 'Đánh Hơi' || skillName === 'Soi Đặc Biệt'
                                  ? 'Đánh hơi nhận diện đích danh Harry/Ron hoặc nhân vật đặc biệt'
                                  : skillName === 'Soi Phe'
                                    ? 'Kiểm tra phe Hội Phượng Hoàng, Tử Thần Thực Tử hay Trung Lập'
                                    : skillName === 'Soi Vai Trò'
                                      ? 'Bí mật soi biết vai trò cụ thể của người này'
                                      : skillName === 'Tặng Kẹo'
                                        ? 'Tặng Kẹo Ngất Xỉu tước quyền vote ban ngày tiếp theo của mục tiêu'
                                        : skillName === 'Rải Bột'
                                          ? 'Rải Bột Khói Mù Peru khiến toàn bộ TTTT mất quyền ám sát đêm nay'
                                          : skillName === 'Giải Phong Ấn'
                                            ? 'Giải bùa câm lặng khôi phục kỹ năng cho đồng đội bị phong ấn'
                                            : skillName === 'Chém Kiếm'
                                              ? 'Dùng Kiếm Gryffindor chém chết ngay 4T (chém nhầm đồng minh sẽ tự sát)'
                                              : skillName === 'Silenced Ultimate'
                                                ? 'Reveal Potter Fake và phong ấn kỹ năng của 1 TTTT ở vòng sau'
                                                : skillName === 'Cắn'
                                                  ? 'Cắn 1 người chuyển sang phe Tử Thần Thực Tử (1 lần duy nhất)'
                                                  : 'Thi triển quyền năng ma pháp'}
                            </span>
                          </div>
                        </button>
                      )}

                      {me.role?.faction === 'DEATH_EATERS' && (
                        <>
                          <button
                            onClick={() => {
                              if (effectiveTargetId) {
                                if (me.role?.id === 'PETER_PETTIGREW' && effectiveTargetPlayer?.role?.id === 'HARRY_POTTER') {
                                  setToastMessage('⚠️ BÀN TAY BẠC PHẢN PHỆ! Do Món Nợ Sinh Mệnh với Harry Potter ở Lều Hét, bàn tay của bạn bị co giật và không thể giương đũa ám sát Kẻ Được Chọn! Hãy để Voldemort hoặc đồng minh ra tay!');
                                  setTimeout(() => setToastMessage(null), 5000);
                                  return;
                                }
                                playerAction('giết', effectiveTargetId);
                                setSelectedTarget(effectiveTargetId);
                                const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                                setToastMessage(`✓ Đã lưu mục tiêu Ám Sát: ${tName}!`);
                                setTimeout(() => setToastMessage(null), 3500);
                              }
                            }}
                            disabled={!effectiveTargetId || isDead || isSilenced}
                            className="flex-1 py-3 px-4 rounded-xl hpvn-btn-floo flex items-center justify-between sm:justify-start gap-3 shadow-lg disabled:opacity-40"
                          >
                            <div className="p-2 rounded-lg bg-black/40 border border-emerald-400/40 text-emerald-300 shrink-0">
                              <Skull size={20} />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-emerald-200 truncate">
                                {isSilenced
                                  ? 'Bị phong ấn (Không thể ám sát)'
                                  : myAction?.targetId === effectiveTargetId && isKillAction(myAction?.actionName || '')
                                    ? `✓ Đã Lưu Mục Tiêu Ám Sát (${effectiveTargetPlayer?.name})`
                                    : isKillAction(myAction?.actionName || '') && myAction?.targetId !== 'NONE'
                                      ? `🔄 Đổi Mục Tiêu Ám Sát Sang: ${effectiveTargetPlayer?.name}`
                                      : `Ám Sát (Avada Kedavra) ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-lora text-emerald-200/80 font-normal truncate">
                                Chỉ định mục tiêu để phe Tử Thần Thực Tử hạ sát đêm nay
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              playerAction('giết', 'NONE');
                              setSelectedTarget(null);
                              setToastMessage('✓ Đã chọn: Không ám sát ai đêm nay! (Án binh bất động)');
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            disabled={isDead || isSilenced}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-between sm:justify-start gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
                              myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '')
                                ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-2 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40'
                                : 'bg-gradient-to-r from-slate-900/90 via-zinc-900 to-black hover:border-zinc-500 border-2 border-zinc-700/80 text-zinc-300'
                            }`}
                          >
                            <div className={`p-2 rounded-lg bg-black/40 border shrink-0 ${
                              myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '')
                                ? 'border-emerald-400 text-emerald-300'
                                : 'border-zinc-600 text-zinc-400'
                            }`}>
                              <Ban size={20} />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-zinc-200 truncate">
                                {myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '')
                                  ? '✓ Đang Chọn: Không Giết Ai Cả'
                                  : 'Không Giết Ai Cả (Án Binh)'}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-lora text-zinc-400 font-normal truncate">
                                Ẩn mình quan sát, không ra tay ám sát ai trong đêm nay
                              </span>
                            </div>
                          </button>
                        </>
                      )}

                      {me.role?.id === 'ALBUS_DUMBLEDORE' && (
                        <button
                          onClick={() => {
                            if (!effectiveTargetId) return;

                            // FIX: Check BEFORE sending action
                            const prevShieldedId = gameState.skillStates[`DUMBLEDORE_SHIELDED_R${gameState.round - 1}`];
                            if (prevShieldedId && prevShieldedId === effectiveTargetId) {
                              setToastMessage('⚠️ Dumbledore không được bảo vệ cùng 1 người 2 lượt liên tiếp!');
                              setTimeout(() => setToastMessage(null), 4000);
                              return; // Exit early - action NOT sent
                            }

                            playerAction('bảo vệ', effectiveTargetId);
                            setSelectedTarget(effectiveTargetId);
                            const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                            setToastMessage(`✓ Đã lưu khiên Bảo Vệ cho: ${tName}!`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          disabled={!effectiveTargetId || isDead}
                          className="flex-1 py-3 px-4 rounded-xl hpvn-btn-gold flex items-center justify-between sm:justify-start gap-3 shadow-lg disabled:opacity-40"
                        >
                          <div className="p-2 rounded-lg bg-black/40 border border-amber-400/40 text-[#ffd88f] shrink-0">
                            <Shield size={20} />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                              {myAction?.targetId === effectiveTargetId && isProtectAction(myAction?.actionName || '')
                                ? `✓ Đã Lưu Khiên Bảo Vệ (${effectiveTargetPlayer?.name})`
                                : isProtectAction(myAction?.actionName || '')
                                  ? `🔄 Đổi Bảo Vệ Sang: ${effectiveTargetPlayer?.name}`
                                  : `Phù Phép Bảo Vệ (Protego) ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                              Dựng kết giới cứu sống mục tiêu nếu phe ác tấn công đêm nay
                            </span>
                          </div>
                        </button>
                      )}

                      {me.role?.id === 'SEVERUS_SNAPE' && (
                        <button
                          onClick={() => {
                            if (!effectiveTargetId) return;

                            if (effectiveTargetId === me.id) {
                              setToastMessage('⚠️ Snape không thể tự bọc lót cho chính mình! Hãy chọn 1 người chơi khác.');
                              setTimeout(() => setToastMessage(null), 3500);
                              return;
                            }

                            playerAction('bọc lót sectumsempra', effectiveTargetId);
                            setSelectedTarget(effectiveTargetId);
                            const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                            setToastMessage(`✓ Đã giương đũa niệm Sectumsempra bọc lót cho: ${tName}!`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          disabled={!effectiveTargetId || isDead || effectiveTargetId === me.id}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/90 via-[#2a0e3f] to-purple-950 hover:from-purple-800 hover:to-purple-900 border-2 border-purple-400/90 flex items-center justify-between sm:justify-start gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                        >
                          <div className="p-2 rounded-lg bg-black/40 border border-purple-400/50 text-purple-300 shrink-0">
                            <Sparkles size={20} className="text-purple-300 animate-pulse" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-purple-200 truncate">
                              {myAction?.targetId === effectiveTargetId && (myAction?.actionName || '').toLowerCase().includes('sectumsempra')
                                ? `✓ Đang Bọc Lót Sectumsempra (${effectiveTargetPlayer?.name})`
                                : (myAction?.actionName || '').toLowerCase().includes('sectumsempra')
                                  ? `🔄 Đổi Bọc Lót Sang: ${effectiveTargetPlayer?.name}`
                                  : `Bọc Lót Sectumsempra ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-lora text-purple-200/80 font-normal truncate">
                              Bị TTTT tấn công: Cứu sống! Không bị tấn công: Bùa lạc phong ấn kỹ năng vòng sau!
                            </span>
                          </div>
                        </button>
                      )}

                      {me.role?.id === 'KINGSLEY_SHACKLEBOLT' && (
                        <button
                          onClick={() => {
                            playerAction('chỉ huy ứng cứu', 'ALL');
                            setToastMessage('✓ Đã chỉ huy toàn quân sẵn sàng ứng cứu đêm nay (100% cứu sống 1 thành viên Hội bị ám sát).');
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          disabled={isDead}
                          className="flex-1 py-3 px-4 rounded-xl hpvn-btn-gold flex items-center justify-between sm:justify-start gap-3 shadow-lg disabled:opacity-40"
                        >
                          <div className="p-2 rounded-lg bg-black/40 border border-amber-400/40 text-[#ffd88f] shrink-0">
                            <Shield size={20} />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                              {isKingsleyAction(myAction?.actionName || '')
                                ? '✓ Đã Kích Hoạt Ứng Cứu Đêm Nay'
                                : 'Chỉ Huy Ứng Cứu (100%)'}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                              Sẵn sàng thế trận: 100% cứu sống 1 thành viên Hội bị ám sát trong đêm
                            </span>
                          </div>
                        </button>
                      )}

                      {me.role?.id === 'REMUS_LUPIN' && (
                        <button
                          onClick={() => {
                            if (!effectiveTargetId) return;
                            const target = gameState.players.find(p => p.id === effectiveTargetId);
                            if (target && target.status !== 'DEAD') {
                              setToastMessage('⚠️ Thuốc Hồi Sinh chỉ có thể dùng cho đồng đội đã ngã xuống!');
                              setTimeout(() => setToastMessage(null), 3500);
                              return;
                            }
                            if (gameState.skillStates[`${me.id}_LUPIN`]) {
                              setToastMessage('⚠️ Bạn đã dùng hết Thuốc Hồi Sinh quý giá trong trận này!');
                              setTimeout(() => setToastMessage(null), 3500);
                              return;
                            }

                            playerAction('hồi sinh', effectiveTargetId);
                            setSelectedTarget(effectiveTargetId);
                            const tName = target?.name;
                            setToastMessage(`✓ Đã lưu lựa chọn Hồi Sinh cho: ${tName}! Rạng sáng mai họ sẽ sống lại.`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          disabled={!effectiveTargetId || isDead || Boolean(gameState.skillStates[`${me.id}_LUPIN`])}
                          className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800/90 via-[#0d3822] to-teal-950 hover:from-emerald-700 hover:to-teal-900 border-2 border-emerald-400/90 flex items-center justify-between sm:justify-start gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
                            Boolean(gameState.skillStates[`${me.id}_LUPIN`]) ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-black/40 border border-emerald-400/50 text-emerald-300 shrink-0">
                            <Sparkles size={20} className="text-emerald-300 animate-pulse" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-emerald-200 truncate">
                              {Boolean(gameState.skillStates[`${me.id}_LUPIN`])
                                ? 'Đã Hết Thuốc Hồi Sinh (1 Lần)'
                                : myAction?.targetId === effectiveTargetId && isReviveAction(myAction?.actionName || '')
                                  ? `✓ Đã Chọn Hồi Sinh (${effectiveTargetPlayer?.name})`
                                  : isReviveAction(myAction?.actionName || '')
                                    ? `🔄 Đổi Hồi Sinh Sang: ${effectiveTargetPlayer?.name}`
                                    : `Dùng Thuốc Hồi Sinh ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-lora text-emerald-200/80 font-normal truncate">
                              {Boolean(gameState.skillStates[`${me.id}_LUPIN`])
                                ? 'Đã sử dụng độc dược hồi sinh duy nhất'
                                : 'Hồi sinh bí mật trong đêm, công bố rạng sáng'}
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Universal Night Action: Bay Hộ Tống (Chắn Gió) for ALL Players */}
                      <button
                        onClick={() => {
                          if (effectiveTargetId) {
                            if (effectiveTargetId === me.id) {
                              setToastMessage('⚠️ Bạn không thể tự bay hộ tống chính mình! Hãy chọn đồng đội.');
                              setTimeout(() => setToastMessage(null), 3500);
                              return;
                            }
                            playerAction('bay hộ tống', effectiveTargetId);
                            setSelectedTarget(effectiveTargetId);
                            const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                            setToastMessage(`✓ Đã xác nhận Bay Hộ Tống sát cánh cùng: ${tName}!`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }
                        }}
                        disabled={!effectiveTargetId || isDead || effectiveTargetId === me.id}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700/90 via-amber-800 to-amber-950 hover:from-amber-600 hover:to-amber-800 border-2 border-amber-400/90 flex items-center justify-between sm:justify-start gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-black/40 border border-amber-400/40 text-amber-300 shrink-0">
                          <Shield size={20} />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-[#ffd88f] truncate">
                            {myAction?.targetId === effectiveTargetId && isEscortAction(myAction?.actionName || '')
                              ? `✓ Đang Bay Hộ Tống (${effectiveTargetPlayer?.name})`
                              : isEscortAction(myAction?.actionName || '')
                                ? `🔄 Đổi Hộ Tống Sang: ${effectiveTargetPlayer?.name}`
                                : `Bay Hộ Tống ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-lora text-amber-200/80 font-normal truncate">
                            Liệng chổi bay cùng để chia sẻ rủi ro, né đòn hoặc che chắn thay đồng đội
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Weasleys' Joke Shop In-Hand Arsenal (Instant Night Use) */}
                    <div className="pt-3 mt-3 border-t border-[#7a5229]/50">
                      <span className="text-[10px] font-mono font-bold text-[#ffd88f] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        Bảo Bối Tiệm Phù Thủy Weasley (Dùng Trong Đêm):
                      </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(gameState.weasleyItems || []).map(item => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (item.count <= 0) {
                                    setToastMessage(`⚠️ [${item.name}] đã hết lượt sử dụng!`);
                                    setTimeout(() => setToastMessage(null), 3000);
                                    return;
                                  }
                                  if (item.id === 'FAINTING_FANCIES' && !effectiveTargetId) {
                                    setToastMessage(`⚠️ Vui lòng chọn 1 mục tiêu trên bầu trời để cho ăn Kẹo Ngất Xỉu!`);
                                    setTimeout(() => setToastMessage(null), 3500);
                                    return;
                                  }
                                  const res = consumeWeasleyItem(item.id, effectiveTargetId || undefined);
                                  setToastMessage(res || `✓ Đã kích hoạt [${item.name}] thành công!`);
                                  setTimeout(() => setToastMessage(null), 4000);
                                }}
                                disabled={isDead || item.count <= 0}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                  item.count > 0 
                                    ? 'bg-[#211107]/90 hover:bg-[#331a0b] border-[#bd8436] text-[#ffd88f] active:scale-95 cursor-pointer shadow-md' 
                                    : 'bg-black/40 border-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-serif font-bold truncate">{item.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-[#7a5229]/60 font-bold">{item.count}/{item.maxCount}</span>
                                </div>
                                <span className="text-[10px] text-[#ebdcb0]/70 font-lora line-clamp-1 mt-1">{item.description}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Toast Message Notification */}
                {toastMessage && (
                  <motion.div 
                    key="player-screen-toast-notification"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`p-3.5 border rounded-xl text-center font-lora text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg ${
                      toastMessage.startsWith('⚠️')
                        ? 'bg-gradient-to-r from-[#3d1800] via-[#522200] to-[#3d1800] border-amber-500/80 text-amber-200'
                        : 'bg-gradient-to-r from-[#044e36] via-[#057a55] to-[#044e36] border-emerald-400 text-emerald-100'
                    }`}
                  >
                    {toastMessage.startsWith('⚠️') ? (
                      <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle size={16} className="text-emerald-300 shrink-0" />
                    )}
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* 2. Skies of Privet Drive: Target Selection Grid - Danh Sách Mục Tiêu */}
          <div className="relative rounded-2xl hpvn-panel-gold p-5 overflow-hidden">
            <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none" />
            <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#7a5229] pb-3 mb-4 gap-2">
              <div>
                <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2 tracking-wide">
                  <Crosshair size={18} className="text-[#bd8436]" />
                  Mục Tiêu Trên Bầu Trời (Chọn 1 người)
                </h3>
                <p className="text-xs text-[#ebdcb0] font-lora">
                  {isDay ? 'Chọn đối tượng để biểu quyết Tước Đũa (Expelliarmus)' : 'Chọn mục tiêu để áp dụng kỹ năng ban đêm / ám sát / bay hộ tống'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {myAction && (
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/80 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    Đã lưu: {myAction.targetId === 'NONE' ? 'Án Binh (Không Giết)' : (myVotedTarget?.name || 'Mục tiêu')}
                  </span>
                )}
                {selectedTarget && selectedTarget !== myAction?.targetId && (
                  <span className="text-xs font-mono font-bold text-[#ffd88f] bg-[#3a2213] px-3 py-1 rounded-full border border-[#ffd88f] flex items-center gap-1.5">
                    <Crosshair size={13} className="text-[#bd8436]" />
                    Đang chọn: {effectiveTargetPlayer?.name}
                  </span>
                )}
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {gameState.players.filter(p => !p.isGM && p.id !== me.id).map((p, index) => {
                const isSelected = effectiveTargetId === p.id;
                const isMyVote = myAction?.targetId === p.id;
                const isPDead = p.status === 'DEAD';
                const isPInjured = p.status === 'INJURED';
                const isFellowDeathEater = me.role?.faction === 'DEATH_EATERS' && p.role?.faction === 'DEATH_EATERS';
                const isSpecialForSnape = me.role?.id === 'SEVERUS_SNAPE' && 
                  p.role && 
                  p.role.id !== 'HARRY_POTTER' && 
                  p.role.id !== 'VOLDEMORT' && 
                  p.role.id !== 'POTTER_FAKE';
                const pettigrewInspectStatus = me.role?.id === 'PETER_PETTIGREW'
                  ? gameState.skillStates[`${me.id}_PETTIGREW_INSPECTED_${p.id}`]
                  : null;
                const canSelectDead = isNight && me.role?.id === 'REMUS_LUPIN';
                const disabled = isPDead && !canSelectDead;
                const voteCount = isDay ? (voteCountsByTarget[p.id] || 0) : 0;
                const killCount = isNight && me.role?.faction === 'DEATH_EATERS' ? (killCountsByTarget[p.id] || 0) : 0;

                return (
                  <button
                    key={p.id ? `target-candidate-${p.id}` : `target-candidate-${index}`}
                    onClick={() => !disabled && setSelectedTarget(p.id)}
                    disabled={disabled}
                    className={`relative p-3.5 rounded-xl text-left border-2 transition-all flex items-center justify-between select-none ${
                      disabled 
                        ? isFellowDeathEater
                          ? 'bg-[#041c12]/50 border-emerald-950/60 opacity-40 cursor-not-allowed grayscale-[40%]'
                          : 'bg-[#120803]/50 border-[#3a2213] opacity-40 cursor-not-allowed grayscale' 
                        : isMyVote
                          ? 'bg-[#1b3d2b] border-emerald-400 ring-1 ring-emerald-400'
                          : isSelected 
                            ? isFellowDeathEater
                              ? 'bg-[#0a3825] border-emerald-300 ring-2 ring-emerald-400'
                              : 'bg-[#462c14] border-[#ffd88f] ring-1 ring-[#ffd88f]' 
                            : isFellowDeathEater
                              ? 'bg-gradient-to-r from-[#052418] via-[#083623] to-[#052418] border-emerald-500/90 hover:border-emerald-400 hover:bg-[#0c442c]'
                              : 'bg-[#1a0e07] border-[#5a3a1f] hover:border-[#7a5229] hover:bg-[#26150c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg border ${
                        isMyVote
                          ? 'bg-emerald-900 text-emerald-300 border-emerald-500'
                          : isSelected 
                            ? isFellowDeathEater
                              ? 'bg-emerald-800 text-emerald-200 border-emerald-300'
                              : 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ebdcb0]' 
                            : isPDead 
                              ? 'bg-[#2a0303] text-red-400 border-red-900' 
                              : isFellowDeathEater
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                                : isPInjured
                                  ? 'bg-[#3d2406] text-amber-300 border-amber-600'
                                  : 'bg-[#120803] text-[#ebdcb0] border-[#5a3a1f]'
                      }`}>
                        {isMyVote ? (
                          <CheckCircle size={14} />
                        ) : isFellowDeathEater ? (
                          <DarkMarkCrest className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isSpecialForSnape ? (
                          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                        ) : pettigrewInspectStatus === 'SPECIAL' ? (
                          <Target className="w-3.5 h-3.5 text-amber-400" />
                        ) : pettigrewInspectStatus === 'NORMAL' ? (
                          <Target className="w-3.5 h-3.5 text-gray-500" />
                        ) : isPDead ? (
                          <Skull size={14} />
                        ) : (
                          <Wand2 size={14} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-serif font-bold text-sm block truncate ${
                            isPDead 
                              ? 'line-through text-[#7a5229]' 
                              : isFellowDeathEater
                                ? 'text-emerald-300'
                                : 'text-[#f5eedb]'
                          }`}>
                            {p.name}
                          </span>
                          {isMyVote && (
                            <span className="text-[9px] font-mono font-black text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600 uppercase">
                              Phiếu bạn
                            </span>
                          )}
                          {isFellowDeathEater && (
                            <span className="text-[9px] font-mono font-black text-emerald-200 bg-emerald-950/95 px-2 py-0.5 rounded border border-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                              <DarkMarkCrest className="w-2.5 h-2.5 text-emerald-300" />
                              Đồng Minh: {p.role?.name} {p.role?.id === 'VOLDEMORT' ? '👑' : ''}
                            </span>
                          )}
                          {isSpecialForSnape && (
                            <span className="text-[9px] font-mono font-bold text-purple-200 bg-purple-950/95 px-2 py-0.5 rounded border border-purple-500/70 flex items-center gap-1">
                              <FlaskConical className="w-2.5 h-2.5 text-purple-400" />
                              Nhân Vật Đặc Biệt (Ẩn Phe)
                            </span>
                          )}
                          {pettigrewInspectStatus === 'HARRY_POTTER' && (
                            <span className="text-[9px] font-mono font-black text-rose-300 bg-rose-950/95 px-2 py-0.5 rounded border border-rose-500/70 flex items-center gap-1 animate-pulse">
                              <Target className="w-2.5 h-2.5 text-rose-400" />
                              ⚡ Đích Danh: Harry Potter Thật! (Nợ Mạng ⚠️)
                            </span>
                          )}
                          {pettigrewInspectStatus === 'RON_WEASLEY' && (
                            <span className="text-[9px] font-mono font-bold text-orange-300 bg-orange-950/95 px-2 py-0.5 rounded border border-orange-500/70 flex items-center gap-1">
                              <Target className="w-2.5 h-2.5 text-orange-400" />
                              🐀 Đích Danh: Ron Weasley (Cậu chủ cũ)
                            </span>
                          )}
                          {pettigrewInspectStatus === 'SPECIAL' && (
                            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/95 px-2 py-0.5 rounded border border-amber-500/70 flex items-center gap-1">
                              <Target className="w-2.5 h-2.5 text-amber-400" />
                              Đánh Hơi: Nhân Vật Đặc Biệt ✨
                            </span>
                          )}
                          {pettigrewInspectStatus === 'NORMAL' && (
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-900/95 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                              <Target className="w-2.5 h-2.5 text-gray-500" />
                              Đánh Hơi: Bản Sao / Thường Dân
                            </span>
                          )}
                          {isPInjured && (
                            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600 uppercase">
                              Bị thương
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-mono ${
                            isPDead 
                              ? 'text-[#ebdcb0]/50' 
                              : isFellowDeathEater
                                ? 'text-emerald-400 font-bold'
                                : isPInjured 
                                  ? 'text-amber-400 font-bold' 
                                  : 'text-[#ebdcb0]/60'
                          }`}>
                            {isPDead 
                              ? (isFellowDeathEater ? '💀 Đồng minh đã tử trận' : 'Đã tử trận')
                              : isFellowDeathEater
                                ? '🐍 Đồng minh Tử Thần Thực Tử'
                                : isPInjured 
                                  ? '⚠️ Đang bị thương nặng' 
                                  : 'Mục tiêu khả dĩ'}
                          </span>
                          {voteCount > 0 && (
                            <span className="text-[10px] font-mono font-bold text-[#ffd88f] bg-[#3a2213] px-1.5 rounded border border-[#bd8436]">
                              🗳️ {voteCount} phiếu
                            </span>
                          )}
                          {killCount > 0 && (
                            <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950 px-1.5 rounded border border-red-800">
                              🗡️ {killCount} phiếu
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-2 flex-shrink-0">
                      {isMyVote ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : isSelected ? (
                        <Crosshair size={18} className={isFellowDeathEater ? "text-emerald-300 animate-spin-slow" : "text-[#ffd88f] animate-spin-slow"} />
                      ) : isFellowDeathEater ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#5a3a1f] block" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Caution banner when a fellow Death Eater is selected */}
            {effectiveTargetPlayer?.role?.faction === 'DEATH_EATERS' && me.role?.faction === 'DEATH_EATERS' && (
              <div className="mt-3.5 p-3 rounded-xl bg-[#09261a] border-2 border-emerald-500/90 text-xs text-emerald-200 font-serif flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 shrink-0 mt-0.5">
                  <DarkMarkCrest className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-emerald-300 uppercase tracking-wider block">
                    ⚠️ CHÚ Ý: ĐANG CHỌN ĐỒNG MINH TỬ THẦN THỰC TỬ!
                  </span>
                  <span>
                    Mục tiêu bạn vừa nhấp chọn là <strong>{effectiveTargetPlayer.name} ({effectiveTargetPlayer.role?.name})</strong>. Đây là đồng minh cùng hội kín của bạn. Hãy cân nhắc kỹ trước khi bấm Ám Sát hoặc Biểu Quyết Tước Đũa!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Log View (shown when mobileTab === 'log' on screens < lg) */}
        <div className={`space-y-4 lg:hidden ${mobileTab === 'log' ? 'block' : 'hidden'}`}>
          <div className="relative rounded-2xl hpvn-panel p-5">
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] mb-3 flex items-center gap-2 border-b border-[#7a5229] pb-2 tracking-wide">
              <ScrollText size={18} className="text-[#bd8436]" />
              Biên Niên Sử Chiến Trường
            </h3>
            <div 
              ref={playerLogsContainerRef}
              className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar scroll-smooth"
            >
              {gameState.logs.length === 0 ? (
                <p className="text-xs text-[#ebdcb0]/50 font-lora italic py-6 text-center">
                  Chưa có hành động nào được ghi nhận trên bầu trời.
                </p>
              ) : (
                gameState.logs.map((log, idx) => {
                  const isWinLog = log.includes('CHIẾN THẮNG') || log.includes('KẾT THÚC TRẬN CHIẾN') || log.includes('Lý do:');
                  return (
                    <div
                      key={`player-log-entry-${idx}`}
                      className={`text-xs p-3 rounded-lg border font-lora leading-relaxed whitespace-pre-line ${
                        isWinLog
                          ? 'bg-gradient-to-r from-[#2e1908] via-[#45220c] to-[#2e1908] border-[#ffd88f] text-[#ffd88f] font-bold shadow-[0_0_15px_rgba(255,216,143,0.25)]'
                          : 'bg-[#140b05] border-[#5a3a1f] text-[#ebdcb0]'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })
              )}
              <div ref={playerLogsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar at Bottom of Viewport */}
      {mobileTab === 'battle' && effectiveTargetPlayer && !isDead && (
        <div className="mobile-target-sticky-bar lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pt-2.5 pb-6 sm:pb-3 pb-safe bg-gradient-to-t from-black via-[#140b05]/98 to-[#140b05]/90 border-t-2 border-[#bd8436]/70 backdrop-blur-lg shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0 flex-1">
              <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                effectiveTargetPlayer.role?.faction === 'DEATH_EATERS' && me.role?.faction === 'DEATH_EATERS'
                  ? 'text-emerald-400 font-extrabold flex items-center gap-1'
                  : 'text-[#ffd88f]'
              }`}>
                {effectiveTargetPlayer.role?.faction === 'DEATH_EATERS' && me.role?.faction === 'DEATH_EATERS' ? (
                  <>
                    <DarkMarkCrest className="w-3 h-3 text-emerald-400" />
                    <span>Đồng minh TTTT đã chọn:</span>
                  </>
                ) : (
                  'Mục tiêu đã chọn:'
                )}
              </span>
              <span className={`text-sm font-serif font-bold truncate block ${
                effectiveTargetPlayer.role?.faction === 'DEATH_EATERS' && me.role?.faction === 'DEATH_EATERS'
                  ? 'text-emerald-300'
                  : 'text-white'
              }`}>
                {effectiveTargetPlayer.name} {effectiveTargetPlayer.role?.faction === 'DEATH_EATERS' && me.role?.faction === 'DEATH_EATERS' ? `(${effectiveTargetPlayer.role?.name})` : ''}
              </span>
            </div>

            {isDay ? (
              <button
                onClick={() => {
                  playerAction('Biểu quyết Tước Đũa', effectiveTargetId!);
                  setSelectedTarget(effectiveTargetId);
                  setToastMessage(`✓ Đã lưu phiếu biểu quyết Tước Đũa cho: ${effectiveTargetPlayer.name}!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2.5 rounded-xl hpvn-btn-phoenix font-serif font-bold text-xs flex items-center gap-1.5 flex-shrink-0 active:scale-95"
              >
                <Crosshair size={14} />
                <span>
                  {myAction?.targetId === effectiveTargetId ? '✓ Đã Lưu' : 'Tước Đũa'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {me.role?.faction === 'DEATH_EATERS' && (
                  <>
                    <button
                      onClick={() => {
                        playerAction('giết', effectiveTargetId!);
                        setSelectedTarget(effectiveTargetId);
                        setToastMessage(`✓ Đã lưu mục tiêu Ám Sát: ${effectiveTargetPlayer.name}!`);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      disabled={isSilenced}
                      className="px-3 py-2 rounded-xl hpvn-btn-floo font-serif font-bold text-xs flex items-center gap-1 active:scale-95 disabled:opacity-40"
                    >
                      <Skull size={13} />
                      <span>Ám Sát</span>
                    </button>

                    <button
                      onClick={() => {
                        playerAction('giết', 'NONE');
                        setSelectedTarget(null);
                        setToastMessage('✓ Đã chọn: Không ám sát ai đêm nay! (Án binh)');
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      disabled={isSilenced}
                      className={`px-3 py-2 rounded-xl font-serif font-bold text-xs flex items-center gap-1 active:scale-95 disabled:opacity-40 border ${
                        myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '')
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                      }`}
                    >
                      <Ban size={13} />
                      <span>{myAction?.targetId === 'NONE' && isKillAction(myAction?.actionName || '') ? '✓ Án Binh' : 'Không Giết'}</span>
                    </button>
                  </>
                )}
                {me.role?.id === 'ALBUS_DUMBLEDORE' && (
                  <button
                    onClick={() => {
                      playerAction('bảo vệ', effectiveTargetId!);
                      setSelectedTarget(effectiveTargetId);
                      setToastMessage(`✓ Đã lưu khiên Bảo Vệ cho: ${effectiveTargetPlayer.name}!`);
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="px-3 py-2 rounded-xl hpvn-btn-gold font-serif font-bold text-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Shield size={13} />
                    <span>Bảo Vệ</span>
                  </button>
                )}
                {effectiveTargetId !== me.id && (
                  <button
                    onClick={() => {
                      playerAction('bay hộ tống', effectiveTargetId!);
                      setSelectedTarget(effectiveTargetId);
                      setToastMessage(`✓ Đã lưu mục tiêu Bay Hộ Tống: ${effectiveTargetPlayer.name}!`);
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-[#ffd88f] border border-amber-500 font-serif font-bold text-xs flex items-center gap-1 active:scale-95"
                  >
                    <Shield size={13} />
                    <span>{myAction?.targetId === effectiveTargetId && isEscortAction(myAction?.actionName || '') ? '✓ Đang Hộ Tống' : 'Hộ Tống'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Card Inspector Modal for Self */}
      <CardInspectorModal
        role={me.role}
        isOpen={inspectSelf}
        onClose={() => setInspectSelf(false)}
      />
    </div>
  );
}
