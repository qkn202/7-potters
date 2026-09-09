"use client";

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  X, 
  Sparkles, 
  Loader2,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { 
  CardCornerFlourish
} from './ArtAssets';

interface FlooChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

/**
 * Global trigger to open Floo Chat Drawer from any component.
 */
export function openFlooDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-floo-drawer'));
  }
}

export function FlooChatDrawer({ isOpen, onClose, onOpen }: FlooChatDrawerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => onOpen?.();
    window.addEventListener('open-floo-drawer', handleOpen);
    return () => window.removeEventListener('open-floo-drawer', handleOpen);
  }, [onOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reload iframe function
  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Dark Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel - 7 Potters Mahogany & Antique Gold Framing Full Floo App */}
      <aside 
        className="relative w-full sm:w-[500px] md:w-[540px] max-w-full h-full bg-gradient-to-b from-[#1c0f07] via-[#140a04] to-[#0e0703] border-l-2 border-[#bd8436] text-[#ebdcb0] flex flex-col z-50 select-text animate-in slide-in-from-right duration-250 ease-out overflow-hidden"
        role="dialog"
        aria-label="Mạng Floo HPVN Chat"
      >
        {/* Ornate Corner Flourishes */}
        <CardCornerFlourish className="absolute top-2 right-14 w-5 h-5 text-[#bd8436] pointer-events-none -scale-x-100 opacity-60 z-20" />
        <CardCornerFlourish className="absolute bottom-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none -scale-y-100 opacity-60 z-20" />

        {/* 7 Potters Header Banner */}
        <div className="hpvn-header-banner px-4 py-3.5 flex items-center justify-between gap-3 shrink-0 border-b border-[#7a5229]/80 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#3a2213] text-[#ffd88f] border border-[#ebdcb0]/50 shrink-0">
              <Flame size={18} className="text-[#ffd88f] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-title-magical font-bold text-sm sm:text-base tracking-wide text-[#ffd88f] truncate">
                  Mạng Floo · Seven Potters
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2b170c] border border-[#7a5229] text-[10px] font-mono text-[#ffd88f] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[#ebdcb0]/80 font-lora truncate">
                Đầy đủ tính năng gốc: Emoji, Hình ảnh, Thư Sấm, Cảm xúc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 z-20">
            <button
              type="button"
              onClick={handleReload}
              title="Tải lại Mạng Floo"
              className="p-2 rounded-xl bg-[#1c0f07] hover:bg-[#2b170c] text-[#ffd88f] border border-[#7a5229] transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Đóng Mạng Floo (Phím Esc)"
              className="p-2 rounded-xl bg-[#1c0f07] hover:bg-[#2b170c] text-[#ffd88f] border border-[#7a5229] transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Body: Full Original Floo Network Embedded In-App */}
        <div className="relative flex-1 w-full h-full min-h-0 bg-[#050d0a]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-[#ebdcb0]/80 gap-3 bg-[#140a04] z-10">
              <Loader2 size={32} className="animate-spin text-[#bd8436]" />
              <p className="font-title-magical text-sm sm:text-base text-[#ffd88f] tracking-wide">
                Đang thắp lửa Mạng Floo...
              </p>
              <p className="font-lora text-xs text-[#ebdcb0]/70 text-center max-w-xs leading-relaxed">
                Đang nạp toàn bộ chức năng gốc: bộ emoji Yahoo, gửi ảnh, thư sấm, thả cảm xúc bùa chú và ghim tin.
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src="/api/floo-embed"
            title="Mạng Floo HPVN Full Feature App"
            className="w-full h-full border-none"
            allow="clipboard-write; autoplay; fullscreen"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* 7 Potters Themed Bottom Status Strip */}
        <div className="px-3.5 py-2 bg-[#140b05] border-t border-[#7a5229]/80 flex items-center justify-between text-[11px] text-[#bd8436] font-lora shrink-0 z-20">
          <span className="flex items-center gap-1.5 text-[#ffd88f]">
            <Sparkles size={12} className="text-[#ffd88f]" />
            Mạng Floo HPVN · Full tính năng
          </span>

          <a
            href="https://www.hpvn-archive.net/floo?hpvn_update=ea7cfe4"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffd88f] flex items-center gap-1 text-[10px] text-[#bd8436] transition-colors"
            title="Mở toàn màn hình trong tab mới nếu cần"
          >
            <span>Mở ngoài</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </aside>
    </div>
  );
}

/**
 * Top Header Quick Button for Mạng Floo Drawer (7 Potters Theme)
 */
export function FlooHeaderTrigger({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Mở Mạng Floo (Chat In-App Seven Potters)"
      className={`hpvn-btn-gold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer text-[#ffd88f] border border-[#7a5229] transition-colors ${className}`}
    >
      <Flame size={14} className="text-[#ffd88f] animate-pulse shrink-0" />
      <span className="text-[11px] sm:text-xs tracking-wide">
        Mạng Floo <span className="hidden md:inline">(Chat)</span>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
    </button>
  );
}

/**
 * Floating Magic Handle Widget on bottom/right edge (7 Potters Theme)
 */
export function FlooFloatingTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        className="group px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-[#1c0f07] hover:bg-[#28180e] border-2 border-[#bd8436] text-[#ffd88f] font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
        title="Mở Mạng Floo HPVN (Chat In-App)"
      >
        <div className="relative flex items-center justify-center">
          <Flame size={17} className="text-[#ffd88f] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black tracking-wider uppercase text-[#ffd88f]">
            Mạng Floo
          </span>
          <span className="text-[9px] font-lora text-[#bd8436] hidden sm:inline">
            Chat In-App 💬
          </span>
        </div>
      </button>
    </div>
  );
}
