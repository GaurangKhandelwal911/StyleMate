'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  RotateCcw,
  Sparkles,
  Palette,
  Shield,
  CheckCircle2,
  Loader2,
  Ruler,
  Save,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ComplexionPicker } from '@/components/profile/ComplexionPicker';

export default function SettingsPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Profile attributes
  const [name, setName] = useState('Aryan');
  const [email, setEmail] = useState('aryan@example.com');
  const [gender, setGender] = useState("Masculine / Men's silhouettes");
  const [complexion, setComplexion] = useState(
    'Deep with rich undertones (flattered by crisp white, jewel tones, bold contrast)'
  );
  const [height, setHeight] = useState("5'10\" – 6'1\" (178 – 185 cm)");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setName(data.profile.name || 'Aryan');
        setEmail(data.profile.email || 'aryan@example.com');
        setGender(data.profile.gender || "Masculine / Men's silhouettes");
        setComplexion(
          data.profile.complexion ||
            'Deep with rich undertones (flattered by crisp white, jewel tones, bold contrast)'
        );
        setHeight(data.profile.height || "5'10\" – 6'1\" (178 – 185 cm)");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gender,
          complexion,
          height,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Profile Updated', `Preferences saved for ${name}. Recommendations updated.`);
      } else {
        toastError('Save Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to restore the default demo wardrobe with 18 items?')) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        success('Demo Wardrobe Restored', 'The clean demo items and history have been re-seeded.');
        fetchProfile();
      } else {
        toastError('Reset Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to re-seed database.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
          System & Personalization
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#686561] mt-1">
          Customize your styling profile (Name, Gender, Complexion, and Height) for tailored outfit recommendations.
        </p>
      </div>

      {/* User profile & Physical Attributes Form */}
      <form onSubmit={handleSaveProfile} className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#47583D]" />
            <h3 className="text-base font-bold text-[#151413]">Personal Styling Profile</h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E7ECE3] text-[#2A3524]">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#EAE4D7] bg-[#F7F4EE] text-[#78716C] cursor-not-allowed"
            />
          </div>

          {/* Gender / Styling Silhouettes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5">
              Gender & Styling Silhouettes
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
            >
              <option value="Masculine / Men's silhouettes">Masculine / Men's silhouettes</option>
              <option value="Feminine / Women's silhouettes">Feminine / Women's silhouettes</option>
              <option value="Gender-neutral / Androgynous silhouettes">Gender-neutral / Androgynous silhouettes</option>
            </select>
          </div>

          {/* Height Range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1.5 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#5A6E4F]" />
              Height Range
            </label>
            <select
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
            >
              <option value="Under 5'5&quot; (165 cm)">Under 5'5" (165 cm)</option>
              <option value="5'5&quot; – 5'9&quot; (165 – 175 cm)">5'5" – 5'9" (165 – 175 cm)</option>
              <option value="5'10&quot; – 6'1&quot; (178 – 185 cm)">5'10" – 6'1" (178 – 185 cm)</option>
              <option value="6'2&quot; and above (188+ cm)">6'2" and above (188+ cm)</option>
            </select>
          </div>

          {/* Complexion & Undertone with Visual Color Swatches */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#C76A52]" />
              Complexion & Undertone Color Swatches
            </label>
            <ComplexionPicker
              value={complexion}
              onChange={(newVal) => setComplexion(newVal)}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Vision Engine Info */}
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#47583D]" />
          AI Vision Classification Architecture
        </h3>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D7] space-y-2 text-xs text-[#686561] leading-relaxed">
          <p>
            StyleMate implements an extensible vision abstraction layer (<code>IVisionProvider</code>).
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Default Mode:</strong> Built-in intelligent fashion heuristics analyzer (zero external setup required).
            </li>
            <li>
              <strong>External Vision:</strong> Configurable via <code>GEMINI_API_KEY</code> or OpenAI vision models in <code>.env</code>.
            </li>
            <li>
              <strong>Human-in-the-Loop:</strong> All AI suggestions remain 100% editable prior to saving into the closet.
            </li>
          </ul>
        </div>
      </div>

      {/* Demo Data Reset Card */}
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-[#C76A52]" />
          Demo Scenario & Database Reset
        </h3>

        <p className="text-xs text-[#686561] leading-relaxed">
          Need to test the initial state again? Resetting reloads the 18 curated wardrobe items, marks 3 items (such as Black Jeans in Laundry and Hoodie in Repair) as Temporarily Unavailable, and resets the outfit history.
        </p>

        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-5 py-2.5 rounded-xl border border-[#F5D5C8] bg-[#FFF2EE] hover:bg-[#FCE3DA] text-[#A9523C] text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
        >
          {resetting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting Wardrobe...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Wardrobe Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
