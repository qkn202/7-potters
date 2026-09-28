'use client';

/**
 * MOD HPVN - Ultimate Edition Page
 * Chế độ chơi Ultimate kết hợp Classic + Chaos
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HPVNLobby from '@/lib/modHPVNLobby';
import HPVNGameBoard from '@/lib/hpvnGameBoard';
import HPVNRoleCards from '@/components/HPVNRoleCards';
import { Crown, Sparkles, BookOpen, Play, Users, Clock, Zap, Ghost, Settings } from 'lucide-react';
import { PhoenixCrest, DarkMarkCrest } from '@/components/ArtAssets';

export default function HPVNPage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [settings, setSettings] = useState({
    playerCount: 8,
    hostName: 'Host',
    roomCode: 'HPVN',
    enableGhostVoting: true,
    enableChaosEvents: true,
    darkPactProtection: true,
    minRounds: 4,
  });
  const [showRoleCards, setShowRoleCards] = useState(false);
  const [mode, setMode] = useState<'menu' | 'lobby' | 'game' | 'rules'>('menu');

  const handleStartGame = (names: string[], playerId: string, gameSettings: typeof settings) => {
    setPlayerNames(names);
    setCurrentPlayerId(playerId);
    setSettings(gameSettings);
    setGameStarted(true);
    setMode('game');
  };

  const handleBackToMenu = () => {
    setMode('menu');
    setGameStarted(false);
    setPlayerNames([]);
    setCurrentPlayerId('');
  };

  // Menu Screen
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <header className="border-b border-purple-500/30 bg-black/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoenixCrest className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="font-bold text-xl text-purple-200">MOD HPVN</h1>
                <p className="text-xs text-slate-400">Ultimate Edition</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-purple-200 text-sm font-medium">Kết hợp Classic & Chaos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              MOD HPVN
              <span className="block text-2xl text-purple-400 font-normal mt-2">Ultimate Edition</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Trải nghiệm game 7 Potter hoàn toàn mới! Kết hợp những tính năng tốt nhất từ Classic và Chaos mode,
              với hệ thống Ghost Voting, Chaos Events, và Dark Pact Protection.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
              <Users className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-bold text-white mb-2">4-20 Người Chơi</h3>
              <p className="text-sm text-slate-400">
                Phù hợp với mọi nhóm, từ nhóm nhỏ đến party lớn. Cân bằng tự động theo số người.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-white mb-2">10-25 Phút</h3>
              <p className="text-sm text-slate-400">
                Game nhanh, hỗn loạn, không bao giờ nhàm chán. Mỗi ván là một câu chuyện mới.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
              <Zap className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Chaos Events</h3>
              <p className="text-sm text-slate-400">
                Sự kiện bất ngờ mỗi đêm: Shield, Info, Silence hoặc không có gì. Luôn bất ngờ!
              </p>
            </div>
          </div>

          {/* Role Stats */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              24 Vai Trò Độc Đáo
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-green-400">15</p>
                <p className="text-sm text-slate-400">Hội Phượng Hoàng</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">5</p>
                <p className="text-sm text-slate-400">Tử Thần Thực Tử</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">4</p>
                <p className="text-sm text-slate-400">Neutral</p>
              </div>
            </div>
          </div>

          {/* New Roles Highlight */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Vai Trò Mới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="font-bold text-purple-300 mb-2">🧙 McGonagall</h4>
                <p className="text-xs text-slate-400">Biến hình bảo vệ đồng minh khỏi death glare. Shield mạnh nhất game!</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="font-bold text-green-300 mb-2">⚔️ Neville</h4>
                <p className="text-xs text-slate-400">Longbottom tỉnh giấc đánh thức người chơi. Reverse death glare!</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="font-bold text-red-300 mb-2">🐍 Draco</h4>
                <p className="text-xs text-slate-400">Điệp viên hai mang. Tàng hình nhưng có thể reveal bất cứ lúc nào!</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setMode('lobby')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Bắt Đầu Chơi
            </button>
            <button
              onClick={() => setMode('rules')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Xem Luật Chơi
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Rules Screen
  if (mode === 'rules') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
        <header className="border-b border-purple-500/30 bg-black/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoenixCrest className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="font-bold text-xl text-purple-200">MOD HPVN</h1>
                <p className="text-xs text-slate-400">Luật Chơi</p>
              </div>
            </div>
            <button
              onClick={() => setMode('menu')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {showRoleCards ? (
            <div>
              <button
                onClick={() => setShowRoleCards(false)}
                className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                ← Quay lại luật chơi
              </button>
              <HPVNRoleCards />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview */}
              <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Tổng Quan</h2>
                <div className="space-y-4 text-slate-300">
                  <p>
                    <strong className="text-purple-300">MOD HPVN - Ultimate Edition</strong> là chế độ chơi kết hợp
                    những tính năng tốt nhất từ Classic và Chaos mode, mang đến trải nghiệm social deduction
                    hoàn toàn mới.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>4-20 người chơi</strong> với cân bằng tự động</li>
                    <li><strong>10-25 phút</strong> mỗi ván game</li>
                    <li><strong>24 vai trò</strong> độc đáo từ Harry Potter</li>
                    <li><strong>Ghost Voting</strong> - Người chết vẫn có thể vote</li>
                    <li><strong>Chaos Events</strong> - Bất ngờ mỗi đêm</li>
                    <li><strong>Dark Pact</strong> - 4T được bảo vệ Round 1</li>
                  </ul>
                </div>
              </section>

              {/* Win Conditions */}
              <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Điều Kiện Thắng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-green-400 mb-2">🏛️ Hội Phượng Hoàng Thắng</h3>
                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                      <li>Tất cả Tử Thần Thực Tử bị loại</li>
                      <li>Harry Potter còn sống khi hết round tối thiểu</li>
                      <li>Voldemort bị giết</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-red-400 mb-2">💀 Tử Thần Thực Tử Thắng</h3>
                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                      <li>HPH ≤ 4T (sau round tối thiểu)</li>
                      <li>Harry Potter bị giết</li>
                      <li>Tất cả HPH bị loại</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-400 mb-2">🃏 Jester Thắng</h3>
                    <p className="text-sm text-slate-300">
                      Jester thắng nếu bị treo cổ (lynched) bất kỳ lúc nào trong game.
                    </p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-purple-400 mb-2">⚖️ Polyjuice Thắng</h3>
                    <p className="text-sm text-slate-300">
                      Polyjuice thắng nếu sống đến cuối game với ít nhất 2 người còn sống.
                    </p>
                  </div>
                </div>
              </section>

              {/* Game Phases */}
              <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Các Pha Game</h2>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">🌙</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pha Đêm (Night)</h3>
                      <p className="text-sm text-slate-400">Người chơi thực hiện hành động bí mật: giết, soi, bảo vệ, v.v. Mỗi hành động có 20 giây.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">🎲</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pha Sự Kiện (Chaos Event)</h3>
                      <p className="text-sm text-slate-400">Sự kiện ngẫu nhiên xảy ra: Shield (bảo vệ), Info (thông tin), Silence (im lặng), hoặc None (không có gì).</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-red-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">💀</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pha Giải Quyết (Death Resolution)</h3>
                      <p className="text-sm text-slate-400">Người chơi bị giết được tiết lộ. Họ có thể chia sẻ thông tin cuối cùng.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-800/50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">👻</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pha Ma Hiểu (Ghost Revelation)</h3>
                      <p className="text-sm text-slate-400">Người chơi đã chết có thể vote với sức mạnh 0.5. Ghosts ảnh hưởng đến kết quả!</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-orange-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">🗳️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pha Biểu Quyết (Vote)</h3>
                      <p className="text-sm text-slate-400">Người chơi bỏ phiếu treo cổ. Người có nhiều phiếu nhất bị treo. Có thể bỏ phiếu trắng.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Special Features */}
              <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Tính Năng Đặc Biệt</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-400 mb-2">👻 Ghost Voting</h3>
                    <p className="text-sm text-slate-300">
                      Người chơi đã chết vẫn có thể vote với sức mạnh 0.5.
                      Họ không bị loại hoàn toàn và vẫn ảnh hưởng đến kết quả!
                    </p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-purple-400 mb-2">🛡️ Dark Pact Protection</h3>
                    <p className="text-sm text-slate-300">
                      Ở Round 1, Tử Thần Thực Tử được bảo vệ bởi Dark Pact.
                      Ít nhất 1 4T sẽ sống đến Round 2 để đảm bảo game không kết thúc quá sớm.
                    </p>
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-400 mb-2">🎲 Chaos Events</h3>
                    <p className="text-sm text-slate-300">
                      Mỗi đêm có 50% không có sự kiện, 20% Shield, 15% Info, 15% Silence.
                      Không ai biết trước được!
                    </p>
                  </div>
                  <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-green-400 mb-2">⚖️ Dynamic Balance</h3>
                    <p className="text-sm text-slate-300">
                      Tỷ lệ HPH/4T tự động điều chỉnh theo số người chơi để đảm bảo game luôn cân bằng.
                    </p>
                  </div>
                </div>
              </section>

              {/* Role Cards Link */}
              <div className="text-center">
                <button
                  onClick={() => setShowRoleCards(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white transition-all inline-flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Xem Tất Cả Thẻ Vai Trò (24 vai)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Lobby Screen
  if (mode === 'lobby' && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
        <header className="border-b border-purple-500/30 bg-black/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoenixCrest className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="font-bold text-xl text-purple-200">MOD HPVN</h1>
                <p className="text-xs text-slate-400">Phòng Chờ</p>
              </div>
            </div>
            <button
              onClick={() => setMode('menu')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <HPVNLobby
            onStartGame={handleStartGame}
            onBack={() => setMode('menu')}
          />
        </main>
      </div>
    );
  }

  // Game Screen
  if (mode === 'game' && gameStarted) {
    return (
      <HPVNGameBoard
        playerNames={playerNames}
        settings={settings}
        currentPlayerId={currentPlayerId}
      />
    );
  }

  return null;
}
