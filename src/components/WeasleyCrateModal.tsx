"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Sparkles, Cookie, Eye, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { WeasleyItem, WeasleyItemId, Player, GamePhase } from '@/lib/types';

interface WeasleyCrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WeasleyItem[];
  players: Player[];
  currentPlayerId: string | null;
  currentPhase: GamePhase;
  onUseItem: (itemId: WeasleyItemId, targetId?: string) => string | void;
}

export function WeasleyCrateModal({
  isOpen,
  onClose,
  items = [],
  players = [],
  currentPlayerId,
  currentPhase,
  onUseItem,
}: WeasleyCrateModalProps) {
  const [selectedItem, setSelectedItem] = useState<WeasleyItem | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const validTargets = players.filter(
    (p) => p.id !== currentPlayerId && p.status !== 'DEAD' && !p.isGM
  );

  const getItemIcon = (id: WeasleyItemId) => {
    switch (id) {
      case 'DARKNESS_POWDER':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'FAINTING_FANCIES':
        return <Cookie className="w-5 h-5 text-amber-400" />;
      default:
        return <Package className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleActivate = () => {
    if (!selectedItem) return;

    if (selectedItem.id === 'FAINTING_FANCIES' && !selectedTargetId) {
      setActionFeedback('⚠️ Vui lòng chọn 1 người chơi để áp dụng bảo bối!');
      return;
    }

    const res = onUseItem(selectedItem.id, selectedTargetId || undefined);
    if (
      typeof res === 'string' &&
      (res.startsWith('⚠️') ||
        res.startsWith('Không') ||
        res.startsWith('Vui lòng') ||
        res.startsWith('Chỉ') ||
        res.includes('kẹt') ||
        res.includes('hết'))
    ) {
      setActionFeedback(res);
      return;
    }

    setActionFeedback(`Đã kích hoạt thành công: ${selectedItem.name}!`);
    setTimeout(() => {
      setActionFeedback(null);
      setSelectedItem(null);
      setSelectedTargetId('');
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#0f172a] via-[#090e1b] to-[#050811] border border-amber-400/40 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 z-10 max-h-[90vh] flex flex-col backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-cinzel font-black text-amber-300 flex items-center gap-1.5">
                  Bảo Bối Tiệm Phù Thủy Weasley
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Weasleys&apos; Wizard Wheezes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Feedback banner */}
          {actionFeedback && (
            <div
              className={`mb-3 p-2.5 rounded-lg border text-xs font-sans flex items-center gap-2 ${
                actionFeedback.startsWith('⚠️') ||
                actionFeedback.startsWith('Không') ||
                actionFeedback.startsWith('Vui lòng') ||
                actionFeedback.startsWith('Chỉ')
                  ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
                  : 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 animate-pulse'
              }`}
            >
              {actionFeedback.startsWith('⚠️') ||
              actionFeedback.startsWith('Không') ||
              actionFeedback.startsWith('Vui lòng') ||
              actionFeedback.startsWith('Chỉ') ? (
                <AlertCircle size={16} className="shrink-0 text-amber-400" />
              ) : (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              )}
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isAvailable = item.count > 0;
              const isPhaseAllowed =
                item.phaseAllowed === 'ANY' || item.phaseAllowed === currentPhase;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isAvailable && isPhaseAllowed) {
                      setSelectedItem(item);
                      setActionFeedback(null);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    !isAvailable
                      ? 'bg-slate-950/40 border-slate-900 opacity-40 cursor-not-allowed'
                      : !isPhaseAllowed
                      ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-amber-400/40 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getItemIcon(item.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-cinzel font-bold text-sm text-amber-300">
                            {item.name}
                          </h4>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isAvailable
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : 'bg-red-950 text-red-400 border border-red-800/50'
                            }`}
                          >
                            {isAvailable ? `Còn ${item.count} lần` : 'Đã dùng'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Phase Badge */}
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                      {item.phaseAllowed === 'ANY'
                        ? 'Mọi pha'
                        : item.phaseAllowed === 'DAY'
                        ? 'Ban Ngày'
                        : 'Ban Đêm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Target selection if required */}
          {selectedItem &&
            selectedItem.count > 0 &&
            selectedItem.id === 'FAINTING_FANCIES' && (
              <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <label className="block text-xs font-cinzel font-bold text-amber-300 mb-1.5">
                  🎯 Chọn mục tiêu chuốc Kẹo Ngất Xỉu:
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-slate-900 text-amber-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="">-- Chọn 1 người chơi trong đoàn bay --</option>
                  {validTargets.map((p) => (
                    <option key={`target-${p.id}`} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              Bảo bối độc quyền tiệm Weasley
            </span>

            <button
              disabled={!selectedItem || selectedItem.count <= 0}
              onClick={handleActivate}
              className={`px-4 py-2 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedItem && selectedItem.count > 0
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <span>Kích Hoạt</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
