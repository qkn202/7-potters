"use client";

import { useState } from 'react';
import { useGame, getOptimalBalance } from '@/lib/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, 
  Crown, 
  Play, 
  Sparkles, 
  BookOpen, 
  LogOut,
  Bot,
  UserX,
  Copy,
  Check,
  QrCode,
  X,
  Radio,
  Wifi,
  Flame,
  Plus,
  ShieldAlert,
  Wand2
} from 'lucide-react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';
import { openFlooDrawer } from './FlooChatDrawer';
import { getHouseStyle } from '@/lib/flooFirebase';

export function Lobby() {
  const { 
    gameState, 
    currentPlayerId, 
    startGame, 
    leaveGame, 
    addBot, 
    assignRoles,
    kickPlayer,
    roomCode,
    isHost,
    connStatus,
    offlinePlayerIds
  } = useGame();

  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isGM = currentPlayer?.isGM;
  const hasControl = Boolean(isGM || isHost);

  if (gameState.phase !== 'LOBBY') return null;

  const nonGmPlayers = gameState.players.filter(p => !p.isGM);
  const optimalBalance = getOptimalBalance(nonGmPlayers.length);
  const hasAssignedRoles = nonGmPlayers.length > 0 && nonGmPlayers.every(p => Boolean(p.role));

  const inviteUrl = typeof window !== 'undefined' && roomCode 
    ? `${window.location.origin}/?room=${roomCode}` 
    : '';

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-screen px-4 py-4 flex flex-col justify-between select-none">
      
      {/* 1. TOP HEADER & ROOM PIN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoenixCrest className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,197,66,0.5)]" />
            <div>
              <h2 className="font-cinzel text-lg font-black tracking-wider text-amber-300">
                SẢNH TẬP HỢP
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <Users size={11} className="text-amber-400" />
                <span>{gameState.players.length} Phù Thủy</span>
                {connStatus === 'connected' && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Wifi size={10} /> Live
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-amber-400/30 text-amber-300 hover:text-white transition-colors cursor-pointer"
              title="27 Thẻ Bài"
            >
              <BookOpen size={15} />
            </button>
            <button
              onClick={openFlooDrawer}
              className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:text-white transition-colors cursor-pointer"
              title="Mạng Floo"
            >
              <Flame size={15} />
            </button>
            <button
              onClick={() => setConfirmLeave(true)}
              className="p-2 rounded-xl bg-slate-900 border border-red-500/30 text-red-400 hover:text-white transition-colors cursor-pointer"
              title="Rời phòng"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* ROOM CODE SHARE BAR */}
        {roomCode && (
          <div className="arcane-card-glass rounded-2xl p-2.5 flex items-center justify-between border border-amber-400/30 shadow-lg">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-amber-400 animate-pulse shrink-0" />
              <div>
                <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400">MÃ PHÒNG</div>
                <div className="font-mono text-xl font-black text-amber-300 tracking-[0.2em] leading-none">
                  {roomCode}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 hover:border-amber-400 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedCode ? 'ĐÃ CHÉP' : 'CHÉP'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="p-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                title="Mã QR"
              >
                <QrCode size={16} />
              </button>
            </div>
          </div>
        )}

        {/* FACTION BALANCE PILL BAR */}
        <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-cinzel font-bold mb-1.5">
            <span className="text-amber-400 flex items-center gap-1">
              <PhoenixCrest className="w-3.5 h-3.5" /> {optimalBalance.goodCount} HỘI PHƯỢNG HOÀNG
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              {optimalBalance.evilCount} TỬ THẦN <DarkMarkCrest className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-900 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
              style={{ width: `${(optimalBalance.goodCount / (nonGmPlayers.length || 1)) * 100}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${(optimalBalance.evilCount / (nonGmPlayers.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. SQUAD ROSTER (2-COLUMNS MOBILE GRID) */}
      <div className="flex-1 my-3 overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar">
        
        {/* Death Eater Secret Alert if roles were assigned */}
        {currentPlayer?.role?.faction === 'DEATH_EATERS' && (
          <div className="mb-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-sans flex items-center gap-2">
            <DarkMarkCrest className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đồng minh Tử Thần Thực Tử phát sáng viền xanh lá!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {gameState.players.map((p, index) => {
            const isMe = p.id === currentPlayerId;
            const isFellowDeathEater = currentPlayer?.role?.faction === 'DEATH_EATERS' && p.role?.faction === 'DEATH_EATERS' && !p.isGM;
            const isOffline = offlinePlayerIds.includes(p.id);
            const house = getHouseStyle(p.house || 'NONE');

            return (
              <motion.div
                key={p.id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`relative p-2.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                  isFellowDeathEater
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : isMe
                    ? 'bg-amber-950/30 border-amber-400/80 shadow-[0_0_12px_rgba(245,197,66,0.2)]'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-base">{house.badge}</span>
                    <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-400'}`} />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {p.isGM ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-cinzel font-black flex items-center gap-0.5">
                        <Crown size={9} /> MERLIN
                      </span>
                    ) : p.isBot ? (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[9px] font-mono flex items-center gap-0.5">
                        <Bot size={9} /> BOT
                      </span>
                    ) : null}

                    {/* Kick Button for Host */}
                    {hasControl && !isMe && !p.isGM && (
                      <button
                        type="button"
                        onClick={() => kickPlayer(p.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Đuổi"
                      >
                        <UserX size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Name & Role */}
                <div className="min-w-0">
                  <div className={`font-cinzel font-bold text-xs truncate ${
                    isFellowDeathEater ? 'text-emerald-300' : isMe ? 'text-amber-300' : 'text-slate-200'
                  }`}>
                    {p.name}
                  </div>
                  {p.role ? (
                    (isGM || isMe || isFellowDeathEater) ? (
                      <div className={`text-[10px] font-serif font-bold truncate mt-0.5 ${
                        p.role.faction === 'DEATH_EATERS' ? 'text-emerald-400' : 'text-amber-300'
                      }`}>
                        ✦ {p.role.name}
                      </div>
                    ) : (
                      <div className="text-[10px] text-cyan-400/90 font-mono truncate mt-0.5">
                        ✓ Đã có thẻ bài
                      </div>
                    )
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {isMe ? '✦ BẠN' : p.house ? house.name : 'Tân binh'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM FLOATING ACTION DOCK */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        {hasControl ? (
          <div className="space-y-2">
            {/* Toolbar Buttons: Add Bot, Assign Roles, Copy Link */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => addBot()}
                className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-cinzel font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer select-none active:scale-95"
                title="Thêm Bot phụ chiến"
              >
                <Plus size={13} />
                <span>+ Bot</span>
              </button>

              <button
                type="button"
                onClick={() => assignRoles()}
                disabled={gameState.players.length < 2}
                className={`py-2.5 px-2 rounded-xl border font-cinzel font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer select-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  hasAssignedRoles
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-amber-950/50 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,197,66,0.2)] animate-pulse'
                }`}
                title="Phân phát và xáo bài vai trò"
              >
                <Wand2 size={13} className={hasAssignedRoles ? 'text-emerald-400' : 'text-amber-400'} />
                <span>{hasAssignedRoles ? 'Xáo Lại' : 'Chia Vai'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink()}
                className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-cinzel font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer select-none active:scale-95"
                title="Sao chép link mời người chơi"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Đã Chép' : 'Link Mời'}</span>
              </button>
            </div>

            {/* Start Campaign Button */}
            <button
              type="button"
              onClick={() => startGame()}
              disabled={gameState.players.length < 4}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-cinzel font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,197,66,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              <Play size={16} className="fill-slate-950 text-slate-950" />
              <span>
                {gameState.players.length < 4 ? 'CẦN TỐI THIỂU 4 NGƯỜI (BẤM THÊM BOT)' : 'BẮT ĐẦU CHIẾN DỊCH'}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/30 text-center space-y-1">
            <div className="font-cinzel font-bold text-xs text-amber-300 flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles size={14} className="text-amber-400" />
              <span>Đang chờ Chủ phòng phát lệnh xuất kích...</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Phòng sẵn sàng ({gameState.players.length} người)
            </p>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      <AnimatePresence>
        {isQrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQrOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="arcane-card-glass rounded-3xl p-6 text-center max-w-xs w-full space-y-4 border border-amber-400/40"
            >
              <h3 className="font-cinzel font-bold text-base text-amber-300">QUÉT MÃ VÀO PHÒNG</h3>
              <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
                <QRCodeSVG value={inviteUrl} size={180} />
              </div>
              <div className="font-mono text-xl font-black text-amber-300 tracking-[0.25em]">
                {roomCode}
              </div>
              <button
                type="button"
                onClick={() => setIsQrOpen(false)}
                className="w-full py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-xs font-cinzel font-bold cursor-pointer"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM LEAVE MODAL */}
      <AnimatePresence>
        {confirmLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmLeave(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="arcane-card-glass rounded-3xl p-5 text-center max-w-xs w-full space-y-3 border border-red-500/40"
            >
              <h3 className="font-cinzel font-bold text-base text-red-300">RỜI PHÒNG?</h3>
              <p className="text-xs text-slate-400">Bạn sẽ ngắt kết nối khỏi sảnh tập hợp này.</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => leaveGame()}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-cinzel font-bold text-xs cursor-pointer"
                >
                  Ở lại
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 27 CARDS CODEX MODAL */}
      <CardDeckModal isOpen={isDeckOpen} onClose={() => setIsDeckOpen(false)} />
    </div>
  );
}
