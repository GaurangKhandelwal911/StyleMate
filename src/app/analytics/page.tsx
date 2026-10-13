'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  Shirt,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  PieChart,
  Layers,
} from 'lucide-react';
import { WardrobeAnalytics } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<WardrobeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
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
          Wardrobe Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
          Wardrobe Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#686561] mt-1 max-w-xl">
          Actionable metrics on closet utilization, color frequencies, and most loved styles.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total items */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Items</span>
            <Shirt className="w-4 h-4 text-[#47583D]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#151413]">
            {loading ? '—' : analytics?.totalItems || 0}
          </span>
          <p className="text-[11px] text-[#78716C]">In your digital closet</p>
        </div>

        {/* Available Items */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
            <CheckCircle2 className="w-4 h-4 text-[#5A6E4F]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#2A3524]">
            {loading ? '—' : analytics?.availableCount || 0}
          </span>
          <p className="text-[11px] text-[#5A6E4F] font-medium">Ready for outfits</p>
        </div>

        {/* Unavailable Items */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Unavailable</span>
            <Clock className="w-4 h-4 text-[#C76A52]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#A9523C]">
            {loading ? '—' : analytics?.unavailableCount || 0}
          </span>
          <p className="text-[11px] text-[#A9523C] font-medium">Laundry, repair & storage</p>
        </div>

        {/* Worn Outfits Count */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Outfits Worn</span>
            <Sparkles className="w-4 h-4 text-[#C76A52]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#151413]">
            {loading ? '—' : analytics?.totalOutfitsWorn || 0}
          </span>
          <p className="text-[11px] text-[#78716C]">History logs recorded</p>
        </div>
      </div>

      {/* Category Breakdown & Color Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-4">
          <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#47583D]" />
            Category Distribution
          </h3>

          <div className="space-y-3 pt-1">
            {analytics?.categoryDistribution.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#151413]">{cat.category}</span>
                  <span className="text-[#78716C]">
                    {cat.count} items ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EAE4D7]">
                  <div
                    className="h-full rounded-full bg-[#47583D] transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Worn Colors & Styles */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-5">
          <div>
            <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413] mb-3">
              Top Wardrobe Colors
            </h3>
            <div className="flex flex-wrap gap-2">
              {analytics?.colorDistribution.map((col) => (
                <div
                  key={col.color}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] text-xs font-semibold flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{
                      backgroundColor:
                        col.color.toLowerCase() === 'white'
                          ? '#FFFFFF'
                          : col.color.toLowerCase() === 'black'
                          ? '#1C1917'
                          : col.color.toLowerCase() === 'blue'
                          ? '#2563EB'
                          : col.color.toLowerCase() === 'navy'
                          ? '#1E3A8A'
                          : col.color.toLowerCase() === 'beige'
                          ? '#D5C7B2'
                          : col.color.toLowerCase() === 'olive'
                          ? '#5A6E4F'
                          : col.color.toLowerCase() === 'grey'
                          ? '#6B7280'
                          : '#A89475',
                    }}
                  />
                  <span className="text-[#151413]">{col.color}</span>
                  <span className="text-[10px] text-[#8C8984]">({col.count})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EBE1]">
            <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413] mb-3">
              Favorite Style Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {analytics?.styleDistribution.map((st) => (
                <span
                  key={st.style}
                  className="px-3 py-1.5 rounded-xl bg-[#E7ECE3] text-[#2A3524] text-xs font-semibold"
                >
                  {st.style} ({st.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Most Frequently Worn Items */}
      {analytics && analytics.mostWornItems.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs space-y-4">
          <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#47583D]" />
            Most Frequently Worn Pieces
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
            {analytics.mostWornItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D7] text-center space-y-2"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#EAE4D7] mx-auto border border-black/5">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#8C8984]">
                      <Shirt className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#151413] truncate">{item.name}</p>
                  <span className="text-[11px] font-bold text-[#5A6E4F]">
                    {item.wearCount} times worn
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
