"use client";

import React from 'react';
import Image from 'next/image';
import { CardCornerFlourish } from './ArtAssets';
import { Skull, Target } from 'lucide-react';

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
 * Modern AAA Mobile Character Card (Gilded Gothic Fantasy)
 * Replaces the awkward landscape reticle box with a majestic, vertical card.
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
  return (
    <div
      onClick={onClick}
      className={`relative w-full aspect-[3/4] rounded-2xl transition-all duration-300 flex flex-col justify-end cursor-pointer select-none overflow-hidden group ${
        isSelected
          ? 'ring-2 ring-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,197,66,0.6)] scale-[1.02] z-20'
          : isDead
          ? 'bg-slate-950/80 border border-slate-800 opacity-55 grayscale'
          : isFellowDeathEater
          ? 'bg-slate-950 border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:border-emerald-400'
          : 'bg-slate-950 border border-amber-400/30 hover:border-amber-400/60 shadow-lg hover:shadow-amber-500/10'
      } ${className}`}
    >
      {/* 1. FULL-BLEED CHARACTER ARTWORK */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image || '/cards/harry.jpg'}
          alt={name}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className={`object-cover object-top transition-transform duration-300 ${
            isSelected ? 'scale-105' : 'group-hover:scale-103'
          }`}
          priority
        />
        {/* Subtle radial starlight aura behind portrait */}
        <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* 2. INNER GILDED FILIGREE RIM */}
      <div className="absolute inset-1 rounded-[13px] border border-amber-400/25 pointer-events-none z-10" />

      {/* 3. SELECTED RETICLE & CORNER FLOURISHES */}
      {isSelected && (
        <>
          {/* 4 Golden Corner Victorian Flourishes */}
          <CardCornerFlourish className="absolute top-1.5 left-1.5 w-5 h-5 text-amber-300 pointer-events-none z-20" />
          <CardCornerFlourish className="absolute top-1.5 right-1.5 w-5 h-5 text-amber-300 -scale-x-100 pointer-events-none z-20" />
          <CardCornerFlourish className="absolute bottom-1.5 left-1.5 w-5 h-5 text-amber-300 -scale-y-100 pointer-events-none z-20" />
          <CardCornerFlourish className="absolute bottom-1.5 right-1.5 w-5 h-5 text-amber-300 -scale-x-100 -scale-y-100 pointer-events-none z-20" />

          {/* Top Target Badge */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 font-cinzel font-black text-[10px] tracking-wider shadow-lg flex items-center gap-1 z-20 animate-pulse">
            <Target size={11} className="text-amber-400" />
            <span>MỤC TIÊU</span>
          </div>
        </>
      )}

      {/* 4. ATTACHED ACTION BADGES (TOP-RIGHT) */}
      {statusBadge && (
        <div className="absolute top-2 right-2 z-20">
          {statusBadge}
        </div>
      )}

      {/* 5. TOP-LEFT FACTION TAG IF FELLOW DEATH EATER */}
      {isFellowDeathEater && !isSelected && (
        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[9px] font-cinzel font-black tracking-wider shadow-md">
          🐍 TỬ THẦN
        </div>
      )}

      {/* 6. DEAD OVERLAY */}
      {isDead && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-400 z-20 select-none">
          <Skull size={32} className="animate-pulse" />
          <span className="text-[10px] font-cinzel font-black tracking-widest uppercase text-red-300 mt-1">
            ĐÃ TỬ TRẬN
          </span>
        </div>
      )}

      {/* 7. BOTTOM NAMEPLATE BANNER */}
      <div className="relative z-10 bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-2 px-2 text-center pointer-events-none">
        <h4 className={`font-cinzel font-black text-xs sm:text-sm tracking-wide truncate block leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
          isSelected 
            ? 'text-amber-300' 
            : isFellowDeathEater
            ? 'text-emerald-300'
            : isDead 
            ? 'text-slate-500 line-through' 
            : 'text-slate-100'
        }`}>
          {name}
        </h4>

        {roleName && (
          <span className={`text-[10px] font-mono tracking-wider block truncate mt-0.5 ${
            isFellowDeathEater ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}>
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
