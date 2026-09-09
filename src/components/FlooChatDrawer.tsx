"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  X, 
  Send, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Lock, 
  Sparkles, 
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  getFlooFirebase, 
  signInHPVN, 
  signOutHPVN, 
  fetchFlooUserProfile, 
  subscribeToFlooShouts, 
  sendFlooShout, 
  getHouseStyle, 
  FlooShout, 
  FlooUserProfile 
} from '@/lib/flooFirebase';
import { 
  CardCornerFlourish, 
  PhoenixCrest, 
  DeathlyHallowsSymbol 
} from './ArtAssets';
import { onAuthStateChanged, User } from 'firebase/auth';

interface FlooChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

/**
 * Global trigger to open Floo Chat Drawer from any component.
 */
export function openFlooDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-floo-drawer'));
  }
}

export function FlooChatDrawer({ isOpen, onClose, onOpen }: FlooChatDrawerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FlooUserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Auth Form state
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Chat state
  const [shouts, setShouts] = useState<FlooShout[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => onOpen?.();
    window.addEventListener('open-floo-drawer', handleOpen);
    return () => window.removeEventListener('open-floo-drawer', handleOpen);
  }, [onOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auth State Listener
  useEffect(() => {
    const { auth } = getFlooFirebase();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await fetchFlooUserProfile(currentUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Realtime Shouts Subscription (when user is logged in)
  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = subscribeToFlooShouts(
      (newShouts) => {
        setShouts(newShouts);
        setChatError(null);
      },
      () => {
        setChatError('Không thể đồng bộ tin nhắn từ Mạng Floo. Vui lòng thử lại sau.');
      },
      40
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  // Scroll to bottom on new shouts
  useEffect(() => {
    if (isOpen && shouts.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouts, isOpen]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password) {
      setAuthError('Vui lòng nhập đầy đủ tài khoản và mật khẩu HPVN.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      await signInHPVN(account.trim(), password);
      setAccount('');
      setPassword('');
    } catch (err: any) {
      console.error('HPVN Login error:', err);
      let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.';
      if (err.message && err.message.includes('401')) {
        msg = 'Sai tài khoản hoặc mật khẩu HPVN.';
      } else if (err.message && err.message.includes('user-not-found')) {
        msg = 'Tài khoản HPVN không tồn tại.';
      } else if (err.message && err.message.includes('wrong-password')) {
        msg = 'Mật khẩu không chính xác.';
      } else if (typeof err.message === 'string') {
        msg = err.message;
      }
      setAuthError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOutHPVN();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle Send Shout
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setChatError(null);

    try {
      await sendFlooShout(text);
      setMessageText('');
    } catch (err: any) {
      console.error('Send shout error:', err);
      setChatError('Gửi tin thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  // Quick Spell Chips
  const addQuickText = (spell: string) => {
    setMessageText((prev) => (prev ? `${prev} ${spell}` : spell));
  };

  if (!isOpen) return null;

  const currentHouseStyle = getHouseStyle(profile?.house);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Dark Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel - Styled in 7 Potters Mahogany & Antique Gold */}
      <aside 
        className="relative w-full sm:w-[460px] max-w-full h-full bg-gradient-to-b from-[#1c0f07] via-[#140a04] to-[#0e0703] border-l-2 border-[#bd8436] text-[#ebdcb0] flex flex-col z-50 select-text animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-label="Mạng Floo HPVN Chat"
      >
        {/* Ornate Corner Flourishes */}
        <CardCornerFlourish className="absolute top-2 right-12 w-5 h-5 text-[#bd8436] pointer-events-none -scale-x-100 opacity-60" />
        <CardCornerFlourish className="absolute bottom-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none -scale-y-100 opacity-60" />

        {/* 7 Potters Header Banner */}
        <div className="hpvn-header-banner px-4 py-3.5 flex items-center justify-between gap-3 shrink-0 border-b border-[#7a5229]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#3a2213] text-[#ffd88f] border border-[#ebdcb0]/50 shrink-0">
              <Flame size={18} className="text-[#ffd88f] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-title-magical font-bold text-sm sm:text-base tracking-wide text-[#ffd88f] truncate">
                  Mạng Floo · Seven Potters
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2b170c] border border-[#7a5229] text-[10px] font-mono text-[#ffd88f] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[#ebdcb0]/80 font-lora truncate">
                Shoutbox Phù Thủy Thời Gian Thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 z-10">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi Mạng Floo"
                className="p-2 rounded-xl bg-[#1c0f07] hover:bg-red-950/60 text-[#ffd88f] hover:text-red-300 border border-[#7a5229] hover:border-red-700 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Đóng Mạng Floo (Phím Esc)"
              className="p-2 rounded-xl bg-[#1c0f07] hover:bg-[#2b170c] text-[#ffd88f] border border-[#7a5229] transition-colors cursor-pointer active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User Identity Sub-bar (if logged in) */}
        {user && (
          <div className="px-4 py-2 bg-[#24150c] border-b border-[#7a5229]/80 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">{currentHouseStyle.badge}</span>
              <span className="font-title font-bold text-[#ffd88f] truncate text-xs">
                {profile?.username || user.displayName || user.email || 'Phù thủy'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-serif font-bold ${currentHouseStyle.pillColor}`}>
                {currentHouseStyle.name}
              </span>
            </div>
            {profile?.userTag && (
              <span className="px-1.5 py-0.5 rounded bg-[#3a2213] border border-[#bd8436] text-[#ffd88f] text-[10px] font-mono shrink-0">
                {profile.userTag}
              </span>
            )}
          </div>
        )}

        {/* Main Content Body */}
        {isAuthLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-[#ebdcb0]/80 gap-3">
            <Loader2 size={26} className="animate-spin text-[#bd8436]" />
            <p className="font-lora text-xs tracking-wide">Đang kết nối Bột Floo HPVN...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated State: 7 Potters Themed Login Form */
          <div className="flex-1 flex flex-col justify-center px-5 py-6 overflow-y-auto">
            <div className="hpvn-panel-gold p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
              <CardCornerFlourish className="absolute top-2 left-2 w-5 h-5 text-[#bd8436] pointer-events-none opacity-60" />
              <CardCornerFlourish className="absolute top-2 right-2 w-5 h-5 text-[#bd8436] pointer-events-none -scale-x-100 opacity-60" />

              <div className="text-center pt-1">
                <PhoenixCrest className="w-14 h-14 mx-auto mb-2 opacity-90" />
                <h3 className="font-title-magical font-bold text-lg text-[#ffd88f] tracking-wide uppercase">
                  Đăng Nhập Mạng Floo
                </h3>
                <p className="text-xs text-[#ebdcb0]/90 font-lora mt-1 leading-relaxed">
                  Đăng nhập tài khoản HPVN của bạn để trò chuyện và phối hợp chiến thuật cùng các phù thủy trong ván cờ.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/80 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-lora">{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] font-serif font-bold text-[#ffd88f] uppercase tracking-wider mb-1">
                    Tên tài khoản HPVN (hoặc Email)
                  </label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bd8436]" />
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="Ví dụ: HarryPotter hoặc email@hpvn..."
                      disabled={isLoggingIn}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#140b05] border border-[#7a5229] text-[#f5eedb] placeholder-[#8c622e] font-lora text-xs focus:outline-none focus:border-[#ffd88f] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-serif font-bold text-[#ffd88f] uppercase tracking-wider mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bd8436]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      disabled={isLoggingIn}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#140b05] border border-[#7a5229] text-[#f5eedb] placeholder-[#8c622e] font-lora text-xs focus:outline-none focus:border-[#ffd88f] disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="hpvn-btn-gold w-full mt-1 py-3 px-4 rounded-xl font-serif font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-[#ffd88f]" />
                      <span>Đang ném Bột Floo...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={15} />
                      <span>Bước Vào Mạng Floo</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#bd8436] font-lora text-center pt-1 border-t border-[#7a5229]/40">
                <DeathlyHallowsSymbol className="w-3.5 h-3.5 text-[#bd8436]" />
                <span>Phiên đăng nhập được ghi nhớ an toàn trên thiết bị này.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated State: Realtime Feed + Composer in 7 Potters Theme */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Shouts Feed */}
            <div 
              ref={listContainerRef} 
              className="flex-1 overflow-y-auto p-3.5 space-y-2.5 overscroll-contain"
            >
              {chatError && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2 font-lora">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              {shouts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#bd8436]">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="font-title text-sm text-[#ffd88f]">Mạng Floo đang tĩnh lặng</p>
                  <p className="text-xs text-[#ebdcb0]/70 font-lora mt-0.5">Hãy là người đầu tiên gửi tin nhắn lửa vào lò sưởi!</p>
                </div>
              ) : (
                shouts.map((shout) => {
                  const houseStyle = getHouseStyle(shout.house);
                  const isSelf = shout.uid === user.uid;

                  return (
                    <div 
                      key={shout.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-colors ${
                        isSelf 
                          ? 'bg-[#24140b] border-[#bd8436] ml-2' 
                          : 'bg-[#160c06] border-[#7a5229]/70 mr-2'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs">{houseStyle.badge}</span>
                          <span className={`font-serif font-bold text-[12px] truncate ${houseStyle.textColor}`}>
                            {shout.name}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-serif font-bold ${houseStyle.pillColor}`}>
                            {houseStyle.name}
                          </span>
                          {shout.userTag && (
                            <span className="px-1 py-0.2 rounded bg-[#3a2213] border border-[#bd8436]/60 text-[#ffd88f] text-[9px] font-mono">
                              {shout.userTag}
                            </span>
                          )}
                        </div>

                        {shout.createdAt && (
                          <span className="text-[10px] font-mono text-[#bd8436] shrink-0">
                            {shout.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Message Body */}
                      <p className="text-[#ebdcb0] font-lora text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {shout.message}
                      </p>

                      {/* Attached Image if any */}
                      {(shout.imageUrl || shout.imageReplyUrl) && (
                        <div className="mt-1 rounded-lg overflow-hidden border border-[#7a5229]/70 max-h-48 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={shout.imageUrl || shout.imageReplyUrl || ''} 
                            alt="Hình ảnh Mạng Floo" 
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Spell Buttons for 7 Potters Theme */}
            <div className="px-3 py-2 bg-[#1a0e07] border-t border-[#7a5229]/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-serif text-[#bd8436] font-bold shrink-0 flex items-center gap-1">
                <Sparkles size={11} className="text-[#ffd88f]" /> Câu niệm:
              </span>
              {[
                '⚡ Bảo vệ Harry!',
                '🪄 Expelliarmus!',
                '💀 Ai là Tử Thần Thực Tử?',
                '🦉 Hội Phượng Hoàng tiến lên!',
                '🛡️ Bọc lót tôi!'
              ].map((spell) => (
                <button
                  key={spell}
                  type="button"
                  onClick={() => addQuickText(spell)}
                  className="px-2.5 py-1 rounded-lg bg-[#28180e] hover:bg-[#3a2213] border border-[#7a5229] text-[11px] font-lora text-[#ffd88f] shrink-0 transition-colors cursor-pointer active:scale-95"
                >
                  {spell}
                </button>
              ))}
            </div>

            {/* Composer Box in 7 Potters Theme */}
            <form 
              onSubmit={handleSend}
              className="p-3 bg-[#140b05] border-t-2 border-[#7a5229] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Gửi tin nhắn vào Mạng Floo… (Enter)"
                maxLength={500}
                disabled={isSending}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1c0f07] border border-[#7a5229] text-[#f5eedb] placeholder-[#8c622e] text-xs font-lora focus:outline-none focus:border-[#ffd88f] disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="hpvn-btn-gold px-4 py-2.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 active:scale-95"
              >
                {isSending ? (
                  <Loader2 size={15} className="animate-spin text-[#ffd88f]" />
                ) : (
                  <>
                    <Send size={14} className="text-[#ffd88f]" />
                    <span className="hidden sm:inline">Gửi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}

/**
 * Top Header Quick Button for Mạng Floo Drawer (Harmonized with 7 Potters Theme)
 */
export function FlooHeaderTrigger({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Mở Mạng Floo (Chat In-App Seven Potters)"
      className={`hpvn-btn-gold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer text-[#ffd88f] border border-[#7a5229] transition-colors ${className}`}
    >
      <Flame size={14} className="text-[#ffd88f] animate-pulse shrink-0" />
      <span className="text-[11px] sm:text-xs tracking-wide">
        Mạng Floo <span className="hidden md:inline">(Chat)</span>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
    </button>
  );
}

/**
 * Floating Magic Handle Widget on bottom/right edge (Harmonized with 7 Potters Theme)
 */
export function FlooFloatingTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        className="group px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-[#1c0f07] hover:bg-[#28180e] border-2 border-[#bd8436] text-[#ffd88f] font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
        title="Mở Mạng Floo HPVN (Chat In-App)"
      >
        <div className="relative flex items-center justify-center">
          <Flame size={17} className="text-[#ffd88f] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black tracking-wider uppercase text-[#ffd88f]">
            Mạng Floo
          </span>
          <span className="text-[9px] font-lora text-[#bd8436] hidden sm:inline">
            Chat In-App 💬
          </span>
        </div>
      </button>
    </div>
  );
}
