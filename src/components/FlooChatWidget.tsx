"use client";

import React, { useState } from 'react';
import { Flame, MessageCircle, ExternalLink, Sparkles, X } from 'lucide-react';

export const FLOO_NETWORK_URL = 'https://www.hpvn-archive.net/floo?hpvn_update=ea7cfe4';

/**
 * Opens the Floo Network Shoutbox in a dedicated popup window (PA2).
 * If the browser popup blocker prevents it, cleanly falls back to a new browser tab.
 */
export function openFlooWindow() {
  const width = 450;
  const height = 720;
  const left = typeof window !== 'undefined' ? Math.max(0, Math.round((window.screen.width - width) / 2)) : 100;
  const top = typeof window !== 'undefined' ? Math.max(0, Math.round((window.screen.height - height) / 2)) : 100;

  const popup = window.open(
    FLOO_NETWORK_URL,
    'HPVN_Floo_Shoutbox',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no`
  );

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    window.open(FLOO_NETWORK_URL, '_blank', 'noopener,noreferrer');
  } else {
    popup.focus();
  }
}

/**
 * Header Quick Button for Mạng Floo
 */
export function FlooHeaderButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openFlooWindow}
      title="Mở Mạng Floo (Shoutbox HPVN trò chuyện, gửi bùa chú & Thư Sấm)"
      className={`hpvn-btn-floo px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer text-emerald-200 border border-emerald-500/70 hover:border-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 transition-colors ${className}`}
    >
      <Flame size={14} className="text-emerald-400 animate-pulse shrink-0" />
      <span className="text-[11px] sm:text-xs tracking-wide">
        Mạng Floo <span className="hidden lg:inline">(Chat)</span>
      </span>
      <ExternalLink size={11} className="text-emerald-400/80 hidden sm:inline shrink-0" />
    </button>
  );
}

/**
 * Floating Magic Floo Network Widget Button
 * Positioned cleanly with zero shadow, sharp magical border, and responsive spacing.
 */
export function FlooFloatingWidget() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Optional Mini Information Pill */}
      {showTooltip && (
        <div className="pointer-events-auto bg-[#072418] border-2 border-emerald-500 rounded-xl p-2.5 max-w-[240px] text-xs font-serif text-emerald-100 flex items-start gap-2 animate-in fade-in zoom-in-95 duration-150">
          <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-300 text-[11px] uppercase tracking-wider">
              Mạng Floo · HPVN Chat
            </p>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed mt-0.5">
              Mở cửa sổ trò chuyện phù thủy, gửi bùa chú và Thư Sấm song song cùng trận đấu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-emerald-400/70 hover:text-emerald-200 p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Magic Button */}
      <button
        type="button"
        onClick={openFlooWindow}
        onMouseEnter={() => setShowTooltip(true)}
        className="pointer-events-auto group px-3.5 py-2.5 rounded-2xl bg-[#062419] hover:bg-[#0a3826] border-2 border-emerald-500/90 hover:border-emerald-400 text-emerald-200 font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
        title="Mở Mạng Floo (Chat)"
      >
        <div className="relative flex items-center justify-center">
          <Flame size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black tracking-wider uppercase text-emerald-300">
            Mạng Floo
          </span>
          <span className="text-[9px] font-mono text-emerald-400/80 hidden sm:inline">
            HPVN Shoutbox 💬
          </span>
        </div>
        <ExternalLink size={12} className="text-emerald-400/70 group-hover:text-emerald-300 shrink-0 ml-0.5" />
      </button>
    </div>
  );
}
