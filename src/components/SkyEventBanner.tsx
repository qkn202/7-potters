"use client";

import React from 'react';
import { SkyEvent } from '@/lib/types';
import { Moon, CloudLightning, Skull, ShieldCheck, Compass, Sparkles, AlertCircle } from 'lucide-react';

interface SkyEventBannerProps {
  event?: SkyEvent;
  phase: string;
}

export function SkyEventBanner({ event, phase }: SkyEventBannerProps) {
  if (!event || phase === 'LOBBY' || phase === 'END') {
    return null;
  }

  // Choose appropriate icon
  const renderIcon = () => {
    switch (event.modifier) {
      case 'PERFECT_DISGUISE':
        return <Moon className="w-6 h-6 text-amber-300 animate-pulse" />;
      case 'TURBULENCE_BLIND':
        return <CloudLightning className="w-6 h-6 text-cyan-300 animate-bounce" />;
      case 'VOLDEMORT_AMBUSH':
        return <Skull className="w-6 h-6 text-red-400 animate-pulse" />;
      case 'SAFE_HAVEN':
        return <Moon className="w-6 h-6 text-amber-200" />;
      case 'APPROACH_SHIELD':
        return <Compass className="w-6 h-6 text-amber-300 animate-pulse" />;
      case 'BURROW_SHIELD':
        return <ShieldCheck className="w-6 h-6 text-emerald-300 animate-spin-slow" />;
      default:
        return <Compass className="w-6 h-6 text-[#ffd88f]" />;
    }
  };

  const getThemeStyles = () => {
    switch (event.modifier) {
      case 'PERFECT_DISGUISE':
        return {
          border: 'border-amber-500/60',
          bg: 'from-[#1e1308]/95 via-[#2b190a]/90 to-[#140b05]/95',
          accent: 'text-amber-300',
          badgeBg: 'bg-amber-950/80 border-amber-500/70 text-amber-200',
        };
      case 'TURBULENCE_BLIND':
        return {
          border: 'border-cyan-500/60',
          bg: 'from-[#0b1726]/95 via-[#11243b]/90 to-[#08101a]/95',
          accent: 'text-cyan-300',
          badgeBg: 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200',
        };
      case 'VOLDEMORT_AMBUSH':
        return {
          border: 'border-red-600/70',
          bg: 'from-[#2b0808]/95 via-[#3d0d0d]/90 to-[#170404]/95',
          accent: 'text-red-400',
          badgeBg: 'bg-red-950/80 border-red-500/70 text-red-200',
        };
      case 'SAFE_HAVEN':
        return {
          border: 'border-amber-600/60',
          bg: 'from-[#26150a]/95 via-[#381e0f]/90 to-[#1a0e07]/95',
          accent: 'text-amber-300',
          badgeBg: 'bg-amber-950/80 border-amber-600/70 text-amber-200',
        };
      case 'APPROACH_SHIELD':
        return {
          border: 'border-yellow-500/60',
          bg: 'from-[#241708]/95 via-[#3b270f]/90 to-[#170e05]/95',
          accent: 'text-yellow-300',
          badgeBg: 'bg-yellow-950/80 border-yellow-500/70 text-yellow-200',
        };
      case 'BURROW_SHIELD':
      default:
        return {
          border: 'border-emerald-500/70',
          bg: 'from-[#092415]/95 via-[#0e3620]/90 to-[#06170d]/95',
          accent: 'text-emerald-300',
          badgeBg: 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className={`relative rounded-2xl border-2 ${theme.border} bg-gradient-to-r ${theme.bg} p-3.5 sm:p-4 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300`}>
      {/* Subtle ambient light glow in corner */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ffd88f]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/40 border border-[#7a5229]/60 flex items-center justify-center flex-shrink-0 shadow-inner">
            {renderIcon()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] sm:text-[11px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${theme.badgeBg} flex items-center gap-1`}>
                <Sparkles size={11} /> {event.badgeText}
              </span>
              <span className="text-[10px] font-mono text-[#ffd88f]/80 uppercase tracking-widest hidden sm:inline">
                Chặng {event.stage} · Bầu Trời Chiến Thuật
              </span>
            </div>

            <h3 className={`text-base sm:text-lg md:text-xl font-title font-bold ${theme.accent} tracking-wide mt-0.5 truncate`}>
              {event.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#ebdcb0]/90 font-lora italic leading-snug line-clamp-1 sm:line-clamp-none">
              {event.subtitle}
            </p>
          </div>
        </div>

        {/* Tactical Rule Tip Box */}
        <div className="self-stretch sm:self-auto sm:max-w-md bg-black/40 rounded-xl p-2.5 border border-[#7a5229]/40 flex items-start gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-[#ffd88f] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-[#f5eedb] font-serif leading-relaxed">
            <strong className="text-[#ffd88f]">Luật Chặng: </strong>
            {event.tacticalTip}
          </p>
        </div>
      </div>
    </div>
  );
}
