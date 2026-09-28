'use client';

/**
 * MOD HPVN - Ultimate Edition Page
 * Chế độ chơi Ultimate kết hợp Classic + Chaos với Thẻ Bài Ma Thuật
 * Đồng bộ toàn diện UI/UX theo tiêu chuẩn Đại Điện Hogwarts
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HPVNLobby from '@/lib/modHPVNLobby';
import HPVNGameBoard from '@/lib/hpvnGameBoard';
import HPVNRoleCards from '@/components/HPVNRoleCards';
import { 
  Crown, 
  Sparkles, 
  BookOpen, 
  Users, 
  Zap, 
  Ghost, 
  Shield, 
  ArrowLeft,
  Flame,
  Swords
} from 'lucide-react';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol, 
  CardCornerFlourish,
  WaxSeal 
} from '@/components/ArtAssets';

const NEW_EXPANSION_ROLES = [
  {
    id: 'MCGONAGALL',
    name: 'Minerva McGonagall',
    title: 'Hiệu Phó Trường Hogwarts',
    faction: 'ORDER_OF_PHOENIX',
    img: '/cards/mcgonagall.jpg',
    ability: 'Hóa mèo vằn bọc lót bảo vệ 1 đồng đội khỏi đòn tử sát trong đêm.',
  },
  {
    id: 'NEVILLE',
    name: 'Neville Longbottom',
    title: 'Dũng Khí Gryffindor',
    faction: 'ORDER_OF_PHOENIX',
    img: '/cards/neville.jpg',
    ability: 'Rút Lưỡi Kiếm Gryffindor thức tỉnh và giải trừ câm lặng cho đồng minh.',
  },
  {
    id: 'DRACO',
    name: 'Draco Malfoy',
    title: 'Điệp Viên Hai Mang',
    faction: 'NEUTRAL',
    img: '/cards/draco.jpg',
    ability: 'Tàng hình trước bùa soi; tự do chọn thời khắc tiết lộ phe phái để lật ngược tình thế.',
  },
  {
    id: 'DOLORES',
    name: 'Dolores Umbridge',
    title: 'Thứ Trưởng Bộ Pháp Thuật',
    faction: 'NEUTRAL',
    img: '/cards/dolores.jpg',
    ability: 'Ban hành Sắc Lệnh Giáo Dục cấm đoán 1 phù thủy thi triển phép thuật.',
  },
  {
    id: 'JESTER',
    name: 'Kẻ Hề Ma Quái',
    title: 'Hỗn Loạn Tối Thượng',
    faction: 'NEUTRAL',
    img: '/cards/jester.jpg',
    ability: 'Kích động mọi người biểu quyết Tước Đũa mình ban ngày. Thắng ngay khi bị trục xuất!',
  },
];

import { HPVNGameSettings } from '@/lib/hpvnGameEngine';

export default function HPVNPage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [settings, setSettings] = useState<HPVNGameSettings>({
    playerCount: 8,
    hostName: 'Harry Potter',
    roomCode: 'HPVN',
    enableGhostVoting: true,
    enableChaosEvents: true,
    darkPactProtection: true,
    minRounds: 5,
    isMerlin: false,
  });
  const [isMerlinHost, setIsMerlinHost] = useState(false);
  const [showRoleCards, setShowRoleCards] = useState(false);
  const [mode, setMode] = useState<'menu' | 'lobby' | 'game' | 'rules'>('menu');

  const handleStartGame = (names: string[], playerId: string, gameSettings: HPVNGameSettings) => {
    setPlayerNames(names);
    setCurrentPlayerId(playerId);
    setSettings(gameSettings);
    setIsMerlinHost(Boolean(gameSettings.isMerlin));
    setGameStarted(true);
    setMode('game');
  };

  const handleQuickSolo = () => {
    const quickNames = [
      'Harry Potter (Bạn)',
      'Ron Weasley (Bot)',
      'Hermione Granger (Bot)',
      'Albus Dumbledore (Bot)',
      'Severus Snape (Bot)',
      'Lord Voldemort (Bot)',
      'Bellatrix Lestrange (Bot)',
      'Draco Malfoy (Bot)',
    ];
    setPlayerNames(quickNames);
    setCurrentPlayerId('player_0');
    setIsMerlinHost(false);
    setSettings({
      playerCount: 8,
      hostName: 'Harry Potter',
      roomCode: 'SOLO',
      enableGhostVoting: true,
      enableChaosEvents: true,
      darkPactProtection: true,
      minRounds: 5,
      isMerlin: false,
    });
    setGameStarted(true);
    setMode('game');
  };

  const handleQuickMerlin = () => {
    const quickNames = [
      'Merlin (Quản Trò)',
      'Harry Potter (Bot)',
      'Ron Weasley (Bot)',
      'Hermione Granger (Bot)',
      'Albus Dumbledore (Bot)',
      'Severus Snape (Bot)',
      'Lord Voldemort (Bot)',
      'Bellatrix Lestrange (Bot)',
      'Draco Malfoy (Bot)',
    ];
    setPlayerNames(quickNames);
    setCurrentPlayerId('player_0');
    setIsMerlinHost(true);
    setSettings({
      playerCount: 9,
      hostName: 'Merlin (Quản Trò)',
      roomCode: 'MERLIN',
      enableGhostVoting: true,
      enableChaosEvents: true,
      darkPactProtection: true,
      minRounds: 5,
      isMerlin: true,
    });
    setGameStarted(true);
    setMode('game');
  };

  // =========================================================================
  // 1. MENU SCREEN (HOGWARTS ANTIQUE CARD ROOM)
  // =========================================================================
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-[#120904] text-[#f5eedb] flex flex-col justify-between selection:bg-amber-900 selection:text-white">
        {/* Antique Gold Top Bar */}
        <header className="sticky top-0 z-40 hpvn-header-banner px-3 sm:px-6 py-2 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <PhoenixCrest className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
            <div>
              <h1 className="font-title-magical font-bold text-xs sm:text-base text-[#ffd88f] flex items-center gap-1.5 leading-none">
                <span>⚡ MOD HPVN</span>
                <span className="text-[11px] font-lora italic text-[#ebdcb0]/80">· Ultimate Edition</span>
              </h1>
              <p className="text-[10px] font-mono text-[#bd8436] tracking-widest hidden sm:block">
                HỆ THỐNG THẺ BÀI MA THUẬT & CHAOS EVENTS
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-3 py-1.5 bg-[#24150c] hover:bg-[#382013] text-[#ffd88f] border border-[#7a5229] rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Về Bàn Cờ Chính</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
          {/* Main Title Badge */}
          <div className="text-center mb-8 relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <PhoenixCrest className="w-8 h-8 text-amber-400" />
              <DeathlyHallowsSymbol className="w-6 h-6 text-[#bd8436]" />
              <DarkMarkCrest className="w-8 h-8 text-emerald-400" />
            </div>

            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#ffd88f] block mb-1">
              PHIÊN BẢN ĐẠI CHIẾN NÂNG CẤP · 24 THẺ BÀI MA THUẬT
            </span>
            <h2 className="text-3xl sm:text-5xl font-title-magical font-black tracking-wide text-[#ffd88f] mb-3">
              MOD HPVN · ULTIMATE
            </h2>
            <p className="text-xs sm:text-sm text-[#ebdcb0]/90 font-lora italic max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm social deduction tốc độ cao kết hợp <strong>Ghost Voting (Hồn Ma Bỏ Phiếu)</strong>, 
              <strong> Chaos Events (Biến Cố Bầu Trời)</strong> và <strong>5 Thẻ Bài Nhân Vật Mở Rộng</strong> độc quyền!
            </p>
          </div>

          {/* 5-CARD EXPANSION FAN DISPLAY */}
          <div className="relative h-32 sm:h-36 mb-8 flex items-center justify-center select-none">
            {[
              { img: '/cards/mcgonagall.jpg', rotate: '-16deg', x: '-90px', z: 1 },
              { img: '/cards/neville.jpg', rotate: '-8deg', x: '-45px', z: 2 },
              { img: '/cards/draco.jpg', rotate: '0deg', x: '0px', z: 3, center: true },
              { img: '/cards/dolores.jpg', rotate: '8deg', x: '45px', z: 2 },
              { img: '/cards/jester.jpg', rotate: '16deg', x: '90px', z: 1 },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  transform: `translateX(${c.x}) rotate(${c.rotate})`,
                  zIndex: c.z,
                }}
                className={`absolute w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-transform duration-300 hover:scale-110 cursor-pointer ${
                  c.center 
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' 
                    : 'border-[#bd8436]/70'
                }`}
              >
                <img src={c.img} alt="Card" className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
            <button
              onClick={handleQuickSolo}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border-2 border-amber-200 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Sparkles size={16} className="text-black animate-pulse shrink-0" />
              <span>⚡ CHƠI (HARRY)</span>
            </button>

            <button
              onClick={handleQuickMerlin}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-purple-100 font-serif font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border-2 border-purple-400/80 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Crown size={16} className="text-amber-300 shrink-0" />
              <span>👑 LÀM MERLIN (HOST)</span>
            </button>

            <button
              onClick={() => setMode('lobby')}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2a170d] to-[#1a0e07] hover:bg-[#341d11] text-[#ffd88f] font-serif font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border-2 border-[#bd8436] transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Users size={16} className="text-[#ffd88f] shrink-0" />
              <span>🎮 MỞ PHÒNG CHỜ</span>
            </button>
          </div>

          {/* 5 NEW CHARACTER CARDS SHOWCASE */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 border-b border-[#7a5229]/60 pb-2">
              <h3 className="font-serif font-black text-base sm:text-lg text-[#ffd88f] flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                5 Thẻ Bài Nhân Vật Mới (Expansion Set)
              </h3>
              <button
                onClick={() => setMode('rules')}
                className="text-xs font-serif font-bold text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Xem Toàn Bộ 24 Thẻ ➔</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {NEW_EXPANSION_ROLES.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border-2 border-[#7a5229]/80 bg-[#160d07] p-2.5 flex flex-col justify-between hover:border-[#ffd88f] transition-all hover:scale-[1.02] group select-none relative overflow-hidden"
                >
                  <CardCornerFlourish className="absolute top-1 left-1 w-4 h-4 text-[#bd8436] pointer-events-none opacity-60" />
                  <CardCornerFlourish className="absolute top-1 right-1 w-4 h-4 text-[#bd8436] -scale-x-100 pointer-events-none opacity-60" />

                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-[#bd8436]/60 mb-2 bg-black">
                    <img 
                      src={role.img} 
                      alt={role.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-1 right-1">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                        role.faction === 'ORDER_OF_PHOENIX'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-600'
                          : role.faction === 'DEATH_EATERS'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                          : 'bg-purple-950/90 text-purple-300 border-purple-600'
                      }`}>
                        {role.faction === 'ORDER_OF_PHOENIX' ? 'Phượng Hoàng' : role.faction === 'DEATH_EATERS' ? 'Tử Thần' : 'Trung Lập'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-black text-xs text-[#ffd88f] truncate block">
                      {role.name}
                    </h4>
                    <p className="text-[10px] text-[#bd8436] font-mono truncate mb-1">
                      {role.title}
                    </p>
                    <p className="text-[10px] text-[#ebdcb0]/80 font-lora line-clamp-2 leading-tight">
                      {role.ability}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KEY GAMEPLAY PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-8">
            <div className="p-4 rounded-2xl hpvn-panel flex items-start gap-3 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-1 left-1 w-4 h-4 text-[#bd8436] pointer-events-none opacity-60" />
              <div className="p-2.5 rounded-xl bg-[#28150c] border border-[#bd8436] text-amber-300 shrink-0">
                <Ghost size={20} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#ffd88f] mb-1">Ghost Voting (0.5 Phiếu)</h4>
                <p className="text-xs text-[#ebdcb0]/80 font-lora leading-relaxed">
                  Người chơi đã tử trận hóa thành linh hồn bóng ma, vẫn giữ 0.5 quyền biểu quyết để hỗ trợ đồng minh!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl hpvn-panel flex items-start gap-3 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-1 left-1 w-4 h-4 text-[#bd8436] pointer-events-none opacity-60" />
              <div className="p-2.5 rounded-xl bg-[#28150c] border border-[#bd8436] text-yellow-300 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#ffd88f] mb-1">Chaos Events Hàng Đêm</h4>
                <p className="text-xs text-[#ebdcb0]/80 font-lora leading-relaxed">
                  Sấm chớp, Khiên chắn cổ xưa (Shield), Lộ danh tính (Info) hoặc Câm lặng (Silence) xảy ra ngẫu nhiên.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl hpvn-panel flex items-start gap-3 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-1 left-1 w-4 h-4 text-[#bd8436] pointer-events-none opacity-60" />
              <div className="p-2.5 rounded-xl bg-[#28150c] border border-[#bd8436] text-emerald-300 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#ffd88f] mb-1">Dark Pact Protection</h4>
                <p className="text-xs text-[#ebdcb0]/80 font-lora leading-relaxed">
                  Khế ước hắc ám bảo vệ ít nhất 1 Tử Thần Thực Tử sống sót qua Vòng 1, bảo đảm ván đấu luôn kịch tính.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 2. RULES & CARDS VIEW
  // =========================================================================
  if (mode === 'rules') {
    return (
      <div className="min-h-screen bg-[#120904] text-[#f5eedb] flex flex-col justify-between selection:bg-amber-900 selection:text-white">
        <header className="sticky top-0 z-40 hpvn-header-banner px-3 sm:px-6 py-2 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <PhoenixCrest className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
            <div>
              <h1 className="font-title-magical font-bold text-xs sm:text-base text-[#ffd88f]">
                MOD HPVN · Sổ Tay Thẻ Bài & Luật Chơi
              </h1>
            </div>
          </div>
          <button
            onClick={() => setMode('menu')}
            className="px-3 py-1.5 bg-[#24150c] hover:bg-[#382013] text-[#ffd88f] border border-[#7a5229] rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Quay Lại Menu</span>
          </button>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowRoleCards(!showRoleCards)}
              className="hpvn-btn-gold px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{showRoleCards ? 'Xem Tổng Quan Giai Đoạn' : 'Mở Rộng Thư Viện Thẻ Bài'}</span>
            </button>
            <button
              onClick={handleQuickSolo}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-serif font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Chơi Thử Ngay ➔</span>
            </button>
          </div>

          {/* Overview Pillars */}
          <section className="hpvn-panel-gold rounded-2xl p-5 relative overflow-hidden">
            <CardCornerFlourish className="absolute top-2 left-2 w-6 h-6 text-[#bd8436] pointer-events-none" />
            <CardCornerFlourish className="absolute top-2 right-2 w-6 h-6 text-[#bd8436] -scale-x-100 pointer-events-none" />

            <h3 className="text-xl font-serif font-black text-[#ffd88f] mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Cốt Lõi Vận Hành MOD HPVN
            </h3>
            <p className="text-xs sm:text-sm text-[#ebdcb0]/90 font-lora leading-relaxed mb-4">
              Chế độ chơi kết hợp cơ chế không chiến và các bùa chú hỗn loạn. Mỗi ván diễn ra tuần tự qua các giai đoạn:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-serif font-bold">
              <div className="p-2.5 rounded-xl bg-[#24150c] border border-[#bd8436] text-[#ffd88f]">
                🌙 1. Đêm Ma Thuật
              </div>
              <div className="p-2.5 rounded-xl bg-[#24150c] border border-[#bd8436] text-[#ffd88f]">
                🎲 2. Biến Cố Chaos
              </div>
              <div className="p-2.5 rounded-xl bg-[#24150c] border border-[#bd8436] text-[#ffd88f]">
                💀 3. Phán Quyết Tử Thần
              </div>
              <div className="p-2.5 rounded-xl bg-[#24150c] border border-[#bd8436] text-[#ffd88f]">
                👻 4. Hồn Ma Thức Tỉnh
              </div>
              <div className="p-2.5 rounded-xl bg-[#24150c] border border-[#bd8436] text-[#ffd88f]">
                🗳️ 5. Biểu Quyết Tước Đũa
              </div>
            </div>
          </section>

          {/* Full Role Cards Browser */}
          <HPVNRoleCards />
        </main>
      </div>
    );
  }

  // =========================================================================
  // 3. LOBBY SCREEN
  // =========================================================================
  if (mode === 'lobby' && !gameStarted) {
    return (
      <div className="min-h-screen bg-[#120904] text-[#f5eedb] flex flex-col justify-between selection:bg-amber-900 selection:text-white">
        <header className="sticky top-0 z-40 hpvn-header-banner px-3 sm:px-6 py-2 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <PhoenixCrest className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
            <div>
              <h1 className="font-title-magical font-bold text-xs sm:text-base text-[#ffd88f]">
                MOD HPVN · Sảnh Đón Tiếp Phù Thủy
              </h1>
            </div>
          </div>
          <button
            onClick={() => setMode('menu')}
            className="px-3 py-1.5 bg-[#24150c] hover:bg-[#382013] text-[#ffd88f] border border-[#7a5229] rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Quay Lại Menu</span>
          </button>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
          <HPVNLobby
            onStartGame={handleStartGame}
            onBack={() => setMode('menu')}
          />
        </main>
      </div>
    );
  }

  // =========================================================================
  // 4. GAME SCREEN
  // =========================================================================
  if (mode === 'game' && gameStarted) {
    return (
      <HPVNGameBoard
        playerNames={playerNames}
        settings={settings}
        currentPlayerId={currentPlayerId}
        initialIsMerlin={isMerlinHost}
      />
    );
  }

  return null;
}
