"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '@/lib/roles';
import { Role, Faction } from '@/lib/types';
import { CharacterCard, CardInspectorModal } from './CharacterCard';
import { PhoenixCrest, DarkMarkCrest, DeathlyHallowsSymbol } from './ArtAssets';
import { BookOpen, X, Search, Shield, Skull, Sparkles } from 'lucide-react';

/**
 * Hiệu ứng Background Đặc Trưng cho Bộ Bài (Card Deck Background FX)
 * - Hội Phượng Hoàng (HPH): Cánh Chim Phượng Hoàng Lửa (Fire Phoenix Wings) rực sáng hào quang
 * - Tử Thần Thực Tử (4T): Con Rắn Ngọc Bích (Emerald Jade Serpent) uy nghi uốn lượn
 * - Tất cả: Đối đầu lưỡng cực giữa Cánh Lửa Phượng Hoàng và Con Rắn Ngọc Bích
 */
function DeckModalFactionBackground({ faction }: { faction: Faction | 'ALL' }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Ambient Dynamic Glow */}
      <motion.div
        animate={{
          opacity: faction === 'DEATH_EATERS' ? [0.3, 0.5, 0.3] : [0.35, 0.58, 0.35],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 transition-colors duration-700 ${
          faction === 'ORDER_OF_PHOENIX'
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.25)_0%,rgba(220,38,38,0.15)_50%,transparent_85%)]'
            : faction === 'DEATH_EATERS'
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.28)_0%,rgba(6,78,59,0.2)_50%,transparent_85%)]'
            : 'bg-[radial-gradient(ellipse_at_30%_50%,rgba(251,191,36,0.2)_0%,transparent_60%),radial-gradient(ellipse_at_70%_50%,rgba(16,185,129,0.2)_0%,transparent_60%)]'
        }`}
      />

      {/* 2. Watermark SVGs */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* PHOENIX WINGS WATERMARK */}
        {(faction === 'ORDER_OF_PHOENIX' || faction === 'ALL') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: faction === 'ORDER_OF_PHOENIX' ? 0.35 : 0.22,
              scale: [0.98, 1.02, 0.98],
              x: faction === 'ALL' ? '-24%' : '0%',
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-[800px] h-[580px] max-w-full ${faction === 'ALL' ? 'left-1/4' : ''}`}
          >
            <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]">
              <defs>
                <linearGradient id="deckPhoenixFireGrad" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#ea580c" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.15" />
                </linearGradient>
                <g id="deckBigWing">
                  <path
                    d="M 380 260
                       C 320 200, 240 120, 60 50
                       C 50 90, 100 140, 140 180
                       C 90 170, 30 180, 40 225
                       C 80 240, 130 245, 175 260
                       C 115 275, 45 295, 60 340
                       C 100 350, 155 335, 205 330
                       C 145 360, 75 400, 100 445
                       C 140 445, 200 405, 240 380
                       C 190 435, 140 500, 175 525
                       C 215 510, 275 435, 315 360
                       C 350 400, 380 430, 400 440 Z"
                    fill="url(#deckPhoenixFireGrad)"
                  />
                  {/* Inner Golden Plumes */}
                  <path
                    d="M 380 250
                       C 330 190, 260 130, 120 85
                       C 115 115, 155 155, 195 190
                       C 150 192, 100 200, 105 235
                       C 140 245, 185 248, 220 260
                       C 180 280, 125 300, 135 335
                       C 170 342, 220 322, 255 310 Z"
                    fill="#fef08a"
                    opacity="0.75"
                  />
                </g>
              </defs>
              {/* Left Wing */}
              <use href="#deckBigWing" />
              {/* Right Wing (Mirrored) */}
              <use href="#deckBigWing" transform="translate(800, 0) scale(-1, 1)" />
              {/* Phoenix Crown & Flame Crest */}
              <path
                d="M 400 130
                   C 385 100, 370 70, 400 40
                   C 430 70, 415 100, 400 130 Z"
                fill="#fde047"
              />
              <path
                d="M 390 140 C 375 120, 350 100, 365 80 C 385 95, 395 115, 395 140 Z"
                fill="#ea580c"
              />
              <path
                d="M 410 140 C 425 120, 450 100, 435 80 C 415 95, 405 115, 405 140 Z"
                fill="#ea580c"
              />
            </svg>
          </motion.div>
        )}

        {/* SINGLE GREAT EMERALD JADE SERPENT WATERMARK */}
        {(faction === 'DEATH_EATERS' || faction === 'ALL') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: faction === 'DEATH_EATERS' ? 0.38 : 0.22,
              scale: [0.98, 1.02, 0.98],
              x: faction === 'ALL' ? '24%' : '0%',
            }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-[800px] h-[580px] max-w-full ${faction === 'ALL' ? 'right-1/4' : ''}`}
          >
            <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_0_35px_rgba(16,185,129,0.55)]">
              <defs>
                <linearGradient id="deckGreatJadeSerpent" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#6ee7b7" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.75" />
                  <stop offset="85%" stopColor="#047857" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Massive Sinuous Serpent Coils Across Entire Backdrop */}
              <path
                d="M 400 130
                   C 330 140, 240 180, 160 250
                   C 70 330, 80 430, 170 490
                   C 260 550, 420 560, 520 500
                   C 630 430, 680 320, 620 220
                   C 560 120, 440 90, 410 70"
                fill="none"
                stroke="url(#deckGreatJadeSerpent)"
                strokeWidth="52"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Shimmering Inner Jade Highlights */}
              <path
                d="M 400 130
                   C 330 140, 240 180, 160 250
                   C 70 330, 80 430, 170 490
                   C 260 550, 420 560, 520 500
                   C 630 430, 680 320, 620 220
                   C 560 120, 440 90, 410 70"
                fill="none"
                stroke="#a7f3d0"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />

              {/* Pale Diamond Scale Spine */}
              <path
                d="M 400 130
                   C 330 140, 240 180, 160 250
                   C 70 330, 80 430, 170 490
                   C 260 550, 420 560, 520 500
                   C 630 430, 680 320, 620 220
                   C 560 120, 440 90, 410 70"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeDasharray="20 16"
                opacity="0.85"
              />

              {/* Giant Cobra Hood at Top Center */}
              <path
                d="M 410 70
                   C 360 40, 310 70, 330 115
                   C 350 150, 420 160, 460 140
                   C 490 120, 480 70, 430 55 Z"
                fill="#10b981"
                opacity="0.9"
              />

              {/* Sleek Viper Head & Snout */}
              <path
                d="M 410 50
                   C 380 45, 345 65, 350 95
                   C 355 125, 410 125, 425 105
                   C 435 85, 425 55, 410 50 Z"
                fill="#064e3b"
                stroke="#6ee7b7"
                strokeWidth="3"
              />

              {/* Glowing Emerald Eyes */}
              <circle cx="375" cy="75" r="7" fill="#ecfdf5" />
              <circle cx="375" cy="75" r="4" fill="#10b981" />
              <line x1="375" y1="70" x2="375" y2="80" stroke="#064e3b" strokeWidth="2.5" />

              <circle cx="410" cy="75" r="7" fill="#ecfdf5" />
              <circle cx="410" cy="75" r="4" fill="#10b981" />
              <line x1="410" y1="70" x2="410" y2="80" stroke="#064e3b" strokeWidth="2.5" />

              {/* Forked Red Tongue */}
              <path
                d="M 380 110 Q 375 140, 370 165 M 370 165 L 355 180 M 370 165 L 382 180"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function CardDeckModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedFaction, setSelectedFaction] = useState<Faction | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedRole, setInspectedRole] = useState<Role | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allRoles = Object.values(ROLES);

  const filteredRoles = allRoles.filter(role => {
    const matchesFaction = selectedFaction === 'ALL' || role.faction === selectedFaction;
    const matchesSearch = 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.title && role.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFaction && matchesSearch;
  });


  return (
    <AnimatePresence>
      <div 
        key="card-deck-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          key="card-deck-modal-dialog"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl max-h-[90vh] hpvn-panel-gold rounded-2xl flex flex-col overflow-hidden cursor-default"
        >
          {/* Deck Modal Faction Ambient Artwork Background */}
          <DeckModalFactionBackground faction={selectedFaction} />

          {/* Header styled after HPVN Floo banner */}
          <div className="hpvn-header-banner relative z-20 p-3.5 sm:p-5 flex flex-col gap-3 border-b border-[#7a5229]/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#3a2213] text-[#ffd88f] border border-[#ebdcb0]/50 shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-title-magical font-bold text-[#ffd88f] tracking-wide truncate">
                    Bí Kíp Thẻ Bài · Seven Potters
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#ebdcb0] font-lora truncate">
                    Tổng hợp {allRoles.length} nhân vật & kỹ năng phép thuật
                  </p>
                </div>
              </div>

              {/* Close Button always pinned top right */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1c0f07] hover:bg-[#2b170c] text-[#ffd88f] border border-[#7a5229] transition-colors shrink-0 cursor-pointer active:scale-95"
                title="Đóng bí kíp thẻ bài"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bd8436]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhân vật, kỹ năng..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#140b05] border border-[#7a5229] text-[#f5eedb] placeholder-[#8c622e] font-lora focus:outline-none focus:border-[#ffd88f]"
                />
              </div>

              {/* Horizontally Scrollable Faction Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#140b05] p-1 rounded-xl border border-[#7a5229] shrink-0">
                <button
                  onClick={() => setSelectedFaction('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap transition-colors ${
                    selectedFaction === 'ALL' ? 'hpvn-btn-gold font-bold' : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
                  }`}
                >
                  Tất cả ({allRoles.length})
                </button>
                <button
                  onClick={() => setSelectedFaction('ORDER_OF_PHOENIX')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedFaction === 'ORDER_OF_PHOENIX' ? 'hpvn-btn-phoenix font-bold' : 'text-[#ebdcb0]/70 hover:text-red-400'
                  }`}
                >
                  <PhoenixCrest className="w-3.5 h-3.5 shrink-0" /> Phượng Hoàng
                </button>
                <button
                  onClick={() => setSelectedFaction('DEATH_EATERS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedFaction === 'DEATH_EATERS' ? 'hpvn-btn-floo font-bold' : 'text-[#ebdcb0]/70 hover:text-emerald-400'
                  }`}
                >
                  <DarkMarkCrest className="w-3.5 h-3.5 shrink-0" /> Tử Thần
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10 custom-scrollbar">
            {filteredRoles.map((role, idx) => (
              <div
                key={`deck-role-${role.id || idx}`}
                className="transform hover:-translate-y-1 transition-transform"
              >
                <CharacterCard
                  role={role}
                  size="compact"
                  allowFlip={true}
                  showStatusBadge={false}
                  onInspect={() => setInspectedRole(role)}
                />
              </div>
            ))}
          </div>

          {/* Footer with Rules Briefing */}
          <div className="relative z-20 p-3 bg-gray-950/80 border-t border-amber-500/20 text-center text-xs text-gray-400 flex items-center justify-around flex-wrap gap-2">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles size={12} /> Nhấn nút mũi tên trên mỗi thẻ để lật mặt sau
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <Shield size={12} /> Hội Phượng Hoàng thắng khi Voldemort bị tiêu diệt
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Skull size={12} /> Tử Thần Thực Tử thắng khi số lượng bằng hoặc áp đảo phe còn lại
            </span>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Inspector Modal if opened */}
      <CardInspectorModal
        role={inspectedRole}
        isOpen={!!inspectedRole}
        onClose={() => setInspectedRole(null)}
      />
    </AnimatePresence>
  );
}
