"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '@/lib/roles';
import { Role, Faction } from '@/lib/types';
import { CharacterCard, CardInspectorModal } from './CharacterCard';
import { PhoenixCrest, DarkMarkCrest, DeathlyHallowsSymbol } from './ArtAssets';
import { BookOpen, X, Search, Shield, Skull, Sparkles } from 'lucide-react';

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
          className="relative w-full max-w-6xl max-h-[90vh] hpvn-panel-gold rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden cursor-default"
        >

          {/* Header styled after HPVN Floo banner */}
          <div className="hpvn-header-banner p-3.5 sm:p-5 flex flex-col gap-3 border-b border-[#7a5229]/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#3a2213] text-[#ffd88f] border border-[#ebdcb0]/50 shadow-md shrink-0">
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
                className="p-2 rounded-xl bg-[#1c0f07] hover:bg-[#2b170c] text-[#ffd88f] border border-[#7a5229] transition-colors shrink-0 cursor-pointer shadow-sm active:scale-95"
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
                    selectedFaction === 'ALL' ? 'hpvn-btn-gold font-bold shadow-sm' : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
                  }`}
                >
                  Tất cả ({allRoles.length})
                </button>
                <button
                  onClick={() => setSelectedFaction('ORDER_OF_PHOENIX')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedFaction === 'ORDER_OF_PHOENIX' ? 'hpvn-btn-phoenix font-bold shadow-sm' : 'text-[#ebdcb0]/70 hover:text-red-400'
                  }`}
                >
                  <PhoenixCrest className="w-3.5 h-3.5 shrink-0" /> Phượng Hoàng
                </button>
                <button
                  onClick={() => setSelectedFaction('DEATH_EATERS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedFaction === 'DEATH_EATERS' ? 'hpvn-btn-floo font-bold shadow-sm' : 'text-[#ebdcb0]/70 hover:text-emerald-400'
                  }`}
                >
                  <DarkMarkCrest className="w-3.5 h-3.5 shrink-0" /> Tử Thần
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 custom-scrollbar">
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
          <div className="p-3 bg-gray-950/80 border-t border-amber-500/20 text-center text-xs text-gray-400 flex items-center justify-around flex-wrap gap-2">
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
