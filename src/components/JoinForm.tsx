"use client";

import { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { Sparkles, Wand2, Crown, BookOpen, KeyRound, PlusCircle, LogIn, Laptop, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  WaxSeal, 
  CardCornerFlourish,
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';

type JoinMode = 'create' | 'join' | 'mock';

export function JoinForm() {
  const { createRoom, joinRoom, joinGame, errorMsg: globalError } = useGame();
  const [mode, setMode] = useState<JoinMode>('create');
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isGM, setIsGM] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Check URL query param ?room=CODE on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && roomParam.trim()) {
        setRoomCodeInput(roomParam.trim().toUpperCase());
        setMode('join');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError('Vui lòng nhập Danh Xưng / Bí Danh Phù Thủy!');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createRoom(trimmedName, isGM);
      } else if (mode === 'join') {
        const cleanCode = roomCodeInput.trim().toUpperCase();
        if (!cleanCode) {
          setLocalError('Vui lòng nhập Mã Phòng gồm 4 ký tự!');
          setIsSubmitting(false);
          return;
        }
        await joinRoom(cleanCode, trimmedName, isGM);
      } else {
        // Single-device / Mock mode
        joinGame(trimmedName, isGM);
      }
    } catch (err: any) {
      console.error('Join error:', err);
      setLocalError(err?.message || 'Không thể kết nối. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || globalError;

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8c0c0c]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dossier Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-3xl p-4 sm:p-8 md:p-10 hpvn-panel-gold shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        {/* Corner Antique Flourishes */}
        <CardCornerFlourish className="absolute top-2.5 left-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] pointer-events-none" />
        <CardCornerFlourish className="absolute top-2.5 right-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-x-100 pointer-events-none" />
        <CardCornerFlourish className="absolute bottom-2.5 left-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-y-100 pointer-events-none" />
        <CardCornerFlourish className="absolute bottom-2.5 right-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="text-center relative z-10 mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2.5">
            <PhoenixCrest className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_12px_rgba(220,38,38,0.7)]" />
            <DeathlyHallowsSymbol className="w-5 h-5 sm:w-6 sm:h-6 text-[#bd8436]" />
            <DarkMarkCrest className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#ffd88f] block mb-1">
            HỘI PHƯỢNG HOÀNG · MẠNG FLOO THỜI GIAN THỰC
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-title-magical font-bold tracking-wide text-[#ffd88f] drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
            Chiến Dịch 7 Potter
          </h1>
          <p className="text-xs sm:text-sm text-[#ebdcb0] font-lora italic mt-1 px-2 sm:px-4">
            Cuộc tháo chạy định mệnh từ Privet Drive đến Trang trại Hang Sóc
          </p>
        </div>

        {/* Mode Selector Tabs (Create / Join / Mock) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#120803] rounded-xl border border-[#7a5229]/60 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => { setMode('create'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'create'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803] shadow-md'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <PlusCircle size={14} />
            <span>Tạo Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('join'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'join'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803] shadow-md'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <LogIn size={14} />
            <span>Vào Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('mock'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'mock'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803] shadow-md'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <Laptop size={14} />
            <span>Giả Lập</span>
          </button>
        </div>

        {/* Error Notification */}
        {displayError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs font-serif flex items-center gap-2 relative z-10 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Secret Mission Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Room Code Input (Only in 'join' mode) */}
          {mode === 'join' && (
            <div>
              <label className="block text-xs font-serif uppercase tracking-widest text-[#ffd88f] mb-1.5 font-bold">
                Mã Phòng (4 Ký Tự)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-[#120803] border-2 border-[#bd8436] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-2 focus:ring-[#bd8436]/50 text-[#ffd88f] placeholder-[#8c622e] font-mono text-center tracking-[0.3em] uppercase text-lg transition-all shadow-inner"
                  placeholder="VÍ DỤ: POT7"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                  <KeyRound size={18} />
                </div>
              </div>
            </div>
          )}

          {/* Player Name */}
          <div>
            <label className="block text-xs font-serif uppercase tracking-widest text-[#ffd88f] mb-1.5 font-bold">
              Danh Xưng / Bí Danh Phù Thủy
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#120803] border-2 border-[#7a5229] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-2 focus:ring-[#bd8436]/40 text-[#f5eedb] placeholder-[#8c622e] font-lora transition-all shadow-inner"
                placeholder="Ví dụ: Harry, Moody Mắt Điên, Albus..."
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                <Wand2 size={18} />
              </div>
            </div>
          </div>

          {/* GM Role Toggle Card */}
          <div 
            onClick={() => setIsGM(!isGM)}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between select-none ${
              isGM 
                ? 'bg-[#3a2213] border-[#ffd88f] shadow-[0_0_20px_rgba(189,132,54,0.3)]' 
                : 'bg-[#180e07] border-[#5a3a1f] hover:border-[#7a5229]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isGM 
                  ? 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ebdcb0] shadow-md' 
                  : 'bg-[#120803] text-[#ebdcb0] border-[#5a3a1f]'
              }`}>
                <Crown size={18} />
              </div>
              <div>
                <span className={`block font-serif font-bold text-xs sm:text-sm ${isGM ? 'text-[#ffd88f]' : 'text-[#ebdcb0]'}`}>
                  Vai trò Quản Trò (Game Master)
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#ebdcb0]/70 block font-mono">
                  {isGM ? 'Nắm giữ cuốn sổ định đoạt ván cờ' : 'Người chơi nhận thẻ nhân vật'}
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              id="isGM"
              checked={isGM}
              onChange={(e) => setIsGM(e.target.checked)}
              className="w-4 h-4 rounded border-[#7a5229] text-[#bd8436] focus:ring-[#bd8436] bg-[#120803] pointer-events-none"
            />
          </div>

          {/* Wax Sealed Entrance Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden rounded-xl p-[2px] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#8c0c0c] via-[#bd8436] to-[#047857] rounded-xl opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#24150c] via-[#1a0e07] to-[#24150c] px-6 sm:px-8 py-3.5 rounded-xl transition-all group-hover:bg-opacity-90 font-serif font-bold text-base sm:text-lg text-[#ffd88f] tracking-wider uppercase border border-[#bd8436]/60 shadow-lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 text-[#ffd88f] animate-spin" />
                  <span>Đang kết nối Mạng Floo...</span>
                </>
              ) : (
                <>
                  <WaxSeal variant={isGM ? 'gold' : 'red'} letter={isGM ? 'GM' : 'P'} size="sm" />
                  <span>
                    {mode === 'create'
                      ? (isGM ? 'Thiết Lập Phòng GM' : 'Mở Phòng Bầu Trời')
                      : mode === 'join'
                      ? 'Gia Nhập Phòng'
                      : (isGM ? 'Vào Bàn Quản Trò' : 'Gia Nhập Giả Lập')}
                  </span>
                  <Sparkles size={18} className="text-[#ffd88f]" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Quick Deck Codex Button */}
        <div className="mt-6 pt-4 border-t border-[#7a5229]/40 flex items-center justify-between text-xs text-[#ebdcb0]/70">
          <button
            type="button"
            onClick={() => setIsDeckOpen(true)}
            className="flex items-center gap-1.5 text-[#ffd88f] hover:text-[#fff4d1] transition-colors font-serif font-bold cursor-pointer"
          >
            <BookOpen size={14} /> Sổ tay 22 Thẻ Bài & Luật chơi
          </button>
          <span className="font-mono text-[10px] text-[#ebdcb0]/60">HPVN Multiplayer Engine</span>
        </div>
      </motion.div>

      {/* Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />
    </div>
  );
}
