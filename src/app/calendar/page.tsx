'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shirt,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface CalendarOutfit {
  id: string;
  title: string;
  occasion: string;
  style: string;
  plannedDate?: string | null;
  items: {
    role: string;
    item: {
      name: string;
      imageUrl?: string | null;
    };
  }[];
}

export default function CalendarPage() {
  const [outfits, setOutfits] = useState<CalendarOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const res = await fetch('/api/outfits');
      const data = await res.json();
      if (data.success) {
        setOutfits(data.outfits || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate 7 upcoming days
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    };
  });

  const plannedForSelected = outfits.filter(
    (o) => o.plannedDate && o.plannedDate.startsWith(selectedDate)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
            Wardrobe Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
            Outfit Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#686561] mt-1">
            Plan your looks in advance for upcoming meetings, trips, or presentations.
          </p>
        </div>

        <Link
          href="/generate"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate for Event</span>
        </Link>
      </div>

      {/* Week Selector Ribbon */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {next7Days.map((d) => {
          const isSelected = selectedDate === d.dateStr;
          const hasPlan = outfits.some(
            (o) => o.plannedDate && o.plannedDate.startsWith(d.dateStr)
          );

          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'bg-[#151413] border-[#151413] text-white shadow-xs'
                  : 'bg-[#FFFFFF] border-[#EAE4D7] text-[#686561] hover:bg-[#FAF8F5]'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase ${isSelected ? 'text-white/80' : 'text-[#8C8984]'}`}>
                {d.dayName}
              </span>
              <span className="text-base sm:text-lg font-bold mt-0.5">{d.dayNumber}</span>
              <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#8C8984]'}`}>
                {d.monthName}
              </span>

              {hasPlan && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                    isSelected ? 'bg-white' : 'bg-[#47583D]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Scheduled Outfits for selected date */}
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#47583D]" />
            <h2 className="text-base sm:text-lg font-bold text-[#151413]">
              Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E7ECE3] text-[#2A3524]">
            {plannedForSelected.length} {plannedForSelected.length === 1 ? 'Outfit Planned' : 'Outfits Planned'}
          </span>
        </div>

        {plannedForSelected.length > 0 ? (
          <div className="space-y-4">
            {plannedForSelected.map((outfit) => (
              <div
                key={outfit.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D7] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#E7ECE3] text-[#2A3524] text-xs font-bold">
                      {outfit.occasion}
                    </span>
                    <span className="text-xs text-[#78716C]">• {outfit.style}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#151413]">{outfit.title}</h3>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {outfit.items.map((oi, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#DDD5C7] text-[#151413] font-medium"
                      >
                        {oi.item.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/generate`}
                    className="px-4 py-2 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition shadow-xs"
                  >
                    Adjust Look
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <Clock className="w-10 h-10 text-[#8C8984] opacity-50 mx-auto" />
            <div>
              <p className="text-sm font-bold text-[#151413]">No outfit scheduled for this date.</p>
              <p className="text-xs text-[#78716C] mt-0.5">
                Generate an outfit and click "Add to Calendar" to schedule what to wear.
              </p>
            </div>
            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#47583D] text-white text-xs font-semibold hover:bg-[#384630] transition mt-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate for this Date</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
