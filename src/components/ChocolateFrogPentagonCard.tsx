"use client";

import React from 'react';

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
 * Exact recreation of Harry Potter Chocolate Frog Tarot Cards from the game mockup
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
      className={`relative w-full aspect-[1.38/1] rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none group ${
        isSelected
          ? 'bg-[#101b2d] z-20'
          : isDead
          ? 'bg-[#070b12]/80 opacity-55 grayscale border border-[#141e2e]'
          : isFellowDeathEater
          ? 'bg-[#081814]/90 border border-emerald-500/60 hover:border-emerald-400'
          : 'bg-[#0b1322]/90 border border-[#1a293d] hover:border-[#2d4566]'
      } ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. GLOWING GOLDEN TARGETING RETICLE (WHEN SELECTED)       */}
      {/* Exact pixel-perfect match of Albus Dumbledore in mockup:  */}
      {/* 4 outer arrows, full crosshairs, vintage corner brackets, */}
      {/* and center circular aiming reticle                        */}
      {/* ========================================================= */}
      {isSelected && (
        <div className="absolute -inset-1 sm:-inset-1.5 pointer-events-none z-30 overflow-visible flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible text-[#ffd84d] drop-shadow-[0_0_12px_rgba(255,216,77,0.95)]"
            viewBox="0 0 200 145"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id={`reticleGlow-${clipId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Golden Reticle Box with Rounded Corners */}
            <rect
              x="16"
              y="12"
              width="168"
              height="121"
              rx="12"
              ry="12"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2.2"
              filter={`url(#reticleGlow-${clipId})`}
            />

            {/* 4 Ornate Victorian Corner Flourish Brackets */}
            {/* Top-Left */}
            <path
              d="M 23 28 C 19 20, 23 16, 32 20"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2.2"
            />
            {/* Top-Right */}
            <path
              d="M 177 28 C 181 20, 177 16, 168 20"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2.2"
            />
            {/* Bottom-Left */}
            <path
              d="M 23 117 C 19 125, 23 129, 32 125"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2.2"
            />
            {/* Bottom-Right */}
            <path
              d="M 177 117 C 181 125, 177 129, 168 125"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2.2"
            />

            {/* Continuous Horizontal Crosshair Line */}
            <line
              x1="-3"
              y1="72.5"
              x2="203"
              y2="72.5"
              stroke="#ffd84d"
              strokeWidth="2"
              filter={`url(#reticleGlow-${clipId})`}
            />

            {/* Continuous Vertical Crosshair Line */}
            <line
              x1="100"
              y1="-3"
              x2="100"
              y2="148"
              stroke="#ffd84d"
              strokeWidth="2"
              filter={`url(#reticleGlow-${clipId})`}
            />

            {/* Top Arrowhead (Pointing UP) */}
            <polygon points="100,-8 91,6 109,6" fill="#ffd84d" />

            {/* Bottom Arrowhead (Pointing DOWN) */}
            <polygon points="100,153 91,139 109,139" fill="#ffd84d" />

            {/* Left Arrowhead (Pointing LEFT) */}
            <polygon points="-8,72.5 6,63.5 6,81.5" fill="#ffd84d" />

            {/* Right Arrowhead (Pointing RIGHT) */}
            <polygon points="208,72.5 194,63.5 194,81.5" fill="#ffd84d" />

            {/* Center Circular Reticle Target */}
            <circle
              cx="100"
              cy="72.5"
              r="13"
              fill="none"
              stroke="#ffd84d"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
            <circle cx="100" cy="72.5" r="3" fill="#ffd84d" />

            {/* 4 Small Cardinal Ticks around Center Ring */}
            <line x1="100" y1="54" x2="100" y2="58" stroke="#ffd84d" strokeWidth="2.5" />
            <line x1="100" y1="87" x2="100" y2="91" stroke="#ffd84d" strokeWidth="2.5" />
            <line x1="81.5" y1="72.5" x2="85.5" y2="72.5" stroke="#ffd84d" strokeWidth="2.5" />
            <line x1="114.5" y1="72.5" x2="118.5" y2="72.5" stroke="#ffd84d" strokeWidth="2.5" />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CARD CONTENT: PENTAGON + ATTACHED BADGE                */}
      {/* ========================================================= */}
      <div className="relative w-full h-full flex items-center justify-center px-2">
        {/* Pentagonal Chocolate Frog Card Frame */}
        <div className={`relative h-[86%] aspect-square flex items-center justify-center shrink-0 transition-transform duration-200 ${
          isSelected ? 'scale-105' : 'group-hover:scale-105'
        }`}>
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              {/* Symmetrical Upward Pentagonal Clip Path */}
              <clipPath id={`pentagon-clip-${clipId}`}>
                <polygon points="50,6 94,38 77,94 23,94 6,38" />
              </clipPath>

              {/* Rich Multi-tone Metallic Gold Gradient */}
              <linearGradient id={`goldBevel-${clipId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff1a8" />
                <stop offset="30%" stopColor="#d4af37" />
                <stop offset="60%" stopColor="#854d0e" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>

              {/* Slytherin Emerald Gradient */}
              <linearGradient id={`emeraldBevel-${clipId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="35%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>

              {/* Dark Vignette Inner Shadow */}
              <radialGradient id={`cardVignette-${clipId}`} cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
              </radialGradient>
            </defs>

            {/* Character Portrait Clipped into Pentagon */}
            <image
              href={image}
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#pentagon-clip-${clipId})`}
              className={`transition-all duration-200 ${isDead ? 'grayscale' : ''}`}
            />

            {/* Vignette Shadow Overlay */}
            <polygon
              points="50,6 94,38 77,94 23,94 6,38"
              fill={`url(#cardVignette-${clipId})`}
            />

            {/* Gilded Inner Filigree Outline */}
            <polygon
              points="50,12 88,39 73,88 27,88 12,39"
              fill="none"
              stroke={isFellowDeathEater ? `url(#emeraldBevel-${clipId})` : `url(#goldBevel-${clipId})`}
              strokeWidth="1.2"
              strokeDasharray="3 1.5"
              opacity="0.85"
            />

            {/* Gilded Outer Beveled Bezel */}
            <polygon
              points="50,6 94,38 77,94 23,94 6,38"
              fill="none"
              stroke={isFellowDeathEater ? `url(#emeraldBevel-${clipId})` : `url(#goldBevel-${clipId})`}
              strokeWidth="3.2"
              className={isSelected ? "drop-shadow-[0_0_6px_rgba(255,216,77,0.9)]" : ""}
            />

            {/* 5 Corner Diamond Studs */}
            {[
              { cx: 50, cy: 6 },
              { cx: 94, cy: 38 },
              { cx: 77, cy: 94 },
              { cx: 23, cy: 94 },
              { cx: 6, cy: 38 },
            ].map((pt, i) => (
              <circle
                key={i}
                cx={pt.cx}
                cy={pt.cy}
                r={2}
                fill={isFellowDeathEater ? "#6ee7b7" : "#ffd88f"}
                stroke="#1a0e07"
                strokeWidth="0.8"
              />
            ))}
          </svg>

          {/* Skull Overlay if Dead */}
          {isDead && (
            <div 
              style={{ clipPath: 'polygon(50% 6%, 94% 38%, 77% 94%, 23% 94%, 6% 38%)' }}
              className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-red-500 z-10"
            >
              <span className="text-xl">💀</span>
            </div>
          )}
        </div>

        {/* Attached Status Badge on the Right (Hermione's 🛡️ Hộ tống) */}
        {statusBadge && (
          <div className="ml-2 shrink-0 z-20">
            {statusBadge}
          </div>
        )}
      </div>

      {/* Subtle Player Name Tag at Bottom Edge */}
      <div className="absolute bottom-1 left-2 right-2 text-center pointer-events-none">
        <span className={`text-[10px] font-serif font-bold tracking-wide truncate block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
          isDead ? 'line-through text-slate-500' : isSelected ? 'text-amber-300' : 'text-slate-300/80'
        }`}>
          {name}
        </span>
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
    : '#6e1111'; // Gryffindor Royal Crimson

  return (
    <svg viewBox="0 0 100 120" className={className}>
      <defs>
        <linearGradient id="crestGoldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <radialGradient id="crestInnerLight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* Medieval Shield Body */}
      <path
        d="M10 10 H90 V65 C90 95 50 115 50 115 C50 115 10 95 10 65 Z"
        fill={shieldBg}
        stroke="url(#crestGoldBorder)"
        strokeWidth="3.5"
        className="drop-shadow-lg"
      />

      {/* Inner Shield Glow */}
      <path
        d="M15 15 H85 V64 C85 90 50 108 50 108 C50 108 15 90 15 64 Z"
        fill="url(#crestInnerLight)"
        stroke="url(#crestGoldBorder)"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Gryffindor Rampant Lion Emblem (Gold) */}
      {!isSlytherin && !isRavenclaw && !isHufflepuff && (
        <path
          d="M52 28 C55 23 62 23 65 26 C68 29 66 33 63 34 C66 36 70 40 68 45 C65 50 58 50 56 46 C56 53 62 58 65 63 C68 68 65 76 60 80 C55 84 48 83 45 78 C40 83 32 83 30 76 C28 68 34 63 38 58 C32 53 28 46 30 40 C32 34 38 33 42 36 C45 30 48 28 52 28 Z"
          fill="#ffd88f"
          stroke="#b45309"
          strokeWidth="0.8"
        />
      )}

      {/* Slytherin Serpent Emblem (Silver-Emerald) */}
      {isSlytherin && (
        <path
          d="M50 25 C60 25 68 32 68 40 C68 50 45 55 45 65 C45 75 60 78 65 72 C68 68 72 72 68 78 C62 86 42 86 36 78 C30 70 38 60 42 55 C46 50 58 45 58 38 C58 32 52 28 46 30 Z"
          fill="#d1fae5"
          stroke="#047857"
          strokeWidth="0.8"
        />
      )}
    </svg>
  );
}
