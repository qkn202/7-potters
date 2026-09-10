"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Home, CloudLightning, Key, Castle, Sparkles, Flame, Check } from 'lucide-react';

interface FlightTrackProps {
  flightStage: number; // Current stage
  maxStages?: number; // Total stages (4, 5, or 6)
  goldenFlameUsed: boolean;
  round: number;
  phase: string;
}

const ALL_LOCATIONS = [
  {
    key: 'privet',
    name: 'Privet Drive',
    fullTitle: 'Số 4 Privet Drive',
    desc: 'Cất cánh bí mật',
    icon: Home,
  },
  {
    key: 'storm',
    name: 'Mây Giông',
    fullTitle: 'Tầng Mây Giông Bão',
    desc: 'Không chiến ác liệt',
    icon: CloudLightning,
  },
  {
    key: 'tonks',
    name: 'Nhà Tonks',
    fullTitle: 'Trạm Bố Mẹ Tonks',
    desc: 'Sơ cứu & Chuyển tiếp',
    icon: Home,
  },
  {
    key: 'ottery',
    name: 'Đồi Ottery',
    fullTitle: 'Đồi Ottery St Catchpole',
    desc: 'Vượt vòng vây hắc ám',
    icon: Key,
  },
  {
    key: 'portkey',
    name: 'Khóa Cảng',
    fullTitle: 'Trạm Khóa Cảng',
    desc: 'Phối hợp tiếp cận',
    icon: Key,
  },
  {
    key: 'burrow',
    name: 'Hang Sóc',
    fullTitle: 'Trang Trại Hang Sóc',
    desc: 'Hạ cánh an toàn!',
    icon: Castle,
  },
];

const getStagesList = (maxStages: number = 4) => {
  if (maxStages === 5) {
    return [
      { stage: 1, ...ALL_LOCATIONS[0] },
      { stage: 2, ...ALL_LOCATIONS[1] },
      { stage: 3, ...ALL_LOCATIONS[2] }, // Nhà Tonks
      { stage: 4, ...ALL_LOCATIONS[4] }, // Khóa Cảng
      { stage: 5, ...ALL_LOCATIONS[5] }, // Hang Sóc
    ];
  }
  if (maxStages >= 6) {
    return [
      { stage: 1, ...ALL_LOCATIONS[0] },
      { stage: 2, ...ALL_LOCATIONS[1] },
      { stage: 3, ...ALL_LOCATIONS[2] }, // Nhà Tonks
      { stage: 4, ...ALL_LOCATIONS[3] }, // Đồi Ottery
      { stage: 5, ...ALL_LOCATIONS[4] }, // Khóa Cảng
      { stage: 6, ...ALL_LOCATIONS[5] }, // Hang Sóc
    ];
  }
  // Default 4 stages
  return [
    { stage: 1, ...ALL_LOCATIONS[0] },
    { stage: 2, ...ALL_LOCATIONS[1] },
    { stage: 3, ...ALL_LOCATIONS[4] }, // Khóa Cảng
    { stage: 4, ...ALL_LOCATIONS[5] }, // Hang Sóc
  ];
};

export function FlightTrack({ flightStage = 1, maxStages = 4, goldenFlameUsed, round, phase }: FlightTrackProps) {
  const totalStages = Math.max(4, Math.min(6, maxStages || 4));
  const currentStage = Math.max(1, Math.min(totalStages, flightStage || 1));
  const stages = getStagesList(totalStages);
  const progressPct = ((currentStage - 1) / (stages.length - 1)) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-2 sm:py-2.5">
      <div className="relative bg-gradient-to-r from-[#170c06]/95 via-[#231207]/95 to-[#170c06]/95 border border-[#8a6032]/70 rounded-xl p-2.5 sm:p-3.5 shadow-xl shadow-black/40 backdrop-blur-md overflow-hidden">
        
        {/* Subtle magical background shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Header bar within the track */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="font-serif font-bold text-[#ffd88f] text-[11px] sm:text-xs tracking-wider uppercase">
              Hành Trình Về Hang Sóc · Chặng {currentStage}/{totalStages}
            </span>
          </div>

          {/* Golden Flame indicator */}
          <div className="flex items-center gap-1.5 bg-[#120803]/80 px-2 py-0.5 rounded-full border border-[#7a5229]/60 text-[10px] sm:text-[11px]">
            {goldenFlameUsed ? (
              <>
                <Flame size={12} className="text-amber-500 animate-pulse" />
                <span className="text-amber-300 font-serif">Tia Lửa Vàng: <strong className="text-amber-400">Đã Phát Hỏa</strong></span>
              </>
            ) : (
              <>
                <Sparkles size={12} className="text-emerald-400" />
                <span className="text-[#ebdcb0]/80 font-serif">Tia Lửa Vàng: <strong className="text-emerald-400">Sẵn Sàng Cứu Harry</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Progress Timeline Track */}
        <div className="relative my-2 sm:my-3">
          {/* Background baseline track */}
          <div className="absolute top-1/2 left-4 right-4 sm:left-8 sm:right-8 -translate-y-1/2 h-1 bg-[#3a200f] rounded-full" />
          
          {/* Active Glowing Progress Track */}
          <motion.div 
            className="absolute top-1/2 left-4 sm:left-8 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `calc(${progressPct}% - ${progressPct > 0 ? '16px' : '0px'})` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Dynamic Nodes on the Track */}
          <div className="relative flex justify-between items-center px-1 sm:px-4">
            {stages.map((s) => {
              const isPast = s.stage < currentStage;
              const isCurrent = s.stage === currentStage;
              const isFuture = s.stage > currentStage;
              const Icon = s.icon;

              return (
                <div key={`flight-stage-${s.stage}`} className="flex flex-col items-center group">
                  {/* Node Circle */}
                  <div 
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-gradient-to-b from-amber-400 to-amber-700 text-black shadow-[0_0_14px_rgba(251,191,36,0.8)] ring-2 ring-amber-200 scale-110 z-10' 
                        : isPast 
                        ? 'bg-[#2b170a] text-amber-400 border border-amber-500/60' 
                        : 'bg-[#1a0e06] text-[#7a5229] border border-[#3e2410]'
                    }`}
                  >
                    {isPast ? (
                      <Check size={14} className="sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                    )}

                    {/* Ping ring on current stage */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full border border-amber-300 animate-ping opacity-30 pointer-events-none" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="text-center mt-1 sm:mt-1.5 max-w-[65px] sm:max-w-[95px]">
                    <span className={`block font-serif text-[10px] sm:text-xs font-bold truncate leading-tight ${
                      isCurrent 
                        ? 'text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' 
                        : isPast 
                        ? 'text-[#ebdcb0]/90' 
                        : 'text-[#ebdcb0]/40'
                    }`}>
                      {s.name}
                    </span>
                    <span className="hidden sm:block text-[9px] text-[#ebdcb0]/50 truncate">
                      {s.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle sub-text */}
        <div className="text-center text-[10px] sm:text-[11px] text-[#ebdcb0]/60 font-serif italic mt-1">
          {currentStage >= totalStages ? (
            <span className="text-amber-400 font-bold">✨ Đoàn bay đã đáp xuống Hang Sóc! Bùa bảo hộ cổ xưa bảo vệ toàn thắng!</span>
          ) : (
            <span>Mỗi hiệp sống sót đưa đoàn bay tiến gần hơn đến Hang Sóc. Sống sót đến Chặng {totalStages} để chiến thắng!</span>
          )}
        </div>

      </div>
    </div>
  );
}
