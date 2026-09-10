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
      case 'TWO_WAY_MIRROR':
        return <Eye className="w-5 h-5 text-cyan-400" />;
      default:
        return <Package className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleActivate = () => {
    if (!selectedItem) return;

    if (
      (selectedItem.id === 'FAINTING_FANCIES' || selectedItem.id === 'TWO_WAY_MIRROR') &&
      !selectedTargetId
    ) {
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

    if (typeof res === 'string' && selectedItem.id === 'TWO_WAY_MIRROR') {
      setActionFeedback(res);
      setTimeout(() => {
        setActionFeedback(null);
        setSelectedItem(null);
        setSelectedTargetId('');
        onClose();
      }, 3500);
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
          className="relative w-full max-w-xl bg-gradient-to-b from-[#211107] via-[#1a0c05] to-[#120703] border-2 border-[#a4713c] rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 text-[#ebdcb0] z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#7a5229]/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-950/50">
                <Package className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#ffd88f] flex items-center gap-1.5">
                  Hòm Tiếp Tế Tiệm Phù Thủy Weasley
                </h3>
                <p className="text-[11px] text-[#ebdcb0]/65 font-mono">
                  Weasleys' Wizard Wheezes · Bảo Bối Tẩu Thoát Ma Thuật
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#ebdcb0]/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Feedback banner */}
          {actionFeedback && (
            <div
              className={`mb-3 p-2.5 rounded-lg border text-xs font-serif flex items-center gap-2 ${
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
                      ? 'bg-black/30 border-red-950/40 opacity-50 cursor-not-allowed'
                      : !isPhaseAllowed
                      ? 'bg-black/40 border-amber-950/40 opacity-70 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#3d1f0d] border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-[#180d07] border-[#6b4522]/60 hover:border-amber-500/50 hover:bg-[#25140b]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-[#7a5229]/50 flex items-center justify-center shrink-0 mt-0.5">
                        {getItemIcon(item.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-[#ffd88f]">
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
                        <p className="text-xs text-[#ebdcb0]/85 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-[#ebdcb0]/50 italic mt-0.5 font-serif">
                          "{item.flavor}"
                        </p>
                      </div>
                    </div>

                    {/* Phase Badge */}
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-black/50 border border-[#7a5229]/40 text-amber-300/80 font-mono">
                      {item.phaseAllowed === 'ANY'
                        ? 'Mọi pha'
                        : item.phaseAllowed === 'DAY'
                        ? 'Chỉ Ban Ngày'
                        : 'Chỉ Ban Đêm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Target selection if required */}
          {selectedItem &&
            selectedItem.count > 0 &&
            (selectedItem.id === 'FAINTING_FANCIES' || selectedItem.id === 'TWO_WAY_MIRROR') && (
              <div className="mt-3 pt-3 border-t border-[#7a5229]/50 bg-[#170a04] p-3 rounded-xl border border-[#7a5229]/40">
                <label className="block text-xs font-serif font-bold text-amber-300 mb-1.5">
                  {selectedItem.id === 'FAINTING_FANCIES'
                    ? '🎯 Chọn mục tiêu chuốc Kẹo Ngất Xỉu (Mất quyền vote đêm nay):'
                    : '🪞 Chọn đồng đội để soi Gương Hai Chiều:'}
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-[#241208] text-amber-200 border border-[#8a5b2d] rounded-lg px-3 py-1.5 text-xs font-serif focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
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
          <div className="mt-4 pt-3 border-t border-[#7a5229]/60 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#ebdcb0]/65 font-serif italic">
              * Bảo bối Hội Phượng Hoàng · Bùa chống trộm độc quyền từ tiệm Fred & George Weasley.
            </span>

            <button
              disabled={!selectedItem || selectedItem.count <= 0}
              onClick={handleActivate}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedItem && selectedItem.count > 0
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-600/30'
                  : 'bg-[#2a170b] text-[#ebdcb0]/40 border border-[#4a2b15] cursor-not-allowed'
              }`}
            >
              <span>Kích Hoạt Bảo Bối</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
