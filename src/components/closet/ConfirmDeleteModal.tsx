'use client';

import React from 'react';
import { AlertTriangle, X, Clock, Trash2 } from 'lucide-react';
import { ClosetItemEntity } from '@/types';

interface ConfirmDeleteModalProps {
  item: ClosetItemEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
  onSwitchToUnavailable: (item: ClosetItemEntity) => void;
}

export function ConfirmDeleteModal({
  item,
  isOpen,
  onClose,
  onConfirmDelete,
  onSwitchToUnavailable,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-md w-full shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FFF6F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#151413]">Permanently Remove Item?</h3>
              <p className="text-xs text-[#78716C]">Irreversible action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8984] hover:text-[#151413] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#686561] leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-[#151413]">{item.name}</strong> from your closet?
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#EAE4D7] text-xs text-[#78716C] space-y-2">
            <p className="font-semibold text-[#151413] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5A6E4F]" />
              Did you mean Temporarily Unavailable?
            </p>
            <p className="leading-relaxed">
              If this item is just in the laundry, at the tailor, or packed for travel, mark it as{' '}
              <strong className="text-[#47583D]">Temporarily Unavailable</strong> instead. It will stay in your digital wardrobe but be excluded from recommendations.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToUnavailable(item);
              }}
              className="text-xs font-semibold text-[#47583D] underline hover:text-[#2A3524]"
            >
              Set as Temporarily Unavailable instead →
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#686561] hover:bg-[#F7F4EE] transition"
            >
              Cancel & Keep
            </button>
            <button
              type="button"
              onClick={async () => {
                await onConfirmDelete(item.id);
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
