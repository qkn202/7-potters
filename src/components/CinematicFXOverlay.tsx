"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveVisualFX } from '@/lib/types';
import { 
  Zap, 
  Flame, 
  Skull, 
  Eye, 
  CloudLightning, 
  Sparkles, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { PhoenixCrest, DarkMarkCrest } from './ArtAssets';

interface CinematicFXOverlayProps {
  activeFX?: ActiveVisualFX | null;
  onDismiss?: () => void;
}

export function CinematicFXOverlay({ activeFX, onDismiss }: CinematicFXOverlayProps) {
  // Auto-dismiss countdown timer when an active FX is set
  useEffect(() => {
    if (!activeFX) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, 2400);

    return () => clearTimeout(timer);
  }, [activeFX?.id, onDismiss]);

  const renderFXContent = (fx: ActiveVisualFX) => {
    switch (fx.type) {
      case 'GOLDEN_FLAME':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            {/* Screen Flash & Flame Aura */}
            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.8, 1.4, 1.2], opacity: [0.9, 0.6, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute -inset-40 bg-[radial-gradient(circle,rgba(251,191,36,0.6)_0%,rgba(217,119,6,0.3)_40%,transparent_70%)] rounded-full blur-3xl pointer-events-none"
            />
            
            {/* Phoenix Crest Surge */}
            <motion.div
              initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
              animate={{ scale: [0.5, 1.15, 1], rotate: [0, 5, 0], opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full animate-pulse" />
              <PhoenixCrest className="w-full h-full text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.9)]" />
              <Zap className="absolute text-yellow-100 w-12 h-12 animate-ping" />
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/80 shadow-lg shadow-amber-500/30 text-amber-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Flame size={14} className="text-amber-400 animate-bounce" />
                Lõi Kép Tự Vệ · Phản Đòn Chúa Tể
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_2px_15px_rgba(245,158,11,0.8)] tracking-wide">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-amber-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Chiếc đũa phép lông đuôi phượng hoàng của Harry tự động nhận diện và phản pháo Chúa Tể Voldemort!'}
              </p>
            </motion.div>
          </div>
        );

      case 'LIGHTNING_STRIKE':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            {/* Purple / Cyan Lightning Flash */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.2, 0.8, 0] }}
              transition={{ duration: 1.4, times: [0, 0.1, 0.3, 0.5, 1] }}
              className="absolute -inset-96 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.5)_0%,rgba(56,189,248,0.25)_50%,transparent_80%)] blur-2xl pointer-events-none"
            />

            {/* Lightning Bolts */}
            <motion.div
              initial={{ scale: 0.4, y: -40, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-purple-600/40 blur-2xl rounded-full" />
              <Zap className="w-full h-full text-cyan-300 drop-shadow-[0_0_30px_rgba(168,85,247,1)] animate-bounce" />
              <Skull className="absolute w-12 h-12 text-purple-200 animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-400 text-purple-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Zap size={14} className="text-cyan-400 animate-pulse" />
                Đòn Tập Kích Tử Thần
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-100 to-purple-300 drop-shadow-[0_2px_15px_rgba(168,85,247,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-purple-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Tia Chớp Định Mệnh rạch ngang bầu trời đêm!'}
              </p>
            </motion.div>
          </div>
        );

      case 'AVADA_KEDAVRA':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            {/* Emerald Green Death Wave */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.85, 0.3, 0.7, 0], scale: [0.8, 1.3, 1.2] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(34,197,94,0.6)_0%,rgba(6,78,59,0.5)_50%,transparent_80%)] blur-3xl pointer-events-none"
            />

            {/* Dark Mark Skull Emerging */}
            <motion.div
              initial={{ scale: 0.3, rotate: 10, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], rotate: [10, -5, 0], opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
              <DarkMarkCrest className="w-full h-full text-emerald-300 drop-shadow-[0_0_30px_rgba(34,197,94,1)] animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Skull size={14} className="text-emerald-400" />
                Lời Nguyền Chết Chóc · Ám Sát Thành Công
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-100 to-emerald-300 drop-shadow-[0_2px_15px_rgba(34,197,94,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Một luồng ánh sáng xanh lục chói lòa rạch ngang màn đêm!'}
              </p>
            </motion.div>
          </div>
        );

      case 'PERUVIAN_DARKNESS':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            {/* Swirling Deep Indigo / Black Mist */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.6, 1.4, 1.2], opacity: [0.95, 0.7, 0] }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(88,28,135,0.7)_0%,rgba(15,23,42,0.9)_55%,transparent_80%)] blur-3xl pointer-events-none"
            />
            
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-purple-700/40 blur-2xl rounded-full" />
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-purple-400/80 animate-spin" />
              <Sparkles className="absolute w-12 h-12 text-purple-200 animate-ping" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-400 text-purple-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles size={14} className="text-purple-300" />
                Tiệm Phù Thủy Weasley · Bảo Bối Tẩu Thoát
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-100 to-purple-300 drop-shadow-[0_2px_15px_rgba(168,85,247,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-purple-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Bột Khói Mù Peru bao phủ tầng mây, vô hiệu hóa mọi đòn ám sát!'}
              </p>
            </motion.div>
          </div>
        );

      case 'THUNDERSTORM_STAGE':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.2, 0.6, 0] }}
              transition={{ duration: 1.6, times: [0, 0.15, 0.4, 0.65, 1] }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(2,132,199,0.5)_0%,rgba(30,41,59,0.7)_50%,transparent_80%)] blur-2xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-sky-600/30 blur-xl rounded-full" />
              <CloudLightning className="w-full h-full text-sky-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/90 border border-sky-400 text-sky-200 text-xs font-mono font-bold uppercase tracking-widest">
                <CloudLightning size={14} className="text-sky-300" />
                Biến Cố Bầu Trời · Chặng 2
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-blue-100 to-sky-300 drop-shadow-[0_2px_15px_rgba(56,189,248,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-sky-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Tầng Mây Giông Bão: Không chiến hỗn loạn, mọi đòn đánh bị mù hướng!'}
              </p>
            </motion.div>
          </div>
        );

      case 'DARK_MARK_AMBUSH':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.2, 0.6, 0] }}
              transition={{ duration: 1.8 }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(6,78,59,0.6)_0%,rgba(15,23,42,0.8)_55%,transparent_80%)] blur-2xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-emerald-700/30 blur-2xl rounded-full" />
              <DarkMarkCrest className="w-full h-full text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.9)] animate-pulse" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Skull size={14} className="text-emerald-400" />
                Voldemort Trực Tiếp Xuất Kích
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-100 to-emerald-300 drop-shadow-[0_2px_15px_rgba(34,197,94,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Vòng vây Hắc Ám siết chặt! Tử Thần Thực Tử mở đợt phục kích kép!'}
              </p>
            </motion.div>
          </div>
        );

      case 'BURROW_SHIELD':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.7, 1.3, 1.1], opacity: [0.8, 0.5, 0] }}
              transition={{ duration: 1.8 }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(245,158,11,0.55)_0%,rgba(254,240,138,0.25)_45%,transparent_75%)] blur-3xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full" />
              <ShieldCheck className="w-full h-full text-amber-300 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-mono font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-amber-300" />
                Hàng Rào Bảo Vệ Hang Sóc
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_2px_15px_rgba(245,158,11,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-amber-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Kết giới cổ xưa bao bọc toàn bộ đoàn bay · Tiếp đất an toàn!'}
              </p>
            </motion.div>
          </div>
        );

      case 'TWO_WAY_MIRROR':
        return (
          <div className="relative flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.7, 1.3, 1.1], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 1.8 }}
              className="absolute -inset-96 bg-[radial-gradient(circle,rgba(6,182,212,0.5)_0%,rgba(14,116,144,0.3)_45%,transparent_75%)] blur-3xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full" />
              <Eye className="w-full h-full text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-10 space-y-2 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono font-bold uppercase tracking-widest">
                <Eye size={14} className="text-cyan-300" />
                Gương Hai Chiều Của Sirius
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-cyan-300 drop-shadow-[0_2px_15px_rgba(6,182,212,0.8)]">
                {fx.title}
              </h2>
              <p className="text-sm sm:text-base text-cyan-100 font-serif italic drop-shadow-md">
                {fx.subtitle || 'Kênh liên lạc thần giao cách cảm kết nối · Thấu thị tâm can bí mật!'}
              </p>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {activeFX && (
        <motion.div
          key={`cinematic-fx-${activeFX.id}`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: activeFX.type === 'GOLDEN_FLAME' || activeFX.type === 'LIGHTNING_STRIKE' 
              ? [0, -6, 6, -4, 4, -2, 2, 0] 
              : 0,
            y: activeFX.type === 'GOLDEN_FLAME' || activeFX.type === 'LIGHTNING_STRIKE' 
              ? [0, 4, -4, 3, -3, 1, -1, 0] 
              : 0,
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none overflow-hidden select-none backdrop-blur-[2px]"
        >
          <div 
            onClick={() => onDismiss?.()}
            className="pointer-events-auto cursor-pointer flex flex-col items-center group transition-transform active:scale-95"
            title="Nhấn để đóng sớm"
          >
            {renderFXContent(activeFX)}

            <div className="mt-2 opacity-75 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono tracking-wider px-3 py-1 rounded-full bg-black/80 text-amber-200/90 border border-amber-500/40 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                <X size={12} className="text-amber-300" /> Nhấn để đóng hiệu ứng
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
