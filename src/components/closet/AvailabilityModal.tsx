'use client';

import React, { useState } from 'react';
import { X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ClosetItemEntity, AvailabilityReason } from '@/types';

interface AvailabilityModalProps {
  item: ClosetItemEntity;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAvailability: (params: {
    status: 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE';
    reason?: string;
    untilDate?: string;
  }) => Promise<void>;
}

const REASONS: AvailabilityReason[] = [
  'Laundry',
  'Repair',
  'Being worn',
  'Packed',
  'Loaned',
  'Seasonal Storage',
  'Other',
];

export function AvailabilityModal({
  item,
  isOpen,
  onClose,
  onUpdateAvailability,
}: AvailabilityModalProps) {
  const [selectedReason, setSelectedReason] = useState<AvailabilityReason>(
    (item.unavailableReason as AvailabilityReason) || 'Laundry'
  );
  const [customReason, setCustomReason] = useState('');
  const [returnDate, setReturnDate] = useState(
    item.unavailableUntil ? new Date(item.unavailableUntil).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isCurrentlyUnavailable = item.status === 'TEMPORARILY_UNAVAILABLE';

  const handleSubmit = async (targetStatus: 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE') => {
    setLoading(true);
    try {
      await onUpdateAvailability({
        status: targetStatus,
        reason: targetStatus === 'TEMPORARILY_UNAVAILABLE' ? (selectedReason === 'Other' && customReason ? customReason : selectedReason) : undefined,
        untilDate: targetStatus === 'TEMPORARILY_UNAVAILABLE' && returnDate ? returnDate : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-md w-full shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#F0EBE1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isCurrentlyUnavailable ? 'bg-[#E7ECE3] text-[#47583D]' : 'bg-[#FFF2EE] text-[#C76A52]'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#151413]">Manage Availability</h3>
              <p className="text-xs text-[#78716C]">{item.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8984] hover:text-[#151413] rounded-lg hover:bg-[#F7F4EE] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {isCurrentlyUnavailable ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#F5E5D5] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#C76A52] shrink-0 mt-0.5" />
                <div className="text-xs text-[#686561] space-y-1">
                  <p className="font-semibold text-[#151413]">Currently Marked as Temporarily Unavailable</p>
                  <p>
                    Reason:{' '}
                    <span className="font-medium text-[#151413]">{item.unavailableReason || 'None'}</span>
                  </p>
                  {item.unavailableUntil && (
                    <p>
                      Expected Back:{' '}
                      <span className="font-medium text-[#151413]">
                        {new Date(item.unavailableUntil).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                  <p className="pt-1 text-[#8C8984]">
                    This item is kept in your closet, but excluded from outfit recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('AVAILABLE')}
                className="w-full py-3 px-4 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Available Again</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#78716C] leading-relaxed">
                Temporarily excluding an item retains it in your wardrobe while ensuring outfit recommendations
                won’t pick it until it’s ready.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#151413] mb-2 uppercase tracking-wider">
                  Reason for Unavailability
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedReason(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition ${
                        selectedReason === r
                          ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-semibold'
                          : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReason === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-[#151413] mb-1">Custom Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g. Lent to Alex"
                    className="w-full text-xs px-3 py-2 border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#47583D] bg-[#FAF8F5]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#151413] mb-1 uppercase tracking-wider">
                  Expected Available Date (Optional)
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#47583D] bg-[#FAF8F5]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#DDD5C7] text-xs font-medium text-[#686561] hover:bg-[#F7F4EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit('TEMPORARILY_UNAVAILABLE')}
                  className="flex-1 py-2.5 px-4 bg-[#C76A52] hover:bg-[#A9523C] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-xs"
                >
                  Set Unavailable
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
