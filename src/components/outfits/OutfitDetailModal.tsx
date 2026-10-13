'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Check,
  Bookmark,
  Calendar,
  Layers,
  SunMedium,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { ScoredOutfitResult } from '@/types';

interface OutfitDetailModalProps {
  outfit: ScoredOutfitResult | null;
  isOpen: boolean;
  onClose: () => void;
  onWearOutfit: (outfit: ScoredOutfitResult) => void;
  onSaveOutfit: (outfit: ScoredOutfitResult) => void;
  onScheduleDate?: (outfit: ScoredOutfitResult, date: string) => void;
}

export function OutfitDetailModal({
  outfit,
  isOpen,
  onClose,
  onWearOutfit,
  onSaveOutfit,
  onScheduleDate,
}: OutfitDetailModalProps) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!isOpen || !outfit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-3xl w-full shadow-modal overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 px-6 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E7ECE3] text-[#2A3524]">
              {outfit.style}
            </span>
            <span className="text-xs text-[#78716C]">• {outfit.occasion}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D2DEC9]">
              <Sparkles className="w-3.5 h-3.5 text-[#5A6E4F]" />
              <span className="text-xs font-bold text-[#151413]">
                {outfit.score}% Compatibility Score
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8C8984] hover:text-[#151413] rounded-full hover:bg-[#F3EFE6] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Items breakdown list */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#151413] mb-3">
              Ensemble Breakdown ({outfit.items.length} Pieces)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {outfit.items.map((oi) => {
                const item = oi.item;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D7] flex items-center gap-3"
                  >
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#EAE4D7] shrink-0 border border-black/5">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#8C8984]">
                          <Layers className="w-4 h-4 opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#5A6E4F] tracking-wide block">
                        {oi.role} • {item.category}
                      </span>
                      <p className="text-xs font-semibold text-[#151413] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#78716C]">
                        {item.color} • {item.material}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why This Works Section */}
          <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E5DECF] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#47583D]" />
              Why This Works
            </h4>
            <p className="text-xs sm:text-sm text-[#4A4845] leading-relaxed">
              {outfit.explanation}
            </p>
          </div>

          {/* Detailed Scores Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151413] mb-3">
              Styling Analytics & Compatibility Factors
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#78716C] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5A6E4F]" />
                  <span>Occasion Fit</span>
                </div>
                <span className="text-base font-bold text-[#151413]">
                  {outfit.occasionScore ?? 92}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#78716C] mb-1">
                  <Palette className="w-3.5 h-3.5 text-[#C76A52]" />
                  <span>Color Harmony</span>
                </div>
                <span className="text-base font-bold text-[#151413]">
                  {outfit.colorHarmonyScore ?? 94}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#78716C] mb-1">
                  <SunMedium className="w-3.5 h-3.5 text-[#D5C7B2]" />
                  <span>Weather Comfort</span>
                </div>
                <span className="text-base font-bold text-[#151413]">
                  {outfit.weatherScore ?? 90}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#78716C] mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#47583D]" />
                  <span>Style Harmony</span>
                </div>
                <span className="text-base font-bold text-[#151413]">
                  {outfit.styleScore ?? 95}%
                </span>
              </div>
            </div>
          </div>

          {/* Calendar scheduler input if toggled */}
          {showDatePicker && onScheduleDate && (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] space-y-2">
              <label className="block text-xs font-semibold text-[#151413]">
                Schedule this outfit on Calendar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="text-xs px-3 py-2 border border-[#DDD5C7] rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (scheduleDate) {
                      onScheduleDate(outfit, scheduleDate);
                      setShowDatePicker(false);
                    }
                  }}
                  className="text-xs font-semibold px-3 py-2 bg-[#47583D] text-white rounded-xl"
                >
                  Save to Date
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#F0EBE1] bg-[#FDFCF9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-3 py-2 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#686561] hover:bg-[#F3EFE6] transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSaveOutfit(outfit)}
              className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#151413] hover:bg-[#F3EFE6] transition flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Outfit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onWearOutfit(outfit);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Wear This Outfit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
