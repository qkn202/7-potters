"use client";

import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { JoinForm } from '@/components/JoinForm';
import { Lobby } from '@/components/Lobby';
import { PlayerScreen } from '@/components/PlayerScreen';
import { GMDashboard } from '@/components/GMDashboard';
import { CardDeckModal } from '@/components/CardDeckModal';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol 
} from '@/components/ArtAssets';
import { BookOpen, User, RotateCcw, AlertTriangle, Wifi, WifiOff, Clock } from 'lucide-react';

export default function Home() {
  const { 
    gameState, 
    currentPlayerId, 
    impersonatePlayer,
    roomCode,
    isHost,
    connStatus,
    disconnectCountdown 
  } = useGame();

  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

  // Screen routing based on state
  let content;
  if (!currentPlayerId || !currentPlayer) {
    content = <JoinForm />;
  } else if (gameState.phase === 'LOBBY') {
    content = <Lobby />;
  } else if (currentPlayer.isGM) {
    content = <GMDashboard />;
  } else {
    content = <PlayerScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      
      {/* Top Magical Navigation Bar - Styled after HPVN Floo Shoutbox Header */}
      <header className="sticky top-0 z-40 hpvn-header-banner px-2.5 sm:px-4 py-2 flex items-center justify-between shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PhoenixCrest className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
            <div className="flex flex-col min-w-0">
              <span className="font-title-magical font-bold text-base sm:text-xl md:text-2xl tracking-wide text-[#ffd88f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-1 leading-none truncate">
                <span>⚡</span> HPVN · BẢY POTTER <span>⚡</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-lora italic text-[#ebdcb0]/80 tracking-widest hidden md:inline">
                MẠNG FLOO HỘI PHƯỢNG HOÀNG · TRẬN CHIẾN TRÊN KHÔNG
              </span>
            </div>
            <DarkMarkCrest className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] hidden sm:block" />
          </div>
        </div>

        {/* Center/Right Controls: Perspective Switcher & Rulebook */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Floo Realtime Status Beacon */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a0e07]/80 border border-[#7a5229] text-[11px] font-mono text-[#ffd88f]">
            {roomCode ? (
              <>
                <span className={`w-2 h-2 rounded-full ${
                  connStatus === 'connected' 
                    ? 'bg-emerald-400 animate-pulse' 
                    : connStatus === 'connecting' || connStatus === 'reconnecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-red-500'
                }`} />
                <span className="hidden sm:inline font-bold">Phòng: {roomCode}</span>
                <span className="text-[10px] text-[#ebdcb0]/80 hidden md:inline">
                  ({connStatus === 'connected' ? 'Trực Tuyến' : connStatus === 'connecting' ? 'Đang Nối...' : 'Mất Kết Nối'})
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="hidden sm:inline">Cục bộ</span>
              </>
            )}
          </div>

          {/* Rulebook / Codex Deck Button */}
          <button
            onClick={() => setIsDeckOpen(true)}
            title="Xem 22 thẻ bài & luật chơi"
            className="hpvn-btn-gold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1 shadow-md cursor-pointer"
          >
            <BookOpen size={14} />
            <span className="text-[11px] sm:text-xs">Bí Kíp<span className="hidden sm:inline"> 22 Thẻ Bài</span></span>
          </button>

          {/* Quick Perspective Impersonator (Helpful for GM or testing) */}
          {gameState.players.length > 0 && (
            <div className="flex items-center gap-1 bg-[#1a0e07] px-2 py-1 rounded border border-[#7a5229] text-xs">
              <User size={12} className="text-[#ffd88f] shrink-0" />
              <span className="hidden md:inline text-[11px] text-[#ebdcb0]/70 font-mono">Góc nhìn:</span>
              <select
                value={currentPlayerId || ''}
                onChange={(e) => impersonatePlayer(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs text-[#ffd88f] font-serif font-bold focus:outline-none cursor-pointer max-w-[105px] sm:max-w-[160px] truncate"
              >
                {gameState.players.map((p, idx) => (
                  <option key={`perspective-${p.id || idx}`} value={p.id} className="bg-[#1a0e07] text-[#ffd88f]">
                    {p.name} {p.isGM ? '👑 (GM)' : p.role ? `· ${p.role.name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* 10-Minute Host Disconnection Countdown Warning Banner */}
      {disconnectCountdown !== null && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-700/80 text-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm font-serif flex items-center justify-center gap-2 shadow-lg animate-pulse z-30">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Cảnh Báo:</strong> Quản trò / Chủ phòng đang tạm ngắt kết nối. Phòng chơi sẽ được bảo lưu trong:{' '}
            <strong className="font-mono text-white text-sm bg-black/40 px-2 py-0.5 rounded border border-amber-500/50">
              {Math.floor(disconnectCountdown / 60)}:{(disconnectCountdown % 60).toString().padStart(2, '0')}
            </strong>
            {' '}(Đang chờ Quản trò kết nối lại...)
          </span>
        </div>
      )}

      {/* Main Content Area with safe bottom spacing */}
      <main className="flex-1 pb-16 sm:pb-8">
        {content}
      </main>

      {/* HPVN Floo Footer */}
      <footer className="py-4 px-4 text-center text-xs text-[#ebdcb0]/70 border-t border-[#7a5229]/60 bg-[#140b05]/90 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <DeathlyHallowsSymbol className="w-4 h-4 text-[#bd8436]" />
          <span className="font-lora">
            HPVN Archive · Trận Chiến Bảy Potter (The Battle of the Seven Potters) · Realtime Multiplayer Edition
          </span>
        </div>

        {/* Force Reset Emergency Button for Tester */}
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="text-[11px] text-red-400/90 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 px-2.5 py-1 rounded transition-colors border border-red-900/50 flex items-center gap-1 font-mono cursor-pointer"
        >
          <RotateCcw size={11} /> Reset dữ liệu thử nghiệm
        </button>
      </footer>

      {/* Global Card Deck Codex Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Reset Confirmation In-App Modal */}
      {showResetConfirm && (
        <div 
          onClick={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="hpvn-panel-gold rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-2 border-[#bd8436] space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] tracking-wide">
              Khôi Phục Khẩn Cấp
            </h3>

            <p className="text-xs text-[#ebdcb0] font-lora leading-relaxed">
              Hành động này sẽ xóa sạch dữ liệu phòng chơi và đặt lại toàn bộ ván cờ về trạng thái ban đầu. Bạn có chắc chắn muốn thực hiện?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('seven-potters-mock-state');
                  sessionStorage.removeItem('seven-potters-session-id');
                  sessionStorage.removeItem('seven-potters-room-code');
                  sessionStorage.removeItem('seven-potters-is-host');
                  sessionStorage.removeItem('seven-potters-player-name');
                  sessionStorage.removeItem('seven-potters-is-gm');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-serif font-bold shadow-md transition-colors cursor-pointer"
              >
                Xác nhận Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-[#28180e] hover:bg-[#3a2213] text-[#ebdcb0] rounded-xl text-xs font-serif border border-[#7a5229] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
