"use client";

import { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { 
  Sparkles, 
  Wand2, 
  Crown, 
  BookOpen, 
  KeyRound, 
  PlusCircle, 
  LogIn, 
  Laptop, 
  AlertCircle, 
  Loader2,
  Lock,
  User,
  ShieldCheck,
  LogOut,
  Castle,
  UserCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoenixCrest, 
  DarkMarkCrest, 
  WaxSeal, 
  CardCornerFlourish,
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

type JoinMode = 'create' | 'join' | 'mock';
type AuthTab = 'hpvn' | 'guest';

export function JoinForm() {
  const { createRoom, joinRoom, joinGame, errorMsg: globalError } = useGame();
  
  // Game Room Mode
  const [mode, setMode] = useState<JoinMode>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isGM, setIsGM] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // HPVN Authentication State
  const [authTab, setAuthTab] = useState<AuthTab>('hpvn');
  const [currentUserProfile, setCurrentUserProfile] = useState<FlooUserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form Inputs
  const [hpvnAccount, setHpvnAccount] = useState('');
  const [hpvnPassword, setHpvnPassword] = useState('');
  const [guestName, setGuestName] = useState('');

  // Check URL query param ?room=CODE on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && roomParam.trim()) {
        setRoomCodeInput(roomParam.trim().toUpperCase());
        setMode('join');
      }
    }
  }, []);

  // Listen to HPVN Firebase Auth State changes & sync profile
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
          if (isMounted) {
            setCurrentUserProfile(null);
          }
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
      setLocalError(err?.message || 'Không thể đăng xuất tài khoản HPVN.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate Room Code for 'join' mode
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (mode === 'join' && !cleanCode) {
      setLocalError('Vui lòng nhập Mã Phòng gồm 4 ký tự!');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalName = '';
      let extraData: { house?: string; userTag?: string; hpvnUid?: string } | undefined = undefined;

      if (currentUserProfile) {
        // Authenticated via persistent session
        finalName = currentUserProfile.username.trim();
        extraData = {
          house: currentUserProfile.house,
          userTag: currentUserProfile.userTag,
          hpvnUid: currentUserProfile.uid,
        };
      } else if (authTab === 'hpvn') {
        // Fresh HPVN login
        const account = hpvnAccount.trim();
        const password = hpvnPassword;
        if (!account) {
          setLocalError('Vui lòng nhập Tài khoản hoặc Email HPVN!');
          setIsSubmitting(false);
          return;
        }
        if (!password) {
          setLocalError('Vui lòng nhập Mật khẩu tài khoản HPVN!');
          setIsSubmitting(false);
          return;
        }

        // Authenticate with HPVN
        const user = await signInHPVN(account, password);
        const profile = await fetchFlooUserProfile(user.uid);
        
        finalName = profile?.username || user.displayName || account;
        extraData = {
          house: profile?.house,
          userTag: profile?.userTag,
          hpvnUid: user.uid,
        };
      } else {
        // Guest mode
        finalName = guestName.trim();
        if (!finalName) {
          setLocalError('Vui lòng nhập Danh Xưng / Bí Danh Phù Thủy!');
          setIsSubmitting(false);
          return;
        }
      }

      // Execute room entry
      if (mode === 'create') {
        await createRoom(finalName, isGM, extraData);
      } else if (mode === 'join') {
        await joinRoom(cleanCode, finalName, isGM, extraData);
      } else {
        // Single-device / Mock mode
        joinGame(finalName, isGM, extraData);
      }
    } catch (err: any) {
      console.error('[JoinForm] Submit error:', err);
      let msg = err?.message || 'Không thể kết nối. Vui lòng thử lại!';
      if (msg.includes('auth/invalid-credential') || msg.includes('401') || msg.includes('Sai account')) {
        msg = 'Sai tài khoản hoặc mật khẩu HPVN. Vui lòng kiểm tra lại!';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'Tài khoản không tồn tại trên hệ thống HPVN.';
      } else if (msg.includes('auth/wrong-password')) {
        msg = 'Mật khẩu không chính xác.';
      }
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || globalError;
  const activeHouseStyle = currentUserProfile ? getHouseStyle(currentUserProfile.house) : null;

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8c0c0c]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dossier Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-3xl p-4 sm:p-8 md:p-10 hpvn-panel-gold overflow-hidden"
      >
        {/* Corner Antique Flourishes */}
        <CardCornerFlourish className="absolute top-2.5 left-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] pointer-events-none" />
        <CardCornerFlourish className="absolute top-2.5 right-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-x-100 pointer-events-none" />
        <CardCornerFlourish className="absolute bottom-2.5 left-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-y-100 pointer-events-none" />
        <CardCornerFlourish className="absolute bottom-2.5 right-2.5 w-6 h-6 sm:w-8 sm:h-8 text-[#bd8436] -scale-x-100 -scale-y-100 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="text-center relative z-10 mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2.5">
            <PhoenixCrest className="w-8 h-8 sm:w-10 sm:h-10" />
            <DeathlyHallowsSymbol className="w-5 h-5 sm:w-6 sm:h-6 text-[#bd8436]" />
            <DarkMarkCrest className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#ffd88f] block mb-1">
            HỘI PHƯỢNG HOÀNG · ĐỒNG BỘ DỮ LIỆU HPVN
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-title-magical font-bold tracking-wide text-[#ffd88f]">
            Chiến Dịch 7 Potter
          </h1>
          <p className="text-xs sm:text-sm text-[#ebdcb0] font-lora italic mt-1 px-2 sm:px-4">
            Cuộc tháo chạy định mệnh từ Privet Drive đến Trang trại Hang Sóc
          </p>
        </div>

        {/* Mode Selector Tabs (Create / Join / Mock) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#120803] rounded-xl border border-[#7a5229]/60 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => { setMode('create'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'create'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803]'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <PlusCircle size={14} />
            <span>Tạo Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('join'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'join'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803]'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <LogIn size={14} />
            <span>Vào Phòng</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('mock'); setLocalError(null); }}
            className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'mock'
                ? 'bg-gradient-to-r from-[#bd8436] to-[#7a5229] text-[#120803]'
                : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
            }`}
          >
            <Laptop size={14} />
            <span>Giả Lập</span>
          </button>
        </div>

        {/* Error Notification */}
        {displayError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs font-serif flex items-center gap-2 relative z-10 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Main Mission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Room Code Input (Only in 'join' mode) */}
          {mode === 'join' && (
            <div>
              <label className="block text-xs font-serif uppercase tracking-widest text-[#ffd88f] mb-1.5 font-bold">
                Mã Phòng (4 Ký Tự)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-[#120803] border-2 border-[#bd8436] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-2 focus:ring-[#bd8436]/50 text-[#ffd88f] placeholder-[#8c622e] font-mono text-center tracking-[0.3em] uppercase text-lg transition-all"
                  placeholder="VÍ DỤ: POT7"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                  <KeyRound size={18} />
                </div>
              </div>
            </div>
          )}

          {/* USER AUTHENTICATION SECTION */}
          {currentUserProfile ? (
            /* Authenticated HPVN Member Profile Card */
            <div className={`p-4 rounded-2xl border-2 transition-all select-none ${activeHouseStyle?.bgColor} ${activeHouseStyle?.borderColor}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#120803] border border-[#bd8436] flex items-center justify-center text-2xl shrink-0">
                    {activeHouseStyle?.badge || '🧙'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-base text-[#ffd88f] truncate block">
                        {currentUserProfile.username}
                      </span>
                      {currentUserProfile.house && currentUserProfile.house !== 'NONE' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${activeHouseStyle?.pillColor}`}>
                          {activeHouseStyle?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-[11px] text-[#ebdcb0]/80 font-mono truncate">
                        {currentUserProfile.userTag ? `[${currentUserProfile.userTag}] · ` : ''}Tài khoản HPVN đã xác thực
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOutHPVN}
                  className="px-2.5 py-1.5 bg-[#120803]/80 hover:bg-red-950 text-red-300 hover:text-red-200 border border-[#7a5229]/60 hover:border-red-700/80 rounded-lg text-xs font-serif flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  title="Đăng xuất tài khoản này"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Đổi TK</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authentication Tabs & Inputs (HPVN or Guest) */
            <div className="space-y-3.5">
              {/* Dual-mode Selection Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#120803] rounded-xl border border-[#7a5229]/60">
                <button
                  type="button"
                  onClick={() => { setAuthTab('hpvn'); setLocalError(null); }}
                  className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authTab === 'hpvn'
                      ? 'bg-[#3a2213] text-[#ffd88f] border border-[#bd8436]'
                      : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
                  }`}
                >
                  <Castle size={14} className="text-[#ffd88f]" />
                  <span>Tài Khoản HPVN</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthTab('guest'); setLocalError(null); }}
                  className={`py-2 px-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authTab === 'guest'
                      ? 'bg-[#3a2213] text-[#ffd88f] border border-[#bd8436]'
                      : 'text-[#ebdcb0]/70 hover:text-[#ffd88f]'
                  }`}
                >
                  <UserCircle2 size={14} />
                  <span>Khách Vãng Lai</span>
                </button>
              </div>

              {/* Tab 1: HPVN Account Login */}
              {authTab === 'hpvn' && (
                <div className="space-y-3 p-3.5 bg-[#180e07] rounded-2xl border border-[#5a3a1f]">
                  <div className="text-[11px] text-[#ebdcb0]/80 font-serif leading-relaxed flex items-start gap-1.5">
                    <span className="text-[#ffd88f] text-sm">✦</span>
                    <span>
                      Đăng nhập tài khoản <strong>hpvn-archive.net</strong>. Hệ thống sẽ tự động đồng bộ <strong>Tên, Nhà (🦁/🐍/🦅/🦡) và Danh hiệu</strong> vào phòng chơi.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-[#ffd88f] mb-1 font-bold">
                      Tài Khoản HPVN (hoặc Email)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={hpvnAccount}
                        onChange={(e) => setHpvnAccount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120803] border border-[#7a5229] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-1 focus:ring-[#bd8436] text-[#f5eedb] placeholder-[#8c622e] font-serif text-sm transition-all"
                        placeholder="Ví dụ: harrypotter, hermione..."
                        autoComplete="username"
                        required={authTab === 'hpvn'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                        <User size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-[#ffd88f] mb-1 font-bold">
                      Mật Khẩu HPVN
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={hpvnPassword}
                        onChange={(e) => setHpvnPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120803] border border-[#7a5229] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-1 focus:ring-[#bd8436] text-[#f5eedb] placeholder-[#8c622e] font-serif text-sm transition-all"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required={authTab === 'hpvn'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                        <Lock size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Guest Player Name Input */}
              {authTab === 'guest' && (
                <div className="space-y-2 p-3.5 bg-[#180e07] rounded-2xl border border-[#5a3a1f]">
                  <label className="block text-xs font-serif uppercase tracking-widest text-[#ffd88f] mb-1 font-bold">
                    Danh Xưng / Bí Danh Phù Thủy
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#120803] border-2 border-[#7a5229] rounded-xl focus:outline-none focus:border-[#ffd88f] focus:ring-2 focus:ring-[#bd8436]/40 text-[#f5eedb] placeholder-[#8c622e] font-lora transition-all"
                      placeholder="Ví dụ: Harry, Moody Mắt Điên, Albus..."
                      required={authTab === 'guest'}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#bd8436]">
                      <Wand2 size={18} />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#ebdcb0]/60 font-mono italic">
                    Chế độ khách: Tên hiển thị tự do, không có huy hiệu Nhà Hogwarts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* GM Role Toggle Card */}
          <div 
            onClick={() => setIsGM(!isGM)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
              isGM 
                ? 'bg-[#3a2213] border-[#ffd88f]' 
                : 'bg-[#180e07] border-[#5a3a1f] hover:border-[#7a5229]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isGM 
                  ? 'bg-gradient-to-b from-[#bd8436] to-[#7a5229] text-[#120803] border-[#ebdcb0]' 
                  : 'bg-[#120803] text-[#ebdcb0] border-[#5a3a1f]'
              }`}>
                <Crown size={17} />
              </div>
              <div>
                <span className={`block font-serif font-bold text-xs sm:text-sm ${isGM ? 'text-[#ffd88f]' : 'text-[#ebdcb0]'}`}>
                  Vai trò Quản Trò (Game Master)
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#ebdcb0]/70 block font-mono">
                  {isGM ? 'Nắm giữ cuốn sổ định đoạt ván cờ' : 'Người chơi nhận thẻ nhân vật'}
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              id="isGM"
              checked={isGM}
              onChange={(e) => setIsGM(e.target.checked)}
              className="w-4 h-4 rounded border-[#7a5229] text-[#bd8436] focus:ring-[#bd8436] bg-[#120803] pointer-events-none"
            />
          </div>

          {/* Wax Sealed Entrance Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden rounded-xl p-[2px] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none pt-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#8c0c0c] via-[#bd8436] to-[#047857] rounded-xl opacity-85 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#24150c] via-[#1a0e07] to-[#24150c] px-6 sm:px-8 py-3.5 rounded-xl transition-all group-hover:bg-opacity-90 font-serif font-bold text-base sm:text-lg text-[#ffd88f] tracking-wider uppercase border border-[#bd8436]/60">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 text-[#ffd88f] animate-spin" />
                  <span>Đang xác thực & kết nối...</span>
                </>
              ) : (
                <>
                  <WaxSeal variant={isGM ? 'gold' : 'red'} letter={isGM ? 'GM' : 'P'} size="sm" />
                  <span>
                    {currentUserProfile ? (
                      mode === 'create'
                        ? (isGM ? 'Mở Phòng (GM HPVN)' : `Tạo Phòng Với ${currentUserProfile.username}`)
                        : mode === 'join'
                        ? `Vào Phòng (${currentUserProfile.username})`
                        : `Vào Giả Lập (${currentUserProfile.username})`
                    ) : (
                      mode === 'create'
                        ? (isGM ? 'Thiết Lập Phòng GM' : 'Mở Phòng Bầu Trời')
                        : mode === 'join'
                        ? 'Gia Nhập Phòng'
                        : (isGM ? 'Vào Bàn Quản Trò' : 'Gia Nhập Giả Lập')
                    )}
                  </span>
                  <Sparkles size={18} className="text-[#ffd88f]" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Quick Deck Codex Button */}
        <div className="mt-5 pt-4 border-t border-[#7a5229]/40 flex items-center justify-between text-xs text-[#ebdcb0]/70">
          <button
            type="button"
            onClick={() => setIsDeckOpen(true)}
            className="flex items-center gap-1.5 text-[#ffd88f] hover:text-[#fff4d1] transition-colors font-serif font-bold cursor-pointer"
          >
            <BookOpen size={14} /> Sổ tay 22 Thẻ Bài & Luật chơi
          </button>
          <span className="font-mono text-[10px] text-[#ebdcb0]/60">HPVN Multiplayer Engine</span>
        </div>
      </motion.div>

      {/* Card Deck Modal */}
      <CardDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />
    </div>
  );
}
