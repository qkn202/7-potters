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
 * Arcane Astrological Runic Ring (Vòng tròn pháp trận chiêm tinh cổ ngữ quay chậm phía sau mỗi thẻ)
 */
function ArcaneCardHalo({ faction }: { faction: 'ORDER_OF_PHOENIX' | 'DEATH_EATERS' | 'NEUTRAL' }) {
  const isDeathEaters = faction === 'DEATH_EATERS';
  const strokeColor = isDeathEaters ? '#10b981' : '#d4af37';
  const strokeLight = isDeathEaters ? '#6ee7b7' : '#ffd88f';

  return (
    <motion.svg
      viewBox="0 0 320 320"
      animate={{ rotate: isDeathEaters ? -360 : 360 }}
      transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      className="absolute w-[128%] sm:w-[138%] h-auto pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500 overflow-visible select-none"
    >
      {/* Outer celestial dashed rings */}
      <circle cx="160" cy="160" r="150" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 7" opacity="0.5" />
      <circle cx="160" cy="160" r="142" fill="none" stroke={strokeColor} strokeWidth="0.75" opacity="0.3" />

      {/* 12 Astrological tick marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={`tick-${deg}`}
          x1="160"
          y1="12"
          x2="160"
          y2={deg % 90 === 0 ? "24" : "18"}
          stroke={deg % 90 === 0 ? strokeLight : strokeColor}
          strokeWidth={deg % 90 === 0 ? "1.5" : "0.75"}
          transform={`rotate(${deg} 160 160)`}
          opacity="0.65"
        />
      ))}

      {/* Mid decorative arcane rings */}
      <circle cx="160" cy="160" r="122" fill="none" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="8 4 2 4" opacity="0.45" />
      <circle cx="160" cy="160" r="102" fill="none" stroke={strokeColor} strokeWidth="0.6" strokeDasharray="1 5" opacity="0.3" />

      {/* Cardinal diamond glyphs */}
      {[0, 90, 180, 270].map((deg) => (
        <polygon
          key={`diamond-${deg}`}
          points="160,25 163.5,31 160,37 156.5,31"
          fill={strokeLight}
          transform={`rotate(${deg} 160 160)`}
          opacity="0.8"
        />
      ))}
    </motion.svg>
  );
}

/**
 * PHÍA SAU THẺ BÀI: PHE HỘI PHƯỢNG HOÀNG (HPH)
 * Hào quang vàng hoàng gia dịu êm, vòng cổ ngữ ma pháp và đôi cánh phượng hoàng vector siêu nét
 */
function PhoenixFactionBackground({ isDead, size }: { isDead: boolean; size?: 'tarot' | 'compact' | 'mini' }) {
  if (isDead) return null;

  return (
    <div className="absolute -inset-2 pointer-events-none -z-10 flex items-center justify-center overflow-visible select-none">
      {/* 1. Subtle, Soft Diffused Ambient Rim Glow (Dịu êm, không bị chói đục như neon cũ) */}
      <motion.div
        animate={{
          scale: [0.98, 1.02, 0.98],
          opacity: [0.65, 0.85, 0.65],
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2.5rem] blur-lg bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.18)_20%,rgba(180,83,9,0.08)_55%,transparent_80%)]"
      />

      {/* 2. Arcane Astrological Ring Halo (Vòng tròn chiêm tinh xoay nhẹ huyền bí) */}
      <ArcaneCardHalo faction="ORDER_OF_PHOENIX" />

      {/* 3. Symmetrical Blazing Phoenix Fire Wings SVG (Chế độ Tarot / Phóng to: Vector sắc nét tuyệt đối) */}
      {size === 'tarot' && (
        <motion.svg
          viewBox="0 0 500 400"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            scale: [0.99, 1.02, 0.99],
            opacity: [0.85, 0.98, 0.85],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[165%] sm:w-[180%] h-auto max-w-none overflow-visible pointer-events-none"
        >
          <defs>
            <linearGradient id="phoenixWingGrad" x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#fde047" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#dc2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="phoenixInnerGrad" x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.25" />
            </linearGradient>

            {/* Left Wing Path */}
            <path
              id="phLeftWing"
              d="M 180 200
                 C 140 180, 80 130, 40 80
                 C 25 105, 55 140, 85 165
                 C 50 175, 20 200, 30 220
                 C 55 225, 95 225, 135 220
                 C 90 240, 45 270, 50 295
                 C 75 300, 120 285, 155 265
                 C 115 295, 85 335, 95 355
                 C 125 350, 160 310, 185 270 Z"
              fill="url(#phoenixWingGrad)"
            />

            {/* Left Inner Flame Layer */}
            <path
              id="phLeftInner"
              d="M 175 190
                 C 145 170, 100 135, 65 110
                 C 60 125, 85 150, 110 170
                 C 80 180, 55 198, 62 215
                 C 82 218, 115 218, 145 210
                 C 115 225, 80 248, 85 265
                 C 105 270, 135 255, 160 238 Z"
              fill="url(#phoenixInnerGrad)"
            />
          </defs>

          {/* Left Wing */}
          <use href="#phLeftWing" />
          <use href="#phLeftInner" />

          {/* Right Wing (Perfect 100% Mirror reflection across center) */}
          <use href="#phLeftWing" transform="translate(500, 0) scale(-1, 1)" />
          <use href="#phLeftInner" transform="translate(500, 0) scale(-1, 1)" />
        </motion.svg>
      )}

      {/* 4. Delicate Rising Golden Micro-Embers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[
          { left: '4px', delay: 0, duration: 3.2, size: 2.5 },
          { left: '18px', delay: 1.2, duration: 4.0, size: 2 },
          { left: '32px', delay: 2.1, duration: 3.5, size: 3 },
        ].map((spark, idx) => (
          <motion.div
            key={`ph-micro-spark-l-${idx}`}
            initial={{ y: '90%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['90%', '25%', '-20%'],
              opacity: [0, 0.85, 0],
              scale: [0.5, 1.2, 0.2],
              x: [0, idx % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ left: spark.left, width: spark.size, height: spark.size }}
            className="absolute bottom-6 rounded-full bg-amber-200 blur-[0.2px]"
          />
        ))}

        {[
          { right: '4px', delay: 0.6, duration: 3.4, size: 2.5 },
          { right: '18px', delay: 1.8, duration: 4.2, size: 2 },
          { right: '32px', delay: 2.5, duration: 3.6, size: 3 },
        ].map((spark, idx) => (
          <motion.div
            key={`ph-micro-spark-r-${idx}`}
            initial={{ y: '90%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['90%', '25%', '-20%'],
              opacity: [0, 0.85, 0],
              scale: [0.5, 1.2, 0.2],
              x: [0, idx % 2 === 0 ? -5 : 5, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ right: spark.right, width: spark.size, height: spark.size }}
            className="absolute bottom-6 rounded-full bg-amber-200 blur-[0.2px]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PHÍA SAU THẺ BÀI: PHE TỬ THẦN THỰC TỬ (4T)
 * Hào quang Lục Bảo Slytherin trầm mặc, vòng cổ ngữ hắc ám và cánh khói mãng xà vector siêu nét
 */
function DeathEaterFactionBackground({ isDead, size }: { isDead: boolean; size?: 'tarot' | 'compact' | 'mini' }) {
  if (isDead) return null;

  return (
    <div className="absolute -inset-2 pointer-events-none -z-10 flex items-center justify-center overflow-visible select-none">
      {/* 1. Subtle, Soft Diffused Emerald Rim Glow */}
      <motion.div
        animate={{
          scale: [0.98, 1.02, 0.98],
          opacity: [0.65, 0.85, 0.65],
        }}
        transition={{
          duration: 4.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2.5rem] blur-lg bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16)_20%,rgba(5,150,105,0.08)_55%,transparent_80%)]"
      />

      {/* 2. Arcane Astrological Ring Halo (Vòng tròn chiêm tinh xoay ngược) */}
      <ArcaneCardHalo faction="DEATH_EATERS" />

      {/* 3. Symmetrical Dark Magic Serpent Smoke Wings SVG (Chế độ Tarot: Vector sắc nét) */}
      {size === 'tarot' && (
        <motion.svg
          viewBox="0 0 500 400"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            scale: [0.99, 1.02, 0.99],
            opacity: [0.85, 0.98, 0.85],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[165%] sm:w-[180%] h-auto max-w-none overflow-visible pointer-events-none"
        >
          <defs>
            <linearGradient id="deWingGrad" x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#6ee7b7" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#047857" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="deInnerGrad" x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.25" />
            </linearGradient>

            {/* Left Serpent Wing Path */}
            <path
              id="deLeftWing"
              d="M 180 200
                 C 140 170, 75 120, 35 75
                 C 25 100, 60 135, 90 160
                 C 45 170, 15 195, 25 220
                 C 55 230, 100 225, 140 215
                 C 85 240, 40 270, 45 295
                 C 70 305, 120 290, 160 265
                 C 110 295, 80 340, 95 360
                 C 130 350, 165 305, 185 265 Z"
              fill="url(#deWingGrad)"
            />

            {/* Left Inner Serpent Smoke */}
            <path
              id="deLeftInner"
              d="M 175 190
                 C 145 165, 95 128, 60 98
                 C 55 115, 80 142, 105 165
                 C 75 175, 48 195, 56 212
                 C 78 220, 115 218, 145 208
                 C 112 225, 75 250, 82 268
                 C 102 275, 135 258, 160 238 Z"
              fill="url(#deInnerGrad)"
            />
          </defs>

          {/* Left Wing */}
          <use href="#deLeftWing" />
          <use href="#deLeftInner" />

          {/* Right Wing (Perfect 100% Mirror reflection across center) */}
          <use href="#deLeftWing" transform="translate(500, 0) scale(-1, 1)" />
          <use href="#deLeftInner" transform="translate(500, 0) scale(-1, 1)" />
        </motion.svg>
      )}

      {/* 4. Ghostly Emerald Poison Wisps */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {[
          { left: '4px', delay: 0.2, duration: 3.5, size: 2.5 },
          { left: '18px', delay: 1.4, duration: 4.2, size: 2 },
          { left: '32px', delay: 2.3, duration: 3.7, size: 3 },
        ].map((spark, idx) => (
          <motion.div
            key={`jade-micro-wisp-l-${idx}`}
            initial={{ y: '90%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['90%', '25%', '-20%'],
              opacity: [0, 0.85, 0],
              scale: [0.5, 1.2, 0.2],
              x: [0, idx % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ left: spark.left, width: spark.size, height: spark.size }}
            className="absolute bottom-6 rounded-full bg-emerald-300 blur-[0.2px]"
          />
        ))}

        {[
          { right: '4px', delay: 0.8, duration: 3.6, size: 2.5 },
          { right: '18px', delay: 1.9, duration: 4.3, size: 2 },
          { right: '32px', delay: 2.7, duration: 3.8, size: 3 },
        ].map((spark, idx) => (
          <motion.div
            key={`jade-micro-wisp-r-${idx}`}
            initial={{ y: '90%', opacity: 0, scale: 0.5 }}
            animate={{
              y: ['90%', '25%', '-20%'],
              opacity: [0, 0.85, 0],
              scale: [0.5, 1.2, 0.2],
              x: [0, idx % 2 === 0 ? -5 : 5, 0],
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ right: spark.right, width: spark.size, height: spark.size }}
            className="absolute bottom-6 rounded-full bg-emerald-300 blur-[0.2px]"
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
    <div className="absolute -inset-2 pointer-events-none -z-10 flex items-center justify-center overflow-visible select-none">
      <motion.div
        animate={{
          scale: [0.98, 1.02, 0.98],
          opacity: [0.5, 0.75, 0.5],
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[2.5rem] blur-lg bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.15)_20%,rgba(14,116,144,0.08)_55%,transparent_80%)]"
      />
      <ArcaneCardHalo faction="NEUTRAL" />
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

  // Border theming & In-card metallic glow
  const factionBorder = isDeathEaters
    ? 'border-[#10b981]/70 hover:border-[#34d399] transition-colors'
    : 'border-[#bd8436] hover:border-[#ffd88f] transition-colors';

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
          className={`absolute inset-0 rounded-3xl border-2 ${factionBorder} bg-[#140b05] p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFlipped ? 'pointer-events-none z-0' : 'pointer-events-auto z-20'
          }`}
          onClick={() => {
            if (allowFlip && !showAbilityPreview) setIsFlipped(true);
          }}
        >
          {/* Main Chocolate Frog Portrait Image Container */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex flex-col justify-between">
            {/* Subtle gilded inner hairline border for collector card feel */}
            <div className={`pointer-events-none absolute inset-1 rounded-xl border ${isDeathEaters ? 'border-emerald-400/25' : 'border-[#ffd88f]/25'} z-20`} />

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
          className={`absolute inset-0 rounded-3xl border-2 ${factionBorder} p-3 sm:p-4 flex flex-col justify-between overflow-hidden cursor-pointer ${
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
