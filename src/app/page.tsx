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
import { FlooChatDrawer, FlooHeaderTrigger, FlooFloatingTrigger } from '@/components/FlooChatDrawer';
import { BookOpen, User, RotateCcw, AlertTriangle, Wifi, WifiOff, Clock, Package, Bot } from 'lucide-react';
import { FlightTrack } from '@/components/FlightTrack';
import { WeasleyCrateModal } from '@/components/WeasleyCrateModal';
import { CinematicFXOverlay } from '@/components/CinematicFXOverlay';

export default function Home() {
  const { 
    gameState, 
    currentPlayerId, 
    impersonatePlayer,
    consumeWeasleyItem,
    clearVisualFX,
    roomCode,
    isHost,
    connStatus,
    disconnectCountdown 
  } = useGame();

  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isFlooOpen, setIsFlooOpen] = useState(false);
  const [isWeasleyCrateOpen, setIsWeasleyCrateOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

  // Quyền đổi góc nhìn (Perspective Switcher):
  // CHỈ DUY NHẤT ở chế độ Giả Lập (!roomCode), host và tất cả người chơi khác mới có thể nhìn qua góc nhìn của nhau để kiểm thử.
  // Ở chế độ phòng Online (có roomCode), TUYỆT ĐỐI KHÔNG AI được đổi góc nhìn để bảo đảm tính bảo mật, tránh nhìn trộm thẻ bài bí mật!
  const isSimulationMode = !roomCode;
  const canSwitchPerspective = isSimulationMode;

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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Magical Navigation Bar - Styled after HPVN Floo Shoutbox Header */}
      <header className="sticky top-0 z-40 hpvn-header-banner px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between backdrop-blur-md gap-1.5 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <PhoenixCrest className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-title-magical font-bold text-xs sm:text-xl md:text-2xl tracking-wide text-[#ffd88f] flex items-center gap-1 leading-none">
                <span className="hidden sm:inline">⚡</span> 
                <span className="truncate hidden sm:inline">HPVN · BẢY POTTER</span> 
                <span className="truncate sm:hidden">BẢY POTTER</span> 
                <span className="hidden sm:inline">⚡</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-lora italic text-[#ebdcb0]/80 tracking-widest hidden lg:inline truncate">
                MẠNG FLOO HỘI PHƯỢNG HOÀNG · TRẬN CHIẾN TRÊN KHÔNG
              </span>
            </div>
            <DarkMarkCrest className="w-5 h-5 sm:w-7 sm:h-7 hidden sm:block shrink-0" />
          </div>
        </div>

        {/* Center/Right Controls: Perspective Switcher & Rulebook */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Floo Realtime Status Beacon */}
          <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg bg-[#1a0e07]/90 border border-[#7a5229] text-[10px] sm:text-[11px] font-mono text-[#ffd88f] shrink-0">
            {roomCode ? (
              <>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  connStatus === 'connected' 
                    ? 'bg-emerald-400 animate-pulse' 
                    : connStatus === 'connecting' || connStatus === 'reconnecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-red-500'
                }`} />
                <span className="font-bold">
                  <span className="hidden sm:inline">Phòng: </span>#{roomCode}
                </span>
              </>
            ) : (
              <span 
                title="Chế độ Giả Lập: Cho phép đổi góc nhìn tự do giữa các người chơi để kiểm thử"
                className="flex items-center gap-1 font-bold text-cyan-300 font-mono text-[10px] sm:text-[11px]"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Chế độ </span>Giả Lập
              </span>
            )}
          </div>

          {/* Floo Shoutbox Header Button (In-App Drawer) */}
          <FlooHeaderTrigger onClick={() => setIsFlooOpen(true)} />

          {/* Weasleys' Wizard Wheezes Supply Crate Button */}
          {gameState.phase !== 'LOBBY' && (
            <button
              onClick={() => setIsWeasleyCrateOpen(true)}
              title="Hòm Đồ Tiệm Phù Thủy Weasley"
              className="hpvn-btn-gold p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer relative shrink-0"
            >
              <Package size={14} className="text-amber-300 shrink-0" />
              <span className="text-[11px] sm:text-xs hidden md:inline">Bảo Bối Weasley</span>
              <span className="text-[11px] hidden sm:inline md:hidden">Bảo Bối</span>
              {(gameState.weasleyItems || []).some(i => i.count > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          {/* Rulebook / Codex Deck Button */}
          <button
            onClick={() => setIsDeckOpen(true)}
            title="Xem 22 thẻ bài & luật chơi"
            className="hpvn-btn-gold p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <BookOpen size={14} className="shrink-0" />
            <span className="text-[11px] sm:text-xs hidden md:inline">Bí Kíp 22 Thẻ Bài</span>
            <span className="text-[11px] hidden sm:inline md:hidden">Bí Kíp</span>
          </button>

          {/* Perspective Indicator / Impersonator: CHỈ DUY NHẤT Ở CHẾ ĐỘ GIẢ LẬP MỚI MỞ CHO TẤT CẢ MỌI NGƯỜI */}
          {gameState.players.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#1a0e07] px-1.5 sm:px-2 py-1 rounded border border-[#7a5229] text-xs shrink-0 max-w-[100px] sm:max-w-[190px]">
              {canSwitchPerspective ? (
                <>
                  <Bot size={12} className="text-cyan-400 shrink-0" />
                  <span className="hidden md:inline text-[11px] text-cyan-200/90 font-mono font-semibold">
                    Góc nhìn:
                  </span>
                  <select
                    value={currentPlayerId || ''}
                    onChange={(e) => impersonatePlayer(e.target.value)}
                    className="bg-transparent text-[10px] sm:text-xs text-[#ffd88f] font-serif font-bold focus:outline-none cursor-pointer truncate max-w-[75px] sm:max-w-[145px]"
                    title="Chế độ giả lập: Tự do chuyển đổi góc nhìn giữa Quản trò, Host và các người chơi khác"
                  >
                    {gameState.players.map((p, idx) => (
                      <option key={`perspective-${p.id || idx}`} value={p.id} className="bg-[#1a0e07] text-[#ffd88f]">
                        {p.name} {p.isGM ? '👑 (GM)' : (p.isBot || p.name.includes('(Bot)') || p.id.startsWith('bot_')) ? '🤖' : ''} {p.role ? `· ${p.role.name}` : ''}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <User size={12} className="text-[#ffd88f] shrink-0" />
                  <span 
                    className="text-[10px] sm:text-xs text-[#ffd88f] font-serif font-bold truncate max-w-[75px] sm:max-w-[145px]"
                    title={`Bạn đang tham gia với tư cách: ${currentPlayer?.name}`}
                  >
                    {currentPlayer?.name || 'Phù thủy'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 4-Stage Flight Progress Track (Active during gameplay) */}
      {gameState.phase !== 'LOBBY' && gameState.phase !== 'END' && (
        <FlightTrack 
          flightStage={gameState.flightStage || 1}
          maxStages={gameState.maxStages || 4}
          goldenFlameUsed={gameState.goldenFlameUsed || false}
          round={gameState.round}
          phase={gameState.phase}
        />
      )}

      {/* 10-Minute Host Disconnection Countdown Warning Banner */}
      {disconnectCountdown !== null && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-700/80 text-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm font-serif flex items-center justify-center gap-2 animate-pulse z-30">
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
            className="hpvn-panel-gold rounded-2xl p-6 max-w-sm w-full text-center border-2 border-[#bd8436] space-y-4 animate-in fade-in zoom-in duration-200"
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
                  const keys = [
                    'seven-potters-mock-state',
                    'seven-potters-session-id',
                    'seven-potters-room-code',
                    'seven-potters-is-host',
                    'seven-potters-player-name',
                    'seven-potters-is-gm',
                    'seven-potters-house',
                    'seven-potters-user-tag',
                    'seven-potters-hpvn-uid',
                    'seven-potters-session-timestamp',
                  ];
                  keys.forEach(k => {
                    try {
                      sessionStorage.removeItem(k);
                      localStorage.removeItem(k);
                    } catch {}
                  });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer"
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

      {/* Weasleys' Wizard Wheezes Supply Crate Modal */}
      <WeasleyCrateModal 
        isOpen={isWeasleyCrateOpen}
        onClose={() => setIsWeasleyCrateOpen(false)}
        items={gameState.weasleyItems || []}
        players={gameState.players}
        currentPlayerId={currentPlayerId}
        currentPhase={gameState.phase}
        onUseItem={(itemId, targetId) => {
          return consumeWeasleyItem(itemId, targetId);
        }}
      />

      {/* Floating Magic Trigger for In-App Floo Chat */}
      <FlooFloatingTrigger onClick={() => setIsFlooOpen(true)} />

      {/* In-App Floo Chat Drawer */}
      <FlooChatDrawer 
        isOpen={isFlooOpen} 
        onClose={() => setIsFlooOpen(false)} 
        onOpen={() => setIsFlooOpen(true)} 
      />

      {/* Cinematic Visual FX Overlay for High-Stakes Events */}
      <CinematicFXOverlay 
        activeFX={gameState.activeFX} 
        onDismiss={clearVisualFX} 
      />
    </div>
  );
}
