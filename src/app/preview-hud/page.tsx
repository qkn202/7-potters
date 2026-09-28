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
  Feather,
  ChevronDown
} from 'lucide-react';
import { ROLES } from '@/lib/roles';
import { ChocolateFrogPentagonCard, HouseCrestShield } from '@/components/ChocolateFrogPentagonCard';

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
        {/* ZONE 1: TOP HUD · CHẶNG BAY & THỜI GIAN (EXACT MOCKUP)     */}
        {/* ========================================================== */}
        <div className="relative px-3 pt-2 pb-2 flex items-center justify-between select-none">
          {/* Left Side: Glowing Blue Dot + Golden Progress Dash Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse" />
            <div className="flex items-center gap-1">
              <span className="w-6 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
              <span className="w-4 h-1 rounded-full bg-amber-400/60" />
              <span className="w-2.5 h-1 rounded-full bg-amber-400/30" />
            </div>
          </div>

          {/* Center: Hanging Arch Shield Badge (Chặng 2/4) */}
          <div className="relative -mt-1">
            <div className="px-5 py-1.5 rounded-b-2xl bg-gradient-to-b from-[#131d2e] via-[#0d1624] to-[#080d16] border-x border-b-2 border-amber-400/70 shadow-[0_6px_20px_rgba(0,0,0,0.8)] text-center relative z-10 flex flex-col items-center">
              <span className="font-serif font-black text-sm text-[#ffd88f] tracking-wider drop-shadow-md">
                Chặng {flightStage}/4
              </span>
              <div className="text-[9px] text-amber-400/80 -mt-0.5 leading-none">
                ✦
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-amber-400/70" />
          </div>

          {/* Right Side: Night Phase Pill & Pocket Watch + Open Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0c1422]/90 border border-amber-500/40 text-[11px] font-serif text-amber-200 shadow-inner">
              {phase === 'NIGHT' ? <Moon size={11} className="text-cyan-300" /> : <Sun size={11} className="text-amber-400" />}
              <span className="font-bold">{phase === 'NIGHT' ? 'Đêm 2' : 'Ngày 2'}</span>
            </div>

            <button
              onClick={() => setIsCardModalOpen(true)}
              className="p-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Xem Thẻ Bài"
            >
              <Clock size={13} className="text-black" />
            </button>

            <button
              onClick={() => setIsInventoryOpen(true)}
              className="px-2 py-0.5 rounded-lg bg-[#0e1726]/90 hover:bg-[#15233a] border border-[#23354d] text-[11px] font-mono text-cyan-200 flex items-center gap-0.5 cursor-pointer relative shadow"
              title="Menu"
            >
              <span>Open</span>
              <ChevronDown size={11} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 shadow-[0_0_4px_#34d399]" />
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ZONE 2: HERO PASSPORT (EXACT MATCH OF USER'S SCREENSHOT)   */}
        {/* ========================================================== */}
        <div className="mx-2 mb-3 rounded-2xl bg-gradient-to-r from-[#0b1320]/95 via-[#101b2c]/95 to-[#0b1320]/95 border border-[#1e2a3c] p-3 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2.5 relative z-10">
            {/* Left: Square Card Portrait with Glowing Gold Rim */}
            <div 
              onClick={() => setIsCardModalOpen(true)}
              className="relative w-16 h-16 rounded-2xl p-0.5 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0 bg-black cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            >
              <Image 
                src={currentRole.image || '/cards/harry.jpg'} 
                alt={currentRole.name} 
                fill 
                className="object-cover object-top rounded-[14px]"
                priority
              />
            </div>

            {/* Middle: Hero Passport Subtitle + Character Name + Tactical Pill */}
            <div className="flex-1 min-w-0 pr-0.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/90 block mb-0.5 font-bold">
                Hero Passport
              </span>
              <h2 className="font-serif font-black text-lg text-white truncate leading-tight drop-shadow-md">
                {currentRole.name}
              </h2>

              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#161208]/90 border border-amber-500/50 text-[#ffd88f] text-[10px] font-serif flex items-center gap-1 shadow-sm max-w-full truncate">
                <span className="text-amber-400 shrink-0">🌙</span>
                <span className="truncate">{getMissionPrompt()}</span>
              </div>
            </div>

            {/* Right: Gryffindor Shield Crest */}
            <div className="shrink-0 flex items-center justify-center">
              <HouseCrestShield 
                house={isDeathEater ? 'SLYTHERIN' : 'GRYFFINDOR'} 
                className="w-10 h-12 drop-shadow-md" 
              />
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ZONE 3: FLIGHT FORMATION ARENA (PENTAGONAL FROG CARDS)      */}
        {/* ========================================================== */}
        <div className="flex-1 px-2 space-y-2 pb-24 overflow-y-auto">
          {/* 2-Column Responsive Grid matching user's exact mockup */}
          <div className="grid grid-cols-2 gap-2.5">
            {MOCK_PLAYERS.filter(p => p.id !== 'p1').map(player => {
              const isSelected = selectedTargetId === player.id;
              const isDead = player.status === 'DEAD';

              let statusBadgeNode: React.ReactNode = null;
              if (player.isEscorted && !isDead) {
                statusBadgeNode = (
                  <span className="px-2 py-0.5 rounded-full bg-[#0a1829] border border-cyan-400 text-cyan-200 text-[10px] font-serif font-bold shadow-[0_0_10px_rgba(34,211,238,0.5)] flex items-center gap-1 shrink-0 animate-pulse">
                    🛡️ Hộ tống
                  </span>
                );
              }

              return (
                <ChocolateFrogPentagonCard
                  key={player.id}
                  image={player.image}
                  name={player.name}
                  roleName={player.house}
                  isSelected={isSelected}
                  isDead={isDead}
                  statusBadge={statusBadgeNode}
                  onClick={() => {
                    if (isDead) {
                      showToast('Người này đã ngã xuống trong trận chiến!');
                      return;
                    }
                    setSelectedTargetId(player.id);
                  }}
                />
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
