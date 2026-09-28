"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Wand2, 
  Crosshair, 
  Sparkles, 
  Moon, 
  Sun, 
  Maximize2, 
  X, 
  ChevronUp, 
  AlertCircle, 
  Check, 
  Package, 
  Eye, 
  Skull, 
  Zap, 
  Flame, 
  HelpCircle,
  Clock,
  Compass,
  Feather
} from 'lucide-react';
import { ROLES } from '@/lib/roles';

// Mock Players data using real images from public/cards/
const MOCK_PLAYERS = [
  { id: 'p1', name: 'Harry Potter (Bạn)', roleId: 'HARRY_POTTER', faction: 'ORDER_OF_PHOENIX', image: '/cards/harry.jpg', status: 'ALIVE', house: 'Gryffindor' },
  { id: 'p2', name: 'Hermione Granger', roleId: 'HERMIONE_GRANGER', faction: 'ORDER_OF_PHOENIX', image: '/cards/hermione.jpg', status: 'ALIVE', house: 'Gryffindor', isEscorted: true },
  { id: 'p3', name: 'Ron Weasley', roleId: 'RON_WEASLEY', faction: 'ORDER_OF_PHOENIX', image: '/cards/ron.jpg', status: 'ALIVE', house: 'Gryffindor' },
  { id: 'p4', name: 'Severus Snape', roleId: 'SEVERUS_SNAPE', faction: 'ORDER_OF_PHOENIX', image: '/cards/snape.jpg', status: 'ALIVE', house: 'Slytherin' },
  { id: 'p5', name: 'Albus Dumbledore', roleId: 'ALBUS_DUMBLEDORE', faction: 'ORDER_OF_PHOENIX', image: '/cards/dumbledore.jpg', status: 'ALIVE', house: 'Gryffindor' },
  { id: 'p6', name: 'Remus Lupin', roleId: 'REMUS_LUPIN', faction: 'ORDER_OF_PHOENIX', image: '/cards/lupin.jpg', status: 'ALIVE', house: 'Gryffindor' },
  { id: 'p7', name: 'Kingsley Shacklebolt', roleId: 'KINGSLEY_SHACKLEBOLT', faction: 'ORDER_OF_PHOENIX', image: '/cards/kingsley.jpg', status: 'ALIVE', house: 'Ravenclaw' },
  { id: 'p8', name: 'Bellatrix Lestrange', roleId: 'BELLATRIX_LESTRANGE', faction: 'DEATH_EATERS', image: '/cards/bellatrix.jpg', status: 'DEAD', house: 'Slytherin' },
  { id: 'p9', name: 'Lucius Malfoy', roleId: 'LUCIUS_MALFOY', faction: 'DEATH_EATERS', image: '/cards/lucius.jpg', status: 'ALIVE', house: 'Slytherin' },
  { id: 'p10', name: 'Lord Voldemort', roleId: 'VOLDEMORT', faction: 'DEATH_EATERS', image: '/cards/voldemort.jpg', status: 'ALIVE', house: 'Slytherin' },
];

export default function PreviewHUDPage() {
  // Simulator State
  const [selectedRoleId, setSelectedRoleId] = useState<string>('HARRY_POTTER');
  const [phase, setPhase] = useState<'NIGHT' | 'DAY'>('NIGHT');
  const [flightStage, setFlightStage] = useState<number>(2);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>('p2');
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentRole = ROLES[selectedRoleId] || ROLES.HARRY_POTTER;
  const isDeathEater = currentRole.faction === 'DEATH_EATERS';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const selectedTargetPlayer = MOCK_PLAYERS.find(p => p.id === selectedTargetId);

  // Dynamic 1-line Mission Prompt based on Role & Phase
  const getMissionPrompt = () => {
    if (phase === 'DAY') {
      return '☀️ Phiên Phán Quyết: Chạm chọn 1 kẻ khả nghi để Biểu Quyết Tước Đũa!';
    }
    if (selectedRoleId === 'HARRY_POTTER') {
      return '🌙 Đêm 2: Chạm chọn 1 đồng đội để Bay Hộ Tống hoặc ẩn mình bảo toàn sinh mạng!';
    }
    if (selectedRoleId === 'VOLDEMORT') {
      return '🌙 Đêm 2: Chọn 1 mục tiêu để Ám Sát hoặc bấm "Án Binh" để thăm dò!';
    }
    if (selectedRoleId === 'HERMIONE_GRANGER') {
      return '🌙 Đêm 2: Chọn 1 phù thủy để thi triển bùa Soi Danh Tính thật!';
    }
    if (selectedRoleId === 'SEVERUS_SNAPE') {
      return '🌙 Đêm 2: Chọn 1 người để bọc lót Sectumsempra (cứu nếu bị tấn công)!';
    }
    return '🌙 Đêm 2: Chọn 1 đồng đội để sát cánh Bay Hộ Tống né đòn bùa chú!';
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-[#f5ebd7] font-sans flex flex-col items-center py-4 px-2 sm:px-6">
      {/* ============================================================== */}
      {/* TOP CONTROLS TOOLBAR (DÀNH CHO BẠN REVIEW & TEST TRẢI NGHIỆM) */}
      {/* ============================================================== */}
      <div className="w-full max-w-md bg-[#101726]/90 border border-amber-500/30 rounded-2xl p-3 mb-4 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
          <span className="text-xs font-serif font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Compass size={14} className="text-amber-400" /> Bảng Điều Khiển Preview
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Interactive Mockup
          </span>
        </div>

        {/* Role Switcher */}
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] text-zinc-400 font-medium">Chọn nhân vật để xem góc nhìn:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'HARRY_POTTER', label: 'Harry Potter' },
              { id: 'HERMIONE_GRANGER', label: 'Hermione' },
              { id: 'SEVERUS_SNAPE', label: 'Snape' },
              { id: 'VOLDEMORT', label: 'Voldemort' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-serif font-bold transition-all ${
                  selectedRoleId === r.id 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-300/40' 
                    : 'bg-black/40 text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Phase Switcher */}
          <div className="flex items-center justify-between pt-1 mt-1 border-t border-white/5">
            <span className="text-[11px] text-zinc-400">Giai đoạn:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPhase('NIGHT')}
                className={`px-3 py-1 rounded-md text-[11px] font-serif font-bold flex items-center gap-1 ${
                  phase === 'NIGHT' ? 'bg-indigo-950 border border-indigo-400 text-indigo-200' : 'bg-black/30 text-zinc-500'
                }`}
              >
                <Moon size={12} /> Ban Đêm
              </button>
              <button
                onClick={() => setPhase('DAY')}
                className={`px-3 py-1 rounded-md text-[11px] font-serif font-bold flex items-center gap-1 ${
                  phase === 'DAY' ? 'bg-amber-950 border border-amber-400 text-amber-200' : 'bg-black/30 text-zinc-500'
                }`}
              >
                <Sun size={12} /> Ban Ngày
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE DEVICE CONTAINER (CHÍNH XÁC GIAO DIỆN SẼ HIỂN THỊ)       */}
      {/* ============================================================== */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#06080e] border-2 border-amber-600/30 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col min-h-[820px]">
        
        {/* Top Floating Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-12 left-4 right-4 z-50 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-900/95 via-amber-800/95 to-amber-950/95 border border-amber-400/80 text-amber-100 text-xs font-serif font-bold shadow-2xl flex items-center justify-between"
            >
              <span>{toastMsg}</span>
              <button onClick={() => setToastMsg(null)}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================== */}
        {/* ZONE 1: TOP HUD · CHẶNG BAY & THỜI GIAN                    */}
        {/* ========================================================== */}
        <div className="px-4 pt-4 pb-2 border-b border-amber-500/15 bg-black/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            {/* Stage Info */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-serif font-black text-xs tracking-wider text-amber-300 uppercase">
                Chặng {flightStage}/4
              </span>
              <span className="text-[11px] text-zinc-400 font-serif">· Tầng Mây Giông</span>
            </div>

            {/* Phase Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-serif font-bold flex items-center gap-1.5 border shadow-inner ${
              phase === 'NIGHT' 
                ? 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-indigo-950/50' 
                : 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50'
            }`}>
              {phase === 'NIGHT' ? <Moon size={12} className="text-indigo-400" /> : <Sun size={12} className="text-amber-400" />}
              <span>{phase === 'NIGHT' ? 'Đêm 2' : 'Ngày 2'}</span>
              <span className="text-[9px] font-mono text-zinc-400">25s</span>
            </div>
          </div>

          {/* Micro Flight Progress Bar */}
          <div className="mt-2.5 w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 transition-all duration-500" style={{ width: `${(flightStage / 4) * 100}%` }} />
          </div>
        </div>

        {/* ========================================================== */}
        {/* ZONE 2: COMPACT HERO PASSPORT (THẺ CĂN CƯỚC THU GỌN)      */}
        {/* ========================================================== */}
        <div className="px-4 py-3 bg-gradient-to-r from-black/50 via-[#121927]/60 to-black/50 border-b border-white/5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Avatar with Glowing Arcane Halo */}
            <div className="relative group cursor-pointer" onClick={() => setIsCardModalOpen(true)}>
              <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 shadow-lg overflow-hidden relative ${
                isDeathEater 
                  ? 'border-emerald-500/80 shadow-emerald-950/50' 
                  : 'border-amber-400/90 shadow-amber-950/50'
              }`}>
                <Image 
                  src={currentRole.image || '/cards/harry.jpg'} 
                  alt={currentRole.name} 
                  fill 
                  className="object-cover rounded-[14px]"
                  priority
                />
              </div>
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-black/80 border border-amber-400/60 text-amber-300">
                <Maximize2 size={10} />
              </span>
            </div>

            {/* Middle: Title, Faction & Key Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif font-black text-sm text-[#ffd88f] truncate">
                  {currentRole.name}
                </h2>
                {selectedRoleId === 'HARRY_POTTER' && <span title="Kẻ Được Chọn">👑</span>}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-serif font-bold px-2 py-0.5 rounded-full border ${
                  isDeathEater 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}>
                  {isDeathEater ? '🐍 Tử Thần Thực Tử' : '🦅 Hội Phượng Hoàng'}
                </span>
                
                {selectedRoleId === 'HARRY_POTTER' && (
                  <span className="text-[10px] font-mono text-amber-200/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400" /> Tia Lửa Vàng
                  </span>
                )}
              </div>
            </div>

            {/* Right: Info Passport Button */}
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="py-1.5 px-2.5 rounded-xl bg-black/40 hover:bg-black/70 border border-amber-500/30 text-amber-300/90 hover:text-amber-200 text-[11px] font-serif flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-md"
              title="Xem toàn bộ lá bài và câu chuyện"
            >
              <HelpCircle size={15} />
              <span className="text-[9px]">Chi tiết</span>
            </button>
          </div>

          {/* Dynamic 1-Line Mission Bar (Thay thế hoàn toàn Action Coach 4 tầng) */}
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-black/50 to-amber-950/40 border border-amber-500/25 flex items-center gap-2 text-xs font-serif text-amber-200/90 shadow-sm animate-pulse">
            <span className="text-amber-400 shrink-0">👉</span>
            <span className="truncate">{getMissionPrompt()}</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ZONE 3: FLIGHT FORMATION ARENA (ĐẤU TRƯỜNG PHI ĐỘI BẦU TRỜ) */}
        {/* ========================================================== */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-2 pb-28">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] font-serif font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Feather size={12} className="text-amber-400" /> Phi Đội Bầu Trời ({MOCK_PLAYERS.length} Phù Thủy)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Chạm để nhắm mục tiêu</span>
          </div>

          {/* Grid of Players: 2 columns on mobile, tactile cards */}
          <div className="grid grid-cols-2 gap-2">
            {MOCK_PLAYERS.map(player => {
              const isSelected = selectedTargetId === player.id;
              const isDead = player.status === 'DEAD';
              const isMe = player.id === 'p1';

              return (
                <motion.div
                  key={player.id}
                  whileTap={!isDead ? { scale: 0.97 } : {}}
                  onClick={() => {
                    if (isDead) {
                      showToast('Người này đã ngã xuống trong trận chiến!');
                      return;
                    }
                    setSelectedTargetId(player.id);
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col items-center text-center ${
                    isDead 
                      ? 'bg-red-950/20 border-red-900/30 opacity-45 cursor-not-allowed' 
                      : isSelected 
                        ? 'bg-gradient-to-b from-[#1c2438] to-[#0e1624] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]' 
                        : 'bg-black/40 hover:bg-[#121927]/60 border-white/10'
                  }`}
                >
                  {/* Selected Crosshair Indicator */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-amber-400 animate-spin" style={{ animationDuration: '6s' }}>
                      <Crosshair size={14} />
                    </span>
                  )}

                  {/* Escorted Shield Badge */}
                  {player.isEscorted && !isDead && (
                    <span className="absolute top-2 left-2 text-amber-300" title="Đang được bay hộ tống">
                      <Shield size={14} className="fill-amber-500/30" />
                    </span>
                  )}

                  {/* Character Avatar Cutout with Status Border */}
                  <div className={`w-14 h-14 rounded-full p-0.5 border-2 mb-2 relative ${
                    isDead 
                      ? 'border-gray-600 grayscale' 
                      : isSelected 
                        ? 'border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                        : 'border-white/20'
                  }`}>
                    <Image 
                      src={player.image} 
                      alt={player.name} 
                      fill 
                      className="object-cover rounded-full"
                    />
                    {isDead && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-red-400">
                        <Skull size={18} />
                      </div>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="font-serif font-black text-xs text-zinc-200 truncate w-full">
                    {player.name}
                  </div>

                  {/* Role or Affiliation Badge */}
                  <div className="mt-1 flex items-center justify-center gap-1 w-full">
                    {isDead ? (
                      <span className="text-[10px] text-red-400 font-mono">Tử trận</span>
                    ) : isSelected ? (
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 font-bold">
                        🎯 Đang Nhắm
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-serif truncate">
                        {isMe ? 'Bạn' : 'Phù thủy'} · {player.house}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================== */}
        {/* ZONE 4: FLOATING BOTTOM ACTION DOCK (VÙNG NGÓN TAY CÁI)     */}
        {/* ========================================================== */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#06080e] via-[#090d16]/95 to-transparent border-t border-white/10 backdrop-blur-lg">
          <div className="flex gap-2 items-center">
            
            {/* Primary Action Button (Tự động đổi theo Vai trò & Phase) */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (!selectedTargetPlayer) {
                  showToast('Vui lòng chạm chọn 1 mục tiêu trên bầu trời!');
                  return;
                }
                const actionLabel = phase === 'DAY' 
                  ? `Đã biểu quyết Tước Đũa: ${selectedTargetPlayer.name}` 
                  : selectedRoleId === 'VOLDEMORT' 
                    ? `Đã ra lệnh Ám Sát: ${selectedTargetPlayer.name}`
                    : selectedRoleId === 'HERMIONE_GRANGER'
                      ? `Đã thi triển Soi Danh Tính: ${selectedTargetPlayer.name}`
                      : `Đã xác nhận Bay Hộ Tống: ${selectedTargetPlayer.name}`;
                showToast(`✓ ${actionLabel}`);
              }}
              className="flex-1 py-3 px-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-serif font-black text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-200/80 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {phase === 'DAY' ? (
                <>
                  <Crosshair size={18} className="text-black shrink-0" />
                  <span className="truncate">Tước Đũa {selectedTargetPlayer ? `(${selectedTargetPlayer.name.split(' ')[0]})` : ''}</span>
                </>
              ) : selectedRoleId === 'VOLDEMORT' ? (
                <>
                  <Zap size={18} className="text-black shrink-0" />
                  <span className="truncate">Ám Sát {selectedTargetPlayer ? `(${selectedTargetPlayer.name.split(' ')[0]})` : ''}</span>
                </>
              ) : selectedRoleId === 'HERMIONE_GRANGER' ? (
                <>
                  <Eye size={18} className="text-black shrink-0" />
                  <span className="truncate">Soi Bài {selectedTargetPlayer ? `(${selectedTargetPlayer.name.split(' ')[0]})` : ''}</span>
                </>
              ) : (
                <>
                  <Shield size={18} className="text-black shrink-0" />
                  <span className="truncate">Hộ Tống {selectedTargetPlayer ? `(${selectedTargetPlayer.name.split(' ')[0]})` : ''}</span>
                </>
              )}
            </motion.button>

            {/* Special Action: Hold Fire (Án Binh) for Voldemort */}
            {selectedRoleId === 'VOLDEMORT' && phase === 'NIGHT' && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => showToast('✓ Chúa Tể Voldemort quyết định: Án Binh Bất Động đêm nay!')}
                className="py-3 px-3 rounded-2xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>🕊️ Án Binh</span>
              </motion.button>
            )}

            {/* Weasley Inventory Bag Trigger Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsInventoryOpen(true)}
              className="py-3 px-3.5 rounded-2xl bg-[#18110b] hover:bg-[#281b11] border border-amber-500/40 text-amber-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              title="Mở túi đồ bảo bối Weasley"
            >
              <Package size={16} className="text-amber-400" />
              <span>Túi Đồ (2)</span>
            </motion.button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* WEASLEY INVENTORY DRAWER (BOTTOM SHEET POPUP)              */}
        {/* ========================================================== */}
        <AnimatePresence>
          {isInventoryOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end"
              onClick={() => setIsInventoryOpen(false)}
            >
              <motion.div 
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                exit={{ y: 200 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#121927] border-t-2 border-amber-400/60 rounded-t-3xl p-5 shadow-2xl space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-amber-300 font-serif font-black text-sm">
                    <Package size={18} /> Túi Bảo Bối Tiệm Phù Thủy Weasley
                  </div>
                  <button onClick={() => setIsInventoryOpen(false)} className="text-zinc-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div 
                    onClick={() => {
                      showToast('✓ Đã rải Bột Khói Mù Peru che kín bầu trời!');
                      setIsInventoryOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-black/50 border border-amber-500/30 hover:border-amber-400 text-left cursor-pointer transition-all active:scale-95"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-serif font-black text-amber-300">Bột Khói Mù</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">1/1</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-serif">Vô hiệu hóa toàn bộ đòn ám sát của TTTT đêm nay.</p>
                  </div>

                  <div 
                    onClick={() => {
                      if (!selectedTargetPlayer) {
                        showToast('Hãy chọn 1 người để tặng Kẹo Ngất Xỉu!');
                        return;
                      }
                      showToast(`✓ Đã cho ${selectedTargetPlayer.name} ăn Kẹo Ngất Xỉu!`);
                      setIsInventoryOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-black/50 border border-amber-500/30 hover:border-amber-400 text-left cursor-pointer transition-all active:scale-95"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-serif font-black text-amber-300">Kẹo Ngất Xỉu</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">1/1</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-serif">Làm mục tiêu bị cấm bỏ phiếu ở vòng kế tiếp.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================== */}
        {/* FULL TAROT CARD INSPECTOR MODAL (XEM TOÀN BỘ LÁ BÀI & LORE) */}
        {/* ========================================================== */}
        <AnimatePresence>
          {isCardModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setIsCardModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-gradient-to-b from-[#18110b] to-[#0a0705] border-2 border-amber-400/80 rounded-3xl p-5 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.3)] relative text-center"
              >
                <button 
                  onClick={() => setIsCardModalOpen(false)} 
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-amber-300 hover:text-white border border-amber-400/40"
                >
                  <X size={16} />
                </button>

                <div className="text-[11px] font-mono text-amber-400/80 tracking-widest uppercase mb-1">
                  {currentRole.cardNumber || '№ 01/22'}
                </div>

                <div className="w-28 h-28 mx-auto rounded-full p-1 border-2 border-amber-400/90 shadow-2xl relative mb-3">
                  <Image 
                    src={currentRole.image || '/cards/harry.jpg'} 
                    alt={currentRole.name} 
                    fill 
                    className="object-cover rounded-full"
                  />
                </div>

                <h3 className="text-xl font-serif font-black text-amber-300 mb-1">{currentRole.name}</h3>
                <div className="text-xs font-serif text-amber-200/80 italic mb-3">{currentRole.title}</div>

                <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-3 text-left space-y-2 mb-4 text-xs font-serif">
                  <div>
                    <span className="text-amber-400 font-bold block mb-0.5">📜 Quyền Năng Thẻ Bài:</span>
                    <p className="text-zinc-300 leading-relaxed">{currentRole.ability}</p>
                  </div>
                  {currentRole.tacticalTip && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-amber-400 font-bold block mb-0.5">💡 Lời Khuyên Chiến Thuật:</span>
                      <p className="text-zinc-400 leading-relaxed">{currentRole.tacticalTip}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 font-serif font-black text-xs text-white shadow-lg border border-amber-300/40"
                >
                  Đóng Sổ Tay
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
