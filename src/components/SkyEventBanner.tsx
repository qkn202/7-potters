"use client";

import React, { useState } from 'react';
import { SkyEvent } from '@/lib/types';
import { Moon, CloudLightning, Skull, ShieldCheck, Compass, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SkyEventBannerProps {
  event?: SkyEvent;
  phase: string;
}

export function SkyEventBanner({ event, phase }: SkyEventBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!event || phase === 'LOBBY' || phase === 'END') {
    return null;
  }

  const renderIcon = () => {
    switch (event.modifier) {
      case 'PERFECT_DISGUISE':
        return <Moon className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />;
      case 'TURBULENCE_BLIND':
        return <CloudLightning className="w-4 h-4 text-cyan-300 animate-bounce shrink-0" />;
      case 'VOLDEMORT_AMBUSH':
        return <Skull className="w-4 h-4 text-red-400 animate-pulse shrink-0" />;
      case 'BURROW_SHIELD':
        return <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />;
    }
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="w-full bg-slate-950/90 border border-amber-400/30 hover:border-amber-400/60 rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-md transition-all cursor-pointer select-none"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-amber-400/10 border border-amber-400/20 shrink-0">
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-cinzel font-bold text-amber-300 text-xs truncate">
              <span className="text-[10px] text-slate-400 font-mono">Chặng {event.stage}:</span>
              <span className="truncate">{event.badgeText || event.title}</span>
            </div>
            {!isExpanded && (
              <p className="text-[10px] text-slate-400 font-sans truncate">
                {event.tacticalTip || event.subtitle}
              </p>
            )}
          </div>
        </div>

        <button 
          type="button" 
          className="text-slate-400 hover:text-amber-300 p-0.5 shrink-0"
          title={isExpanded ? "Thu gọn" : "Chi tiết"}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
          <strong className="text-amber-300 font-cinzel">Hiệu ứng chặng: </strong>
          {event.tacticalTip || event.description}
        </div>
      )}
    </div>
  );
}
