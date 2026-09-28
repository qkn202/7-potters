/**
 * MOD HPVN - Role Cards Display
 * Hiển thị tất cả thẻ vai trò HPVN với phong cách Ma Pháp Hogwarts
 */

'use client';

import React, { useState } from 'react';
import { HPVN_ROLES, Role } from '@/lib/hpvnGameEngine';
import { 
  Users, 
  Crown, 
  Sparkles, 
  Info,
  Search,
  BookOpen
} from 'lucide-react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  CardCornerFlourish 
} from '@/components/ArtAssets';

// ============================================================================
// TYPES
// ============================================================================

interface RoleCardsProps {
  playerCount?: number;
  onSelectRole?: (roleId: string) => void;
}

// ============================================================================
// ROLE CARD COMPONENT
// ============================================================================

const ROLE_CARD_IMAGES: Record<string, string> = {
  HARRY_POTTER: '/cards/harry.jpg',
  RON_WEASLEY: '/cards/ron.jpg',
  RON_WESLEY: '/cards/ron.jpg',
  HERMIONE_GRANGER: '/cards/hermione.jpg',
  DUMBLEDORE: '/cards/dumbledore.jpg',
  SNAPE: '/cards/snape.jpg',
  LUPIN: '/cards/lupin.jpg',
  MOODY: '/cards/moody.jpg',
  HAGRID: '/cards/hagrid.jpg',
  KINGSLEY: '/cards/kingsley.jpg',
  FRED: '/cards/fred.jpg',
  GEORGE: '/cards/george.jpg',
  BILL: '/cards/bill.jpg',
  TONKS: '/cards/tonks.jpg',
  FLEUR: '/cards/fleur.jpg',
  MCGONAGALL: '/cards/mcgonagall.jpg',
  McGONAGALL: '/cards/mcgonagall.jpg',
  NEVILLE: '/cards/neville.jpg',
  VOLDEMORT: '/cards/voldemort.jpg',
  BELLATRIX: '/cards/bellatrix.jpg',
  LUCIUS: '/cards/lucius.jpg',
  LUCIFUS_MALFORY: '/cards/lucius.jpg',
  PETTIGREW: '/cards/pettigrew.jpg',
  WORMTAIL: '/cards/pettigrew.jpg',
  FENRIR: '/cards/greyback.jpg',
  DRACO: '/cards/draco.jpg',
  JESTER: '/cards/jester.jpg',
  POLYJUICE: '/cards/potter_fake.jpg',
  POLYJUICE_POTION: '/cards/potter_fake.jpg',
  DOLORES: '/cards/dolores.jpg',
  DOLORES_UMBRIDGE: '/cards/dolores.jpg',
  MUNDUNGUS: '/cards/mundungus.jpg',
  ARTHUR: '/cards/arthur.jpg',
};

function RoleCard({ role, onClick }: { role: Role; onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const factionConfig = getFactionConfig(role.faction);
  const cardImg = ROLE_CARD_IMAGES[role.id] || '/cards/harry.jpg';

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${factionConfig.borderColor}
        bg-gradient-to-b from-[#1c1008] via-[#140b05] to-[#0d0603]
        ${onClick ? 'cursor-pointer hover:border-[#ffd88f] hover:scale-[1.02]' : ''}
      `}
      onClick={() => onClick?.()}
    >
      <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none z-10 opacity-70" />
      <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none z-10 opacity-70" />

      {/* Card Artwork Hero Banner */}
      <div className="relative w-full h-48 overflow-hidden border-b border-[#7a5229]/60 bg-black">
        <img
          src={cardImg}
          alt={role.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140b05] via-transparent to-black/30" />
        
        {/* Faction Pill Floating */}
        <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-black uppercase tracking-wider ${factionConfig.textColor} ${factionConfig.factionBgColor} border ${factionConfig.borderColor} z-20`}>
          {factionConfig.label}
        </div>

        {/* Phase Type Pill */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#120803]/90 text-amber-300 border border-[#7a5229] z-20">
          {role.phaseType === 'NIGHT' ? '🌙 Đêm' : '☀️ Ngày'}
        </div>
      </div>

      <div className="p-4">
        {/* Title */}
        <div className="mb-2">
          <h3 className="font-title-magical font-bold text-lg text-[#ffd88f] leading-tight flex items-center justify-between">
            <span>{role.name}</span>
          </h3>
          <p className="text-xs text-[#ebdcb0]/70 font-lora italic">{role.title}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {role.canVote && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#24150c] border border-[#7a5229] text-[#ffd88f]">
              🗳️ Vote
            </span>
          )}
          {role.canKill && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700 text-red-300">
              💀 Kill
            </span>
          )}
          {(role as any).canScan && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-700 text-blue-300">
              🔍 Soi
            </span>
          )}
          {(role as any).canProtect && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-300">
              🛡️ Bảo Vệ
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-[#ebdcb0]/90 font-lora mb-3 line-clamp-2 leading-relaxed">
          {role.description}
        </p>

        {/* Ability Button & Panel */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-serif font-bold cursor-pointer transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{expanded ? 'Thu gọn bí kíp' : 'Xem năng lực ma thuật →'}</span>
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#7a5229]/60 animate-in fade-in duration-200">
            <div className="bg-[#0e0703] rounded-xl p-3 border border-[#bd8436]/60">
              <h4 className="text-[10px] font-serif font-black uppercase text-amber-400 mb-1 flex items-center gap-1">
                <Sparkles size={11} /> Năng Lực Ma Thuật
              </h4>
              <p className="text-xs text-[#ebdcb0] font-lora leading-relaxed">{role.ability}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HPVNRoleCards({ playerCount, onSelectRole }: RoleCardsProps) {
  const [filter, setFilter] = useState<'all' | 'ORDER_OF_PHOENIX' | 'DEATH_EATERS' | 'NEUTRAL'>('all');
  const [search, setSearch] = useState('');

  // Group roles by faction
  const hphRoles = Object.values(HPVN_ROLES).filter(r => r.faction === 'ORDER_OF_PHOENIX');
  const fourTRoles = Object.values(HPVN_ROLES).filter(r => r.faction === 'DEATH_EATERS');
  const neutralRoles = Object.values(HPVN_ROLES).filter(r => r.faction === 'NEUTRAL');

  // Filter roles
  const filteredRoles = Object.values(HPVN_ROLES).filter(role => {
    const matchesFilter = filter === 'all' || role.faction === filter;
    const matchesSearch = !search || role.name.toLowerCase().includes(search.toLowerCase()) || role.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="hpvn-panel-gold rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
      <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />
      <CardCornerFlourish className="absolute bottom-2 left-2 w-6 h-6 text-[#bd8436] -scale-y-100 pointer-events-none" />
      <CardCornerFlourish className="absolute bottom-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#7a5229]/60 pb-4">
        <div>
          <h2 className="font-title-magical font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2">
            <BookOpen size={22} className="text-amber-400" />
            <span>Thư Viện Thẻ Bài Phù Thủy</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#ebdcb0]/80 font-lora italic mt-0.5">
            Tổng hợp toàn bộ {Object.keys(HPVN_ROLES).length} vai trò ma thuật Hội Phượng Hoàng & Tử Thần Thực Tử
          </p>
        </div>

        {/* Faction Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'all'
                ? 'hpvn-btn-gold text-[#ffd88f] ring-1 ring-[#ffd88f]'
                : 'bg-[#1a0e07] text-[#ebdcb0]/70 hover:text-white border border-[#7a5229]'
            }`}
          >
            <Sparkles size={13} />
            <span>Tất Cả ({Object.keys(HPVN_ROLES).length})</span>
          </button>
          
          <button
            onClick={() => setFilter('ORDER_OF_PHOENIX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'ORDER_OF_PHOENIX'
                ? 'bg-amber-950 text-amber-300 border-2 border-amber-500 ring-1 ring-amber-400'
                : 'bg-[#1a0e07] text-amber-200/70 hover:text-amber-200 border border-[#7a5229]'
            }`}
          >
            <PhoenixCrest className="w-4 h-4 text-amber-400" />
            <span>Phượng Hoàng ({hphRoles.length})</span>
          </button>

          <button
            onClick={() => setFilter('DEATH_EATERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'DEATH_EATERS'
                ? 'bg-emerald-950 text-emerald-300 border-2 border-emerald-500 ring-1 ring-emerald-400'
                : 'bg-[#1a0e07] text-emerald-200/70 hover:text-emerald-200 border border-[#7a5229]'
            }`}
          >
            <DarkMarkCrest className="w-4 h-4 text-emerald-400" />
            <span>Tử Thần ({fourTRoles.length})</span>
          </button>

          <button
            onClick={() => setFilter('NEUTRAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'NEUTRAL'
                ? 'bg-purple-950 text-purple-300 border-2 border-purple-500 ring-1 ring-purple-400'
                : 'bg-[#1a0e07] text-purple-200/70 hover:text-purple-200 border border-[#7a5229]'
            }`}
          >
            <DeathlyHallowsSymbol className="w-4 h-4 text-purple-300" />
            <span>Trung Lập ({neutralRoles.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bd8436]" />
        <input
          type="text"
          placeholder="Tìm kiếm danh tính hoặc chức năng phù thủy (ví dụ: Harry, Neville, Soi, Bọc lót...)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#140b05] border-2 border-[#7a5229] rounded-xl text-[#ffd88f] placeholder-[#bd8436]/60 text-xs sm:text-sm font-serif focus:outline-none focus:border-[#ffd88f] transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Faction Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#240e0c]/80 border border-red-800/80 rounded-xl p-3 flex items-center gap-3">
          <PhoenixCrest className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <p className="text-xl font-mono font-bold text-amber-300">{hphRoles.length} Nhân vật</p>
            <p className="text-xs text-red-200 font-serif">Hội Phượng Hoàng</p>
          </div>
        </div>

        <div className="bg-[#092217]/80 border border-emerald-800/80 rounded-xl p-3 flex items-center gap-3">
          <DarkMarkCrest className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xl font-mono font-bold text-emerald-300">{fourTRoles.length} Nhân vật</p>
            <p className="text-xs text-emerald-200 font-serif">Tử Thần Thực Tử</p>
          </div>
        </div>

        <div className="bg-[#22102e]/80 border border-purple-800/80 rounded-xl p-3 flex items-center gap-3">
          <DeathlyHallowsSymbol className="w-8 h-8 text-purple-300 shrink-0" />
          <div>
            <p className="text-xl font-mono font-bold text-purple-300">{neutralRoles.length} Nhân vật</p>
            <p className="text-xs text-purple-200 font-serif">Phe Trung Lập</p>
          </div>
        </div>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredRoles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            onClick={() => onSelectRole?.(role.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12 bg-[#140b05] border border-[#7a5229] rounded-2xl">
          <p className="text-[#ebdcb0]/60 font-lora italic text-sm">
            Không tìm thấy phù thủy nào khớp với từ khóa &ldquo;{search}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FACTION CONFIG HELPER
// ============================================================================

function getFactionConfig(faction: string) {
  switch (faction) {
    case 'ORDER_OF_PHOENIX':
      return {
        label: 'HỘI PHƯỢNG HOÀNG',
        borderColor: 'border-amber-600/70',
        bgColor: 'bg-amber-950/30',
        textColor: 'text-amber-300',
        factionBgColor: 'bg-amber-950/90',
        iconBgColor: 'bg-amber-900/50',
      };
    case 'DEATH_EATERS':
      return {
        label: 'TỬ THẦN THỰC TỬ',
        borderColor: 'border-emerald-600/70',
        bgColor: 'bg-emerald-950/30',
        textColor: 'text-emerald-300',
        factionBgColor: 'bg-emerald-950/90',
        iconBgColor: 'bg-emerald-900/50',
      };
    case 'NEUTRAL':
      return {
        label: 'TRUNG LẬP',
        borderColor: 'border-purple-600/70',
        bgColor: 'bg-purple-950/30',
        textColor: 'text-purple-300',
        factionBgColor: 'bg-purple-950/90',
        iconBgColor: 'bg-purple-900/50',
      };
    default:
      return {
        label: 'KHÔNG RÕ',
        borderColor: 'border-[#7a5229]',
        bgColor: 'bg-[#180e07]',
        textColor: 'text-[#ebdcb0]',
        factionBgColor: 'bg-[#24150c]',
        iconBgColor: 'bg-[#24150c]',
      };
  }
}
