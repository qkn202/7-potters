/**
 * MOD HPVN - Role Cards Display
 * Hiển thị tất cả thẻ vai trò HPVN
 */

'use client';

import React, { useState } from 'react';
import { HPVN_ROLES, Role } from '@/lib/hpvnGameEngine';
import { Users, Heart, Skull, Ghost, Crown, Zap, Shield, Eye, Sword, Sparkles, Info } from 'lucide-react';

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
        bg-gradient-to-b from-[#180e07] to-[#0c0603] shadow-xl
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : ''}
      `}
      onClick={() => onClick?.()}
    >
      {/* Card Artwork Hero Banner */}
      <div className="relative w-full h-44 overflow-hidden border-b border-amber-500/30">
        <img
          src={cardImg}
          alt={role.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#180e07] via-transparent to-black/40" />
        
        {/* Faction Pill Floating */}
        <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-black uppercase tracking-wider ${factionConfig.textColor} ${factionConfig.factionBgColor} border ${factionConfig.borderColor}`}>
          {factionConfig.label}
        </div>

        {/* Phase Type Pill */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-amber-300 border border-amber-400/50">
          {role.phaseType === 'NIGHT' ? '🌙 Đêm' : '☀️ Ngày'}
        </div>
      </div>

      <div className="p-4">
        {/* Title */}
        <div className="mb-2">
          <h3 className="font-serif font-black text-lg text-[#ffd88f] leading-tight">{role.name}</h3>
          <p className="text-xs text-amber-200/70 font-lora italic">{role.title}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {role.canVote && <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">🗳️ Vote</span>}
          {role.canKill && <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700 text-red-300">💀 Kill</span>}
          {(role as any).canScan && <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-700 text-blue-300">🔍 Scan</span>}
          {(role as any).canProtect && <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-300">🛡️ Protect</span>}
        </div>

        {/* Description */}
        <p className="text-xs text-[#ebdcb0]/90 font-lora mb-3 line-clamp-2 leading-relaxed">{role.description}</p>

        {/* Ability Button & Panel */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-serif font-bold cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{expanded ? 'Thu gọn bí kíp' : 'Xem năng lực ma thuật →'}</span>
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-amber-500/20 animate-in fade-in duration-200">
            <div className="bg-black/60 rounded-xl p-3 border border-amber-500/30">
              <h4 className="text-[10px] font-serif font-black uppercase text-amber-400 mb-1 flex items-center gap-1">
                <Sparkles size={11} /> Năng Lực Ma Thuật
              </h4>
              <p className="text-xs text-zinc-100 font-lora leading-relaxed">{role.ability}</p>
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
    const matchesSearch = !search || role.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-slate-900/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Thẻ Vai Trò HPVN</h2>
          <p className="text-sm text-slate-400">Tổng cộng {Object.keys(HPVN_ROLES).length} vai trò</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('ORDER_OF_PHOENIX')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ORDER_OF_PHOENIX' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            HPH
          </button>
          <button
            onClick={() => setFilter('DEATH_EATERS')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'DEATH_EATERS' ? 'bg-red-600 text-white' : 'bg-slate-700 text-sslate-300 hover:bg-slate-600'
            }`}
          >
            4T
          </button>
          <button
            onClick={() => setFilter('NEUTRAL')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'NEUTRAL' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Neutral
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm vai trò..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
          <Heart className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{hphRoles.length}</p>
          <p className="text-xs text-slate-400">Hội Phượng Hoàng</p>
        </div>
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-center">
          <Skull className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">{fourTRoles.length}</p>
          <p className="text-xs text-slate-400">Tử Thần Thực Tử</p>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 text-center">
          <Ghost className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{neutralRoles.length}</p>
          <p className="text-xs text-slate-400">Neutral</p>
        </div>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-12">
          <p className="text-slate-400">Không tìm thấy vai trò phù hợp</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ROLE ICON HELPER
// ============================================================================

function getRoleIcon(roleId: string) {
  const icons: Record<string, React.ReactNode> = {
    HARRY_POTTER: <span className="text-lg">⚡</span>,
    HERMIONE_GRANGER: <span className="text-lg">📚</span>,
    RON_WESLEY: <span className="text-lg">🦞</span>,
    DUMBLEDORE: <Crown className="w-6 h-6 text-yellow-400" />,
    HAGRID: <span className="text-lg">🧍</span>,
    LUPIN: <span className="text-lg">🌙</span>,
    TONKS: <span className="text-lg">🔮</span>,
    MOODY: <Eye className="w-6 h-6 text-blue-400" />,
    McGONAGALL: <Sparkles className="w-6 h-6 text-red-400" />,
    NEVILLE: <Shield className="w-6 h-6 text-green-400" />,
    DRACO: <span className="text-lg">🐍</span>,
    GEORGE: <span className="text-lg">👯</span>,
    FRED: <span className="text-lg">👯</span>,
    SYBILL_TRELAWNEY: <Sparkles className="w-6 h-6 text-purple-400" />,
    VOLDEMORT: <Skull className="w-6 h-6 text-red-400" />,
    BELLATRIX: <span className="text-lg">🗡️</span>,
    LESTRANGE: <Eye className="w-6 h-6 text-red-400" />,
    WORMTAIL: <span className="text-lg">🐀</span>,
    DOLORES_UMBRIDGE: <span className="text-lg">🐸</span>,
    LUCIFUS_MALFORY: <span className="text-lg">🏰</span>,
    JESTER: <span className="text-lg">🃏</span>,
    POLYJUICE_POTION: <span className="text-lg">🧪</span>,
  };
  return icons[roleId] || <Users className="w-6 h-6 text-slate-400" />;
}

// ============================================================================
// FACTION CONFIG HELPER
// ============================================================================

function getFactionConfig(faction: string) {
  switch (faction) {
    case 'ORDER_OF_PHOENIX':
      return {
        label: 'HỘI PHƯỢNG HOÀNG',
        borderColor: 'border-green-500/50',
        bgColor: 'bg-green-900/20',
        textColor: 'text-green-300',
        factionBgColor: 'bg-green-800/50',
        iconBgColor: 'bg-green-800/50',
      };
    case 'DEATH_EATERS':
      return {
        label: 'TỬ THẦN THỰC TỬ',
        borderColor: 'border-red-500/50',
        bgColor: 'bg-red-900/20',
        textColor: 'text-red-300',
        factionBgColor: 'bg-red-800/50',
        iconBgColor: 'bg-red-800/50',
      };
    case 'NEUTRAL':
      return {
        label: 'NEUTRAL',
        borderColor: 'border-yellow-500/50',
        bgColor: 'bg-yellow-900/20',
        textColor: 'text-yellow-300',
        factionBgColor: 'bg-yellow-800/50',
        iconBgColor: 'bg-yellow-800/50',
      };
    default:
      return {
        label: 'UNKNOWN',
        borderColor: 'border-slate-500/50',
        bgColor: 'bg-slate-900/20',
        textColor: 'text-slate-300',
        factionBgColor: 'bg-slate-800/50',
        iconBgColor: 'bg-slate-800/50',
      };
  }
}
