'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Heart,
  Clock,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Edit2,
  Tag,
} from 'lucide-react';
import { ClosetItemEntity } from '@/types';

interface ItemDetailModalProps {
  item: ClosetItemEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAvailabilityManager: (item: ClosetItemEntity) => void;
  onOpenDeleteConfirm: (item: ClosetItemEntity) => void;
  onOpenEdit: (item: ClosetItemEntity) => void;
  onQuickMakeAvailable: (id: string) => Promise<void>;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onToggleFavorite,
  onOpenAvailabilityManager,
  onOpenDeleteConfirm,
  onOpenEdit,
  onQuickMakeAvailable,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const isAvailable = item.status === 'AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-2xl w-full shadow-modal overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="p-4 px-6 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8984]">
              {item.category} • {item.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(item.id, e)}
              className={`p-2 rounded-full border transition ${
                item.isFavorite
                  ? 'border-[#F5D5C8] bg-[#FFF2EE] text-[#C76A52]'
                  : 'border-[#EAE4D7] text-[#8C8984] hover:text-[#C76A52] hover:bg-[#FAF8F5]'
              }`}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#C76A52]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8C8984] hover:text-[#151413] rounded-full hover:bg-[#F3EFE6] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual & Key Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image container */}
            <div className="relative aspect-[4/5] rounded-2xl bg-[#F7F4EE] overflow-hidden border border-[#EAE4D7] flex items-center justify-center">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className={`object-cover ${!isAvailable ? 'opacity-85 grayscale-[20%]' : ''}`}
                />
              ) : (
                <div className="text-center p-6 text-[#A89475]">
                  <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs uppercase tracking-wider font-semibold">No Image Provided</p>
                </div>
              )}

              {/* Status pill on image */}
              <div className="absolute bottom-3 left-3">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFFFF]/95 backdrop-blur-md text-[#2A3524] border border-[#D2DEC9] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#5A6E4F]" />
                    Available in Closet
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF9F0]/95 backdrop-blur-md text-[#A9523C] border border-[#F5D5C8] shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#C76A52]" />
                    Temporarily Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Main Info */}
            <div className="space-y-4">
              <div>
                {item.brand && (
                  <span className="text-xs font-bold text-[#5A6E4F] tracking-wide uppercase">
                    {item.brand}
                  </span>
                )}
                <h2 className="text-xl font-bold tracking-tight text-[#151413] mt-0.5">
                  {item.name}
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  Added on {new Date(item.createdAt).toLocaleDateString()} • Worn {item.wearCount} times
                </p>
              </div>

              {/* Availability Notice Banner */}
              {!isAvailable && (
                <div className="p-3.5 rounded-2xl bg-[#FFF7F2] border border-[#FADCD1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A9523C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C76A52]" />
                      Temporarily Unavailable
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuickMakeAvailable(item.id)}
                      className="text-xs font-semibold px-2.5 py-1 bg-[#47583D] text-white rounded-lg hover:bg-[#384630] transition shadow-xs"
                    >
                      Make Available
                    </button>
                  </div>
                  <p className="text-xs text-[#686561]">
                    Reason: <strong className="text-[#151413]">{item.unavailableReason || 'Not specified'}</strong>
                    {item.unavailableUntil && (
                      <> • Expected back: {new Date(item.unavailableUntil).toLocaleDateString()}</>
                    )}
                  </p>
                  <p className="text-[11px] text-[#8C8984]">
                    Excluded from outfit recommendations while unavailable.
                  </p>
                </div>
              )}

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Color</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.color}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Pattern</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.pattern}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Material</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.material}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Fit</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.fit}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Style</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.style}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                  <span className="block text-[10px] uppercase font-semibold text-[#8C8984]">Type</span>
                  <span className="text-xs font-semibold text-[#151413]">{item.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Occasions & Seasons tags */}
          <div className="space-y-3 pt-2 border-t border-[#F0EBE1]">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
                Suitable Occasions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(item.occasions || []).map((occ) => (
                  <span
                    key={occ}
                    className="px-2.5 py-1 rounded-lg bg-[#E7ECE3] text-[#2A3524] text-xs font-medium"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
                Seasons
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(item.seasons || []).map((sea) => (
                  <span
                    key={sea}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DDD5C7] text-[#686561] text-xs font-medium"
                  >
                    {sea}
                  </span>
                ))}
              </div>
            </div>

            {item.notes && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1">
                  Personal Notes
                </span>
                <p className="text-xs text-[#686561] bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE4D7] leading-relaxed">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 px-6 border-t border-[#F0EBE1] bg-[#FDFCF9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDeleteConfirm(item)}
              className="px-3 py-2 rounded-xl border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Closet</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEdit(item)}
              className="px-3.5 py-2 rounded-xl border border-[#DDD5C7] text-[#686561] hover:bg-[#F3EFE6] text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {isAvailable ? (
              <button
                type="button"
                onClick={() => onOpenAvailabilityManager(item)}
                className="px-4 py-2 rounded-xl bg-[#FFF2EE] border border-[#F5D5C8] text-[#A9523C] hover:bg-[#FCE3DA] text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#C76A52]" />
                <span>Mark Temporarily Unavailable</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onQuickMakeAvailable(item.id)}
                className="px-4 py-2 rounded-xl bg-[#47583D] text-white hover:bg-[#384630] text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Available Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
