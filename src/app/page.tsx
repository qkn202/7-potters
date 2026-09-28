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
import { FlooChatDrawer, FlooFloatingTrigger } from '@/components/FlooChatDrawer';
import Link from 'next/link';
import { BookOpen, User, RotateCcw, AlertTriangle, Clock, Package, Bot, Crown } from 'lucide-react';
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

  // Perspective switcher allowed only in Simulation mode (!roomCode)
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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#050811] text-slate-100 selection:bg-amber-400 selection:text-black">
      
      {/* 1. FLOATING SIMULATION PERSPECTIVE SWITCHER (FOR TESTERS ONLY IN MOCK MODE) */}
      {canSwitchPerspective && !currentPlayer?.isGM && gameState.players.length > 0 && (
        <div className="fixed top-2 right-2 z-50 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/50 text-[11px] text-cyan-300 font-mono shadow-[0_0_15px_rgba(56,189,248,0.25)] select-none">
          <Bot size={12} className="text-cyan-400 animate-pulse shrink-0" />
          <select
            value={currentPlayerId || ''}
            onChange={(e) => impersonatePlayer(e.target.value)}
            className="bg-transparent text-[11px] text-cyan-200 font-bold focus:outline-none cursor-pointer max-w-[120px] truncate"
            title="Đổi góc nhìn kiểm thử"
          >
            {gameState.players.map((p, idx) => (
              <option key={`perspective-${p.id || idx}`} value={p.id} className="bg-slate-950 text-slate-100">
                {p.name} {p.isGM ? '👑 (GM)' : ''} {p.role ? `· ${p.role.name}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. DEDICATED GM / MERLIN HEADER (ONLY VISIBLE ON GM DASHBOARD) */}
      {currentPlayer?.isGM && (
        <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-amber-400/40 px-3 py-2 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <PhoenixCrest className="w-6 h-6 text-amber-400" />
            <span className="font-cinzel font-black text-sm text-amber-300">
              MERLIN DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-cinzel font-bold"
            >
              27 Thẻ Bài
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-700/60 text-red-300 text-xs font-mono"
            >
              Reset
            </button>
          </div>
        </header>
      )}

      {/* 3. FLIGHT PROGRESS TRACK (ONLY FOR GM) */}
      {gameState.phase !== 'LOBBY' && gameState.phase !== 'END' && currentPlayer?.isGM && (
        <FlightTrack 
          flightStage={gameState.flightStage || 1}
          maxStages={gameState.maxStages || 4}
          goldenFlameUsed={gameState.goldenFlameUsed || false}
          round={gameState.round}
          phase={gameState.phase}
        />
      )}

      {/* 4. DISCONNECTION COUNTDOWN WARNING BANNER */}
      {disconnectCountdown !== null && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-700/80 text-amber-200 px-4 py-2 text-center text-xs font-mono flex items-center justify-center gap-2 animate-pulse z-30">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Chủ phòng tạm ngắt kết nối. Bảo lưu phòng:{' '}
            <strong className="text-white bg-black/50 px-1.5 py-0.5 rounded border border-amber-400/40">
              {Math.floor(disconnectCountdown / 60)}:{(disconnectCountdown % 60).toString().padStart(2, '0')}
            </strong>
          </span>
        </div>
      )}

      {/* 5. MAIN CONTENT AREA */}
      <main className="flex-1 w-full">
        {content}
      </main>

      {/* 6. GLOBAL CARD DECK CODEX MODAL */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* 7. RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div 
          onClick={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="arcane-card-glass rounded-3xl p-5 max-w-xs w-full text-center border border-amber-400/50 space-y-3 shadow-2xl"
          >
            <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              Khôi Phục Dữ Liệu?
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Thao tác này sẽ xóa sạch phòng chơi và đưa ván cờ về trạng thái ban đầu.
            </p>

            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch {}
                  window.location.reload();
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-cinzel font-bold cursor-pointer"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-xs font-cinzel font-bold cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. WEASLEY SUPPLY CRATE MODAL */}
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

      {/* 9. FLOATING MAGIC TRIGGER & FLOO CHAT DRAWER */}
      <FlooFloatingTrigger onClick={() => setIsFlooOpen(true)} />
      <FlooChatDrawer 
        isOpen={isFlooOpen} 
        onClose={() => setIsFlooOpen(false)} 
        onOpen={() => setIsFlooOpen(true)} 
      />

      {/* 10. CINEMATIC VISUAL FX OVERLAY */}
      <CinematicFXOverlay 
        activeFX={gameState.activeFX} 
        onDismiss={clearVisualFX} 
      />
    </div>
  );
}
