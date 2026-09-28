/**
 * MOD HPVN - Ultimate Mode Lobby
 * Kết hợp tinh hoa từ Classic + Chaos
 */

'use client';

import React, { useState } from 'react';
import { Users, Zap, Shield, Ghost, Sparkles, Crown, Skull, Heart, Info } from 'lucide-react';
import { HPVNGameSettings, HPVN_BALANCE } from './hpvnGameEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HPVNPlayer {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  status: 'waiting' | 'ready' | 'playing' | 'dead' | 'ghost';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PLAYER_COUNTS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// ============================================================================
// COMPONENT
// ============================================================================

interface HPVNLobbyProps {
  onStartGame: (playerNames: string[], playerId: string, settings: HPVNGameSettings) => void;
  onBack: () => void;
}

export default function HPVNLobby({ onStartGame, onBack }: HPVNLobbyProps) {
  const [settings, setSettings] = useState<HPVNGameSettings>({
    playerCount: 10,
    hostName: 'Host',
    roomCode: generateRoomCode(),
    enableGhostVoting: true,
    enableChaosEvents: true,
    darkPactProtection: true,
    minRounds: 6,
  });

  const [players, setPlayers] = useState<HPVNPlayer[]>([
    { id: 'host_' + Math.random().toString(36).substring(2, 9), name: 'Host', isHost: true, isReady: false, status: 'waiting' },
  ]);

  const [copySuccess, setCopySuccess] = useState(false);

  const balance = HPVN_BALANCE[settings.playerCount];

  // Generate random room code
  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(settings.roomCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Add player
  const addPlayer = (name: string) => {
    if (players.length >= settings.playerCount) return;
    setPlayers([...players, {
      id: Date.now().toString(),
      name,
      isHost: false,
      isReady: false,
      status: 'waiting'
    }]);
  };

  // Remove player
  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Toggle ready
  const toggleReady = (id: string) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, isReady: !p.isReady, status: p.isReady ? 'waiting' : 'ready' } : p
    ));
  };

  // Start game
  const startGame = () => {
    const playerNames = players.map(p => p.name);
    const hostPlayerId = players.find(p => p.isHost)?.id || '';
    onStartGame(playerNames, hostPlayerId, {
      ...settings,
      minRounds: balance.minRounds,
    });
  };

  const canStart = players.filter(p => !p.isHost).length >= 4 &&
                   players.every(p => p.isReady || p.isHost);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">MOD HPVN</h1>
              <p className="text-xs text-purple-300">Ultimate Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              ← Quay lại
            </button>

          {/* Room Code */}
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-lg hover:bg-purple-600/50 transition-colors"
          >
            <span className="text-xs text-purple-300">Mã phòng</span>
            <span className="font-mono font-bold text-lg tracking-wider">{settings.roomCode}</span>
            <span className="text-xs text-green-400">{copySuccess ? '✓' : '📋'}</span>
          </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">

          {/* Game Mode Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 border border-purple-500/30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAxMCAwIDEwMCBMIDEwMCAxMDAgTSAzMCAwIEwgMCAzMCAwIDkwIEwgOTAgOTEgTSA2MCAwIEwgMCA2MCAwIDgwIEwgODAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0MjQ3NSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <div className="relative p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">CHẾ ĐỘ ĐẶC BIỆT</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">MOD HPVN: Ultimate Edition</h2>
              <p className="text-purple-200 text-sm leading-relaxed">
                Kết hợp tinh hoa từ Classic & Chaos. Tốc độ nhanh, chiến thuật sâu,
                bất ngờ có kiểm soát. 4-20 người chơi, 10-25 phút!
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>4-20 Players</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>10-25 Phút</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>4T Bảo Vệ R1</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Ghost className="w-4 h-4 text-blue-400" />
                  <span>Ghost Vote</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Count Selection */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              SỐ LƯỢNG NGƯỜI CHƠI
            </h3>

            <div className="grid grid-cols-6 md:grid-cols-9 gap-2 mb-4">
              {PLAYER_COUNTS.map(count => (
                <button
                  key={count}
                  onClick={() => setSettings({...settings, playerCount: count})}
                  className={`
                    py-2 rounded-lg font-medium text-sm transition-all
                    ${settings.playerCount === count
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                  `}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Balance Display */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="font-bold">{balance.hph}</span>
                </div>
                <span className="text-xs text-slate-400">HPH</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                  <Skull className="w-4 h-4" />
                  <span className="font-bold">{balance.fourT}</span>
                </div>
                <span className="text-xs text-slate-400">Tử Thần</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">{balance.neutral}</span>
                </div>
                <span className="text-xs text-slate-400">Neutral</span>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              CÀI ĐẶT GAME
            </h3>

            <div className="space-y-4">
              {/* Ghost Voting */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Ghost className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="text-sm font-medium">Ghost Voting</span>
                    <p className="text-xs text-slate-400">Người chết vẫn có thể vote (0.5 sức)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableGhostVoting}
                  onChange={e => setSettings({...settings, enableGhostVoting: e.target.checked})}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
                />
              </label>

              {/* Chaos Events */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <span className="text-sm font-medium">Chaos Events</span>
                    <p className="text-xs text-slate-400">Random events mỗi vòng (Shield, Info, Silence)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableChaosEvents}
                  onChange={e => setSettings({...settings, enableChaosEvents: e.target.checked})}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
                />
              </label>

              {/* Dark Pact */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-sm font-medium">Dark Pact Protection</span>
                    <p className="text-xs text-slate-400">4T không chết Round 1 (có kiểm soát)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.darkPactProtection}
                  onChange={e => setSettings({...settings, darkPactProtection: e.target.checked})}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Players */}
        <div className="space-y-6">
          {/* Player List */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-purple-300 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                NGƯỜI CHƠI
              </span>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded">
                {players.length}/{settings.playerCount}
              </span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {players.map(player => (
                <div
                  key={player.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all
                    ${player.isHost
                      ? 'bg-purple-900/30 border border-purple-500/30'
                      : player.isReady
                        ? 'bg-green-900/30 border border-green-500/30'
                        : 'bg-slate-800/50 border border-slate-700/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                      {player.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{player.name}</span>
                      {player.isHost && (
                        <span className="ml-2 text-xs bg-purple-600/50 px-2 py-0.5 rounded">Host</span>
                      )}
                    </div>
                  </div>

                  {!player.isHost && (
                    <div className="flex items-center gap-2">
                      {player.isReady && (
                        <span className="text-xs text-green-400">✓ Ready</span>
                      )}
                      <button
                        onClick={() => toggleReady(player.id)}
                        className={`
                          px-3 py-1 rounded text-xs font-medium transition-all
                          ${player.isReady
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-green-600 text-white hover:bg-green-500'}
                        `}
                      >
                        {player.isReady ? 'Cancel' : 'Ready'}
                      </button>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Player */}
              {players.length < settings.playerCount && (
                <AddPlayerForm onAdd={addPlayer} />
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-purple-300 mb-3">
              📋 QUY TẮC MOD HPVN
            </h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>HPH thắng: Harry sống đến Round {balance.minRounds} HOẶC Voldemort bị treo cổ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>4T thắng: Harry chết HOẶC số 4T ≥ số HPH (sau R2)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Jester thắng: Bị VOTE treo cổ (chỉ vote mới thắng)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Ghost vote: Chết rồi vẫn vote được (0.5 sức)</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            disabled={!canStart}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all
              ${canStart
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
            `}
          >
            {canStart ? '🎮 BẮT ĐẦU GAME' : 'Chờ người chơi...'}
          </button>
        </div>
      </main>
    </div>
  );
}

// Add Player Form Component
function AddPlayerForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-all flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        <span>Thêm người chơi</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Tên người chơi..."
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-2"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-sm transition-colors"
        >
          Thêm
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
