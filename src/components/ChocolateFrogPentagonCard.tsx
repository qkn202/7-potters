"use client";

import React from 'react';
import Image from 'next/image';

interface PentagonCardProps {
  image: string;
  name: string;
  roleName?: string;
  isSelected?: boolean;
  isFellowDeathEater?: boolean;
  isDead?: boolean;
  statusBadge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Authentic Pentagonal Chocolate Frog Card
 * Exact recreation of Harry Potter Chocolate Frog Tarot Cards
 */
export function ChocolateFrogPentagonCard({
  image,
  name,
  roleName,
  isSelected = false,
  isFellowDeathEater = false,
  isDead = false,
  statusBadge,
  onClick,
  className = "",
}: PentagonCardProps) {
  const clipId = React.useId().replace(/:/g, '');

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-[#0c1322]/85 border transition-all duration-300 p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer select-none group min-h-[145px] sm:min-h-[160px] ${
        isSelected
          ? 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.35)] bg-[#121c2e]'
          : isFellowDeathEater
          ? 'border-emerald-500/70 hover:border-emerald-400 bg-[#091a18]/90'
          : isDead
          ? 'border-[#1e2a3a]/60 bg-[#080d16]/70 opacity-60 grayscale'
          : 'border-[#1b273b] hover:border-[#3b537a] bg-[#0c1322]/85'
      } ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. RETICLE TARGETING CROSSHAIR OVERLAY (WHEN SELECTED)    */}
      {/* Exact match of user's screenshot: 4 arrows, continuous crosshairs, corner flourishes & center target ring */}
      {/* ========================================================= */}
      {isSelected && (
        <div className="absolute -inset-2.5 pointer-events-none z-30 flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible text-[#ffd88f] drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]"
            viewBox="0 0 200 150"
            preserveAspectRatio="none"
          >
            {/* Outer Golden Reticle Box */}
            <rect
              x="18"
              y="16"
              width="164"
              height="118"
              rx="12"
              ry="12"
              fill="none"
              stroke="#ffd88f"
              strokeWidth="2.2"
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            />

            {/* 4 Ornate Victorian Corner Flourishes matching screenshot */}
            <path d="M 26 34 C 20 25, 25 20, 34 26" fill="none" stroke="#ffd88f" strokeWidth="2" />
            <path d="M 174 34 C 180 25, 175 20, 166 26" fill="none" stroke="#ffd88f" strokeWidth="2" />
            <path d="M 26 116 C 20 125, 25 130, 34 124" fill="none" stroke="#ffd88f" strokeWidth="2" />
            <path d="M 174 116 C 180 125, 175 130, 166 124" fill="none" stroke="#ffd88f" strokeWidth="2" />

            {/* Continuous Horizontal Crosshair Line */}
            <line x1="0" y1="75" x2="200" y2="75" stroke="#ffd88f" strokeWidth="2" />

            {/* Continuous Vertical Crosshair Line */}
            <line x1="100" y1="0" x2="100" y2="150" stroke="#ffd88f" strokeWidth="2" />

            {/* Top Arrowhead (Pointing Up) */}
            <polygon points="100,-4 92,10 108,10" fill="#ffd88f" />

            {/* Bottom Arrowhead (Pointing Down) */}
            <polygon points="100,154 92,140 108,140" fill="#ffd88f" />

            {/* Left Arrowhead (Pointing Left) */}
            <polygon points="-4,75 10,67 10,83" fill="#ffd88f" />

            {/* Right Arrowhead (Pointing Right) */}
            <polygon points="204,75 190,67 190,83" fill="#ffd88f" />

            {/* Center Circular Reticle Target */}
            <circle cx="100" cy="75" r="14" fill="none" stroke="#ffd88f" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="100" cy="75" r="3.5" fill="#ffd88f" />
            
            {/* Small Cardinal Target Ticks */}
            <line x1="100" y1="56" x2="100" y2="60" stroke="#ffd88f" strokeWidth="2.5" />
            <line x1="100" y1="90" x2="100" y2="94" stroke="#ffd88f" strokeWidth="2.5" />
            <line x1="81" y1="75" x2="85" y2="75" stroke="#ffd88f" strokeWidth="2.5" />
            <line x1="115" y1="75" x2="119" y2="75" stroke="#ffd88f" strokeWidth="2.5" />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PENTAGONAL CHOCOLATE FROG CARD CONTAINER               */}
      {/* ========================================================= */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 120 120"
          className={`w-full h-full overflow-visible transition-transform duration-300 ${
            isSelected ? 'scale-105' : 'group-hover:scale-105'
          }`}
        >
          <defs>
            {/* Pentagonal Clip Path */}
            <clipPath id={`pentagon-clip-${clipId}`}>
              <polygon points="60,6 112,44 93,108 27,108 8,44" />
            </clipPath>

            {/* Gold Metallic Border Gradient */}
            <linearGradient id={`goldBorder-${clipId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Emerald Slytherin Border Gradient */}
            <linearGradient id={`emeraldBorder-${clipId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Clipped Character Portrait Image */}
          <image
            href={image}
            width="120"
            height="120"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#pentagon-clip-${clipId})`}
            className={`transition-all duration-300 ${isDead ? 'grayscale' : ''}`}
          />

          {/* Dark Vignette / Shadow Overlay Inside Pentagon */}
          <polygon
            points="60,6 112,44 93,108 27,108 8,44"
            fill="none"
            stroke="black"
            strokeWidth="3"
            opacity="0.4"
          />

          {/* Gilded Inner Filigree Outline */}
          <polygon
            points="60,11 107,45 90,103 30,103 13,45"
            fill="none"
            stroke={isFellowDeathEater ? `url(#emeraldBorder-${clipId})` : `url(#goldBorder-${clipId})`}
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity={isSelected ? "0.95" : "0.75"}
          />

          {/* Gilded Outer Beveled Pentagon Frame */}
          <polygon
            points="60,5 113,44 94,109 26,109 7,44"
            fill="none"
            stroke={isFellowDeathEater ? `url(#emeraldBorder-${clipId})` : `url(#goldBorder-${clipId})`}
            strokeWidth={isSelected ? "3.5" : "2.8"}
            className={isSelected ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" : ""}
          />

          {/* 5 Corner Diamond Studs */}
          {[
            { cx: 60, cy: 5 },
            { cx: 113, cy: 44 },
            { cx: 94, cy: 109 },
            { cx: 26, cy: 109 },
            { cx: 7, cy: 44 },
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r={isSelected ? 2.5 : 2}
              fill={isFellowDeathEater ? "#6ee7b7" : "#ffd88f"}
              stroke="#1a0e07"
              strokeWidth="0.8"
            />
          ))}
        </svg>

        {/* Dead Grayscale Overlay with Skull */}
        {isDead && (
          <div 
            style={{ clipPath: 'polygon(50% 5%, 94% 37%, 78% 91%, 22% 91%, 6% 37%)' }}
            className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-red-500 z-10"
          >
            <span className="text-xl">💀</span>
            <span className="text-[9px] font-serif font-black uppercase text-red-300 tracking-wider">Tử trận</span>
          </div>
        )}

        {/* STATUS BADGE ATTACHED (e.g. 🛡️ Hộ tống) */}
        {statusBadge && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20">
            {statusBadge}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. PLAYER & ROLE NAME CAPTION                             */}
      {/* ========================================================= */}
      <div className="mt-2 text-center w-full px-1">
        <span className={`font-serif font-bold text-xs sm:text-sm truncate block ${
          isDead ? 'line-through text-slate-500' : isSelected ? 'text-amber-300' : 'text-slate-200'
        }`}>
          {name}
        </span>
        {roleName && (
          <span className="text-[10px] font-mono text-amber-400/80 truncate block">
            {roleName}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Gryffindor Lion / Hogwarts House Crest Shield
 * Matches the golden lion shield on the right of the Hero Passport
 */
export function HouseCrestShield({
  house = 'GRYFFINDOR',
  className = "w-11 h-13",
}: {
  house?: string;
  className?: string;
}) {
  const isSlytherin = house === 'SLYTHERIN';
  const isRavenclaw = house === 'RAVENCLAW';
  const isHufflepuff = house === 'HUFFLEPUFF';

  const shieldBg = isSlytherin
    ? '#073623'
    : isRavenclaw
    ? '#0d2d4d'
    : isHufflepuff
    ? '#8a6508'
    : '#741515'; // Gryffindor Red

  const borderGold = '#d4af37';

  return (
    <svg viewBox="0 0 100 120" className={className}>
      <defs>
        <linearGradient id="shieldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <radialGradient id="shieldInnerGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* Medieval Shield Body */}
      <path
        d="M10 10 H90 V65 C90 95 50 115 50 115 C50 115 10 95 10 65 Z"
        fill={shieldBg}
        stroke="url(#shieldBorder)"
        strokeWidth="4"
        className="drop-shadow-lg"
      />

      {/* Inner Shield Glow */}
      <path
        d="M15 15 H85 V64 C85 90 50 108 50 108 C50 108 15 90 15 64 Z"
        fill="url(#shieldInnerGlow)"
        stroke="url(#shieldBorder)"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Gryffindor Rampant Lion Emblem (Gold) */}
      {!isSlytherin && !isRavenclaw && !isHufflepuff && (
        <path
          d="M52 30 C55 25 62 25 65 28 C68 31 66 35 63 36 C66 38 70 42 68 47 C65 52 58 52 56 48 C56 55 62 60 65 65 C68 70 65 78 60 82 C55 86 48 85 45 80 C40 85 32 85 30 78 C28 70 34 65 38 60 C32 55 28 48 30 42 C32 36 38 35 42 38 C45 32 48 30 52 30 Z"
          fill="#ffd88f"
          stroke="#b45309"
          strokeWidth="1"
        />
      )}

      {/* Slytherin Serpent Emblem (Silver) */}
      {isSlytherin && (
        <path
          d="M50 25 C60 25 68 32 68 40 C68 50 45 55 45 65 C45 75 60 78 65 72 C68 68 72 72 68 78 C62 86 42 86 36 78 C30 70 38 60 42 55 C46 50 58 45 58 38 C58 32 52 28 46 30 Z"
          fill="#d1fae5"
          stroke="#047857"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
