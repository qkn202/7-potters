"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, PlayerStatus } from '@/lib/types';
import { 
  CardCornerFlourish, 
  PhoenixCrest, 
  DarkMarkCrest, 
  WaxSeal, 
  BadgeIcon,
  ChocolateFrogLogo
} from './ArtAssets';
import { 
  RotateCw, 
  Sparkles, 
  Eye, 
  Shield, 
  Skull, 
  Activity, 
  Flame, 
  Wand2, 
  AlertCircle,
  Maximize2,
  BookOpen
} from 'lucide-react';

interface CharacterCardProps {
  role: Role | null;
  playerStatus?: PlayerStatus;
  playerName?: string;
  isOwner?: boolean;
  size?: 'tarot' | 'compact' | 'mini';
  allowFlip?: boolean;
  className?: string;
  onInspect?: () => void;
  showStatusBadge?: boolean;
}

/**
 * PHÍA SAU THẺ BÀI: PHE HỘI PHƯỢNG HOÀNG (HPH)
 * Hào quang Lửa Phượng Hoàng hoàng gia bao bọc thẻ bài
 */
function PhoenixFactionBackground({ isDead, size }: { isDead: boolean; size?: 'tarot' | 'compact' | 'mini' }) {
  if (isDead) return null;

  return (
    <div className="absolute -inset-4 sm:-inset-6 pointer-events-none z-0 flex items-center justify-center overflow-visible select-none">
      {/* 1. Ambient Solar Fire Glow */}
      <motion.div
        animate={{
          scale: [0.96, 1.05, 0.96],
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2.5rem] blur-xl bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.55)_15%,rgba(234,88,12,0.35)_50%,rgba(220,38,38,0.15)_75%,transparent_95%)]"
      />

      {/* 2. Hiển thị Cánh Chim Phượng Hoàng sắc nét khi xem chi tiết (tarot mode) */}
      {size === 'tarot' && (
        <motion.img
          src="/images/phoenix_fire_wings.jpg"
          alt="Cánh Chim Phượng Hoàng Lửa"
          animate={{
            scale: [0.98, 1.03, 0.98],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-16 w-[150%] h-[150%] max-w-none object-contain mix-blend-screen drop-shadow-[0_0_26px_rgba(251,191,36,0.85)] filter contrast-125 brightness-110"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
          }}
        />
      )}

      {/* 3. Rising Golden Sparks & Embers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[
          { left: '10px', delay: 0, duration: 2.8, size: 4 },
          { left: '26px', delay: 1.1, duration: 3.6, size: 3 },
          { left: '42px', delay: 1.9, duration: 3.2, size: 4.5 },
        ].map((spark, idx) => (
          <motion.div
            key={`ph-spark-l-${idx}`}
            initial={{ y: '100%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['100%', '30%', '-15%'],
              opacity: [0, 0.95, 0],
              scale: [0.5, 1.3, 0.2],
              x: [0, idx % 2 === 0 ? 6 : -6, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ left: spark.left, width: spark.size, height: spark.size }}
            className="absolute bottom-4 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a] blur-[0.4px]"
          />
        ))}

        {[
          { right: '10px', delay: 0.5, duration: 3.0, size: 4 },
          { right: '26px', delay: 1.6, duration: 3.9, size: 3 },
          { right: '42px', delay: 2.3, duration: 3.4, size: 4.5 },
        ].map((spark, idx) => (
          <motion.div
            key={`ph-spark-r-${idx}`}
            initial={{ y: '100%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['100%', '30%', '-15%'],
              opacity: [0, 0.95, 0],
              scale: [0.5, 1.3, 0.2],
              x: [0, idx % 2 === 0 ? -6 : 6, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ right: spark.right, width: spark.size, height: spark.size }}
            className="absolute bottom-4 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a] blur-[0.4px]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PHÍA SAU THẺ BÀI: PHE TỬ THẦN THỰC TỬ (4T)
 * Hào quang Mãng Xà Ngọc Bích hắc ám bao bọc thẻ bài
 */
function DeathEaterFactionBackground({ isDead, size }: { isDead: boolean; size?: 'tarot' | 'compact' | 'mini' }) {
  if (isDead) return null;

  return (
    <div className="absolute -inset-4 sm:-inset-6 pointer-events-none z-0 flex items-center justify-center overflow-visible select-none">
      {/* 1. Ambient Jade Emerald Nebula */}
      <motion.div
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2.5rem] blur-xl bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.55)_15%,rgba(5,150,105,0.35)_50%,rgba(6,78,59,0.18)_75%,transparent_95%)]"
      />

      {/* 2. Hiển thị Con Rắn Ngọc Bích sắc nét khi xem chi tiết (tarot mode) */}
      {size === 'tarot' && (
        <motion.img
          src="/images/emerald_jade_serpent.jpg"
          alt="Con Rắn Ngọc Bích"
          animate={{
            scale: [0.98, 1.03, 0.98],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-16 w-[150%] h-[150%] max-w-none object-contain mix-blend-screen drop-shadow-[0_0_26px_rgba(16,185,129,0.85)] filter contrast-125 brightness-110"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
          }}
        />
      )}

      {/* 3. Rising Emerald Poison Wisps */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[
          { left: '10px', delay: 0.2, duration: 3.2, size: 4 },
          { left: '26px', delay: 1.4, duration: 3.8, size: 3 },
          { left: '42px', delay: 2.2, duration: 3.5, size: 4.5 },
        ].map((spark, idx) => (
          <motion.div
            key={`jade-wisp-l-${idx}`}
            initial={{ y: '100%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['100%', '30%', '-15%'],
              opacity: [0, 0.95, 0],
              scale: [0.5, 1.3, 0.2],
              x: [0, idx % 2 === 0 ? 6 : -6, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ left: spark.left, width: spark.size, height: spark.size }}
            className="absolute bottom-4 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7] blur-[0.4px]"
          />
        ))}

        {[
          { right: '10px', delay: 0.7, duration: 3.4, size: 4 },
          { right: '26px', delay: 1.8, duration: 4.0, size: 3 },
          { right: '42px', delay: 2.6, duration: 3.6, size: 4.5 },
        ].map((spark, idx) => (
          <motion.div
            key={`jade-wisp-r-${idx}`}
            initial={{ y: '100%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['100%', '30%', '-15%'],
              opacity: [0, 0.95, 0],
              scale: [0.5, 1.3, 0.2],
              x: [0, idx % 2 === 0 ? -6 : 6, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ right: spark.right, width: spark.size, height: spark.size }}
            className="absolute bottom-4 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7] blur-[0.4px]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PHÍA SAU THẺ BÀI: PHE TRUNG LẬP
 */
function NeutralFactionBackground({ isDead }: { isDead: boolean }) {
  if (isDead) return null;

  return (
    <div className="absolute -inset-x-14 -inset-y-8 sm:-inset-x-20 sm:-inset-y-10 pointer-events-none z-0 overflow-visible">
      <motion.div
        animate={{
          scale: [0.98, 1.04, 0.98],
          opacity: [0.6, 0.85, 0.6],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[3rem] blur-2xl bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.5)_15%,rgba(14,116,144,0.35)_45%,transparent_85%)]"
      />
    </div>
  );
}

export function CharacterCard({
  role,
  playerStatus = 'ALIVE',
  playerName,
  isOwner = false,
  size = 'tarot',
  allowFlip = true,
  className = "",
  onInspect,
  showStatusBadge = true,
}: CharacterCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });
  const [showAbilityPreview, setShowAbilityPreview] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!role) {
    return (
      <div className={`relative rounded-2xl border-2 border-dashed border-amber-500/30 bg-gray-950/60 p-6 flex flex-col items-center justify-center text-center text-gray-500 ${className}`}>
        <ChocolateFrogLogo className="w-12 h-12 text-amber-500/30 mb-3 animate-pulse" />
        <span className="font-serif text-sm tracking-widest uppercase text-amber-400/60">Chưa Mở Hộp Ếch Nhái Socola</span>
        <p className="text-xs text-gray-500 mt-1">Đang chờ Quản Trò phân phát thẻ bài...</p>
      </div>
    );
  }

  const isDeathEaters = role.faction === 'DEATH_EATERS';
  const isDead = playerStatus === 'DEAD';
  const isInjured = playerStatus === 'INJURED';

  // 3D Parallax Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (size === 'mini' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, active: false });
  };

  // Border theming & In-card glow
  const factionBorder = isDeathEaters
    ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.45)]'
    : 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)]';

  const rotateX = mousePos.active ? -mousePos.y * 12 : 0;
  const rotateY = mousePos.active ? mousePos.x * 12 : 0;
  const specularX = mousePos.active ? (mousePos.x + 0.5) * 100 : 50;
  const specularY = mousePos.active ? (mousePos.y + 0.5) * 100 : 50;

  // Render distinctive faction background
  const renderFactionBackground = () => {
    if (isDeathEaters) {
      return <DeathEaterFactionBackground isDead={isDead} size={size} />;
    }
    if (role.faction === 'ORDER_OF_PHOENIX') {
      return <PhoenixFactionBackground isDead={isDead} size={size} />;
    }
    return <NeutralFactionBackground isDead={isDead} />;
  };

  // ================= 1. MINI VERSION (Player radar grid / lists) =================
  if (size === 'mini') {
    return (
      <div 
        className={`relative overflow-hidden rounded-xl border-2 p-2.5 transition-all select-none group ${
          isDead 
            ? 'bg-red-950/20 border-red-900/40 opacity-70 grayscale' 
            : isDeathEaters 
              ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]' 
              : 'bg-red-950/30 border-amber-500/50 hover:border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-2.5 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Chocolate Frog Thumbnail */}
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-amber-400/60 shrink-0 bg-black">
              {role.image ? (
                <img 
                  src={role.image} 
                  alt={role.name}
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105 duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <BadgeIcon badge={role.badge} className="w-5 h-5 text-amber-400" />
                </div>
              )}
            </div>

            <div className="truncate">
              <span className={`block font-serif font-bold text-sm truncate ${isDead ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                {playerName || role.name}
              </span>
              <span className={`text-[10px] block font-mono uppercase tracking-wider ${isDeathEaters ? 'text-emerald-400' : 'text-amber-400'}`}>
                {role.title?.split('·')[0] || role.name}
              </span>
            </div>
          </div>

          {showStatusBadge && (
            <div>
              {isDead ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/90 px-2 py-0.5 rounded border border-red-800">
                  <Skull size={10} /> Tử trận
                </span>
              ) : isInjured ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800">
                  <AlertCircle size={10} /> Trọng thương
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800">
                  <Activity size={10} /> Sống
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= 2. FULL CHOCOLATE FROG CARD (Tarot & Compact) =================
  return (
    <div 
      className={`relative isolate select-none group w-full mx-auto ${
        size === 'compact' ? 'max-w-[280px] sm:max-w-[300px]' : 'max-w-[280px] sm:max-w-sm'
      } ${className}`}
      style={{ perspective: '1200px' }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ================= DISTINCTIVE FACTION BACKGROUND FX (PHÍA SAU THẺ BÀI) ================= */}
      {renderFactionBackground()}

      {/* The 3D Interactive Card Itself */}
      <motion.div
        animate={{
          rotateY: isFlipped ? 180 : rotateY,
          rotateX: isFlipped ? 0 : rotateX,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative z-10 w-full rounded-3xl cursor-pointer aspect-[3/4]"
      >
        {/* ================= CARD FRONT: CHOCOLATE FROG MOVING PORTRAIT ================= */}
        <div
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className={`absolute inset-0 rounded-3xl border-3 ${factionBorder} bg-gray-950 p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFlipped ? 'pointer-events-none z-0' : 'pointer-events-auto z-20'
          }`}
          onClick={() => {
            if (allowFlip && !showAbilityPreview) setIsFlipped(true);
          }}
        >
          {/* Main Chocolate Frog Portrait Image Container */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex flex-col justify-between">
            {role.image ? (
              <img
                src={role.image}
                alt={role.name}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105 ${
                  isDead ? 'grayscale contrast-125' : ''
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#181124] to-[#08050e] flex items-center justify-center">
                <BadgeIcon badge={role.badge} className="w-24 h-24 text-amber-400" />
              </div>
            )}


            {/* Top Ribbon: Chocolate Frog Brand & Faction Badge */}
            <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                <ChocolateFrogLogo className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-serif text-[10px] font-black tracking-widest text-amber-300 uppercase">
                  THẺ ẾCH NHÁI SOCOLA
                </span>
              </div>

              {/* Faction Badge */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif font-bold uppercase backdrop-blur-md border ${
                isDeathEaters 
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : 'bg-red-950/90 text-amber-200 border-amber-500/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              }`}>
                {isDeathEaters ? <DarkMarkCrest className="w-3.5 h-3.5 animate-pulse" /> : <PhoenixCrest className="w-3.5 h-3.5 animate-pulse" />}
                <span>{isDeathEaters ? 'Tử Thần' : 'Phượng Hoàng'}</span>
              </div>
            </div>

            {/* Fallen Status Overlay */}
            {isDead && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-red-400 font-serif font-black z-30">
                <Skull className="w-16 h-16 mb-2 text-red-500 animate-pulse" />
                <span className="text-xl tracking-widest uppercase text-red-400">ĐÃ TỬ TRẬN</span>
                <span className="text-xs font-mono text-gray-400 mt-1">Trong chuyến bay Bảy Potter</span>
              </div>
            )}

            {/* Bottom Floating Bar: Player Binding + Quick Flip & Inspect */}
            <div className="relative z-10 p-2 sm:p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8">
              
              {/* Bound Player Name */}
              {playerName && (
                <div className="text-center mb-2">
                  <span className="text-[11px] font-serif tracking-wider text-amber-300 bg-black/85 backdrop-blur-sm px-3 py-0.5 rounded-full border border-amber-500/50">
                    Phù thủy: <strong>{playerName}</strong> {isOwner && '(Bạn)'}
                  </span>
                </div>
              )}

              {/* Expandable Quick Ability Drawer */}
              <AnimatePresence>
                {showAbilityPreview && (
                  <motion.div 
                    key="ability-preview-drawer"
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 rounded-xl bg-[#26150c]/95 border border-[#bd8436] text-[#f5eedb] text-xs font-lora leading-relaxed mb-2 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between font-bold text-[#ffd88f] uppercase text-[10px] mb-1 font-serif">
                      <div className="flex items-center gap-1">
                        <Wand2 size={12} /> {role.name} · Quyền Năng:
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowAbilityPreview(false)}
                        className="text-[#ebdcb0]/60 hover:text-[#ffd88f] text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="line-clamp-4">{role.ability || role.description}</p>
                    {role.tacticalTip && (
                      <p className="text-[10px] text-[#ebdcb0]/80 italic mt-1.5 pt-1.5 border-t border-[#bd8436]/30">
                        💡 {role.tacticalTip}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Control Action Buttons HUD */}
              <div 
                className="flex items-center justify-between gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-amber-500/40"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAbilityPreview(!showAbilityPreview);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[11px] font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen size={12} />
                  <span>{showAbilityPreview ? 'Đóng' : 'Năng lực'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {allowFlip && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(!isFlipped);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-gray-950 font-serif font-black text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCw size={12} />
                      <span>Lật mặt sau</span>
                    </button>
                  )}

                  {onInspect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect();
                      }}
                      title="Phóng to thẻ bài"
                      className="p-1.5 rounded-lg bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 transition-colors cursor-pointer"
                    >
                      <Maximize2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CARD BACK: CHOCOLATE FROG BIOGRAPHY & RULES ================= */}
        <div
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #24150c 0%, #1a0e07 50%, #100803 100%)',
          }}
          className={`absolute inset-0 rounded-3xl border-3 ${factionBorder} p-3 sm:p-4 flex flex-col justify-between overflow-hidden cursor-pointer ${
            isFlipped ? 'pointer-events-auto z-20' : 'pointer-events-none z-0'
          }`}
          onClick={() => setIsFlipped(false)}
        >
          {/* Corner Filigrees */}
          <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
          <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 left-2 w-6 h-6 text-[#bd8436] -scale-y-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

          {/* Top Header: Chocolate Frog Brand Seal */}
          <div className="relative z-10 text-center pt-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChocolateFrogLogo className="w-4 h-4 text-[#ffd88f] animate-bounce" />
              <span className="font-serif text-xs font-bold tracking-widest uppercase text-[#ffd88f]">
                THẺ PHÙ THỦY NỔI TIẾNG
              </span>
              <ChocolateFrogLogo className="w-4 h-4 text-[#ffd88f] animate-bounce" />
            </div>
            <h3 className="font-title font-black text-2xl sm:text-3xl text-[#ffd88f] tracking-wide">
              {role.name}
            </h3>
            <p className="text-[11px] font-lora italic text-[#ebdcb0]">
              {role.title || 'Nhân vật huyền thoại'}
            </p>
          </div>

          {/* Biography & Lore Box */}
          <div className="relative z-10 my-1 px-2">
            <p className="text-xs font-lora italic text-[#ebdcb0]/90 text-center leading-relaxed">
              "{role.description}"
            </p>
          </div>

          {/* Aged Parchment Ability Scroll with Wax Seal */}
          <div className="relative z-10 my-1">
            <div 
              className="relative rounded-2xl p-3.5 hpvn-parchment overflow-hidden font-serif"
            >
              {/* Wax Seal in Corner */}
              <div className="absolute top-1.5 right-1.5 opacity-90 pointer-events-none scale-75 origin-top-right">
                <WaxSeal variant={isDeathEaters ? 'emerald' : 'red'} letter={isDeathEaters ? 'M' : 'P'} size="sm" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-1.5 mb-1.5 pr-8">
                <Wand2 size={14} className="text-[#8c0c0c] shrink-0" />
                <h4 className="font-black text-xs text-[#5a1818] tracking-wide uppercase border-b border-[#8c0c0c]/30 pb-0.5 w-full font-serif">
                  Phép Thuật & Quyền Năng
                </h4>
              </div>

              {/* Ability text */}
              <p className="text-xs sm:text-[13px] leading-relaxed font-semibold text-[#2c1a0e] font-lora">
                {role.ability || role.description}
              </p>

              {/* Tactical Tip */}
              {role.tacticalTip && (
                <div className="mt-2 pt-1.5 border-t border-[#8c622e]/30 flex items-start gap-1 text-[11px] text-[#6d4c1b] italic font-lora">
                  <Sparkles size={12} className="shrink-0 mt-0.5 text-amber-700" />
                  <span><strong>Chiến thuật:</strong> {role.tacticalTip}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer of Back Card: Quote & Re-flip Indicator */}
          <div className="relative z-10 pt-2 border-t border-[#7a5229]/50 flex items-center justify-between px-2 text-xs">
            <span className="text-[10px] font-mono text-[#ffd88f]">
              {role.cardNumber || '№ 07/21'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="text-[11px] font-serif font-bold text-[#ffd88f] hover:text-white flex items-center gap-1.5 bg-[#120803] hover:bg-[#2b170c] px-3 py-1 rounded-full border border-[#7a5229] hover:border-[#bd8436] transition-all active:scale-95 cursor-pointer z-30"
            >
              <RotateCw size={12} className="text-amber-400" />
              <span>Nhấn để lật lại ảnh</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Fullscreen Cinematic Card Inspector Modal
 */
export function CardInspectorModal({
  role,
  isOpen,
  onClose,
}: {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !role) return null;

  return (
    <AnimatePresence>
      <div 
        key="card-inspector-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          key="card-inspector-dialog"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full cursor-default"
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-1 sm:-top-12 sm:right-0 text-white/90 hover:text-white bg-black/85 hover:bg-gray-800 px-3.5 py-1.5 rounded-full text-xs font-mono border border-amber-500/40 transition-all flex items-center gap-1.5 z-40 active:scale-95 cursor-pointer"
          >
            ✕ Đóng chi tiết (Esc)
          </button>

          <CharacterCard
            role={role}
            size="tarot"
            allowFlip={true}
            showStatusBadge={false}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
