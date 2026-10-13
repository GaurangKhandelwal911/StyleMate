'use client';

import React from 'react';
import Image from 'next/image';
import { AlertCircle, Clock, CheckCircle2, ArrowRight, RefreshCw, Shirt } from 'lucide-react';
import { RecommendationDiagnostics, ClosetItemEntity } from '@/types';
import Link from 'next/link';

interface NoClothesDiagnosisProps {
  diagnostics: RecommendationDiagnostics;
  onMakeItemAvailable: (id: string) => Promise<void>;
  onResetPreferences: () => void;
}

export function NoClothesDiagnosis({
  diagnostics,
  onMakeItemAvailable,
  onResetPreferences,
}: NoClothesDiagnosisProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-8 max-w-2xl mx-auto shadow-subtle text-center space-y-6">
      <div className="w-14 h-14 rounded-full bg-[#FFF2EE] border border-[#F5D5C8] flex items-center justify-center mx-auto text-[#C76A52]">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#151413]">
          Incomplete Wardrobe Availability
        </h3>
        <p className="text-xs sm:text-sm text-[#686561] max-w-lg mx-auto leading-relaxed">
          {diagnostics.reasonIfEmpty ||
            "We couldn't create a complete outfit meeting this criteria from your currently available wardrobe."}
        </p>
      </div>

      {/* Helpful Unavailable items list */}
      {diagnostics.unavailableHelpfulItems && diagnostics.unavailableHelpfulItems.length > 0 && (
        <div className="text-left pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C76A52]" />
              Unavailable items that could help complete this look:
            </h4>
          </div>

          <div className="space-y-2.5">
            {diagnostics.unavailableHelpfulItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#F5E5D5] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#EAE4D7] shrink-0 border border-black/5">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#8C8984]">
                        <Shirt className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#151413] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#A9523C] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        Temporarily Unavailable {item.unavailableReason ? `(${item.unavailableReason})` : ''}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMakeItemAvailable(item.id)}
                  className="px-3 py-1.5 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Available</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested next steps */}
      <div className="pt-4 border-t border-[#F0EBE1] flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetPreferences}
          className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#151413] hover:bg-[#F3EFE6] transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try a Different Style</span>
        </button>

        <Link
          href="/closet?status=TEMPORARILY_UNAVAILABLE"
          className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
        >
          <span>Manage Availability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
