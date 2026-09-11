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
      {/* 1. Ambient Dynamic Color Gradient Atmosphere */}
      <motion.div
        animate={{
          opacity: [0.25, 0.4, 0.25],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 transition-colors duration-700 ${
          faction === 'ORDER_OF_PHOENIX'
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.14)_0%,rgba(180,83,9,0.06)_45%,transparent_80%)]'
            : faction === 'DEATH_EATERS'
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14)_0%,rgba(6,78,59,0.06)_45%,transparent_80%)]'
            : 'bg-[radial-gradient(ellipse_at_25%_25%,rgba(217,119,6,0.1)_0%,transparent_55%),radial-gradient(ellipse_at_75%_25%,rgba(16,185,129,0.1)_0%,transparent_55%)]'
        }`}
      />

      {/* 2. Full-Backdrop Epic Concept Art Wallpapers with Deep Vintage Vignette */}
      {faction === 'ORDER_OF_PHOENIX' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            src="/images/phoenix_deck_banner.jpg"
            alt="Đại Cánh Phượng Hoàng Lửa"
            className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
          />
          {/* Edge blend gradient to match wood mahogany panel */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0703] via-[#140b05]/85 to-[#0e0703]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(14,7,3,0.92)_85%)]" />
        </motion.div>
      )}

      {faction === 'DEATH_EATERS' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.13 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            src="/images/serpent_deck_banner.jpg"
            alt="Đại Mãng Xà Ngọc Bích"
            className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
          />
          {/* Edge blend gradient to match panel */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05110c] via-[#091711]/85 to-[#05110c]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,17,12,0.92)_85%)]" />
        </motion.div>
      )}

      {faction === 'ALL' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center overflow-hidden"
        >
          {/* Left: Phoenix Wings */}
          <div className="relative w-1/2 h-full overflow-hidden opacity-10">
            <img
              src="/images/phoenix_deck_banner.jpg"
              alt="Hội Phượng Hoàng"
              className="w-[200%] h-full max-w-none object-cover object-left filter contrast-110 brightness-95"
              style={{
                maskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
              }}
            />
          </div>
          {/* Right: Jade Serpent */}
          <div className="relative w-1/2 h-full overflow-hidden opacity-11">
            <img
              src="/images/serpent_deck_banner.jpg"
              alt="Tử Thần Thực Tử"
              className="w-[200%] h-full max-w-none object-cover -translate-x-1/2 filter contrast-110 brightness-95"
              style={{
                maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0703] via-[#140b05]/80 to-[#0e0703]/95" />
        </motion.div>
      )}
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
