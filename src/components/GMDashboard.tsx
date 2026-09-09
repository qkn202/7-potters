"use client";

import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Skull, 
  RefreshCw, 
  ScrollText, 
  Target, 
  Calculator, 
  CheckCircle, 
  AlertTriangle, 
  UserX,
  Crown,
  BookOpen,
  Sparkles,
  Shield,
  Eye,
  Wand2
} from 'lucide-react';
import { useState } from 'react';
import { CharacterCard, CardInspectorModal } from './CharacterCard';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  WaxSeal, 
  CardCornerFlourish,
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';
import { Role } from '@/lib/types';

export function GMDashboard() {
  const { 
    gameState, 
    setPhase, 
    killPlayer, 
    revivePlayer, 
    resetGame, 
    calculateResolution, 
    applyResolution, 
    resolveInterrupt,
    kickPlayer,
    simulateBotActions 
  } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{id: string, type: 'KILL' | 'REVIVE' | 'KICK'} | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [inspectedRole, setInspectedRole] = useState<Role | null>(null);
  const [gmTab, setGmTab] = useState<'resolution' | 'players' | 'logs'>('resolution');

  const alivePlayers = gameState.players.filter(p => !p.isGM && p.status !== 'DEAD');
  const totalAlive = alivePlayers.length;
  const votedCount = Object.keys(gameState.pendingActions).length;
  const aliveBots = alivePlayers.filter(p => p.name.includes('(Bot)'));

  // Tally votes received by each player
  const votesReceived: Record<string, number> = {};
  const killReceived: Record<string, number> = {};
  Object.values(gameState.pendingActions).forEach(act => {
    if (act.actionName === 'Bỏ phiếu Treo Cổ') {
      votesReceived[act.targetId] = (votesReceived[act.targetId] || 0) + 1;
    } else if (act.actionName === 'Giết') {
      killReceived[act.targetId] = (killReceived[act.targetId] || 0) + 1;
    }
  });

  const isNight = gameState.phase === 'NIGHT';
  const isDay = gameState.phase === 'DAY';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Header: GM Command Station */}
      <div className="relative rounded-2xl hpvn-panel-gold p-6 overflow-hidden">
        <CardCornerFlourish className="absolute top-2 left-2 w-7 h-7 text-[#bd8436] pointer-events-none" />
        <CardCornerFlourish className="absolute top-2 right-2 w-7 h-7 text-[#bd8436] -scale-x-100 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="shrink-0">
              <WaxSeal variant="gold" letter="GM" size="md" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#ffd88f] font-bold">
                  BỘ PHÁP THUẬT · BÀN ĐIỀU HÀNH QUẢN TRÒ
                </span>
                <span className="text-[#7a5229]">•</span>
                <span className="text-xs font-mono text-[#ebdcb0]">
                  Lượt: <strong className="text-[#ffd88f]">{gameState.round}</strong> | Giai đoạn: <strong className="text-[#ffd88f]">{gameState.phase}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-title-magical font-bold text-[#ffd88f] tracking-wide mt-0.5 leading-tight">
                Bàn Cờ Chiến Lược & Phân Giải Ma Pháp
              </h1>
            </div>
          </div>

          {/* Phase Control & Rulebook */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="flex-1 md:flex-initial hpvn-btn-gold px-3.5 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5"
            >
              <BookOpen size={15} /> Sách Thẻ Bài
            </button>

            <button
              onClick={() => setPhase('DAY')}
              disabled={isDay}
              className={`flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-serif font-bold text-xs sm:text-sm transition-all border ${
                isDay 
                  ? 'bg-[#120803] text-[#7a5229] border-[#3a2213] cursor-not-allowed' 
                  : 'hpvn-btn-gold'
              }`}
            >
              <Sun size={16} /> Sang Ngày
            </button>

            <button
              onClick={() => setPhase('NIGHT')}
              disabled={isNight}
              className={`flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-serif font-bold text-xs sm:text-sm transition-all border ${
                isNight 
                  ? 'bg-[#120803] text-[#7a5229] border-[#3a2213] cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 text-cyan-200 border-indigo-500/60'
              }`}
            >
              <Moon size={16} /> Sang Đêm
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet GM Navigation Tabs (screens < xl) */}
      <div className="xl:hidden flex items-center bg-[#120803] p-1 rounded-xl border border-[#7a5229]">
        <button
          onClick={() => setGmTab('resolution')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            gmTab === 'resolution'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Calculator size={14} /> Phán Quyết ({votedCount}/{totalAlive})
        </button>
        <button
          onClick={() => setGmTab('players')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            gmTab === 'players'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <Target size={14} /> Người Chơi ({gameState.players.filter(p => !p.isGM).length})
        </button>
        <button
          onClick={() => setGmTab('logs')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
            gmTab === 'logs'
              ? 'hpvn-btn-gold'
              : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
          }`}
        >
          <ScrollText size={14} /> Nhật Ký ({gameState.logs.length})
        </button>
      </div>

      {/* Main Grid: Resolution Engine + Players + Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left / Center: Resolution Engine & Player Secret Cards (col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Resolution Engine Console */}
          <div className={`${gmTab === 'resolution' ? 'block' : 'hidden xl:block'}`}>
            {gameState.phase !== 'END' ? (
              <div className="relative rounded-2xl hpvn-panel p-4 sm:p-5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#7a5229] pb-3 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#3a2213] text-[#ffd88f] border border-[#7a5229]">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] tracking-wide">
                      Cỗ Máy Thu Thập & Phân Giải Bùa Chú
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                        votedCount >= totalAlive && totalAlive > 0
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-[#2a170a] text-[#ffd88f] border-[#7a5229]'
                      }`}>
                        {isNight ? '🗳️ Bỏ phiếu Treo Cổ: ' : '⚡ Hành động: '}
                        {votedCount}/{totalAlive} người sống
                      </span>
                      <span className="text-[11px] text-[#ebdcb0]/70 font-mono hidden sm:inline">
                        Tự động tính toán xung đột (Bảo vệ, Đổi mạng Mundungus, Domino Weasley...)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {aliveBots.length > 0 && (
                    <button
                      onClick={simulateBotActions}
                      className="px-3 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 border border-[#7a5229] bg-[#2a170a] hover:bg-[#3a2213] text-[#ebdcb0] transition-colors"
                      title="Cho tất cả các bot tự động bỏ phiếu ngẫu nhiên theo luật"
                    >
                      <span>🎲 Bot Bỏ Phiếu ({aliveBots.length})</span>
                    </button>
                  )}

                  <button
                    onClick={calculateResolution}
                    className="hpvn-btn-gold px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5"
                  >
                    <Wand2 size={14} />
                    <span>Thu Thập & Phân Giải</span>
                  </button>
                </div>
              </div>

              {/* Resolution Report Result */}
              {gameState.resolutionReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-amber-500/40 p-4 space-y-3 bg-[#f7efdc] text-[#2c1d11] font-serif"
                >
                  <div className="flex items-center justify-between border-b border-[#b45309]/30 pb-2">
                    <h4 className="font-bold text-sm text-[#7f1d1d] uppercase flex items-center gap-1.5">
                      <ScrollText size={16} /> Báo Cáo Tuyệt Mật Quản Trò (Lượt {gameState.round})
                    </h4>
                    <span className="text-[10px] font-mono text-[#b45309] font-bold">CONFIDENTIAL</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#382618] leading-relaxed">
                    {gameState.resolutionReport.summary.map((line, i) => (
                      <li key={`gm-summary-item-${i}`} className="flex items-start gap-2">
                        <span className="text-[#8c0c0c] font-bold">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  {gameState.resolutionReport.needsInterrupt && (
                    <div className="space-y-3">
                      <div className="bg-red-100 border-2 border-red-600 p-3 rounded-lg text-red-900 flex items-start gap-2.5">
                        <AlertTriangle className="shrink-0 mt-0.5 text-red-600" size={18} />
                        <div className="text-xs">
                          <strong className="block font-bold">Yêu Cầu Can Thiệp Từ Người Chơi:</strong>
                          {gameState.resolutionReport.needsInterrupt.reason}
                          <p className="mt-1 text-[11px] text-red-800">
                            Người chơi có thể chọn trên màn hình cá nhân, hoặc Quản Trò có thể can thiệp ngay:
                          </p>
                        </div>
                      </div>

                      {/* GM Manual/Random Override */}
                      <div className="p-3 bg-[#1a0e07] border border-[#bd8436] rounded-xl flex items-center justify-between gap-2">
                        <span className="text-xs font-serif font-bold text-[#ffd88f]">
                          👑 Quyền Quản Trò:
                        </span>
                        <button
                          onClick={() => {
                            const interrupt = gameState.resolutionReport?.needsInterrupt;
                            if (!interrupt) return;
                            const eligible = gameState.players.filter(p => p.id !== interrupt.playerId && !p.isGM && p.status !== 'DEAD');
                            if (eligible.length > 0) {
                              const pick = eligible[Math.floor(Math.random() * eligible.length)];
                              resolveInterrupt(pick.id);
                            }
                          }}
                          className="px-3 py-1.5 hpvn-btn-gold rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>🎲 Chọn ngẫu nhiên giúp người chơi</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!gameState.resolutionReport.needsInterrupt && (
                    <div className="pt-2 border-t border-[#b45309]/30 flex justify-end">
                      <button
                        onClick={applyResolution}
                        className="px-5 py-2 hpvn-btn-floo rounded-xl text-xs font-serif font-black flex items-center gap-1.5"
                      >
                        <CheckCircle size={15} />
                        <span>Duyệt & Công Bố Lên Bảng Vàng</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl hpvn-panel p-8 text-center">
              <h2 className={`text-3xl sm:text-4xl font-title-magical font-black mb-3 tracking-wide ${
                gameState.winner === 'DEATH_EATERS' 
                  ? 'text-emerald-400' 
                  : gameState.winner === 'NEUTRAL'
                    ? 'text-purple-400'
                    : 'text-[#ffd88f]'
              }`}>
                {gameState.winner === 'DEATH_EATERS' 
                  ? 'TỬ THẦN THỰC TỬ THẮNG' 
                  : gameState.winner === 'NEUTRAL'
                    ? 'PHE TRUNG LẬP THẮNG (HÒA)'
                    : 'HỘI PHƯỢNG HOÀNG THẮNG'}
              </h2>
              <p className="text-sm text-[#ebdcb0] font-lora">
                Trận đấu đã khép lại. Quản trò có thể bấm "Hủy Phòng & Bắt Đầu Lại" ở cột bên phải.
              </p>
            </div>
          )}
        </div>

          {/* Player Secret Dossiers Grid */}
          <div className={`relative rounded-2xl hpvn-panel-gold p-4 sm:p-5 ${gmTab === 'players' ? 'block' : 'hidden xl:block'}`}>
            <div className="flex items-center justify-between border-b border-[#7a5229] pb-3 mb-4">
              <div>
                <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2 tracking-wide">
                  <Target size={18} className="text-[#bd8436]" />
                  Danh Sách Thẻ Bài Bí Mật Của Người Chơi
                </h3>
                <p className="text-xs text-[#ebdcb0] font-lora">
                  Nhấn vào người chơi để thi triển quyền năng Quản Trò (Giết / Hồi sinh / Đuổi / Xem thẻ)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {gameState.players.filter(p => !p.isGM).map((p, index) => {
                const isSelected = selectedPlayer === p.id;
                const isDead = p.status === 'DEAD';
                const isInjured = p.status === 'INJURED';
                const isDeathEater = p.role?.faction === 'DEATH_EATERS';

                return (
                  <div 
                    key={p.id ? `gm-player-card-${p.id}` : `gm-player-card-${index}`}
                    onClick={() => setSelectedPlayer(isSelected ? null : p.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isDead 
                        ? 'bg-[#1a0e07]/40 border-[#3a2213] opacity-60 grayscale' 
                        : isSelected 
                          ? 'bg-[#3a2213] border-[#ffd88f] ring-1 ring-[#ffd88f]' 
                          : isDeathEater
                            ? 'bg-[#0b1c14] border-[#0e4832] hover:border-[#10b981]'
                            : 'bg-[#220d0d] border-[#5e1919] hover:border-[#bd8436]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {isDeathEater ? (
                          <DarkMarkCrest className="w-5 h-5" />
                        ) : (
                          <PhoenixCrest className="w-5 h-5" />
                        )}
                        <span className={`font-serif font-bold text-sm ${isDead ? 'text-red-500 line-through' : 'text-[#f5eedb]'}`}>
                          {p.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isInjured && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-950 text-amber-300 border-amber-600">
                            Bị thương
                          </span>
                        )}
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isDeathEater 
                            ? 'bg-[#042f21] text-emerald-300 border-emerald-700' 
                            : p.role?.faction === 'NEUTRAL'
                              ? 'bg-purple-950 text-purple-300 border-purple-700'
                              : 'bg-[#400e0e] text-[#ffd88f] border-[#8c0c0c]'
                        }`}>
                          {isDeathEater ? 'Tử Thần' : p.role?.faction === 'NEUTRAL' ? 'Trung Lập' : 'Phượng Hoàng'}
                        </span>
                      </div>
                    </div>

                    {/* Role Title & Name */}
                    <div className="text-xs text-[#ebdcb0] font-lora flex items-center justify-between mt-1">
                      <span className="truncate max-w-[220px]">
                        Vai trò: <strong className="text-[#ffd88f]">{p.role?.name || 'Chưa chia'}</strong>
                      </span>

                      {/* Quick Inspect Button */}
                      {p.role && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedRole(p.role);
                          }}
                          className="text-[11px] text-[#ffd88f] hover:text-[#fff4d1] font-mono flex items-center gap-1 underline decoration-[#bd8436]/60"
                        >
                          <Eye size={12} /> Xem thẻ Tarot
                        </button>
                      )}
                    </div>

                    {/* Action & Vote Tracker */}
                    {(() => {
                      const pAction = gameState.pendingActions[p.id];
                      const targetName = pAction?.targetId === 'ALL' 
                        ? 'Tất cả' 
                        : gameState.players.find(x => x.id === pAction?.targetId)?.name;
                      const pVotes = isNight ? (votesReceived[p.id] || 0) : 0;
                      const pKills = isDay ? (killReceived[p.id] || 0) : 0;

                      return (
                        <div className="mt-2.5 pt-2 border-t border-[#7a5229]/40 flex items-center justify-between gap-1 text-[11px] font-mono">
                          {isDead ? (
                            <span className="text-red-400/80 flex items-center gap-1">
                              <Skull size={11} /> Đã tử trận
                            </span>
                          ) : pAction ? (
                            <span className="text-emerald-300 font-bold flex items-center gap-1 truncate" title={`${pAction.actionName} ➔ ${targetName}`}>
                              <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                              <span className="truncate">
                                {pAction.actionName === 'Bỏ phiếu Treo Cổ' ? 'Vote' : pAction.actionName}: {targetName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#ebdcb0]/50 italic flex items-center gap-1">
                              ⏳ Chưa hành động
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {pVotes > 0 && (
                              <span className="text-[#ffd88f] bg-[#3a2213] px-1.5 py-0.5 rounded border border-[#bd8436] font-bold">
                                🗳️ {pVotes} phiếu
                              </span>
                            )}
                            {pKills > 0 && (
                              <span className="text-red-300 bg-red-950 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                                🗡️ {pKills} phiếu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* GM Action Drawer when Selected */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#7a5229]/50 flex items-center justify-between flex-wrap gap-2">
                        {confirmAction?.id === p.id ? (
                          <div className="flex items-center gap-2 bg-[#120803] p-1.5 rounded-lg border border-[#7a5229] w-full justify-between">
                            <span className="text-xs text-[#ebdcb0]">
                              Xác nhận {confirmAction.type === 'KILL' ? 'giết' : confirmAction.type === 'REVIVE' ? 'hồi sinh' : 'đuổi'}?
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirmAction.type === 'KILL') killPlayer(p.id);
                                  else if (confirmAction.type === 'REVIVE') revivePlayer(p.id);
                                  else if (confirmAction.type === 'KICK') kickPlayer(p.id);
                                  setConfirmAction(null);
                                }}
                                className="text-white bg-green-700 hover:bg-green-600 px-2.5 py-1 rounded text-xs font-bold"
                              >
                                Đồng ý
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction(null);
                                }}
                                className="text-[#ebdcb0] bg-[#3a2213] hover:bg-[#4a2c18] px-2 py-1 rounded text-xs"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full justify-end">
                            {!isDead ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({ id: p.id, type: 'KILL' });
                                }}
                                className="px-2.5 py-1 text-xs rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1 font-lora font-bold"
                              >
                                <Skull size={12} /> Hạ Sát
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({ id: p.id, type: 'REVIVE' });
                                }}
                                className="px-2.5 py-1 text-xs rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 flex items-center gap-1 font-lora font-bold"
                              >
                                <RefreshCw size={12} /> Hồi Sinh
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmAction({ id: p.id, type: 'KICK' });
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 flex items-center gap-1 font-lora font-bold"
                            >
                              <UserX size={12} /> Đuổi
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Action Log & Reset Game (col-span-4) */}
        <div className={`xl:col-span-4 space-y-6 ${gmTab === 'logs' ? 'block' : 'hidden xl:block'}`}>
          <div className="relative rounded-2xl hpvn-panel p-5 flex flex-col h-full max-h-[640px]">
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] mb-3 flex items-center gap-2 border-b border-[#7a5229] pb-2 tracking-wide">
              <ScrollText size={18} className="text-[#bd8436]" />
              Biên Niên Sử Hành Động
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {gameState.logs.map((log, idx) => (
                <motion.div 
                  key={`gm-log-item-${idx}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs p-3 rounded-lg bg-[#140b05] border border-[#5a3a1f] text-[#ebdcb0] font-lora leading-relaxed"
                >
                  {log}
                </motion.div>
              ))}
            </div>

            {/* Reset Game Section */}
            <div className="mt-4 pt-4 border-t border-[#7a5229]/50">
              {confirmReset ? (
                <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl text-center space-y-3">
                  <p className="text-red-300 text-xs font-lora">
                    Bạn có chắc muốn xóa toàn bộ diễn biến để chia bài ván mới?
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        resetGame();
                        setConfirmReset(false);
                      }}
                      className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-serif font-bold"
                    >
                      Xác nhận Reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-[#26150c] hover:bg-[#3a2213] text-[#ebdcb0] rounded-lg text-xs"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-2.5 px-4 bg-red-950/60 hover:bg-red-900/60 text-red-300 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-900/60 text-xs font-serif font-bold"
                >
                  <RefreshCw size={14} /> Hủy Phòng & Bắt Đầu Lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Card Inspector Modal for Inspecting Any Role */}
      <CardInspectorModal
        role={inspectedRole}
        isOpen={!!inspectedRole}
        onClose={() => setInspectedRole(null)}
      />
    </div>
  );
}
