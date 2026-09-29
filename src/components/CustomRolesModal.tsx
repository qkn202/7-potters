"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '@/lib/roles';
import { Role, Faction } from '@/lib/types';
import { PhoenixCrest, DarkMarkCrest, DeathlyHallowsSymbol, CardCornerFlourish } from './ArtAssets';
import { 
  X, 
  Search, 
  Check, 
  CheckCheck, 
  RotateCcw, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CustomRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoleIds: string[];
  onSave: (roleIds: string[]) => void;
  playerCount: number;
}

export function CustomRolesModal({
  isOpen,
  onClose,
  selectedRoleIds,
  onSave,
  playerCount,
}: CustomRolesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // If nothing is selected, default to all 22 classic roles
    if (!selectedRoleIds || selectedRoleIds.length === 0) {
      return Object.keys(ROLES).slice(0, 22);
    }
    return [...selectedRoleIds];
  });

  const [search, setSearch] = useState('');
  const [factionFilter, setFactionFilter] = useState<'ALL' | Faction>('ALL');

  // Reset local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (!selectedRoleIds || selectedRoleIds.length === 0) {
        setSelectedIds(Object.keys(ROLES).slice(0, 22));
      } else {
        setSelectedIds([...selectedRoleIds]);
      }
      setSearch('');
      setFactionFilter('ALL');
    }
  }, [isOpen, selectedRoleIds]);

  const allRoleList = useMemo(() => Object.values(ROLES), []);

  const filteredRoles = useMemo(() => {
    return allRoleList.filter(role => {
      if (factionFilter !== 'ALL' && role.faction !== factionFilter) return false;
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchName = role.name.toLowerCase().includes(query);
        const matchTitle = (role.title || '').toLowerCase().includes(query);
        const matchDesc = role.description.toLowerCase().includes(query);
        const matchAbility = (role.ability || '').toLowerCase().includes(query);
        return matchName || matchTitle || matchDesc || matchAbility;
      }
      return true;
    });
  }, [allRoleList, factionFilter, search]);

  const toggleRole = (roleId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSelectClassic22 = () => {
    setSelectedIds(Object.keys(ROLES).slice(0, 22));
  };

  const handleSelectAll27 = () => {
    setSelectedIds(Object.keys(ROLES));
  };

  const handleSelectOptimalForN = () => {
    // Pick the most iconic, balanced roles for N players
    const n = Math.max(2, playerCount);
    const isSmall = n <= 6;
    
    // Core Evil
    const evilOrder = ['VOLDEMORT', 'BELLATRIX_LESTRANGE', 'LUCIUS_MALFOY', 'PETER_PETTIGREW', 'FENRIR_GREYBACK'];
    // Core Good
    const goodOrder = [
      'HARRY_POTTER', 
      'RON_WEASLEY', 
      'HERMIONE_GRANGER', 
      'ALBUS_DUMBLEDORE', 
      'SEVERUS_SNAPE', 
      'REMUS_LUPIN', 
      'ALASTOR_MOODY', 
      'RUBEUS_HAGRID', 
      'ARTHUR_WEASLEY', 
      'FRED_WEASLEY', 
      'GEORGE_WEASLEY',
      'KINGSLEY_SHACKLEBOLT',
      'FLEUR_DELACOUR',
      'BILL_WEASLEY',
      'MINERVA_MCGONAGALL',
      'NEVILLE_LONGBOTTOM',
      'POTTER_FAKE'
    ];

    // Evil count based on N
    const evilCount = n <= 4 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : n <= 13 ? 4 : 5;
    const goodCount = n - evilCount;

    const chosenEvil = evilOrder.slice(0, evilCount);
    const chosenGood = goodOrder.slice(0, goodCount);
    setSelectedIds([...chosenEvil, ...chosenGood]);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  const count = selectedIds.length;
  const isEnough = count >= playerCount;

  // Counts by faction
  const goodCount = selectedIds.filter(id => ROLES[id]?.faction === 'ORDER_OF_PHOENIX').length;
  const evilCount = selectedIds.filter(id => ROLES[id]?.faction === 'DEATH_EATERS').length;
  const neutralCount = selectedIds.filter(id => ROLES[id]?.faction === 'NEUTRAL').length;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative hpvn-panel-gold rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border-2 border-[#bd8436] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Flourishes */}
          <CardCornerFlourish className="absolute top-2 left-2 w-8 h-8 text-[#bd8436] pointer-events-none" />
          <CardCornerFlourish className="absolute top-2 right-2 w-8 h-8 text-[#bd8436] -scale-x-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 left-2 w-8 h-8 text-[#bd8436] -scale-y-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 right-2 w-8 h-8 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

          {/* Modal Header */}
          <div className="p-4 sm:p-6 pb-3 border-b border-[#7a5229]/60 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2a170a] border border-[#bd8436] text-[#ffd88f]">
                  <DeathlyHallowsSymbol className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-title-magical font-bold text-xl sm:text-2xl lg:text-3xl text-[#ffd88f] tracking-wide flex items-center gap-2">
                    Thiết Lập Bộ Bài Tùy Biến
                  </h3>
                  <p className="text-xs sm:text-sm text-[#dfcbad] font-lora">
                    Merlin tự tay tuyển chọn các nhân vật sẽ xuất hiện trong game (thay vì random toàn bộ 27 nhân vật)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1f1008] border border-[#7a5229] text-[#ebdcb0] hover:text-[#ffd88f] hover:bg-[#2d180b] transition-all cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status & Counter Banner */}
            <div className="mt-3.5 p-3 rounded-2xl bg-[#120803] border border-[#7a5229] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-serif font-bold text-[#ebdcb0]">
                  <Users size={14} className="text-[#ffd88f]" />
                  <span>Sĩ số phòng: <strong className="text-[#ffd88f] font-mono text-sm">{playerCount}</strong> phù thủy</span>
                </span>
                <span className="text-[#7a5229] hidden sm:inline">|</span>
                <span className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 ${
                  isEnough 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                }`}>
                  {isEnough ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>Đã chọn: {count} thẻ bài</span>
                </span>
                
                {/* Breakdown by faction */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                    🦅 {goodCount} HPH
                  </span>
                  <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    🐍 {evilCount} 4T
                  </span>
                  {neutralCount > 0 && (
                    <span className="text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      ⚖️ {neutralCount} Neutral
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="text-[11px] font-lora">
                {count === playerCount ? (
                  <span className="text-emerald-400 font-bold">
                    🎯 Vừa khớp! Mỗi người chơi sẽ nhận chính xác 1 nhân vật trong số {count} nhân vật này.
                  </span>
                ) : count > playerCount ? (
                  <span className="text-amber-300">
                    🎲 Sẽ bốc ngẫu nhiên {playerCount} vai trò từ {count} thẻ bài được chọn.
                  </span>
                ) : (
                  <span className="text-red-400 font-bold">
                    ⚠️ Cần chọn thêm ít nhất {playerCount - count} nhân vật để đủ cho {playerCount} người chơi!
                  </span>
                )}
              </div>
            </div>

            {/* Quick Presets & Filters */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
                <span className="text-[#a47133] text-[11px] font-mono uppercase mr-1">Bộ thẻ:</span>
                <button
                  type="button"
                  onClick={handleSelectOptimalForN}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-[#ffd88f] border border-amber-800/60 font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[11px]"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Chuẩn {playerCount} Người</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectClassic22}
                  className="px-2.5 py-1 rounded-lg bg-[#24130a] hover:bg-[#341b0f] text-[#ebdcb0] border border-[#7a5229] flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[11px]"
                >
                  <span>Cổ Điển (22 Thẻ)</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll27}
                  className="px-2.5 py-1 rounded-lg bg-[#24130a] hover:bg-[#341b0f] text-[#ebdcb0] border border-[#7a5229] flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[11px]"
                >
                  <CheckCheck size={12} />
                  <span>Toàn Bộ (27 Thẻ)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-900/40 text-[11px] cursor-pointer transition-all active:scale-95"
                >
                  <span>Bỏ Chọn</span>
                </button>
              </div>

              {/* Faction Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#120803] p-1 rounded-xl border border-[#7a5229]">
                <button
                  type="button"
                  onClick={() => setFactionFilter('ALL')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
                    factionFilter === 'ALL'
                      ? 'bg-[#bd8436] text-[#120803]'
                      : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
                  }`}
                >
                  Tất Cả (27)
                </button>
                <button
                  type="button"
                  onClick={() => setFactionFilter('ORDER_OF_PHOENIX')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    factionFilter === 'ORDER_OF_PHOENIX'
                      ? 'bg-amber-700 text-amber-100'
                      : 'text-amber-400/70 hover:text-amber-300'
                  }`}
                >
                  <PhoenixCrest className="w-3.5 h-3.5" />
                  <span>HPH (17)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFactionFilter('DEATH_EATERS')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    factionFilter === 'DEATH_EATERS'
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'text-emerald-400/70 hover:text-emerald-300'
                  }`}
                >
                  <DarkMarkCrest className="w-3.5 h-3.5" />
                  <span>4T (5)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFactionFilter('NEUTRAL')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    factionFilter === 'NEUTRAL'
                      ? 'bg-cyan-800 text-cyan-100'
                      : 'text-cyan-400/70 hover:text-cyan-300'
                  }`}
                >
                  <span>Mở Rộng (5)</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-2.5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bd8436] w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm nhân vật theo tên, vai trò hoặc kỹ năng..."
                className="w-full bg-[#120803] border border-[#7a5229] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#ebdcb0] placeholder-[#ebdcb0]/40 focus:outline-none focus:border-[#ffd88f]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ebdcb0]/50 hover:text-[#ebdcb0] text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cards Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredRoles.map(role => {
                const isSelected = selectedIds.includes(role.id);
                const isEvil = role.faction === 'DEATH_EATERS';
                const isNeutral = role.faction === 'NEUTRAL';

                return (
                  <motion.div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className={`relative rounded-2xl p-3 border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? isEvil
                          ? 'bg-gradient-to-br from-[#1b0805] via-[#102419] to-[#051a10] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                          : isNeutral
                          ? 'bg-gradient-to-br from-[#120e06] via-[#091a1d] to-[#041215] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                          : 'bg-gradient-to-br from-[#2a1306] via-[#1a0e07] to-[#120803] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'bg-[#120803]/80 border-[#5a3a1f]/60 opacity-60 hover:opacity-90 hover:border-[#7a5229]'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Card Number, Faction Badge & Checkbox */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-mono text-[#ebdcb0]/60">
                          {role.cardNumber || '№ --/27'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-serif font-bold flex items-center gap-1 ${
                            isEvil 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : isNeutral
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          }`}>
                            {isEvil ? <DarkMarkCrest className="w-3 h-3" /> : <PhoenixCrest className="w-3 h-3" />}
                            <span>{isEvil ? 'Tử Thần' : isNeutral ? 'Trung Lập' : 'Phượng Hoàng'}</span>
                          </span>

                          {/* Checkbox Icon */}
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? isEvil
                                ? 'bg-emerald-500 border-emerald-300 text-black'
                                : isNeutral
                                ? 'bg-cyan-400 border-cyan-200 text-black'
                                : 'bg-amber-400 border-amber-200 text-black'
                              : 'border-[#7a5229] bg-[#1a0e07]'
                          }`}>
                            {isSelected && <Check size={13} className="stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      {/* Character Avatar & Info */}
                      <div className="flex items-start gap-2.5">
                        <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-[#7a5229] bg-black/60 shadow-inner">
                          {role.image ? (
                            <img
                              src={role.image}
                              alt={role.name}
                              className={`w-full h-full object-cover transition-all ${isSelected ? '' : 'grayscale'}`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#bd8436] font-serif font-bold text-lg">
                              {role.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-serif font-black text-sm truncate ${
                            isSelected 
                              ? isEvil ? 'text-emerald-200' : isNeutral ? 'text-cyan-200' : 'text-[#ffd88f]' 
                              : 'text-[#ebdcb0]'
                          }`}>
                            {role.name}
                          </h4>
                          <p className="text-[11px] font-lora italic text-[#dfcbad]/80 truncate">
                            {role.title || role.description}
                          </p>
                          <p className="text-[11px] text-[#ebdcb0]/90 font-lora line-clamp-2 mt-1 leading-snug">
                            {role.ability || role.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="mt-2.5 pt-1.5 border-t border-[#7a5229]/30 flex items-center justify-between text-[10px] font-mono">
                      <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-[#ebdcb0]/40'}>
                        {isSelected ? '✓ ĐÃ CHỌN' : '○ BỎ QUA'}
                      </span>
                      {role.phaseType && (
                        <span className="text-[#a47133] uppercase">
                          {role.phaseType === 'NIGHT' ? '🌙 Ban Đêm' : role.phaseType === 'PASSIVE' ? '⚡ Nội Tại' : role.phaseType === 'DAY' ? '☀️ Ban Ngày' : '🔮 Đặc Biệt'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredRoles.length === 0 && (
              <div className="text-center py-12 text-[#8c622e] font-lora">
                Không tìm thấy nhân vật nào phù hợp với bộ lọc...
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-[#7a5229]/60 bg-[#140a05] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-lora text-[#dfcbad]">
              <span>Đang chọn: <strong className="text-[#ffd88f] font-mono text-sm">{count}</strong> / 27 thẻ bài</span>
              {!isEnough && (
                <span className="text-red-400 ml-2 font-bold">
                  (Cần tối thiểu {playerCount} thẻ)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#26150c] hover:bg-[#3a2213] text-[#ebdcb0] font-serif text-xs font-bold cursor-pointer transition-all"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={count < 2}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-40 disabled:grayscale cursor-pointer transition-all active:scale-95"
              >
                Áp Dụng Danh Sách ({count} Thẻ)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
