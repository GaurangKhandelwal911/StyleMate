'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  PlusCircle,
  Clock,
  Download,
  ArrowRight,
  Shirt,
  Footprints,
  Layers,
  Watch,
  CheckCircle2,
  Bookmark,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { WardrobeAnalytics } from '@/types';
import { AddItemModal } from '@/components/closet/AddItemModal';
import { useToast } from '@/components/ui/Toast';

import { useAuth } from '@/components/auth/AuthContext';

export default function DashboardPage() {
  const { success } = useToast();
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const [greeting, setGreeting] = useState('Good Afternoon');
  const [analytics, setAnalytics] = useState<WardrobeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

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

  // Helper stats
  const topsCount = analytics?.categoryDistribution.find((c) => c.category === 'Tops')?.count || 0;
  const bottomsCount = analytics?.categoryDistribution.find((c) => c.category === 'Bottoms')?.count || 0;
  const clothingCount = topsCount + bottomsCount;
  const shoesCount = analytics?.categoryDistribution.find((c) => c.category === 'Shoes')?.count || 0;
  const jacketsCount = analytics?.categoryDistribution.find((c) => c.category === 'Outerwear')?.count || 0;
  const accessoriesCount = analytics?.categoryDistribution.find((c) => c.category === 'Accessories')?.count || 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Greeting & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
              Digital Wardrobe Overview
            </span>
            <button
              type="button"
              onClick={() => openLoginModal('onboarding')}
              className="text-[10px] font-semibold text-[#47583D] hover:underline"
            >
              (Edit Styling Questionnaire)
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5 flex items-center gap-2">
            <span>{greeting},</span>
            {authLoading && !user ? (
              <span className="inline-block w-36 h-7 bg-[#EAE4D7] animate-pulse rounded-lg align-middle" />
            ) : (
              <span>{user?.name || 'Friend'}</span>
            )}
            <span>👋</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#DDD5C7] text-[#151413] rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#47583D]" />
            <span>Add Item</span>
          </button>
          <Link
            href="/generate"
            className="flex items-center gap-2 px-4 py-2 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Outfit</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl bg-[#F3EFE6] border border-[#E5DECF] p-6 sm:p-8 md:p-10 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/80 backdrop-blur-xs text-[#2A3524] text-xs font-semibold border border-[#D2DEC9]">
            <Sparkles className="w-3.5 h-3.5 text-[#5A6E4F]" />
            <span>Smart Outfit Generation Engine Active</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#151413] leading-tight">
            Your Personal <br />
            <span className="italic font-normal">Virtual Closet</span>
          </h2>

          <p className="text-sm sm:text-base text-[#686561] leading-relaxed">
            Organize your wardrobe, get smart outfit recommendations tailored to weather and events, and never run out of style.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#151413] hover:bg-[#2E2D2B] text-white text-sm font-semibold transition shadow-sm"
            >
              <span>Generate Outfit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/closet"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151413] border border-[#DDD5C7] text-sm font-semibold transition shadow-xs"
            >
              <span>Browse Closet</span>
            </Link>
          </div>
        </div>

        {/* Decorative background flair */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block bg-gradient-to-l from-[#CDBFA9] to-transparent" />
      </div>

      {/* Availability Status Alert (Highlights Section 1 & 9!) */}
      {analytics && analytics.unavailableCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F2] border border-[#FADCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FFF0E8] text-[#C76A52] shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#151413]">
                {analytics.unavailableCount} items are Temporarily Unavailable
              </p>
              <p className="text-xs text-[#686561] mt-0.5">
                These items remain safely in your closet but are automatically excluded from outfit recommendations until available.
              </p>
            </div>
          </div>

          <Link
            href="/closet?status=TEMPORARILY_UNAVAILABLE"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#F5D5C8] text-[#A9523C] hover:bg-[#FFF2EE] text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
          >
            <span>Manage Availability</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Closet Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413]">
            Wardrobe Statistics
          </h3>
          <span className="text-xs text-[#78716C]">
            {analytics?.availableCount || 0} Available • {analytics?.unavailableCount || 0} Inactive
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Clothing Items */}
          <Link
            href="/closet"
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] card-hover-effect space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#47583D]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413]">
                {loading ? '—' : clothingCount}
              </span>
              <p className="text-xs font-semibold text-[#78716C] mt-0.5">Clothing Items</p>
            </div>
          </Link>

          {/* Shoes */}
          <Link
            href="/closet?category=Shoes"
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] card-hover-effect space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#5A6E4F]">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413]">
                {loading ? '—' : shoesCount}
              </span>
              <p className="text-xs font-semibold text-[#78716C] mt-0.5">Shoes</p>
            </div>
          </Link>

          {/* Jackets */}
          <Link
            href="/closet?category=Outerwear"
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] card-hover-effect space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#C76A52]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413]">
                {loading ? '—' : jacketsCount}
              </span>
              <p className="text-xs font-semibold text-[#78716C] mt-0.5">Jackets & Coats</p>
            </div>
          </Link>

          {/* Accessories */}
          <Link
            href="/closet?category=Accessories"
            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] card-hover-effect space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#8C8984]">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413]">
                {loading ? '—' : accessoriesCount}
              </span>
              <p className="text-xs font-semibold text-[#78716C] mt-0.5">Accessories</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] text-left hover:border-[#47583D] transition card-hover-effect group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E7ECE3] flex items-center justify-center text-[#47583D] mb-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#151413]">Add New Item</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">Manual or AI upload</p>
          </button>

          <Link
            href="/generate"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] text-left hover:border-[#47583D] transition card-hover-effect group block"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFF2EE] flex items-center justify-center text-[#C76A52] mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#151413]">Generate Outfit</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">Smart recommendations</p>
          </Link>

          <Link
            href="/closet?status=TEMPORARILY_UNAVAILABLE"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] text-left hover:border-[#47583D] transition card-hover-effect group block"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#4A4845] mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#151413]">Manage Availability</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">Laundry & repairs</p>
          </Link>

          <Link
            href="/export"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE4D7] text-left hover:border-[#47583D] transition card-hover-effect group block"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center text-[#5A6E4F] mb-3 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#151413]">Download Excel</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">Export full .xlsx file</p>
          </Link>
        </div>
      </div>

      {/* Recent Outfits & Wear Timeline */}
      {analytics && analytics.recentlyWornHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-wider font-bold text-[#151413]">
              Recently Worn Outfits
            </h3>
            <Link
              href="/history"
              className="text-xs font-semibold text-[#47583D] hover:underline flex items-center gap-1"
            >
              <span>View full history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.recentlyWornHistory.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#78716C] mb-1.5">
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-[#E7ECE3] text-[#2A3524]">
                      {item.occasion}
                    </span>
                    <span>{new Date(item.wornAt).toLocaleDateString()}</span>
                  </div>

                  <h4 className="font-bold text-base text-[#151413]">{item.outfitTitle}</h4>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.itemNames.map((name, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE4D7] text-[#4A4845]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs text-[#78716C]">
                  <span className="flex items-center gap-1 text-[#47583D] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recorded in style history
                  </span>
                  <Link
                    href="/history"
                    className="font-semibold text-[#151413] hover:text-[#47583D] transition"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemSaved={() => {
          fetchAnalytics();
        }}
      />
    </div>
  );
}
