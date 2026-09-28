/**
 * MOD HPVN - Ultimate Mode Lobby
 * Sảnh Tập Hợp Phù Thủy - Thiết Kế Đồng Bộ Với Toàn Trang Web
 */

'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Zap, 
  Shield, 
  Ghost, 
  Sparkles, 
  Crown, 
  Skull, 
  Heart, 
  Info,
  Copy,
  Check,
  QrCode,
  X,
  Radio,
  ArrowLeft,
  Bot,
  UserPlus,
  Play,
  Eye
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  CardCornerFlourish,
  WaxSeal
} from '@/components/ArtAssets';
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
  isBot?: boolean;
}

const PLAYER_COUNTS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const BOT_NAMES = [
  'Ron Weasley (Bot)',
  'Hermione Granger (Bot)',
  'Albus Dumbledore (Bot)',
  'Severus Snape (Bot)',
  'Remus Lupin (Bot)',
  'Alastor Moody (Bot)',
  'Rubeus Hagrid (Bot)',
  'Kingsley Shacklebolt (Bot)',
  'Minerva McGonagall (Bot)',
  'Neville Longbottom (Bot)',
  'Lord Voldemort (Bot)',
  'Bellatrix Lestrange (Bot)',
  'Lucius Malfoy (Bot)',
  'Peter Pettigrew (Bot)',
  'Draco Malfoy (Bot)',
  'Dolores Umbridge (Bot)',
  'Kẻ Hề Ma Quái (Bot)',
];

interface HPVNLobbyProps {
  onStartGame: (playerNames: string[], playerId: string, settings: HPVNGameSettings) => void;
  onBack: () => void;
}

export default function HPVNLobby({ onStartGame, onBack }: HPVNLobbyProps) {
  const [settings, setSettings] = useState<HPVNGameSettings>({
    playerCount: 8,
    hostName: 'Harry Potter',
    roomCode: generateRoomCode(),
    enableGhostVoting: true,
    enableChaosEvents: true,
    darkPactProtection: true,
    minRounds: 5,
    isMerlin: false,
  });

  const [players, setPlayers] = useState<HPVNPlayer[]>([
    { 
      id: 'host_' + Math.random().toString(36).substring(2, 9), 
      name: 'Harry Potter (Bạn)', 
      isHost: true, 
      isReady: true, 
      status: 'ready' 
    },
  ]);

  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const balance = HPVN_BALANCE[settings.playerCount] || { hph: 4, fourT: 3, neutral: 1, minRounds: 5 };

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/hpvn?room=${settings.roomCode}` 
    : '';

  const copyRoomCode = () => {
    navigator.clipboard.writeText(settings.roomCode);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2000);
  };

  const addPlayer = (name: string, isBot = false) => {
    if (players.length >= settings.playerCount) return;
    setPlayers(prev => [
      ...prev,
      {
        id: (isBot ? 'bot_' : 'p_') + Date.now().toString() + Math.random().toString(36).substring(2, 5),
        name,
        isHost: false,
        isReady: isBot ? true : false,
        status: isBot ? 'ready' : 'waiting',
        isBot,
      }
    ]);
  };

  const addBotPlayer = () => {
    if (players.length >= settings.playerCount) return;
    const existingNames = players.map(p => p.name);
    const available = BOT_NAMES.filter(n => !existingNames.includes(n));
    const nextName = available.length > 0 
      ? available[0] 
      : `Phù Thủy Bot #${players.length + 1}`;
    addPlayer(nextName, true);
  };

  const fillAllBots = () => {
    const needed = settings.playerCount - players.length;
    if (needed <= 0) return;
    const existingNames = players.map(p => p.name);
    const available = BOT_NAMES.filter(n => !existingNames.includes(n));
    const newBots: HPVNPlayer[] = [];
    for (let i = 0; i < needed; i++) {
      const name = available[i] || `Phù Thủy Bot #${players.length + i + 1}`;
      newBots.push({
        id: 'bot_' + Date.now().toString() + '_' + i,
        name,
        isHost: false,
        isReady: true,
        status: 'ready',
        isBot: true,
      });
    }
    setPlayers(prev => [...prev, ...newBots]);
  };

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const toggleReady = (id: string) => {
    setPlayers(prev => prev.map(p =>
      p.id === id ? { ...p, isReady: !p.isReady, status: p.isReady ? 'waiting' : 'ready' } : p
    ));
  };

  const startGame = () => {
    const playerNames = players.map(p => p.name);
    const hostIndex = Math.max(0, players.findIndex(p => p.isHost));
    const hostPlayerId = `player_${hostIndex}`;
    onStartGame(playerNames, hostPlayerId, {
      ...settings,
      minRounds: balance.minRounds,
    });
  };

  const canStart = players.length >= 4 && players.every(p => p.isReady || p.isHost);

  return (
    <div className="text-[#ebdcb0] flex flex-col justify-between selection:bg-amber-900 selection:text-white">
      {/* Header Bar */}
      <div className="text-center mb-6 relative">
        <div className="flex items-center justify-center gap-3 mb-2">
          <PhoenixCrest className="w-8 h-8 text-amber-400" />
          <h2 className="text-3xl sm:text-4xl font-title-magical font-bold tracking-wide text-[#ffd88f]">
            Sảnh Tập Hợp MOD HPVN
          </h2>
          <DarkMarkCrest className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-xs sm:text-sm text-[#ebdcb0]/80 font-lora italic max-w-xl mx-auto">
          Mở phòng tác chiến Ultimate: Thiết lập số lượng phù thủy, kiểm soát biến cố Chaos và kích hoạt khế ước bóng ma!
        </p>

        {/* Room Code & Share Invite Bar */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#120803] px-3.5 sm:px-5 py-2 rounded-2xl border-2 border-[#bd8436] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#ebdcb0]">
            <Radio size={14} className="text-[#ffd88f] animate-pulse" />
            <span>Mã Phòng:</span>
            <span className="font-mono text-base sm:text-lg font-black text-[#ffd88f] tracking-widest bg-[#221006] px-2.5 py-0.5 rounded-lg border border-[#7a5229]">
              {settings.roomCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyRoomCode}
              className="px-2.5 py-1 bg-[#28180e] hover:bg-[#3a2213] text-[#ffd88f] rounded-lg border border-[#7a5229] text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Sao chép mã phòng"
            >
              {copyCodeSuccess ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copyCodeSuccess ? 'Đã chép!' : 'Chép Mã'}</span>
            </button>

            <button
              type="button"
              onClick={copyInviteLink}
              className="px-2.5 py-1 bg-[#28180e] hover:bg-[#3a2213] text-[#ffd88f] rounded-lg border border-[#7a5229] text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Sao chép đường dẫn mời người chơi"
            >
              {copyLinkSuccess ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copyLinkSuccess ? 'Đã chép link!' : 'Chép Link'}</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Settings & Faction Balance (col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Feature Banner */}
          <div className="relative rounded-2xl hpvn-panel-gold p-5 overflow-hidden">
            <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
            <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                CHẾ ĐỘ TỐC ĐỘ CAO · ĐẠI CHIẾN NÂNG CẤP
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-title-magical font-bold text-[#ffd88f] mb-1">
              Quy Chuẩn Cân Bằng Phe Phái
            </h3>
            <p className="text-xs text-[#ebdcb0]/90 font-lora leading-relaxed mb-4">
              Cơ chế tự động cân bằng số lượng phù thủy Hội Phượng Hoàng, Tử Thần Thực Tử và Trung Lập tương ứng với quy mô phòng.
            </p>

            {/* Faction Balance Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#2b100d]/80 border border-red-800/80">
                <div className="flex items-center justify-center gap-1.5 text-amber-300 mb-1">
                  <PhoenixCrest className="w-4 h-4 text-amber-400" />
                  <span className="font-mono font-bold text-lg">{balance.hph}</span>
                </div>
                <span className="text-[11px] font-serif text-red-200">Phượng Hoàng</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#09261a]/80 border border-emerald-800/80">
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 mb-1">
                  <DarkMarkCrest className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-bold text-lg">{balance.fourT}</span>
                </div>
                <span className="text-[11px] font-serif text-emerald-200">Tử Thần</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#20102b]/80 border border-purple-800/80">
                <div className="flex items-center justify-center gap-1.5 text-purple-300 mb-1">
                  <DeathlyHallowsSymbol className="w-4 h-4 text-purple-300" />
                  <span className="font-mono font-bold text-lg">{balance.neutral}</span>
                </div>
                <span className="text-[11px] font-serif text-purple-200">Trung Lập</span>
              </div>
            </div>

            {/* Faction Ratio Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-[#ebdcb0]/80 mb-1">
                <span>{Math.round((balance.hph / settings.playerCount) * 100)}% Phượng Hoàng</span>
                <span className="text-amber-300 font-bold">Tối thiểu {balance.minRounds} Vòng</span>
                <span>{Math.round((balance.fourT / settings.playerCount) * 100)}% Tử Thần</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-black/60 border border-[#7a5229]">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-red-600 transition-all duration-300"
                  style={{ width: `${(balance.hph / settings.playerCount) * 100}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(balance.neutral / settings.playerCount) * 100}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                  style={{ width: `${(balance.fourT / settings.playerCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Player Count Selection Panel */}
          <div className="hpvn-panel rounded-2xl p-5">
            <h3 className="text-sm font-serif font-bold text-[#ffd88f] mb-3 flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <span>SỐ LƯỢNG NGƯỜI CHƠI ({settings.playerCount} PHÙ THỦY)</span>
            </h3>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 mb-3">
              {PLAYER_COUNTS.map(count => (
                <button
                  key={count}
                  onClick={() => setSettings({ ...settings, playerCount: count })}
                  className={`py-2 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                    settings.playerCount === count
                      ? 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ffd88f] ring-1 ring-[#ffd88f] scale-105'
                      : 'bg-[#180e07] text-[#ebdcb0]/80 hover:text-white border-[#5a3a1f] hover:border-[#bd8436]'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#ebdcb0]/70 font-lora italic">
              Khuyên dùng: 8-10 người để trải nghiệm trọn vẹn sự xuất hiện của các nhân vật đặc biệt (Neville, McGonagall, Draco).
            </p>
          </div>

          {/* Mod Advanced Rules Toggle */}
          <div className="hpvn-panel rounded-2xl p-5">
            <h3 className="text-sm font-serif font-bold text-[#ffd88f] mb-3 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span>CƠ CHẾ MA THUẬT ĐẶC TRƯNG</span>
            </h3>

            <div className="space-y-3">
              {/* Ghost Voting */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#140b05] border border-[#7a5229] cursor-pointer hover:border-[#bd8436] transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#24150c] text-cyan-300 border border-[#bd8436]/60">
                    <Ghost size={18} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#ffd88f] block">
                      Ghost Voting (Hồn Ma Bỏ Phiếu)
                    </span>
                    <span className="text-[11px] text-[#ebdcb0]/70 font-lora block">
                      Người chơi sau khi tử trận vẫn giữ 0.5 quyền biểu quyết để hỗ trợ đồng đội.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableGhostVoting}
                  onChange={e => setSettings({ ...settings, enableGhostVoting: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Chaos Events */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#140b05] border border-[#7a5229] cursor-pointer hover:border-[#bd8436] transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#24150c] text-yellow-300 border border-[#bd8436]/60">
                    <Zap size={18} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#ffd88f] block">
                      Chaos Events (Biến Cố Bầu Trời Hàng Đêm)
                    </span>
                    <span className="text-[11px] text-[#ebdcb0]/70 font-lora block">
                      Ngẫu nhiên kích hoạt sấm chớp, khiên bảo vệ cổ xưa, câm lặng hoặc vạch trần danh tính.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableChaosEvents}
                  onChange={e => setSettings({ ...settings, enableChaosEvents: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Dark Pact */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#140b05] border border-[#7a5229] cursor-pointer hover:border-[#bd8436] transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#24150c] text-emerald-300 border border-[#bd8436]/60">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#ffd88f] block">
                      Khế Ước Hắc Ám (Dark Pact Protection)
                    </span>
                    <span className="text-[11px] text-[#ebdcb0]/70 font-lora block">
                      Bảo vệ phe Tử Thần Thực Tử không bị quét sạch ngay trong Vòng 1 để trận đấu kịch tính.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.darkPactProtection}
                  onChange={e => setSettings({ ...settings, darkPactProtection: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Player Roster & Actions (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Player Attendance Scroll */}
          <div className="hpvn-panel-gold rounded-2xl p-5 relative overflow-hidden">
            <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none" />
            <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] -scale-x-100 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#7a5229] pb-3 mb-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#ffd88f] flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                <span>Danh Sách Người Chơi</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#ffd88f] bg-[#120803] px-2.5 py-1 rounded-full border border-[#7a5229]">
                {players.length}/{settings.playerCount}
              </span>
            </div>

            {/* Nút Merlin (Host / Quản Trò Thần Nhãn) */}
            <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-[#2a133d] via-[#1a0a28] to-[#12051d] border-2 border-purple-500/80">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-400 shrink-0">
                    <Eye size={17} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-black text-xs sm:text-sm text-purple-200 truncate">
                        🧙‍♂️ Quyền Host Merlin (Quản Trò)
                      </span>
                      <span className="text-[9px] font-mono bg-purple-900 text-purple-200 px-1.5 py-0.2 rounded border border-purple-500 shrink-0">
                        THẦN NHÃN
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300/80 font-lora truncate">
                      Xem thẻ bài bí mật & đổi góc nhìn của tất cả Bot
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextMerlin = !settings.isMerlin;
                    setSettings(prev => ({
                      ...prev,
                      isMerlin: nextMerlin,
                      hostName: nextMerlin ? 'Merlin (Quản Trò)' : 'Harry Potter (Bạn)',
                    }));
                    setPlayers(prev => prev.map(p => p.isHost ? { ...p, name: nextMerlin ? 'Merlin (Quản Trò)' : 'Harry Potter (Bạn)' } : p));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs shrink-0 transition-all cursor-pointer border ${
                    settings.isMerlin
                      ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400'
                      : 'bg-purple-950/70 text-purple-300 border-purple-700 hover:bg-purple-900'
                  }`}
                >
                  {settings.isMerlin ? '✓ Đang Bật' : 'Bật Merlin'}
                </button>
              </div>
            </div>

            {/* Quick Bot Fill Controls */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={addBotPlayer}
                disabled={players.length >= settings.playerCount}
                className="flex-1 py-1.5 px-2 bg-[#24150c] hover:bg-[#382013] text-[#ffd88f] border border-[#7a5229] rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Bot size={13} className="text-cyan-400" />
                <span>+ Thêm 1 Bot</span>
              </button>

              <button
                type="button"
                onClick={fillAllBots}
                disabled={players.length >= settings.playerCount}
                className="py-1.5 px-3 hpvn-btn-gold rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Lấp Đầy Bot</span>
              </button>
            </div>

            {/* Player Roster Grid */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar mb-4">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    p.isHost
                      ? 'bg-[#2b170c] border-[#ffd88f]'
                      : p.isReady
                        ? 'bg-[#182618]/90 border-emerald-600/70'
                        : 'bg-[#180e07] border-[#5a3a1f]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 ${
                      p.isHost
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : p.isBot
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                          : 'bg-[#24150c] text-[#ffd88f] border-[#7a5229]'
                    }`}>
                      {p.isHost ? <Crown size={14} /> : p.isBot ? <Bot size={14} /> : (idx + 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-bold text-xs sm:text-sm text-[#ffd88f] truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {p.isHost && (
                          <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-600">
                            Chủ Phòng
                          </span>
                        )}
                        {p.isBot && (
                          <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-700">
                            AI Bot
                          </span>
                        )}
                        <span className={`text-[10px] font-mono ${p.isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {p.isReady ? '✓ Đã sẵn sàng' : '⌛ Đang chờ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {!p.isHost && (
                      <button
                        onClick={() => toggleReady(p.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-serif font-bold transition-all cursor-pointer ${
                          p.isReady
                            ? 'bg-[#180e07] text-[#ebdcb0] border border-[#7a5229] hover:bg-[#28180e]'
                            : 'bg-emerald-900/80 text-emerald-200 border border-emerald-600 hover:bg-emerald-800'
                        }`}
                      >
                        {p.isReady ? 'Hủy' : 'Sẵn Sàng'}
                      </button>
                    )}

                    {!p.isHost && (
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="p-1 text-red-400 hover:text-red-200 hover:bg-red-950/60 rounded cursor-pointer"
                        title="Xóa người chơi"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Custom Player Form */}
              {players.length < settings.playerCount && (
                <AddPlayerForm onAdd={(name) => addPlayer(name, false)} />
              )}
            </div>

            {/* Start Game Action Button */}
            <button
              onClick={startGame}
              disabled={!canStart}
              className={`w-full py-3.5 rounded-2xl font-serif font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95'
                  : 'bg-[#24150c] text-zinc-500 border-[#5a3a1f] cursor-not-allowed'
              }`}
            >
              <Sparkles size={18} className={canStart ? 'animate-pulse text-black' : 'text-zinc-600'} />
              <span>{canStart ? '⚡ KHỞI TRANH ĐẠI CHIẾN' : `Cần tối thiểu 4 người (hiện có ${players.length})`}</span>
            </button>
          </div>

          {/* Quick Rules Mini Scroll */}
          <div className="hpvn-panel rounded-2xl p-4">
            <h4 className="text-xs font-serif font-bold text-[#ffd88f] mb-2 flex items-center gap-1.5">
              <Info size={14} className="text-amber-400" />
              <span>Quy Tắc Chiến Thắng Nhanh</span>
            </h4>
            <ul className="text-[11px] text-[#ebdcb0]/80 font-lora space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Hội Phượng Hoàng:</strong> Bảo toàn mạng sống Harry đến hết số vòng quy định HOẶC tiêu diệt được Voldemort.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Tử Thần Thực Tử:</strong> Ám sát thành công Harry Potter thật HOẶC chiếm áp đảo số lượng phù thủy còn sống.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Kẻ Hề (Jester):</strong> Chiến thắng ngay lập tức nếu bị hội đồng biểu quyết trục xuất vào ban ngày!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1a0e07] border-2 border-[#bd8436] rounded-3xl p-6 max-w-sm w-full text-center">
            <button
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg p-1"
            >
              <X size={18} />
            </button>
            <h3 className="font-title-magical font-bold text-lg text-[#ffd88f] mb-2">
              Quét Mã Vào Phòng
            </h3>
            <p className="text-xs text-[#ebdcb0]/80 font-lora mb-4">
              Mở camera điện thoại quét mã để tham gia trực tiếp:
            </p>
            <div className="p-4 bg-white rounded-2xl inline-block mb-4 shadow-xl">
              <QRCodeSVG value={inviteUrl || `HPVN_${settings.roomCode}`} size={180} />
            </div>
            <p className="font-mono text-sm font-bold text-amber-300">
              Phòng #{settings.roomCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADD PLAYER FORM SUBCOMPONENT
// ============================================================================

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
        className="w-full py-2.5 border-2 border-dashed border-[#7a5229]/80 rounded-xl text-xs font-serif font-bold text-[#ffd88f]/80 hover:border-[#ffd88f] hover:text-[#ffd88f] transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#140b05]/50"
      >
        <UserPlus size={14} />
        <span>+ Thêm Phù Thủy Thủ Công</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-2.5 bg-[#140b05] rounded-xl border border-[#7a5229]">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nhập tên phù thủy..."
        className="w-full px-3 py-1.5 bg-[#1f1008] border border-[#7a5229] rounded-lg text-xs font-serif text-[#ffd88f] placeholder-[#bd8436]/60 focus:outline-none focus:border-[#ffd88f] mb-2"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-1 hpvn-btn-gold rounded-lg text-xs font-serif font-bold cursor-pointer"
        >
          Thêm
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1 bg-[#28180e] hover:bg-[#382013] text-[#ebdcb0] rounded-lg text-xs font-serif border border-[#7a5229] cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
