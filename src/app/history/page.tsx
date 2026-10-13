'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  History,
  Calendar,
  Sparkles,
  Shirt,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface OutfitHistoryItem {
  id: string;
  wornAt: string;
  notes?: string | null;
  outfit: {
    id: string;
    title: string;
    occasion: string;
    style: string;
    weather: string;
    score: number;
    explanation: string;
    items: {
      role: string;
      item: {
        id: string;
        name: string;
        category: string;
        color: string;
        material: string;
        imageUrl?: string | null;
      };
    }[];
  };
}

export default function OutfitHistoryPage() {
  const [history, setHistory] = useState<OutfitHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/outfits/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
          Style Log & Timeline
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
          Outfit History
        </h1>
        <p className="text-xs sm:text-sm text-[#686561] mt-1 max-w-xl">
          Track what you wore and when. StyleMate uses this history to avoid repeating recent combinations and keep your daily rotation fresh.
        </p>
      </div>

      {/* Wear diversity insight banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#E7ECE3] border border-[#D2DEC9] flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-[#47583D] shrink-0 mt-0.5" />
        <div className="text-xs text-[#2A3524] space-y-1">
          <p className="font-bold text-sm">Adaptive Diversity Engine Active</p>
          <p className="leading-relaxed">
            When you mark an outfit as worn, the recommendation algorithm automatically dampens the recurrence score of those exact pieces for the subsequent 4 days, preventing repetitive looks.
          </p>
        </div>
      </div>

      {/* History timeline list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-[#F0EBE1] animate-pulse border border-[#EAE4D7]"
            />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((record) => {
            const dateObj = new Date(record.wornAt);
            const dateStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={record.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover-effect"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] border border-[#EAE4D7] text-[#151413]">
                      <Calendar className="w-3.5 h-3.5 text-[#5A6E4F]" />
                      {dateStr}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7ECE3] text-[#2A3524]">
                      {record.outfit.occasion}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#EAE4D7] text-[#686561]">
                      {record.outfit.style}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#151413]">
                      {record.outfit.title}
                    </h3>
                    {record.notes && (
                      <p className="text-xs text-[#78716C] mt-0.5 italic">
                        "{record.notes}"
                      </p>
                    )}
                  </div>

                  {/* Outfit pieces preview */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {record.outfit.items.map((oi, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]"
                      >
                        <div className="relative w-8 h-9 rounded-lg overflow-hidden bg-[#EAE4D7] shrink-0 border border-black/5">
                          {oi.item.imageUrl ? (
                            <Image
                              src={oi.item.imageUrl}
                              alt={oi.item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[#8C8984]">
                              <Shirt className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-[11px] font-semibold text-[#151413] block line-clamp-1">
                            {oi.item.name}
                          </span>
                          <span className="text-[9px] text-[#78716C] uppercase font-bold">
                            {oi.item.color} • {oi.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-[#F0EBE1] shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8C8984] block">
                      Style Match
                    </span>
                    <span className="text-xl font-bold text-[#151413]">
                      {record.outfit.score}%
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#47583D] mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Worn
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center mx-auto text-[#8C8984]">
            <History className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#151413]">No outfits recorded as worn yet.</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              When you generate an outfit and click "Wear This Outfit", it will appear here in your style history.
            </p>
          </div>
          <Link
            href="/generate"
            className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate an Outfit</span>
          </Link>
        </div>
      )}
    </div>
  );
}
