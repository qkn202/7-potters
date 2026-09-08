"use client";

import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Crosshair, 
  Eye, 
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
  HelpCircle,
  Flame,
  Search,
  Maximize2,
  ScrollText
} from 'lucide-react';
import { useState } from 'react';
import { CharacterCard, CardInspectorModal } from './CharacterCard';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  WaxSeal,
  CardCornerFlourish 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';

export function PlayerScreen() {
  const { gameState, currentPlayerId, playerAction, executeInstantSkill, resolveInterrupt } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [inspectSelf, setInspectSelf] = useState(false);
  const [mobileTab, setMobileTab] = useState<'battle' | 'card' | 'log'>('battle');

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
          className="relative bg-gradient-to-b from-red-950 via-gray-950 to-black border-2 border-red-500 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-[0_0_60px_rgba(239,68,68,0.6)] overflow-hidden"
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
                      ? 'bg-red-900/60 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
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
            className="px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-serif font-black rounded-xl text-base tracking-wider transition-all shadow-lg shadow-red-950/50 uppercase"
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
          className={`relative max-w-2xl w-full p-8 sm:p-12 rounded-3xl border-3 shadow-2xl overflow-hidden ${
            isDeathEatersWon ? 'hpvn-panel-emerald' : 'hpvn-panel-crimson'
          }`}
        >
          <div className="flex justify-center mb-6">
            {isDeathEatersWon ? (
              <DarkMarkCrest className="w-24 h-24 drop-shadow-[0_0_35px_rgba(16,185,129,0.9)] animate-pulse" />
            ) : (
              <PhoenixCrest className="w-24 h-24 drop-shadow-[0_0_35px_rgba(220,38,38,0.9)] animate-pulse" />
            )}
          </div>

          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#ffd88f] block mb-2">
            KẾT THÚC CHIẾN DỊCH BẢY POTTER
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-title-magical font-black mb-4 drop-shadow-lg tracking-wide ${
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

          <p className="text-lg sm:text-xl font-lora text-[#f5eedb] mb-8">
            {isWinner 
              ? '🎉 Vinh quang bất diệt! Phe của bạn đã khải hoàn thắng lợi! 🎉' 
              : '💀 Rất tiếc! Lực lượng của bạn đã thất bại trong trận không chiến! 💀'}
          </p>

          <p className="text-xs font-mono text-[#ebdcb0]/60">
            Quản Trò (GM) có thể cài đặt lại ván cờ từ bảng điều khiển.
          </p>
        </motion.div>
      </div>
    );
  }

  const isNight = gameState.phase === 'NIGHT';
  const isDay = gameState.phase === 'DAY';
  const isDead = me.status === 'DEAD';

  const hasDaySkill = me.role?.faction === 'DEATH_EATERS' || 
    ['ALBUS_DUMBLEDORE', 'HERMIONE_GRANGER', 'REMUS_LUPIN', 'KINGSLEY_SHACKLEBOLT'].includes(me.role?.id || '');

  const myAction = me ? gameState.pendingActions[me.id] : null;
  const myVotedTarget = myAction ? gameState.players.find(p => p.id === myAction.targetId) : null;
  const effectiveTargetId = selectedTarget ?? myAction?.targetId ?? null;
  const effectiveTargetPlayer = gameState.players.find(p => p.id === effectiveTargetId);

  // Live vote and kill counts
  const voteCountsByTarget: Record<string, number> = {};
  const killCountsByTarget: Record<string, number> = {};
  Object.values(gameState.pendingActions).forEach(action => {
    if (action.actionName === 'Bỏ phiếu Treo Cổ') {
      voteCountsByTarget[action.targetId] = (voteCountsByTarget[action.targetId] || 0) + 1;
    } else if (action.actionName === 'Giết') {
      killCountsByTarget[action.targetId] = (killCountsByTarget[action.targetId] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Top Banner: Atmospheric Day/Night Tracker & Global Actions */}
      <div className="relative rounded-2xl border-2 border-[#bd8436] p-4 sm:p-5 mb-8 shadow-xl overflow-hidden"
        style={{
          background: isDay 
            ? 'linear-gradient(90deg, #3d2412 0%, #26160c 50%, #170c06 100%)' 
            : 'linear-gradient(90deg, #1c0f24 0%, #15091c 50%, #0d0612 100%)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border shadow-lg ${
              isDay 
                ? 'bg-[#5c3f1f] text-[#ffd88f] border-[#ebdcb0]/60 shadow-amber-900/30' 
                : 'bg-[#2f143d] text-cyan-300 border-indigo-500/50 shadow-indigo-950/40'
            }`}>
              {isDay ? <Sun size={26} className="animate-spin-slow text-[#ffd88f]" /> : <Moon size={26} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#ffd88f]">
                  Lượt {gameState.round}
                </span>
                <span className="text-[#7a5229]">•</span>
                <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                  isDay ? 'bg-[#180e07] text-[#ffd88f] border-[#7a5229]' : 'bg-[#120617] text-cyan-300 border-indigo-800'
                }`}>
                  {isDay ? 'Ban Ngày · Ám Sát & Soi Thân Phận' : 'Ban Đêm · Diễn Đàn & Bỏ Phiếu Treo Cổ'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-title-magical font-bold text-[#ffd88f] mt-0.5 tracking-wide">
                {isDay ? 'Bầu Trời Ngày · Mật Đàm Tử Thần' : 'Bầu Trời Đêm · Hội Đồng Phán Quyết'}
              </h2>
              <p className="text-xs text-[#ebdcb0] font-lora mt-0.5">
                {isDay 
                  ? 'Tử Thần Thực Tử đang săn đuổi. Các thành viên có kỹ năng ban ngày có thể thi triển bùa phép.' 
                  : 'Toàn bộ các phù thủy thức dậy. Tranh luận, vạch trần kẻ ác và bỏ phiếu Treo Cổ!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="hpvn-btn-gold px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen size={14} /> Bí Kíp Thẻ Bài
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tab Bar (hidden on lg screens) */}
      <div className="lg:hidden flex items-center bg-[#120803] p-1 rounded-xl border border-[#7a5229] mb-4 shadow-md">
        <button
          onClick={() => setMobileTab('battle')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'battle'
              ? 'hpvn-btn-gold shadow-md'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Crosshair size={14} /> Tác Chiến ({gameState.phase === 'DAY' ? 'Ngày' : 'Đêm'})
        </button>
        <button
          onClick={() => setMobileTab('card')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'card'
              ? 'hpvn-btn-gold shadow-md'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Sparkles size={14} /> Thẻ Của Bạn
        </button>
        <button
          onClick={() => setMobileTab('log')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'log'
              ? 'hpvn-btn-gold shadow-md'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <ScrollText size={14} /> Nhật Ký ({gameState.logs.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Player's Deluxe 3D Character Card (col-span-5) */}
        <div className={`space-y-4 lg:col-span-5 ${mobileTab === 'card' ? 'block' : 'hidden lg:block'}`}>
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
            <div className="rounded-xl border border-emerald-600/60 bg-[#081a12] p-3.5 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-300 font-title font-bold text-sm mb-2 border-b border-emerald-900/60 pb-1.5">
                <DarkMarkCrest className="w-4 h-4 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
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
        </div>

        {/* Right Column: Battle Grid & Spell Arsenal (col-span-7) */}
        <div className={`space-y-6 lg:col-span-7 ${mobileTab === 'battle' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Death Eater Secret Alliance Awakening Banner */}
          {me.role?.faction === 'DEATH_EATERS' && (
            <div className="relative rounded-2xl border-2 border-emerald-500/80 p-4 sm:p-5 shadow-2xl overflow-hidden bg-gradient-to-r from-[#031d13] via-[#062c1d] to-[#031d13]">
              <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-emerald-500 pointer-events-none" />
              <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-emerald-500 -scale-x-100 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                    <DarkMarkCrest className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600">
                        Mật Lệnh Hội Kín
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/80">
                        • Thức Tỉnh Đầu Game
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-title font-bold text-emerald-300 tracking-wide mt-0.5">
                      Liên Minh Tử Thần Thực Tử
                    </h3>
                  </div>
                </div>

                <div className="text-xs font-mono text-emerald-300 bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-600 self-start sm:self-auto flex items-center gap-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Bảng tên đồng minh sáng <strong className="text-emerald-200">MÀU XANH LÁ</strong></span>
                </div>
              </div>

              <p className="text-xs text-emerald-200 font-lora mb-3.5 leading-relaxed">
                Chúa Tể Hắc Ám đã hiệu triệu. Vào đầu trận chiến, toàn bộ Tử Thần Thực Tử cùng thức tỉnh và nhận diện đồng minh. Dưới đây là danh sách bề tôi bóng tối trong trận này:
              </p>

              {/* Roster Grid of All Death Eaters in this match */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {gameState.players
                  .filter(p => !p.isGM && p.role?.faction === 'DEATH_EATERS')
                  .map((de, idx) => {
                    const isMe = de.id === me.id;
                    const isDeDead = de.status === 'DEAD';
                    const isDeInjured = de.status === 'INJURED';

                    return (
                      <div
                        key={de.id ? `de-roster-card-${de.id}` : `de-roster-card-${idx}`}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          isMe
                            ? 'bg-[#0a3825] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                            : 'bg-[#052418] border-emerald-600/80 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${
                            isDeDead 
                              ? 'bg-red-950 text-red-400 border-red-800' 
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          }`}>
                            {isDeDead ? <Skull size={13} /> : <DarkMarkCrest className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-serif font-bold truncate ${
                                isDeDead ? 'line-through text-emerald-700' : 'text-emerald-200'
                              }`}>
                                {de.name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-900 px-1 rounded border border-emerald-600 shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 block truncate">
                              {de.role?.name} {de.role?.id === 'VOLDEMORT' ? '👑' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isDeDead ? (
                            <span className="text-[9px] font-mono text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-800">
                              Tử trận
                            </span>
                          ) : isDeInjured ? (
                            <span className="text-[9px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600">
                              Bị thương
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600">
                              Sống sót
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 1. Skies of Privet Drive: Target Selection Grid */}
          <div className="relative rounded-2xl hpvn-panel-gold p-5 shadow-xl overflow-hidden">
            <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none" />
            <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#7a5229] pb-3 mb-4 gap-2">
              <div>
                <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2 tracking-wide">
                  <Crosshair size={18} className="text-[#bd8436]" />
                  Mục Tiêu Trên Bầu Trời (Chọn 1 người)
                </h3>
                <p className="text-xs text-[#ebdcb0] font-lora">
                  {isDay ? 'Chọn mục tiêu để áp dụng kỹ năng ban ngày / ám sát' : 'Chọn đối tượng để bỏ phiếu Treo Cổ'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {myAction && (
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/80 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle size={13} className="text-emerald-400" />
                    Đã lưu: {myVotedTarget?.name || 'Mục tiêu'}
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
                const canSelectDead = isDay && me.role?.id === 'REMUS_LUPIN';
                const disabled = isPDead && !canSelectDead;
                const voteCount = isNight ? (voteCountsByTarget[p.id] || 0) : 0;
                const killCount = isDay && me.role?.faction === 'DEATH_EATERS' ? (killCountsByTarget[p.id] || 0) : 0;

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
                          ? 'bg-[#1b3d2b] border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
                          : isSelected 
                            ? isFellowDeathEater
                              ? 'bg-[#0a3825] border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400'
                              : 'bg-[#462c14] border-[#ffd88f] shadow-[0_0_20px_rgba(189,132,54,0.4)] ring-1 ring-[#ffd88f]' 
                            : isFellowDeathEater
                              ? 'bg-gradient-to-r from-[#052418] via-[#083623] to-[#052418] border-emerald-500/90 hover:border-emerald-400 hover:bg-[#0c442c] shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                              : 'bg-[#1a0e07] border-[#5a3a1f] hover:border-[#7a5229] hover:bg-[#26150c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg border ${
                        isMyVote
                          ? 'bg-emerald-900 text-emerald-300 border-emerald-500'
                          : isSelected 
                            ? isFellowDeathEater
                              ? 'bg-emerald-800 text-emerald-200 border-emerald-300 shadow-md'
                              : 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ebdcb0]' 
                            : isPDead 
                              ? 'bg-[#2a0303] text-red-400 border-red-900' 
                              : isFellowDeathEater
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-600 shadow-sm'
                                : isPInjured
                                  ? 'bg-[#3d2406] text-amber-300 border-amber-600'
                                  : 'bg-[#120803] text-[#ebdcb0] border-[#5a3a1f]'
                      }`}>
                        {isMyVote ? (
                          <CheckCircle size={14} />
                        ) : isFellowDeathEater ? (
                          <DarkMarkCrest className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
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
                                ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
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
                            <span className="text-[9px] font-mono font-black text-emerald-200 bg-emerald-950/95 px-2 py-0.5 rounded border border-emerald-400 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                              <DarkMarkCrest className="w-2.5 h-2.5 text-emerald-300" />
                              Đồng Minh: {p.role?.name} {p.role?.id === 'VOLDEMORT' ? '👑' : ''}
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
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] block" />
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
              <div className="mt-3.5 p-3 rounded-xl bg-[#09261a] border-2 border-emerald-500/90 text-xs text-emerald-200 font-serif flex items-start gap-2.5 shadow-lg">
                <div className="p-1 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 shrink-0 mt-0.5">
                  <DarkMarkCrest className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-emerald-300 uppercase tracking-wider block">
                    ⚠️ CHÚ Ý: ĐANG CHỌN ĐỒNG MINH TỬ THẦN THỰC TỬ!
                  </span>
                  <span>
                    Mục tiêu bạn vừa nhấp chọn là <strong>{effectiveTargetPlayer.name} ({effectiveTargetPlayer.role?.name})</strong>. Đây là đồng minh cùng hội kín của bạn. Hãy cân nhắc kỹ trước khi bấm Ám Sát hoặc Bỏ Phiếu Treo Cổ!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Spell Arsenal: Action Console */}
          <div className="relative rounded-2xl hpvn-panel p-5 shadow-xl">
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] mb-3 flex items-center gap-2 tracking-wide">
              <Wand2 size={18} className="text-[#bd8436]" />
              Bàn Thi Triển Ma Pháp & Biểu Quyết
            </h3>

            {/* Persistent Confirmed Vote Box */}
            {myAction && (
              <div className="p-4 rounded-xl border-2 border-emerald-500/70 bg-gradient-to-r from-[#0c2a1a] to-[#121c16] mb-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-300 shadow-sm">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                        PHIẾU BẦU ĐÃ ĐƯỢC LƯU VÀO MÁY CHỦ
                      </span>
                      <p className="font-serif text-sm sm:text-base text-[#f5eedb] font-bold">
                        {myAction.actionName === 'Bỏ phiếu Treo Cổ' ? 'Bỏ phiếu Treo Cổ' : `Hành động: ${myAction.actionName}`}:{' '}
                        <span className="text-[#ffd88f] underline decoration-[#bd8436] font-extrabold text-base">
                          {myVotedTarget?.name || 'Mục tiêu'}
                        </span>
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

            {/* Case: Day and player has no day skills */}
            {isDay && !hasDaySkill ? (
              <div className="p-8 text-center bg-[#120803]/80 rounded-xl border border-[#5a3a1f]">
                <Shield className="w-10 h-10 mx-auto text-[#bd8436]/50 mb-2" />
                <p className="font-lora text-sm text-[#ebdcb0]">
                  Ban Ngày là lượt hành động của Tử Thần Thực Tử và các nhân vật đặc biệt (Hermione, Dumbledore, Lupin...).
                </p>
                <p className="text-xs text-[#ebdcb0]/60 mt-1 font-mono">
                  Bạn vui lòng giữ im lặng và chờ đợi Quản Trò kích hoạt ban Đêm.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Night Phase Actions: Vote Treo Cổ & Moody Avada */}
                {isNight ? (
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
                        className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-phoenix font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        <Skull size={18} />
                        <span>Bắn Lén (Avada Kedavra)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (effectiveTargetId) {
                          playerAction('Bỏ phiếu Treo Cổ', effectiveTargetId);
                          setSelectedTarget(effectiveTargetId);
                          const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                          setToastMessage(`✓ Đã lưu phiếu biểu quyết Treo Cổ cho: ${tName}!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }
                      }}
                      disabled={!effectiveTargetId || isDead}
                      className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-phoenix font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
                    >
                      <Crosshair size={18} />
                      <span>
                        {myAction?.targetId === effectiveTargetId
                          ? `✓ Đã Lưu Phiếu Treo Cổ (${effectiveTargetPlayer?.name})`
                          : myAction
                            ? `🔄 Đổi Phiếu Sang: ${effectiveTargetPlayer?.name}`
                            : `Bỏ Phiếu Treo Cổ ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                      </span>
                    </button>
                  </div>
                ) : (
                  // Day Phase Actions: Role-specific abilities
                  (() => {
                    let skillName: string | null = null;
                    if (me.role?.id === 'HERMIONE_GRANGER') skillName = 'Soi Danh Tính';
                    if (me.role?.id === 'PETER_PETTIGREW') skillName = 'Soi Phe';
                    if (me.role?.id === 'REMUS_LUPIN') skillName = 'Hồi Sinh';
                    if (me.role?.id === 'FENRIR_GREYBACK') skillName = 'Cắn';

                    const isSilenced = Boolean(gameState.skillStates[`voldemort_silenced_R${gameState.round}`]);
                    const isDoubleKill = Boolean(gameState.skillStates[`voldemort_double_kill_R${gameState.round}`]);

                    return (
                      <div className="space-y-3">
                        {me.role?.faction === 'DEATH_EATERS' && isSilenced && (
                          <div className="p-3 bg-red-950/90 border border-red-700 rounded-xl text-xs text-red-200 font-serif flex items-center gap-2 shadow-md">
                            <AlertTriangle size={16} className="text-red-400 shrink-0" />
                            <span><strong>Lời Nguyền Lucius Malfoy:</strong> Đòn ám sát của Tử Thần Thực Tử bị phong ấn ma pháp hôm nay!</span>
                          </div>
                        )}

                        {me.role?.faction === 'DEATH_EATERS' && isDoubleKill && (
                          <div className="p-3 bg-emerald-950/90 border border-emerald-600 rounded-xl text-xs text-emerald-200 font-serif flex items-center gap-2 shadow-md">
                            <Flame size={16} className="text-emerald-400 shrink-0" />
                            <span><strong>Cơn Thịnh Nộ Bellatrix:</strong> Tử Thần Thực Tử được quyền ám sát tới 2 mục tiêu hôm nay! Hãy phối hợp bỏ phiếu các mục tiêu khác nhau.</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {skillName && (
                            <button
                              onClick={() => {
                                if (effectiveTargetId) {
                                  const res = executeInstantSkill(skillName!, effectiveTargetId);
                                  setToastMessage(res || 'Đã thi triển');
                                  setTimeout(() => setToastMessage(null), 5000);
                                }
                              }}
                              disabled={!effectiveTargetId || isDead}
                              className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-gold font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                              <Wand2 size={18} />
                              <span>Thi Triển {skillName}</span>
                            </button>
                          )}

                          {me.role?.faction === 'DEATH_EATERS' && (
                            <button
                              onClick={() => {
                                if (effectiveTargetId) {
                                  playerAction('Giết', effectiveTargetId);
                                  setSelectedTarget(effectiveTargetId);
                                  const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                                  setToastMessage(`✓ Đã lưu mục tiêu Ám Sát: ${tName}!`);
                                  setTimeout(() => setToastMessage(null), 3500);
                                }
                              }}
                              disabled={!effectiveTargetId || isDead || isSilenced}
                              className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-floo font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
                            >
                              <Skull size={18} />
                              <span>
                                {isSilenced
                                  ? 'Bị phong ấn (Không thể ám sát)'
                                  : myAction?.targetId === effectiveTargetId && myAction?.actionName === 'Giết'
                                    ? `✓ Đã Lưu Mục Tiêu Ám Sát (${effectiveTargetPlayer?.name})`
                                    : myAction?.actionName === 'Giết'
                                      ? `🔄 Đổi Mục Tiêu Ám Sát Sang: ${effectiveTargetPlayer?.name}`
                                      : `Ám Sát (Avada Kedavra) ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                              </span>
                            </button>
                          )}

                          {me.role?.id === 'ALBUS_DUMBLEDORE' && (
                            <button
                              onClick={() => {
                                if (effectiveTargetId) {
                                  const prevShieldedId = gameState.skillStates[`DUMBLEDORE_SHIELDED_R${gameState.round - 1}`];
                                  if (prevShieldedId && prevShieldedId === effectiveTargetId) {
                                    setToastMessage('⚠️ Dumbledore không được bảo vệ cùng 1 người 2 lượt liên tiếp!');
                                    setTimeout(() => setToastMessage(null), 4000);
                                    return;
                                  }
                                  playerAction('Bảo vệ', effectiveTargetId);
                                  setSelectedTarget(effectiveTargetId);
                                  const tName = gameState.players.find(p => p.id === effectiveTargetId)?.name;
                                  setToastMessage(`✓ Đã lưu khiên Bảo Vệ cho: ${tName}!`);
                                  setTimeout(() => setToastMessage(null), 3500);
                                }
                              }}
                              disabled={!effectiveTargetId || isDead}
                              className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-gold font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
                            >
                              <Shield size={18} />
                              <span>
                                {myAction?.targetId === effectiveTargetId && myAction?.actionName === 'Bảo vệ'
                                  ? `✓ Đã Lưu Khiên Bảo Vệ (${effectiveTargetPlayer?.name})`
                                  : myAction?.actionName === 'Bảo vệ'
                                    ? `🔄 Đổi Bảo Vệ Sang: ${effectiveTargetPlayer?.name}`
                                    : `Phù Phép Bảo Vệ (Protego) ${effectiveTargetPlayer ? `(${effectiveTargetPlayer.name})` : ''}`}
                              </span>
                            </button>
                          )}

                          {me.role?.id === 'KINGSLEY_SHACKLEBOLT' && (
                            <button
                              onClick={() => {
                                playerAction('Kingsley Kích Hoạt', 'ALL');
                                setToastMessage('✓ Đã kích hoạt thế trận ứng cứu hôm nay (Tỷ lệ 50%).');
                                setTimeout(() => setToastMessage(null), 3500);
                              }}
                              disabled={isDead}
                              className="flex-1 py-3.5 px-4 rounded-xl hpvn-btn-gold font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
                            >
                              <Shield size={18} />
                              <span>
                                {myAction?.actionName === 'Kingsley Kích Hoạt'
                                  ? '✓ Đã Kích Hoạt Ứng Cứu Hôm Nay'
                                  : 'Kích Hoạt Ứng Cứu (50%)'}
                              </span>
                            </button>
                          )}
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
                    className="p-3.5 bg-gradient-to-r from-[#044e36] via-[#057a55] to-[#044e36] border border-emerald-400 rounded-xl text-emerald-100 text-center font-lora text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} className="text-emerald-300" />
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Log View (shown when mobileTab === 'log' on screens < lg) */}
        <div className={`space-y-4 lg:hidden ${mobileTab === 'log' ? 'block' : 'hidden'}`}>
          <div className="relative rounded-2xl hpvn-panel p-5 shadow-xl">
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] mb-3 flex items-center gap-2 border-b border-[#7a5229] pb-2 tracking-wide">
              <ScrollText size={18} className="text-[#bd8436]" />
              Biên Niên Sử Chiến Trường
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {gameState.logs.length === 0 ? (
                <p className="text-xs text-[#ebdcb0]/50 font-lora italic py-6 text-center">
                  Chưa có hành động nào được ghi nhận trên bầu trời.
                </p>
              ) : (
                gameState.logs.map((log, idx) => (
                  <div
                    key={`player-log-entry-${idx}`}
                    className="text-xs p-3 rounded-lg bg-[#140b05] border border-[#5a3a1f] text-[#ebdcb0] font-lora leading-relaxed"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar at Bottom of Viewport */}
      {mobileTab === 'battle' && effectiveTargetPlayer && !isDead && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe bg-gradient-to-t from-black via-[#140b05]/95 to-[#140b05]/80 border-t border-[#bd8436]/50 backdrop-blur-md shadow-[0_-5px_25px_rgba(0,0,0,0.85)]">
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

            {isNight ? (
              <button
                onClick={() => {
                  playerAction('Bỏ phiếu Treo Cổ', effectiveTargetId!);
                  setSelectedTarget(effectiveTargetId);
                  setToastMessage(`✓ Đã lưu phiếu biểu quyết Treo Cổ cho: ${effectiveTargetPlayer.name}!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2.5 rounded-xl hpvn-btn-phoenix font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg flex-shrink-0 active:scale-95"
              >
                <Crosshair size={14} />
                <span>
                  {myAction?.targetId === effectiveTargetId ? '✓ Đã Lưu' : 'Bỏ Phiếu Treo Cổ'}
                </span>
              </button>
            ) : me.role?.faction === 'DEATH_EATERS' ? (
              <button
                onClick={() => {
                  playerAction('Giết', effectiveTargetId!);
                  setSelectedTarget(effectiveTargetId);
                  setToastMessage(`✓ Đã lưu mục tiêu Ám Sát: ${effectiveTargetPlayer.name}!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2.5 rounded-xl hpvn-btn-floo font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg flex-shrink-0 active:scale-95"
              >
                <Skull size={14} />
                <span>
                  {myAction?.targetId === effectiveTargetId ? '✓ Đã Lưu' : 'Ám Sát'}
                </span>
              </button>
            ) : me.role?.id === 'ALBUS_DUMBLEDORE' ? (
              <button
                onClick={() => {
                  playerAction('Bảo vệ', effectiveTargetId!);
                  setSelectedTarget(effectiveTargetId);
                  setToastMessage(`✓ Đã lưu khiên Bảo Vệ cho: ${effectiveTargetPlayer.name}!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2.5 rounded-xl hpvn-btn-gold font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg flex-shrink-0 active:scale-95"
              >
                <Shield size={14} />
                <span>Bảo Vệ</span>
              </button>
            ) : null}
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
