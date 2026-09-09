"use client";

import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, 
  Crown, 
  Play, 
  UserCheck, 
  Sparkles, 
  BookOpen, 
  LogOut,
  Bot,
  Wand2,
  CheckCircle,
  UserX,
  Copy,
  Check,
  QrCode,
  X,
  Radio,
  Wifi,
  WifiOff,
  Flame
} from 'lucide-react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  WaxSeal, 
  CardCornerFlourish,
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';
import { openFlooDrawer } from './FlooChatDrawer';
import { getHouseStyle } from '@/lib/flooFirebase';

export function Lobby() {
  const { 
    gameState, 
    currentPlayerId, 
    assignRoles, 
    startGame, 
    leaveGame, 
    addBot, 
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

  if (gameState.phase !== 'LOBBY') return null;

  const hasAssignedRoles = gameState.players.some(p => p.role);
  const nonGmPlayers = gameState.players.filter(p => !p.isGM);

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
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Lobby Header */}
      <div className="text-center mb-6 sm:mb-8 relative">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <PhoenixCrest className="w-7 h-7 sm:w-9 sm:h-9" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-title-magical font-bold tracking-wide text-[#ffd88f]">
            Sảnh Tập Hợp Chiến Dịch
          </h2>
          <DarkMarkCrest className="w-7 h-7 sm:w-9 sm:h-9" />
        </div>

        {/* Room Code & Invite Share Bar */}
        {roomCode && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#120803] px-3.5 sm:px-5 py-2 rounded-2xl border-2 border-[#bd8436] mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#ebdcb0]">
              <Radio size={14} className="text-[#ffd88f] animate-pulse" />
              <span>Mã Phòng:</span>
              <span className="font-mono text-base sm:text-lg font-black text-[#ffd88f] tracking-widest bg-[#221006] px-2.5 py-0.5 rounded-lg border border-[#7a5229]">
                {roomCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-[#28180e] hover:bg-[#3a2213] text-[#ffd88f] rounded-lg border border-[#7a5229] text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Sao chép mã phòng"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Đã sao chép!' : 'Sao Chép Mã'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-[#28180e] hover:bg-[#3a2213] text-[#ffd88f] rounded-lg border border-[#7a5229] text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Sao chép link mời người chơi"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Đã chép link!' : 'Chép Link Mời'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="px-2.5 py-1 bg-[#bd8436] hover:bg-[#ffd88f] text-[#120803] rounded-lg font-serif font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Quét mã QR để vào phòng trên điện thoại"
              >
                <QrCode size={13} />
                <span>Mã QR</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-[#ebdcb0] font-lora text-xs sm:text-sm flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <Users size={15} className="text-[#ffd88f]" />
          <span>Lực lượng hiện diện: <strong className="text-[#ffd88f] font-mono">{gameState.players.length}</strong> phù thủy</span>
          <span className="text-[#7a5229] hidden sm:inline">|</span>
          <span className="block sm:inline">{hasAssignedRoles ? '✅ Đã chia bài xong' : '⏳ Chờ phân phát vai trò'}</span>
          {connStatus === 'connected' && (
            <>
              <span className="text-[#7a5229] hidden sm:inline">|</span>
              <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                <Wifi size={13} /> Floo Realtime
              </span>
            </>
          )}
        </p>

        {/* Rulebook / Deck Quick Button & Floo Chat */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setIsDeckOpen(true)}
            className="hpvn-btn-gold px-3.5 sm:px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 cursor-pointer"
          >
            <BookOpen size={15} /> Xem Sách Bí Kíp 22 Thẻ Bài & Luật Chơi
          </button>

          <button
            type="button"
            onClick={openFlooDrawer}
            className="hpvn-btn-gold px-3.5 sm:px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 cursor-pointer text-[#ffd88f]"
          >
            <Flame size={15} className="text-[#ffd88f] animate-pulse" /> Mạng Floo (Chat HPVN)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Player Attendance Scroll */}
        <div className={`lg:col-span-2 relative rounded-2xl hpvn-panel-gold p-4 sm:p-6 overflow-hidden ${
          isGM ? 'order-2 lg:order-1' : 'order-1'
        }`}>
          <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
          <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 left-2 w-6 h-6 text-[#bd8436] -scale-y-100 pointer-events-none" />
          <CardCornerFlourish className="absolute bottom-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

          <div className="flex items-center justify-between border-b border-[#7a5229] pb-3 mb-4">
            <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] flex items-center gap-2 tracking-wide">
              <DeathlyHallowsSymbol className="w-5 h-5 text-[#bd8436]" />
              Danh Sách Phù Thủy Tham Gia
            </h3>
            <span className="text-xs font-mono text-[#ffd88f] bg-[#120803] px-2.5 py-1 rounded-full border border-[#7a5229]">
              {nonGmPlayers.length} Chiến binh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Death Eaters Secret Notification in Lobby if roles assigned */}
            {currentPlayer?.role?.faction === 'DEATH_EATERS' && (
              <div className="col-span-1 sm:col-span-2 mb-2 p-3 rounded-xl bg-[#062419] border border-emerald-500/80 text-emerald-200 text-xs font-serif flex items-center gap-2">
                <DarkMarkCrest className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Mật Lệnh Tử Thần Thực Tử:</strong> Dấu Hiệu Hắc Ám đã thức tỉnh! Các đồng minh Tử Thần Thực Tử được hiển thị <strong className="text-emerald-300 uppercase">MÀU XANH LÁ</strong> để nhận diện nhau.
                </span>
              </div>
            )}

            {gameState.players.map((p, index) => {
              const isMe = p.id === currentPlayerId;
              const isFellowDeathEater = currentPlayer?.role?.faction === 'DEATH_EATERS' && p.role?.faction === 'DEATH_EATERS' && !p.isGM;
              const isOffline = offlinePlayerIds.includes(p.id);
              
              return (
                <motion.div
                  key={p.id ? `lobby-p-${p.id}` : `lobby-p-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between select-none ${
                    isFellowDeathEater
                      ? isMe
                        ? 'bg-[#072d1f] border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-[#062419] border-emerald-500/90 hover:border-emerald-400'
                      : isMe
                        ? 'bg-[#3a2213] border-[#ffd88f]'
                        : 'bg-[#180e07] border-[#4e2d17] hover:border-[#7a5229]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      p.isGM 
                        ? 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ebdcb0]' 
                        : isFellowDeathEater
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : isMe 
                            ? 'bg-[#8c0c0c] text-[#ffd88f] border-[#dc2626]/50' 
                            : 'bg-[#120803] text-[#ebdcb0] border-[#5a3a1f]'
                    }`}>
                      {p.isGM ? <Crown size={15} /> : isFellowDeathEater ? <DarkMarkCrest className="w-4 h-4 text-emerald-400" /> : <UserCheck size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-serif font-bold text-sm truncate block ${
                          isFellowDeathEater 
                            ? 'text-emerald-300' 
                            : isMe 
                              ? 'text-[#ffd88f]' 
                              : 'text-[#f5eedb]'
                        }`}>
                          {p.name}
                        </span>
                        {p.house && p.house !== 'NONE' && (
                          <span 
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 flex items-center gap-1 ${getHouseStyle(p.house).pillColor}`}
                            title={`Nhà ${getHouseStyle(p.house).name}`}
                          >
                            <span>{getHouseStyle(p.house).badge}</span>
                            <span>{getHouseStyle(p.house).name}</span>
                          </span>
                        )}
                        {p.userTag && (
                          <span className="text-[9px] text-[#ffd88f]/80 font-mono italic shrink-0">
                            [{p.userTag}]
                          </span>
                        )}
                        {isMe && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono shrink-0 ${
                            isFellowDeathEater
                              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500'
                              : 'bg-[#bd8436]/25 text-[#ffd88f] border-[#bd8436]/50'
                          }`}>
                            Bạn
                          </span>
                        )}
                        {isFellowDeathEater && !isMe && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600 font-mono shrink-0">
                            Đồng Minh
                          </span>
                        )}

                        {/* Connection Presence Badge */}
                        {isOffline ? (
                          <span className="text-[9px] bg-red-950/80 text-red-300 border border-red-800/80 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Mất kết nối
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Online
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-mono block truncate ${
                        isFellowDeathEater ? 'text-emerald-400/90 font-bold' : 'text-[#ebdcb0]/60'
                      }`}>
                        {p.isGM 
                          ? 'Quản Trò (GM)' 
                          : isFellowDeathEater 
                            ? `🐍 Đồng minh: ${p.role?.name}${p.role?.id === 'VOLDEMORT' ? ' 👑' : ''}`
                            : p.role 
                              ? 'Đã nhận thẻ bí mật' 
                              : 'Đang chờ thẻ...'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* GM Kick player button in lobby */}
                    {isGM && !p.isGM && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          kickPlayer(p.id);
                        }}
                        title={`Đuổi ${p.name} khỏi phòng`}
                        className="px-2 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/80 text-xs font-serif font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        <UserX size={12} />
                        <span>Đuổi</span>
                      </button>
                    )}

                    {p.role ? (
                      <span title="Đã nhận vai trò" className="p-1 rounded-full bg-[#053d2b] text-emerald-400 border border-emerald-500/50 block">
                        <CheckCircle size={15} />
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bd8436] block animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })}

            {gameState.players.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[#8c622e] font-lora">
                Chưa có ai gia nhập phòng...
              </div>
            )}
          </div>

          {/* Leave Button */}
          <div className="mt-6 pt-4 border-t border-[#7a5229]/40 flex justify-between items-center text-xs">
            {confirmLeave ? (
              <div className="flex items-center gap-2 bg-[#120803] p-1.5 rounded-lg border border-[#7a5229]">
                <span className="text-red-300 text-xs font-lora">Rời phòng chờ?</span>
                <button
                  onClick={leaveGame}
                  className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-serif font-bold cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="px-2 py-1 bg-[#28180e] hover:bg-[#3a2213] text-[#ebdcb0] rounded text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirmLeave(true)}
                className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1.5 font-lora cursor-pointer"
              >
                <LogOut size={14} /> Rời Khỏi Phòng
              </button>
            )}
            <span className="text-[#ebdcb0]/50 font-mono text-[11px]">HPVN Floo Network</span>
          </div>
        </div>

        {/* Right Column: GM Controls or Player Waiting Status */}
        <div className={`lg:col-span-1 ${isGM ? 'order-1 lg:order-2' : 'order-2'}`}>
          {isGM ? (
            <div className="relative rounded-2xl hpvn-panel-gold p-4 sm:p-6 flex flex-col justify-between min-h-auto lg:min-h-[460px]">
              <div>
                <div className="flex items-center gap-2 border-b border-[#7a5229] pb-3 mb-4">
                  <WaxSeal variant="gold" letter="GM" size="sm" />
                  <div>
                    <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] tracking-wide">
                      Bảng Lệnh Quản Trò
                    </h3>
                    <p className="text-[11px] text-[#ebdcb0]/60 font-mono">Điều khiển phòng & Chia bài</p>
                  </div>
                </div>

                <p className="text-xs text-[#ebdcb0] font-lora leading-relaxed mb-6">
                  Bạn đang giữ quyền quản trò. Thêm bot thử nghiệm nếu cần, sau đó xáo bộ thẻ và ấn bắt đầu chiến dịch.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={addBot}
                    className="w-full py-3 px-4 hpvn-btn-gold rounded-xl flex items-center justify-center gap-2 text-xs font-serif font-bold cursor-pointer"
                  >
                    <Bot size={16} className="text-[#ffd88f]" />
                    <span>Triệu Hồi Thần Sáng Bot (+1)</span>
                  </button>

                  <button
                    onClick={assignRoles}
                    disabled={gameState.players.length < 2}
                    className="w-full py-3.5 px-4 hpvn-btn-phoenix rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-xs font-serif font-bold cursor-pointer"
                  >
                    <Wand2 size={16} className="text-[#ffd88f]" />
                    <span>Xáo Bài & Phân Phát Vai Trò</span>
                  </button>
                </div>
              </div>

              {/* Start Campaign Button */}
              <div className="mt-8">
                <button
                  onClick={startGame}
                  disabled={!hasAssignedRoles}
                  className="w-full py-3.5 px-4 hpvn-btn-floo rounded-xl disabled:opacity-40 disabled:grayscale font-serif font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={20} />
                  <span>Khai Mạc Chiến Dịch</span>
                </button>
                {!hasAssignedRoles && (
                  <p className="text-[10px] text-[#ffd88f]/80 text-center font-mono mt-2">
                    * Cần chia vai trò trước khi khai mạc
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl hpvn-panel p-6 flex flex-col items-center justify-center text-center min-h-[460px]">
              <div className="w-16 h-16 rounded-full bg-[#120803] border border-[#bd8436] flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-[#ffd88f] animate-pulse" />
              </div>
              <h3 className="font-title font-bold text-xl sm:text-2xl text-[#ffd88f] mb-2 tracking-wide">
                Đang Chuẩn Bị Bùa Chú
              </h3>
              <p className="text-xs text-[#ebdcb0] font-lora max-w-xs leading-relaxed mb-6">
                Quản trò đang tập hợp các phù thủy và chuẩn bị chia sẻ thẻ bài định mệnh. Vui lòng giữ yên lặng trong sảnh!
              </p>
              
              <div className="p-3 bg-[#120803] rounded-xl border border-[#5a3a1f] text-[11px] text-[#ebdcb0] font-mono max-w-xs">
                {hasAssignedRoles ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Bạn đã được chia thẻ bài! Chờ khai mạc...
                  </span>
                ) : (
                  <span className="text-[#ffd88f] flex items-center justify-center gap-1">
                    ⏳ Đang chờ chia thẻ bài...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code In-App Modal */}
      {isQrOpen && roomCode && (
        <div 
          onClick={() => setIsQrOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative hpvn-panel-gold rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-2 border-[#bd8436] space-y-4"
          >
            <button
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 text-[#ebdcb0]/70 hover:text-[#ffd88f] p-1 rounded-lg bg-[#1a0e07] border border-[#7a5229] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-mono tracking-widest text-[#ffd88f] uppercase block mb-1">
                QUÉT MÃ THAM GIA PHÒNG
              </span>
              <h3 className="font-title font-bold text-2xl text-[#ffd88f] tracking-wide">
                Phòng {roomCode}
              </h3>
              <p className="text-xs text-[#ebdcb0] font-lora mt-1">
                Mở camera điện thoại để quét mã và tham gia ngay
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-[#7a5229]">
              <QRCodeSVG
                value={inviteUrl}
                size={210}
                bgColor="#FFFFFF"
                fgColor="#120803"
                level="M"
              />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-mono text-[#ffd88f] bg-[#120803] py-1.5 px-3 rounded-lg border border-[#7a5229] truncate">
                {inviteUrl}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803] font-serif font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Sao Chép Liên Kết'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />
    </div>
  );
}
