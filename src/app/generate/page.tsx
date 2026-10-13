'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  CloudSun,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  OccasionOption,
  WeatherCondition,
  StyleOption,
  ScoredOutfitResult,
  RecommendationDiagnostics,
} from '@/types';
import { OutfitCard } from '@/components/outfits/OutfitCard';
import { OutfitDetailModal } from '@/components/outfits/OutfitDetailModal';
import { NoClothesDiagnosis } from '@/components/outfits/NoClothesDiagnosis';
import { useToast } from '@/components/ui/Toast';

const OCCASIONS: { label: string; value: OccasionOption; desc: string }[] = [
  { label: 'College Presentation', value: 'College Presentation', desc: 'Sharper academic presentation look' },
  { label: 'Casual Outing', value: 'Casual Outing', desc: 'Relaxed hangout or weekend cafe' },
  { label: 'Office', value: 'Office', desc: 'Smart work attire' },
  { label: 'Interview', value: 'Interview', desc: 'Formal and professional first impression' },
  { label: 'Date', value: 'Date', desc: 'Refined, stylish, and intentional' },
  { label: 'Party', value: 'Party', desc: 'Night out or celebration' },
  { label: 'College', value: 'College', desc: 'Everyday campus comfort' },
  { label: 'Dinner', value: 'Dinner', desc: 'Evening smart dining' },
  { label: 'Formal Event', value: 'Formal Event', desc: 'Gala or corporate banquet' },
  { label: 'Wedding', value: 'Wedding', desc: 'Ceremonial celebrations' },
  { label: 'Travel', value: 'Travel', desc: 'Comfortable transit & movement' },
  { label: 'Gym', value: 'Gym', desc: 'Athletic and workout ready' },
];

const WEATHER_OPTIONS: { label: string; value: WeatherCondition; icon: string }[] = [
  { label: 'Auto (24°C)', value: 'Auto', icon: '🌤️' },
  { label: 'Hot', value: 'Hot', icon: '☀️' },
  { label: 'Warm', value: 'Warm', icon: '🌤️' },
  { label: 'Mild', value: 'Mild', icon: '🍃' },
  { label: 'Cold', value: 'Cold', icon: '❄️' },
  { label: 'Rainy', value: 'Rainy', icon: '🌧️' },
];

const STYLES: StyleOption[] = [
  'Casual',
  'Smart Casual',
  'Formal',
  'Streetwear',
  'Minimal',
  'Traditional',
  'Sporty',
  'Elegant',
];

export default function GenerateOutfitPage() {
  const { success, error: toastError } = useToast();

  // Form State
  const [occasion, setOccasion] = useState<OccasionOption>('College Presentation');
  const [date, setDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [weather, setWeather] = useState<WeatherCondition>('Hot');
  const [stylePreference, setStylePreference] = useState<StyleOption>('Smart Casual');
  const [extraPreferences, setExtraPreferences] = useState('');

  // Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ScoredOutfitResult[]>([]);
  const [diagnostics, setDiagnostics] = useState<RecommendationDiagnostics | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [styleFilterTab, setStyleFilterTab] = useState<string>('All');
  const [savedOutfitIds, setSavedOutfitIds] = useState<Set<string>>(new Set());

  // Modal State
  const [activeOutfitModal, setActiveOutfitModal] = useState<ScoredOutfitResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setHasGenerated(true);

    try {
      const res = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          date,
          weather,
          stylePreference,
          extraPreferences,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.outfits || []);
        setDiagnostics(data.diagnostics || null);

        if (data.outfits && data.outfits.length > 0) {
          success(
            'Recommendations Generated',
            `Found ${data.outfits.length} curated combinations for your ${occasion}.`
          );
        }
      } else {
        toastError('Generation Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWearOutfit = async (outfit: ScoredOutfitResult) => {
    try {
      // First save outfit if not already saved
      let outfitId = outfit.id;
      if (!outfitId) {
        const saveRes = await fetch('/api/outfits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: outfit.title,
            occasion: outfit.occasion,
            style: outfit.style,
            weather: outfit.weather,
            score: outfit.score,
            explanation: outfit.explanation,
            items: outfit.items.map((oi) => ({
              closetItemId: oi.item.id,
              role: oi.role,
            })),
          }),
        });
        const saveData = await saveRes.json();
        outfitId = saveData.outfit?.id;
      }

      if (outfitId) {
        const wearRes = await fetch(`/api/outfits/${outfitId}/worn`, { method: 'POST' });
        const wearData = await wearRes.json();
        if (wearData.success) {
          success('Outfit Marked as Worn!', 'Saved to your Outfit History and wear stats updated.');
        }
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Could not record outfit as worn.');
    }
  };

  const handleSaveOutfit = async (outfit: ScoredOutfitResult) => {
    try {
      const saveRes = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: outfit.title,
          occasion: outfit.occasion,
          style: outfit.style,
          weather: outfit.weather,
          score: outfit.score,
          explanation: outfit.explanation,
          items: outfit.items.map((oi) => ({
            closetItemId: oi.item.id,
            role: oi.role,
          })),
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        success('Outfit Saved', 'Added to your saved collections.');
        if (saveData.outfit?.id) {
          setSavedOutfitIds((prev) => {
            const next = new Set(prev);
            next.add(saveData.outfit.id);
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to save outfit.');
    }
  };

  const handleScheduleOutfit = async (outfit: ScoredOutfitResult, plannedDate: string) => {
    try {
      const saveRes = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: outfit.title,
          occasion: outfit.occasion,
          style: outfit.style,
          weather: outfit.weather,
          score: outfit.score,
          explanation: outfit.explanation,
          items: outfit.items.map((oi) => ({
            closetItemId: oi.item.id,
            role: oi.role,
          })),
          plannedDate,
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        success('Added to Calendar', `Scheduled for ${new Date(plannedDate).toLocaleDateString()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMakeItemAvailable = async (id: string) => {
    try {
      const res = await fetch(`/api/closet/${id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'AVAILABLE' }),
      });
      const data = await res.json();
      if (data.success) {
        success('Item Made Available', 'Regenerating recommendations...');
        // Auto-retrigger recommendation
        handleGenerate({ preventDefault: () => {} } as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter outfits by tab
  const filteredOutfits = results.filter((o) => {
    if (styleFilterTab === 'All') return true;
    return o.style.toLowerCase().includes(styleFilterTab.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
          AI Recommendation Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
          Generate Outfit
        </h1>
        <p className="text-xs sm:text-sm text-[#686561] mt-1 max-w-xl">
          Enter your event context, weather, and style preference. StyleMate filters your available wardrobe and scores harmonious combinations.
        </p>
      </div>

      {/* Main Generator Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
      >
        <h2 className="text-lg font-bold text-[#151413]">What are you dressing for?</h2>

        {/* 1. Event / Occasion Grid */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-2.5">
            Event / Occasion *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {OCCASIONS.map((occ) => {
              const active = occasion === occ.value;
              return (
                <button
                  key={occ.value}
                  type="button"
                  onClick={() => setOccasion(occ.value)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    active
                      ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] shadow-xs ring-1 ring-[#5A6E4F]'
                      : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6] hover:text-[#151413]'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#151413]">{occ.label}</span>
                  <span className="text-[10px] text-[#78716C] line-clamp-1 mt-0.5">{occ.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Date and Weather row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-2">
              Planned Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
            </div>
          </div>

          {/* Weather condition */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-2">
              Forecasted Weather *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {WEATHER_OPTIONS.map((w) => {
                const active = weather === w.value;
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWeather(w.value)}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      active
                        ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-bold'
                        : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <span className="text-sm mb-0.5">{w.icon}</span>
                    <span className="text-[11px] font-semibold">{w.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Style Preference */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-2">
            Style Preference *
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((st) => {
              const active = stylePreference === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStylePreference(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    active
                      ? 'bg-[#151413] border-[#151413] text-white shadow-xs'
                      : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6] hover:text-[#151413]'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Extra Preferences free text */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
            Extra Preferences (Optional)
          </label>
          <input
            type="text"
            value={extraPreferences}
            onChange={(e) => setExtraPreferences(e.target.value)}
            placeholder="e.g. Comfortable walking shoes, not too flashy, clean minimalist tones"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#47583D] hover:bg-[#384630] text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Wardrobe & Generating Outfits...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Outfits</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {hasGenerated && (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4D7] pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#151413]">
                Your Best Outfits
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Targeted for {occasion} • {weather} weather • {stylePreference} style
              </p>
            </div>

            {/* Results filter tabs */}
            {results.length > 0 && (
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE4D7]">
                {['All', 'Formal', 'Smart Casual', 'Casual'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStyleFilterTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      styleFilterTab === tab
                        ? 'bg-white text-[#151413] shadow-xs'
                        : 'text-[#78716C] hover:text-[#151413]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOutfits.map((outfit, index) => (
                <OutfitCard
                  key={index}
                  outfit={outfit}
                  index={index}
                  onViewDetails={(o) => setActiveOutfitModal(o)}
                  onWearOutfit={handleWearOutfit}
                  onSaveOutfit={handleSaveOutfit}
                  isSaved={outfit.id ? savedOutfitIds.has(outfit.id) : false}
                />
              ))}
            </div>
          ) : (
            /* Section 23: No Available Clothes Case */
            diagnostics && (
              <NoClothesDiagnosis
                diagnostics={diagnostics}
                onMakeItemAvailable={handleMakeItemAvailable}
                onResetPreferences={() => {
                  setStylePreference('Casual');
                  handleGenerate({ preventDefault: () => {} } as any);
                }}
              />
            )
          )}
        </div>
      )}

      {/* Outfit Details Modal */}
      <OutfitDetailModal
        outfit={activeOutfitModal}
        isOpen={Boolean(activeOutfitModal)}
        onClose={() => setActiveOutfitModal(null)}
        onWearOutfit={handleWearOutfit}
        onSaveOutfit={handleSaveOutfit}
        onScheduleDate={handleScheduleOutfit}
      />
    </div>
  );
}
