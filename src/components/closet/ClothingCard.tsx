'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Clock, MoreVertical, Sparkles } from 'lucide-react';
import { ClosetItemEntity } from '@/types';

interface ClothingCardProps {
  item: ClosetItemEntity;
  onSelect: (item: ClosetItemEntity) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleAvailability: (item: ClosetItemEntity, e: React.MouseEvent) => void;
}

export function ClothingCard({
  item,
  onSelect,
  onToggleFavorite,
  onToggleAvailability,
}: ClothingCardProps) {
  const isAvailable = item.status === 'AVAILABLE';

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative bg-[#FFFFFF] border border-[#EAE4D7] rounded-2xl overflow-hidden cursor-pointer card-hover-effect flex flex-col transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative w-full aspect-[4/5] bg-[#F7F4EE] overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              !isAvailable ? 'opacity-80 grayscale-[25%]' : ''
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#A89475]">
            <span className="text-3xl font-serif mb-1">{item.type.charAt(0)}</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8984]">
              {item.type}
            </span>
          </div>
        )}

        {/* Favorite heart button */}
        <button
          onClick={(e) => onToggleFavorite(item.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            item.isFavorite
              ? 'bg-[#FFFFFF]/90 text-[#C76A52]'
              : 'bg-[#FFFFFF]/75 text-[#8C8984] hover:text-[#C76A52] hover:bg-[#FFFFFF]'
          }`}
          aria-label="Toggle favorite"
        >
          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#C76A52]' : ''}`} />
        </button>

        {/* Availability Badge Overlay */}
        <div className="absolute bottom-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFFFF]/90 backdrop-blur-md text-[#2A3524] border border-[#D2DEC9] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A6E4F]" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF9F0]/95 backdrop-blur-md text-[#A9523C] border border-[#F5D5C8] shadow-xs">
              <Clock className="w-3 h-3 text-[#C76A52]" />
              <span>Unavailable</span>
              {item.unavailableReason && (
                <span className="text-[10px] font-normal opacity-90">({item.unavailableReason})</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Item info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1">
            <span className="font-medium tracking-wide uppercase text-[10px] text-[#8C8984]">
              {item.category} • {item.type}
            </span>
            {item.brand && (
              <span className="font-semibold text-[#5A6E4F] tracking-tight">{item.brand}</span>
            )}
          </div>
          <h3 className="font-semibold text-sm text-[#151413] tracking-tight group-hover:text-[#47583D] transition line-clamp-1">
            {item.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F3EFE6] flex items-center justify-between text-xs text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.color.toLowerCase() === 'white' ? '#FFFFFF' : item.color.toLowerCase() === 'black' ? '#1C1917' : item.color.toLowerCase() === 'blue' ? '#2563EB' : item.color.toLowerCase() === 'navy' ? '#1E3A8A' : item.color.toLowerCase() === 'beige' ? '#D5C7B2' : item.color.toLowerCase() === 'olive' ? '#5A6E4F' : item.color.toLowerCase() === 'grey' ? '#6B7280' : '#A89475' }} />
            <span>{item.color}</span>
          </div>

          <span className="text-[11px] text-[#8C8984]">
            {item.wearCount > 0 ? `Worn ${item.wearCount}×` : 'Unworn'}
          </span>
        </div>
      </div>
    </div>
  );
}
