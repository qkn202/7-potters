/**
 * MOD HPVN - Ultimate Mode Game Board
 * Giao diện chơi game HPVN
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Users, Skull, Heart, Ghost, Zap, Shield, Sword, Eye, Vote, ChevronRight, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { HPVNGameEngine, GameState, Player, Role, HPVNGameSettings, HPVN_ROLES, HPVN_BALANCE } from './hpvnGameEngine';

// ============================================================================
// TYPES
// ============================================================================

interface HPVNGameBoardProps {
  playerNames: string[];
  settings: HPVNGameSettings;
  currentPlayerId: string;
}

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HPVNGameBoard({ playerNames, settings, currentPlayerId }: HPVNGameBoardProps) {
  const [game] = useState(() => new HPVNGameEngine(playerNames.length, {
    enableGhostVoting: settings.enableGhostVoting,
    enableChaosEvents: settings.enableChaosEvents,
    darkPactProtection: settings.darkPactProtection,
  }));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [timer, setTimer] = useState(20);

  // Initialize game
  useEffect(() => {
    game.initializeGame(playerNames);
    game.startGame();
    setGameState(game.getState());
    addLog('Game started! Night phase begins.');
    setTimer(getPhaseTime('NIGHT'));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameState || gameState.phase === 'GAME_OVER') return;

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          // Time's up - process phase
          handlePhaseComplete();
          return getPhaseTime(gameState.phase);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Update state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState({ ...game.getState() });
    }, 1000);
    return () => clearInterval(interval);
  }, [game]);

  const addLog = (message: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)]);
  };

  const getPhaseTime = (phase: string): number => {
    switch (phase) {
      case 'NIGHT': return 20;
      case 'CHAOS_EVENT': return 10;
      case 'DEATH_RESOLUTION': return 10;
      case 'GHOST_REVELATION': return 5;
      case 'VOTE': return 30;
      default: return 20;
    }
  };

  const getPhaseName = (phase: string): string => {
    switch (phase) {
      case 'NIGHT': return '🌙 ĐÊM';
      case 'CHAOS_EVENT': return '🎲 SỰ KIỆN';
      case 'DEATH_RESOLUTION': return '💀 GIẢI QUYẾT';
      case 'GHOST_REVELATION': return '👻 MA HIỂU';
      case 'VOTE': return '🗳️ BIỂU QUYẾT';
      case 'GAME_OVER': return '🏆 KẾT THÚC';
      default: return phase;
    }
  };

  const handlePhaseComplete = () => {
    const currentPhase = gameState?.phase;
    switch (currentPhase) {
      case 'NIGHT':
        game.processNightPhase();
        addLog('Kết thúc đêm - Xử lý sự kiện...');
        break;
      case 'CHAOS_EVENT':
        // Advance to death resolution if not already handled
        addLog('Xử lý cái chết...');
        break;
      case 'DEATH_RESOLUTION':
        // Advance to ghost revelation
        if (gameState?.enableGhostVoting) {
          game.processVotePhase();
          addLog('Người chết có thể vote...');
        } else {
          game.processVotePhase();
          addLog('Bắt đầu vote...');
        }
        break;
      case 'GHOST_REVELATION':
      case 'VOTE':
        game.processVotes();
        addLog('Kiểm tra điều kiện thắng...');
        break;
    }
    const newState = game.getState();
    setGameState({ ...newState });
    setTimer(getPhaseTime(newState.phase));
  };

  // Manual advance for simulation
  const handleAdvancePhase = () => {
    const currentPhase = gameState?.phase;
    switch (currentPhase) {
      case 'NIGHT':
        game.processNightPhase();
        addLog('Kết thúc đêm');
        break;
      case 'CHAOS_EVENT':
        // Skip chaos event for now
        addLog('Bỏ qua chaos event');
        break;
      case 'DEATH_RESOLUTION':
        if (gameState?.enableGhostVoting) {
          addLog('Chuyển sang vote');
        } else {
          game.processVotePhase();
          addLog('Bắt đầu vote');
        }
        break;
      case 'GHOST_REVELATION':
        game.processVotePhase();
        addLog('Bắt đầu vote');
        break;
      case 'VOTE':
        game.processVotes();
        addLog('Xử lý vote');
        break;
    }
    const newState = game.getState();
    setGameState({ ...newState });
    setTimer(getPhaseTime(newState.phase));
  };

  const handleAction = (action: string, targetId?: string) => {
    if (!gameState) return;

    const currentPlayer = game.getPlayer(currentPlayerId);
    if (!currentPlayer) return;

    // Handle actions based on phase
    if (gameState.phase === 'NIGHT') {
      game.submitNightAction(currentPlayerId, {
        playerId: currentPlayerId,
        actionType: action as any,
        targetId,
        isProtected: false,
      });
      addLog(`${currentPlayer.name} thực hiện hành động: ${action}${targetId ? ` lên ${game.getPlayer(targetId)?.name}` : ''}`);
    } else if (gameState.phase === 'VOTE') {
      game.submitVote(currentPlayerId, targetId || 'NONE');
      addLog(`${currentPlayer.name} bình chọn: ${targetId ? game.getPlayer(targetId)?.name : 'Bỏ phiếu trắng'}`);
    }

    setGameState({ ...game.getState() });
    setSelectedTarget(null);
  };

  if (!gameState) {
    return <div className="p-8 text-center">Đang tải game...</div>;
  }

  const currentPlayer = game.getPlayer(currentPlayerId);
  const alivePlayers = game.getAlivePlayers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Round & Phase */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="font-bold">Round {gameState.currentRound}</span>
                <span className="text-slate-400">/ {gameState.minRounds}</span>
              </div>
              <div className="h-6 w-px bg-purple-500/30" />
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${gameState.phase === 'NIGHT' ? 'bg-blue-900/50 text-blue-300' :
                  gameState.phase === 'VOTE' ? 'bg-orange-900/50 text-orange-300' :
                  gameState.phase === 'GAME_OVER' ? 'bg-green-900/50 text-green-300' :
                  'bg-purple-900/50 text-purple-300'}
              `}>
                {getPhaseName(gameState.phase)}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center font-mono text-2xl font-bold
                ${timer <= 5 ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-slate-800 text-white'}
              `}>
                {timer}
              </div>
            </div>

            {/* Faction Counts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-bold">{gameState.hphAlive}</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <Skull className="w-4 h-4" />
                <span className="font-bold">{gameState.fourTAlive}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Ghost className="w-4 h-4" />
                <span className="font-bold">{gameState.ghosts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chaos Event Banner */}
      {gameState.currentEvent && (
        <div className="bg-gradient-to-r from-yellow-900/50 via-orange-900/50 to-yellow-900/50 border-b border-yellow-500/30 py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-xl font-bold text-yellow-300">
              🎲 {gameState.currentEvent.name}: {gameState.currentEvent.description}
            </span>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Debug/Control Panel */}
      <div className="bg-slate-900/50 border-b border-slate-700/50 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">Debug Controls (Simulation Mode)</span>
        <button
          onClick={handleAdvancePhase}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-medium"
        >
          Advance Phase →
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gameState.players.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.id === currentPlayerId}
                  isSelected={selectedTarget === player.id}
                  phase={gameState.phase}
                  currentPlayerRole={currentPlayer?.role}
                  onSelect={() => setSelectedTarget(player.id)}
                  onAction={(action) => handleAction(action, player.id)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* My Role Hero Card */}
            <div className="bg-gradient-to-b from-[#1c1208] to-[#0e0703] border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-serif font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" /> VAI TRÒ CỦA BẠN
              </h3>
              {currentPlayer?.role ? (
                <div>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-amber-400/70 shadow-lg mb-3">
                    <img
                      src={ROLE_CARD_IMAGES[currentPlayer.role.id] || '/cards/harry.jpg'}
                      alt={currentPlayer.role.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-xs font-serif font-black text-[#ffd88f] block truncate">
                        {currentPlayer.role.name}
                      </span>
                      <span className="text-[10px] text-zinc-300 font-lora italic truncate block">
                        {currentPlayer.role.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-zinc-200 font-lora mb-3">
                    <strong className="text-amber-300 font-serif block mb-0.5">⚡ Năng lực:</strong>
                    {currentPlayer.role.ability}
                  </div>
                  <button
                    onClick={() => setShowRoleCard(true)}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-serif font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Xem Chi Tiết Thẻ Bài →
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-xs font-serif">Chưa có vai trò</p>
              )}
            </div>

            {/* Action Panel */}
            <ActionPanel
              phase={gameState.phase}
              player={currentPlayer}
              selectedTarget={selectedTarget ? (game.getPlayer(selectedTarget) || null) : null}
              alivePlayers={alivePlayers}
              onAction={handleAction}
              onSelect={setSelectedTarget}
            />

            {/* Game Log */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-300 mb-3">📜 NHẬT KÝ</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {actionLog.map((log, i) => (
                  <p key={i} className="text-xs text-slate-400">{log}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Role Card Modal */}
      {showRoleCard && currentPlayer?.role && (
        <RoleCardModal
          role={currentPlayer.role}
          onClose={() => setShowRoleCard(false)}
        />
      )}

      {/* Game Over Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <GameOverModal
          winners={gameState.winners}
          players={gameState.players}
        />
      )}
    </div>
  );
}

// ============================================================================
// PLAYER CARD
// ============================================================================

function PlayerCard({
  player,
  isCurrentPlayer,
  isSelected,
  phase,
  currentPlayerRole,
  onSelect,
  onAction,
}: {
  player: Player;
  isCurrentPlayer: boolean;
  isSelected: boolean;
  phase: string;
  currentPlayerRole?: Role | null;
  onSelect: () => void;
  onAction: (action: string) => void;
}) {
  const statusColor = player.status === 'ALIVE'
    ? 'border-green-500/50 bg-green-900/20'
    : player.status === 'GHOST'
      ? 'border-blue-500/50 bg-blue-900/20'
      : 'border-red-500/50 bg-red-900/20';

  const factionColor = getFactionColor(player.faction);

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-3 rounded-xl border-2 cursor-pointer transition-all
        ${statusColor}
        ${isSelected ? 'ring-2 ring-purple-500 scale-105' : ''}
        ${isCurrentPlayer ? 'ring-2 ring-yellow-500' : ''}
        ${player.status !== 'ALIVE' ? 'opacity-60' : ''}
        hover:scale-102
      `}
    >
      {/* Status Badge */}
      {player.status === 'GHOST' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Ghost className="w-4 h-4" />
        </div>
      )}
      {player.status === 'DEAD' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <Skull className="w-4 h-4" />
        </div>
      )}

      {/* Avatar Card Portrait */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-amber-400/60 shadow-md shrink-0 bg-black">
          <img
            src={(player.role && ROLE_CARD_IMAGES[player.role.id]) || '/cards/harry.jpg'}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
          {player.status === 'DEAD' && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Skull className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-black text-sm text-[#ffd88f] truncate">{player.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${factionColor}`} />
            <span className="text-[11px] font-mono text-zinc-400">
              {player.status === 'GHOST' ? '👻 Ma' : player.status === 'DEAD' ? '💀 Tử trận' : '✓ Sống'}
            </span>
          </div>
          {player.role && isCurrentPlayer && (
            <span className="text-[10px] font-serif text-amber-300 truncate block mt-0.5 font-bold">
              {player.role.name}
            </span>
          )}
        </div>
      </div>

      {/* Vote Count */}
      {phase === 'VOTE' && player.status === 'ALIVE' && (
        <div className="text-xs text-slate-400 text-center">
          {player.voteCount.toFixed(1)} phiếu
        </div>
      )}

      {/* Actions */}
      {isSelected && phase === 'NIGHT' && currentPlayerRole && (
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAction('KILL'); }}
            className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-medium"
          >
            Giết
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('SCAN'); }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium"
          >
            Soi
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('PROTECT'); }}
            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium"
          >
            Bảo Vệ
          </button>
        </div>
      )}
      {isSelected && phase === 'VOTE' && player.status === 'ALIVE' && (
        <div className="mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAction('VOTE'); }}
            className="w-full px-2 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs font-medium"
          >
            Treo Cổ
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTION PANEL
// ============================================================================

function ActionPanel({
  phase,
  player,
  selectedTarget,
  alivePlayers,
  onAction,
  onSelect,
}: {
  phase: string;
  player?: Player;
  selectedTarget: Player | null;
  alivePlayers: Player[];
  onAction: (action: string, targetId?: string) => void;
  onSelect: (id: string | null) => void;
}) {
  if (!player) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-purple-300 mb-3">
        {phase === 'NIGHT' ? '🌙 HÀNH ĐỘNG ĐÊM' : '🗳️ HÀNH ĐỘNG NGÀY'}
      </h3>

      {/* Role-specific actions */}
      <div className="space-y-2">
        {player.role?.id === 'VOLDEMORT' && phase === 'NIGHT' && (
          <>
            <p className="text-xs text-slate-400 mb-2">Chọn người để giết:</p>
            <div className="grid grid-cols-2 gap-1">
              {alivePlayers.filter(p => p.faction !== 'DEATH_EATERS').slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => onAction('KILL', p.id)}
                  className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}

        {player.role?.id === 'HERMIONE_GRANGER' && phase === 'NIGHT' && (
          <>
            <p className="text-xs text-slate-400 mb-2">Chọn người để soi:</p>
            <div className="grid grid-cols-2 gap-1">
              {alivePlayers.filter(p => p.role?.id !== 'HARRY_POTTER' && p.role?.id !== 'VOLDEMORT').slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => onAction('SCAN', p.id)}
                  className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}

        {player.role?.id === 'DUMBLEDORE' && phase === 'NIGHT' && (
          <>
            <p className="text-xs text-slate-400 mb-2">Chọn người để bảo vệ:</p>
            <div className="grid grid-cols-2 gap-1">
              {alivePlayers.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => onAction('PROTECT', p.id)}
                  className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Default: No action needed */}
        {(phase === 'NIGHT' && !['VOLDEMORT', 'HERMIONE_GRANGER', 'DUMBLEDORE'].includes(player.role?.id || '')) && (
          <p className="text-xs text-slate-500">
            Chờ đêm kết thúc...
          </p>
        )}

        {/* Vote phase */}
        {phase === 'VOTE' && player.status === 'ALIVE' && (
          <>
            <p className="text-xs text-slate-400 mb-2">Bạn có muốn treo cổ ai?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onAction('VOTE', selectedTarget?.id)}
                disabled={!selectedTarget}
                className={`flex-1 px-3 py-2 rounded font-medium text-sm ${
                  selectedTarget
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Treo Cổ{selectedTarget ? ` ${selectedTarget.name}` : ''}
              </button>
              <button
                onClick={() => onAction('VOTE', 'NONE')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                Bỏ phiếu
              </button>
            </div>
          </>
        )}

        {/* Dead players */}
        {player.status !== 'ALIVE' && (
          <p className="text-xs text-slate-500">
            {player.status === 'GHOST' ? '👻 Bạn là ghost - có thể vote (0.5 sức)' : '💀 Bạn đã chết'}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROLE CARD MODAL
// ============================================================================

function RoleCardModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const cardImg = ROLE_CARD_IMAGES[role.id] || '/cards/harry.jpg';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-[#1c1208] to-[#0c0603] border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl p-1 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center z-20 cursor-pointer"
        >
          ✕
        </button>

        {/* Card Image */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl mb-4">
          <img
            src={cardImg}
            alt={role.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-xl font-serif font-black text-[#ffd88f]">{role.name}</h2>
            <p className="text-xs text-amber-200/80 font-lora italic">{role.title}</p>
          </div>
        </div>

        <div className="bg-black/60 rounded-xl p-3 border border-amber-500/30 mb-3 text-xs text-[#ebdcb0] font-lora leading-relaxed">
          {role.description}
        </div>

        <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-400/40 mb-4">
          <h4 className="text-[10px] font-serif font-black text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles size={12} /> Năng Lực Ma Thuật
          </h4>
          <p className="text-xs text-zinc-100 font-lora leading-relaxed">{role.ability}</p>
        </div>

        <div className="flex gap-2 text-[11px] font-mono justify-center">
          <span className={`px-2.5 py-1 rounded-full font-bold ${role.phaseType === 'NIGHT' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}`}>
            {role.phaseType === 'NIGHT' ? '🌙 Đêm' : '☀️ Ngày'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
            Vote: {role.canVote ? '✓' : '✕'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
            Kill: {role.canKill ? '✓' : '✕'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GAME OVER MODAL
// ============================================================================

function GameOverModal({ winners, players }: { winners: string[]; players: Player[] }) {
  const winnerName = winners.includes('HPH') ? 'HỘI PHƯỢNG HOÀNG' :
                     winners.includes('FOUR_T') ? 'TỬ THẦN THỰC TỬ' :
                     winners.includes('JESTER') ? 'JESTER' : 'UNKNOWN';

  const winnerColor = winners.includes('HPH') ? 'text-green-400' :
                      winners.includes('FOUR_T') ? 'text-red-400' :
                      winners.includes('JESTER') ? 'text-yellow-400' : 'text-slate-400';

  const winnerBg = winners.includes('HPH') ? 'from-green-900/50 to-green-950/50 border-green-500/50' :
                  winners.includes('FOUR_T') ? 'from-red-900/50 to-red-950/50 border-red-500/50' :
                  winners.includes('JESTER') ? 'from-yellow-900/50 to-yellow-950/50 border-yellow-500/50' :
                  'from-slate-900/50 to-slate-950/50 border-slate-500/50';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${winnerBg} border-2 rounded-2xl p-8 max-w-md w-full text-center`}>
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2">KẾT THÚC GAME!</h2>
        <p className={`text-2xl font-bold ${winnerColor} mb-6`}>{winnerName} THẮNG!</p>

        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <h4 className="text-sm text-slate-400 mb-2">Vai trò người chơi:</h4>
          <div className="space-y-1 text-left">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className={getFactionColor(p.role?.faction || 'NEUTRAL')}>
                  {p.role?.name || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
        >
          Chơi Lại
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getFactionColor(faction: string): string {
  switch (faction) {
    case 'ORDER_OF_PHOENIX': return 'bg-green-500';
    case 'DEATH_EATERS': return 'bg-red-500';
    case 'NEUTRAL': return 'bg-yellow-500';
    default: return 'bg-slate-500';
  }
}

function getAvatarGradient(faction: string): string {
  switch (faction) {
    case 'ORDER_OF_PHOENIX': return 'from-green-500 to-emerald-600';
    case 'DEATH_EATERS': return 'from-red-500 to-rose-600';
    case 'NEUTRAL': return 'from-yellow-500 to-amber-600';
    default: return 'from-slate-500 to-gray-600';
  }
}
