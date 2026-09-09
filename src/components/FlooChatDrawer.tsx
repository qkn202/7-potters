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
  Radio, 
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronDown
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

  useEffect(() => {
    const handleOpen = () => onOpen?.();
    window.addEventListener('open-floo-drawer', handleOpen);
    return () => window.removeEventListener('open-floo-drawer', handleOpen);
  }, [onOpen]);
  
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
      (err) => {
        setChatError('Không thể đồng bộ tin nhắn từ Mạng Floo. Vui lòng thử lại sau.');
      },
      35
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside 
        className="relative w-full sm:w-[460px] max-w-full h-full bg-[#081b13] border-l-2 border-emerald-600/90 text-gray-200 flex flex-col z-50 select-text animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-label="Mạng Floo HPVN Chat"
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 bg-[#05140e] border-b-2 border-emerald-700/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/70 flex items-center justify-center shrink-0">
              <Flame size={18} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-sm tracking-wider text-emerald-300 uppercase truncate">
                  Mạng Floo · HPVN
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/70 text-[10px] font-mono text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/70 font-serif truncate">
                Shoutbox Cộng Đồng Phù Thủy Thời Gian Thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi Mạng Floo"
                className="p-1.5 rounded-lg text-emerald-400/80 hover:text-red-400 bg-emerald-950/60 hover:bg-red-950/50 border border-emerald-700/50 hover:border-red-700/60 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Đóng ngăn kéo Mạng Floo (Phím Esc)"
              className="p-1.5 rounded-lg text-emerald-300/80 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 hover:border-emerald-500/70 transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* User Identity Sub-bar (if logged in) */}
        {user && (
          <div className="px-4 py-2 bg-[#0a2319] border-b border-emerald-800/60 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{currentHouseStyle.badge}</span>
              <span className="font-serif font-bold text-emerald-200 truncate">
                {profile?.username || user.displayName || user.email || 'Phù thủy'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-serif font-bold ${currentHouseStyle.pillColor}`}>
                {currentHouseStyle.name}
              </span>
            </div>
            {profile?.userTag && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 text-[10px] font-mono shrink-0">
                {profile.userTag}
              </span>
            )}
          </div>
        )}

        {/* Main Content Body */}
        {isAuthLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-emerald-300/80 gap-3">
            <Loader2 size={26} className="animate-spin text-emerald-400" />
            <p className="font-serif text-xs tracking-wide">Đang kết nối Mạng Floo HPVN...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated State: HPVN Login Form */
          <div className="flex-1 flex flex-col justify-center px-6 py-8 overflow-y-auto">
            <div className="p-5 rounded-2xl bg-[#0a2319] border-2 border-emerald-600/70 flex flex-col gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/80 mx-auto flex items-center justify-center mb-2.5">
                  <Flame size={24} className="text-emerald-400 animate-pulse" />
                </div>
                <h3 className="font-serif font-bold text-base text-emerald-200 uppercase tracking-wider">
                  Đăng Nhập Mạng Floo
                </h3>
                <p className="text-xs text-emerald-300/70 font-serif mt-1 leading-relaxed">
                  Nhập tài khoản HPVN của bạn để mở khóa toàn bộ tin nhắn và trò chuyện cùng các phù thủy trong ván đấu.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600/80 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] font-serif font-bold text-emerald-300 uppercase tracking-wider mb-1">
                    Tên tài khoản HPVN (hoặc Email)
                  </label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="Ví dụ: HarryPotter hoặc mail@hpvn..."
                      disabled={isLoggingIn}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#05140e] border border-emerald-600/70 text-emerald-100 text-xs placeholder:text-emerald-600/50 focus:outline-hidden focus:border-emerald-400 font-serif disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-serif font-bold text-emerald-300 uppercase tracking-wider mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      disabled={isLoggingIn}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#05140e] border border-emerald-600/70 text-emerald-100 text-xs placeholder:text-emerald-600/50 focus:outline-hidden focus:border-emerald-400 font-serif disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-400/80 text-emerald-50 font-serif font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Đang xác thực qua Bột Floo...
                    </>
                  ) : (
                    <>
                      <LogIn size={15} />
                      Bước Vào Mạng Floo
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-emerald-400/60 text-center font-mono">
                Phiên đăng nhập được ghi nhớ an toàn trên trình duyệt này.
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated State: Realtime Feed + Composer */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Shouts Feed */}
            <div 
              ref={listContainerRef} 
              className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
            >
              {chatError && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              {shouts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-emerald-400/70">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="font-serif text-xs">Mạng Floo đang tĩnh lặng.</p>
                  <p className="text-[11px] text-emerald-500/60 mt-0.5">Hãy là người đầu tiên gửi tin nhắn lửa!</p>
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
                          ? 'bg-[#0e2c20] border-emerald-500/70 ml-2' 
                          : 'bg-[#071911] border-emerald-800/60 mr-2'
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
                            <span className="px-1 py-0.2 rounded bg-amber-950/70 border border-amber-700/50 text-amber-300 text-[9px] font-mono">
                              {shout.userTag}
                            </span>
                          )}
                        </div>

                        {shout.createdAt && (
                          <span className="text-[10px] font-mono text-emerald-400/60 shrink-0">
                            {shout.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Message Body */}
                      <p className="text-emerald-100 font-sans text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {shout.message}
                      </p>

                      {/* Attached Image if any */}
                      {(shout.imageUrl || shout.imageReplyUrl) && (
                        <div className="mt-1 rounded-lg overflow-hidden border border-emerald-700/50 max-h-48 bg-black/40">
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

            {/* Quick Spell Buttons for 7 Potters */}
            <div className="px-3 py-1.5 bg-[#061710] border-t border-emerald-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-serif text-emerald-400/80 font-bold shrink-0 flex items-center gap-1">
                <Sparkles size={11} /> Câu niệm:
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
                  className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 text-[11px] font-serif text-emerald-200 shrink-0 transition-colors cursor-pointer active:scale-95"
                >
                  {spell}
                </button>
              ))}
            </div>

            {/* Composer Box */}
            <form 
              onSubmit={handleSend}
              className="p-3 bg-[#05140e] border-t-2 border-emerald-700/70 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Gửi tin nhắn vào Mạng Floo… (Enter)"
                maxLength={500}
                disabled={isSending}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a2319] border border-emerald-600/70 text-emerald-100 text-xs placeholder:text-emerald-500/50 focus:outline-hidden focus:border-emerald-400 font-sans disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-emerald-100 font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 active:scale-95"
              >
                {isSending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
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
 * Top Header Quick Button for Mạng Floo Drawer
 */
export function FlooHeaderTrigger({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Mở Mạng Floo HPVN (Chat In-App thời gian thực)"
      className={`hpvn-btn-floo px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer text-emerald-200 border border-emerald-500/80 hover:border-emerald-400 bg-emerald-950/90 hover:bg-emerald-900 transition-colors ${className}`}
    >
      <Flame size={14} className="text-emerald-400 animate-pulse shrink-0" />
      <span className="text-[11px] sm:text-xs tracking-wide">
        Mạng Floo <span className="hidden md:inline">(Chat)</span>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
    </button>
  );
}

/**
 * Floating Magic Handle Widget on bottom/right edge
 */
export function FlooFloatingTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        className="group px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-[#062419] hover:bg-[#0a3826] border-2 border-emerald-500/90 hover:border-emerald-400 text-emerald-200 font-serif font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
        title="Mở Mạng Floo HPVN (Chat In-App)"
      >
        <div className="relative flex items-center justify-center">
          <Flame size={17} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black tracking-wider uppercase text-emerald-300">
            Mạng Floo
          </span>
          <span className="text-[9px] font-mono text-emerald-400/80 hidden sm:inline">
            HPVN Chat In-App 💬
          </span>
        </div>
      </button>
    </div>
  );
}
