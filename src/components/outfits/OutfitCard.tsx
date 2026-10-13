'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Check, Bookmark, Calendar, ArrowRight, Layers } from 'lucide-react';
import { ScoredOutfitResult, RecommendedOutfitItem } from '@/types';

interface OutfitCardProps {
  outfit: ScoredOutfitResult;
  index: number;
  onViewDetails: (outfit: ScoredOutfitResult) => void;
  onWearOutfit: (outfit: ScoredOutfitResult) => void;
  onSaveOutfit: (outfit: ScoredOutfitResult) => void;
  isSaved?: boolean;
}

export function OutfitCard({
  outfit,
  index,
  onViewDetails,
  onWearOutfit,
  onSaveOutfit,
  isSaved = false,
}: OutfitCardProps) {
  const topItem = outfit.items.find((i) => i.role === 'TOP')?.item;
  const bottomItem = outfit.items.find((i) => i.role === 'BOTTOM')?.item;
  const shoeItem = outfit.items.find((i) => i.role === 'FOOTWEAR')?.item;
  const outerItem = outfit.items.find((i) => i.role === 'OUTERWEAR')?.item;
  const accessoryItem = outfit.items.find((i) => i.role === 'ACCESSORY')?.item;

  return (
    <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl overflow-hidden card-hover-effect flex flex-col justify-between shadow-xs transition-all duration-300">
      <div>
        {/* Header Ribbon */}
        <div className="p-4 px-6 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#8C8984]">
              OUTFIT #{index + 1}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E7ECE3] text-[#2A3524]">
              {outfit.style}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D2DEC9] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5A6E4F]" />
            <span className="text-xs font-bold text-[#151413]">
              {outfit.score}% Match
            </span>
          </div>
        </div>

        {/* Visual composition grid */}
        <div className="p-5 pb-3">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Top piece */}
            <div className="relative aspect-[3/4] rounded-2xl bg-[#F7F4EE] overflow-hidden border border-[#EAE4D7] flex flex-col justify-end p-2 group">
              {topItem?.imageUrl ? (
                <Image
                  src={topItem.imageUrl}
                  alt={topItem.name}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8C8984]">
                  <Layers className="w-6 h-6 opacity-40" />
                </div>
              )}
              <div className="relative z-10 bg-[#FFFFFF]/90 backdrop-blur-xs p-1.5 rounded-lg border border-white/50">
                <p className="text-[10px] font-bold text-[#151413] truncate">{topItem?.name}</p>
                <p className="text-[9px] text-[#78716C] uppercase font-semibold">Top</p>
              </div>
            </div>

            {/* Bottom piece */}
            <div className="relative aspect-[3/4] rounded-2xl bg-[#F7F4EE] overflow-hidden border border-[#EAE4D7] flex flex-col justify-end p-2 group">
              {bottomItem?.imageUrl ? (
                <Image
                  src={bottomItem.imageUrl}
                  alt={bottomItem.name}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8C8984]">
                  <Layers className="w-6 h-6 opacity-40" />
                </div>
              )}
              <div className="relative z-10 bg-[#FFFFFF]/90 backdrop-blur-xs p-1.5 rounded-lg border border-white/50">
                <p className="text-[10px] font-bold text-[#151413] truncate">{bottomItem?.name}</p>
                <p className="text-[9px] text-[#78716C] uppercase font-semibold">Bottom</p>
              </div>
            </div>

            {/* Footwear piece */}
            <div className="relative aspect-[3/4] rounded-2xl bg-[#F7F4EE] overflow-hidden border border-[#EAE4D7] flex flex-col justify-end p-2 group">
              {shoeItem?.imageUrl ? (
                <Image
                  src={shoeItem.imageUrl}
                  alt={shoeItem.name}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8C8984]">
                  <Layers className="w-6 h-6 opacity-40" />
                </div>
              )}
              <div className="relative z-10 bg-[#FFFFFF]/90 backdrop-blur-xs p-1.5 rounded-lg border border-white/50">
                <p className="text-[10px] font-bold text-[#151413] truncate">{shoeItem?.name}</p>
                <p className="text-[9px] text-[#78716C] uppercase font-semibold">Shoes</p>
              </div>
            </div>
          </div>

          {/* Optional Layer / Accessory pill */}
          {(outerItem || accessoryItem) && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {outerItem && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE4D7] text-[#686561]">
                  Layer: {outerItem.name}
                </span>
              )}
              {accessoryItem && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE4D7] text-[#686561]">
                  Accent: {accessoryItem.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Why this works section */}
        <div className="px-5 py-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#151413] mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#47583D]" />
            Why This Works
          </h4>
          <p className="text-xs text-[#686561] leading-relaxed bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE4D7]">
            {outfit.explanation}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 px-5 border-t border-[#F0EBE1] bg-[#FDFCF9] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(outfit)}
          className="text-xs font-semibold text-[#151413] hover:text-[#47583D] flex items-center gap-1 transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSaveOutfit(outfit)}
            className={`p-2 rounded-xl border text-xs font-semibold transition ${
              isSaved
                ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                : 'border-[#DDD5C7] text-[#686561] hover:bg-[#F3EFE6]'
            }`}
            title="Save Outfit"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#2A3524]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onWearOutfit(outfit)}
            className="px-3.5 py-1.5 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Wear This</span>
          </button>
        </div>
      </div>
    </div>
  );
}
