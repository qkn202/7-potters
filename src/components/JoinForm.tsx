"use client";

import { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { 
  Sparkles, 
  BookOpen, 
  KeyRound, 
  PlusCircle, 
  LogIn, 
  Laptop, 
  AlertCircle, 
  Loader2,
  User,
  ShieldCheck,
  LogOut,
  Castle,
  UserCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { CardDeckModal } from './CardDeckModal';
import { 
  getFlooFirebase, 
  signInHPVN, 
  signOutHPVN, 
  fetchFlooUserProfile, 
  getHouseStyle, 
  type FlooUserProfile 
} from '@/lib/flooFirebase';
import { onAuthStateChanged } from 'firebase/auth';

type JoinMode = 'join' | 'create' | 'mock';
type AuthTab = 'guest' | 'hpvn';

const HOUSES = [
  { id: 'GRYFFINDOR', name: 'Gryffindor', icon: '🦁', color: 'from-red-950 to-amber-950 border-amber-500/50 text-amber-300' },
  { id: 'SLYTHERIN', name: 'Slytherin', icon: '🐍', color: 'from-emerald-950 to-teal-950 border-emerald-500/50 text-emerald-300' },
  { id: 'RAVENCLAW', name: 'Ravenclaw', icon: '🦅', color: 'from-blue-950 to-indigo-950 border-cyan-500/50 text-cyan-300' },
  { id: 'HUFFLEPUFF', name: 'Hufflepuff', icon: '🦡', color: 'from-amber-950 to-stone-900 border-yellow-500/50 text-yellow-300' },
];

export function JoinForm() {
  const { createRoom, joinRoom, joinGame, startQuickSoloGame, errorMsg: globalError } = useGame();
  
  const [mode, setMode] = useState<JoinMode>('join');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Authentication State (Default to fast guest for frictionless mobile entry)
  const [authTab, setAuthTab] = useState<AuthTab>('guest');
  const [currentUserProfile, setCurrentUserProfile] = useState<FlooUserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form Inputs
  const [hpvnAccount, setHpvnAccount] = useState('');
  const [hpvnPassword, setHpvnPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestHouse, setGuestHouse] = useState<string>('GRYFFINDOR');
  const [skyOfficeIdentity, setSkyOfficeIdentity] = useState<{ name: string; house?: string } | null>(null);

  // Check URL query param ?room=CODE on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      const skyOfficePlayer = params.get('skyofficePlayer');
      const skyOfficeName = params.get('skyofficeName')?.trim().slice(0, 32);
      const rawHouse = params.get('skyofficeHouse')?.toUpperCase();
      const validHouses = ['GRYFFINDOR', 'SLYTHERIN', 'RAVENCLAW', 'HUFFLEPUFF'];
      if (skyOfficePlayer && skyOfficeName) {
        const house = rawHouse && validHouses.includes(rawHouse) ? rawHouse : undefined;
        setSkyOfficeIdentity({ name: skyOfficeName, house });
        setGuestName(skyOfficeName);
        if (house) setGuestHouse(house);
        setAuthTab('guest');
      }
      if (roomParam && roomParam.trim()) {
        setRoomCodeInput(roomParam.trim().toUpperCase());
        setMode('join');
        setAuthTab('guest');
      }
    }
  }, []);

  // Listen to HPVN Firebase Auth
  useEffect(() => {
    let isMounted = true;
    try {
      const { auth } = getFlooFirebase();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;
        if (user) {
          try {
            const profile = await fetchFlooUserProfile(user.uid);
            if (isMounted) {
              if (profile) {
                setCurrentUserProfile(profile);
              } else {
                setCurrentUserProfile({
                  uid: user.uid,
                  username: user.displayName || user.email?.split('@')[0] || 'Phù thủy HPVN',
                  house: 'NONE',
                  email: user.email,
                });
              }
            }
          } catch (err) {
            console.warn('[JoinForm] Error loading HPVN profile:', err);
          }
        } else {
          if (isMounted) setCurrentUserProfile(null);
        }
        if (isMounted) setIsCheckingAuth(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (e) {
      console.warn('[JoinForm] Firebase init warning:', e);
      setIsCheckingAuth(false);
    }
  }, []);

  const handleSignOutHPVN = async () => {
    try {
      await signOutHPVN();
      setCurrentUserProfile(null);
      setLocalError(null);
    } catch (err: any) {
      setLocalError(err?.message || 'Không thể đăng xuất.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (mode === 'join' && !cleanCode) {
      setLocalError('Nhập mã phòng 4 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalName = '';
      let extraData: { house?: string; userTag?: string; hpvnUid?: string } | undefined = undefined;

      if (skyOfficeIdentity) {
        finalName = skyOfficeIdentity.name;
        extraData = { house: skyOfficeIdentity.house, userTag: 'SkyOffice' };
      } else if (currentUserProfile) {
        finalName = currentUserProfile.username.trim();
        extraData = {
          house: currentUserProfile.house,
          userTag: currentUserProfile.userTag,
          hpvnUid: currentUserProfile.uid,
        };
      } else if (authTab === 'hpvn') {
        const account = hpvnAccount.trim();
        const password = hpvnPassword;
        if (!account || !password) {
          setLocalError('Nhập tài khoản & mật khẩu HPVN');
          setIsSubmitting(false);
          return;
        }

        const user = await signInHPVN(account, password);
        const profile = await fetchFlooUserProfile(user.uid);
        
        finalName = profile?.username || user.displayName || account;
        extraData = {
          house: profile?.house,
          userTag: profile?.userTag,
          hpvnUid: user.uid,
        };
      } else {
        finalName = guestName.trim() || 'Phù Thủy Ẩn Danh';
        extraData = {
          house: guestHouse,
          userTag: 'Tân Binh',
        };
      }

      if (mode === 'create') {
        await createRoom(finalName, false, extraData);
      } else if (mode === 'join') {
        await joinRoom(cleanCode, finalName, false, extraData);
      } else {
        joinGame(finalName, false, extraData);
      }
    } catch (err: any) {
      let msg = err?.message || 'Lỗi kết nối. Thử lại!';
      if (msg.includes('auth/invalid-credential') || msg.includes('401')) {
        msg = 'Sai tài khoản hoặc mật khẩu HPVN';
      }
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || globalError;
  const activeHouseStyle = currentUserProfile ? getHouseStyle(currentUserProfile.house) : null;

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-screen px-4 py-5 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      
      {/* 1. BRAND HERO HEADER */}
      <div className="text-center pt-2 select-none">
        <div className="flex items-center justify-center gap-3 mb-2">
          <PhoenixCrest className="w-7 h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(245,197,66,0.6)]" />
          <DeathlyHallowsSymbol className="w-5 h-5 text-amber-300/80" />
          <DarkMarkCrest className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
        </div>
        
        <h1 className="font-cinzel text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff2b2] via-[#f5c542] to-[#b8860b] drop-shadow-[0_2px_10px_rgba(245,197,66,0.3)]">
          7 POTTERS
        </h1>
        <p className="text-[11px] font-sans tracking-[0.2em] uppercase text-cyan-300/80 font-semibold mt-0.5">
          Trận Chiến Trên Không · Mobile Edition
        </p>
      </div>

      {/* 2. CARD FAN SHOWCASE (TAP TO VIEW 27 CARDS) */}
      <div 
        onClick={() => setIsDeckOpen(true)}
        className="relative h-28 my-3 flex items-center justify-center cursor-pointer group select-none active:scale-95 transition-transform"
        title="Chạm để xem 27 thẻ bài ma thuật"
      >
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent blur-xl pointer-events-none" />
        
        {[
          { img: '/cards/hermione.jpg', rotate: '-18deg', x: '-70px', z: 1 },
          { img: '/cards/mcgonagall.jpg', rotate: '-9deg', x: '-35px', z: 2 },
          { img: '/cards/harry.jpg', rotate: '0deg', x: '0px', z: 3, center: true },
          { img: '/cards/neville.jpg', rotate: '9deg', x: '35px', z: 2 },
          { img: '/cards/voldemort.jpg', rotate: '18deg', x: '70px', z: 1 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              transform: `translateX(${c.x}) rotate(${c.rotate})`,
              zIndex: c.z,
            }}
            className={`absolute w-14 h-22 rounded-xl overflow-hidden border transition-all duration-300 shadow-xl ${
              c.center 
                ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,197,66,0.4)] scale-110 -translate-y-1' 
                : 'border-amber-500/30 brightness-90 group-hover:brightness-100'
            }`}
          >
            <img src={c.img} alt="Card" className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="absolute bottom-0 px-2.5 py-0.5 rounded-full bg-black/75 border border-amber-400/40 text-[10px] text-amber-300 font-mono flex items-center gap-1 z-10 backdrop-blur-md shadow-lg">
          <BookOpen size={11} />
          <span>27 Thẻ Bài Ma Thuật</span>
          <ChevronRight size={11} />
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE CARD DOCK */}
      <div className="arcane-card-glass rounded-3xl p-4 sm:p-5 border border-amber-400/30 relative">
        
        {/* ONE-TAP INSTANT SOLO PLAY BUTTON */}
        <button
          type="button"
          onClick={() => startQuickSoloGame()}
          className="w-full py-3.5 px-4 mb-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-cinzel font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,197,66,0.4)] border border-amber-200 transition-all cursor-pointer select-none"
        >
          <Sparkles size={17} className="animate-spin-slow text-slate-900" />
          <span>⚡ CHƠI NGAY (SOLO VỚI BOT)</span>
        </button>

        {/* MODE SELECTOR PILLS */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-3.5">
          <button
            type="button"
            onClick={() => { setMode('join'); setLocalError(null); }}
            className={`py-2 text-xs font-cinzel font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'join'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn size={13} />
            <span>Vào Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('create'); setLocalError(null); }}
            className={`py-2 text-xs font-cinzel font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'create'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle size={13} />
            <span>Tạo Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('mock'); setLocalError(null); }}
            className={`py-2 text-xs font-cinzel font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'mock'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop size={13} />
            <span>Giả Lập</span>
          </button>
        </div>

        {/* ERROR TOAST */}
        {displayError && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span className="truncate">{displayError}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Room PIN Input (Only for Join mode) */}
          {mode === 'join' && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-950/90 border border-amber-400/40 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-amber-300 font-mono text-center tracking-[0.3em] uppercase text-lg transition-all placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal font-bold"
                  placeholder="NHẬP MÃ PHÒNG (VD: POT7)"
                  required
                />
                <KeyRound size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400/60 pointer-events-none" />
              </div>
            </div>
          )}

          {/* AUTH / PROFILE CARD */}
          {currentUserProfile ? (
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${activeHouseStyle?.bgColor || 'bg-slate-900'} ${activeHouseStyle?.borderColor || 'border-slate-700'}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">{activeHouseStyle?.badge || '🧙'}</span>
                <div className="min-w-0">
                  <div className="font-cinzel font-bold text-sm text-amber-300 truncate">
                    {currentUserProfile.username}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>HPVN Verified</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOutHPVN}
                className="p-1.5 bg-slate-950/80 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Guest / HPVN Segmented Switch */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Danh tính phù thủy:</span>
                <button
                  type="button"
                  onClick={() => setAuthTab(authTab === 'guest' ? 'hpvn' : 'guest')}
                  className="text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  {authTab === 'guest' ? 'Dùng nick HPVN?' : 'Vào dạng Khách?'}
                </button>
              </div>

              {authTab === 'guest' ? (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={20}
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 placeholder:text-slate-500 text-xs font-sans transition-all"
                      placeholder="Tên phù thủy của bạn..."
                    />
                    <User size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {/* House Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {HOUSES.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setGuestHouse(h.id)}
                        className={`py-1.5 px-1 rounded-xl border text-[11px] font-sans flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          guestHouse === h.id
                            ? `bg-gradient-to-b ${h.color} ring-1 ring-amber-400/50 font-bold scale-102`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm">{h.icon}</span>
                        <span className="text-[10px] truncate max-w-full">{h.name.slice(0, 4)}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    value={hpvnAccount}
                    onChange={(e) => setHpvnAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500"
                    placeholder="Tài khoản HPVN..."
                  />
                  <input
                    type="password"
                    value={hpvnPassword}
                    onChange={(e) => setHpvnPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500"
                    placeholder="Mật khẩu..."
                  />
                </div>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-cinzel font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,197,66,0.3)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 select-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <span>
                {mode === 'join' ? 'VÀO PHÒNG CHIẾN ĐẤU' : mode === 'create' ? 'KHỞI TẠO PHÒNG MỚI' : 'VÀO GIẢ LẬP'}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* 4. MINIMAL BOTTOM BAR */}
      <div className="py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }
          }}
          className="hover:text-amber-400 transition-colors cursor-pointer"
        >
          ↻ Reset Cache
        </button>
        <span>HPVN · v2026.9</span>
      </div>

      {/* 27 CARDS CODEX MODAL */}
      <CardDeckModal isOpen={isDeckOpen} onClose={() => setIsDeckOpen(false)} />
    </div>
  );
}
