'use client';

import React from 'react';
import { Check, Sparkles, Palette } from 'lucide-react';

export interface ComplexionShade {
  id: string;
  name: string;
  hex: string;
  gradientHex: string;
  undertone: string;
  valueString: string;
  description: string;
  flatteringColors: { name: string; hex: string }[];
}

export const COMPLEXION_SHADES: ComplexionShade[] = [
  {
    id: 'fair',
    name: 'Fair',
    hex: '#FBE3D5',
    gradientHex: '#F7D0BC',
    undertone: 'Cool Rosy',
    valueString: 'Fair with cool undertones (flattered by navy, emerald, charcoal, soft tones)',
    description: 'Fair complexion with cool, rosy undertones. Looks striking in high-contrast deep hues and crisp cool tones.',
    flatteringColors: [
      { name: 'Navy', hex: '#1E3A8A' },
      { name: 'Emerald', hex: '#047857' },
      { name: 'Charcoal', hex: '#374151' },
      { name: 'Pastel Blue', hex: '#93C5FD' },
    ],
  },
  {
    id: 'light',
    name: 'Light',
    hex: '#F3D1B5',
    gradientHex: '#E8BE9B',
    undertone: 'Neutral Ivory',
    valueString: 'Light with neutral undertones (flattered by dusty blue, sage, burgundy)',
    description: 'Light complexion with balanced neutral undertones. Pairs seamlessly with soft earth tones and classic neutrals.',
    flatteringColors: [
      { name: 'Dusty Blue', hex: '#3B82F6' },
      { name: 'Sage Green', hex: '#84A98C' },
      { name: 'Burgundy', hex: '#831843' },
      { name: 'Black', hex: '#111827' },
    ],
  },
  {
    id: 'medium',
    name: 'Wheatish / Tan',
    hex: '#DCA57A',
    gradientHex: '#CA8E60',
    undertone: 'Warm Golden',
    valueString: 'Medium / Wheatish with warm undertones (flattered by olive, beige, terracotta, rich brown)',
    description: 'Wheatish or tan skin with warm golden-peach undertones. Warm earthy tones and rich neutrals naturally illuminate your skin.',
    flatteringColors: [
      { name: 'Olive', hex: '#5A6E4F' },
      { name: 'Terracotta', hex: '#C76A52' },
      { name: 'Warm Beige', hex: '#D5C7B2' },
      { name: 'Mustard', hex: '#D97706' },
    ],
  },
  {
    id: 'olive',
    name: 'Olive',
    hex: '#BA8050',
    gradientHex: '#A26B3D',
    undertone: 'Neutral Olive',
    valueString: 'Olive with neutral undertones (flattered by muted earth tones, denim, stone)',
    description: 'Olive skin tone with subtle greenish or neutral gold undertones. Flattered by natural earth tones and indigo denim.',
    flatteringColors: [
      { name: 'Forest Green', hex: '#14532D' },
      { name: 'Burnt Orange', hex: '#C2410C' },
      { name: 'Denim Blue', hex: '#1D4ED8' },
      { name: 'Khaki', hex: '#A39171' },
    ],
  },
  {
    id: 'rich-bronze',
    name: 'Bronze',
    hex: '#8D562D',
    gradientHex: '#73411C',
    undertone: 'Warm Amber',
    valueString: 'Rich bronze with warm amber undertones (flattered by cobalt, crisp white, camel)',
    description: 'Rich bronze skin with luminous amber warmth. Dynamic jewel tones and clean optic white deliver stunning vibrancy.',
    flatteringColors: [
      { name: 'Cobalt Blue', hex: '#2563EB' },
      { name: 'Optic White', hex: '#FFFFFF' },
      { name: 'Camel', hex: '#B47B44' },
      { name: 'Warm Coral', hex: '#F97316' },
    ],
  },
  {
    id: 'deep',
    name: 'Deep / Rich',
    hex: '#4A2E1B',
    gradientHex: '#351F11',
    undertone: 'Rich Espresso',
    valueString: 'Deep with rich undertones (flattered by crisp white, jewel tones, bold contrast)',
    description: 'Deep complexion with rich, dark chocolate undertones. High-contrast white shirts, vibrant primaries, and rich jewel tones create maximum aesthetic presence.',
    flatteringColors: [
      { name: 'Crisp White', hex: '#FFFFFF' },
      { name: 'Royal Navy', hex: '#1E3A8A' },
      { name: 'Ruby Red', hex: '#B91C1C' },
      { name: 'Bright Gold', hex: '#EAB308' },
    ],
  },
];

interface ComplexionPickerProps {
  value: string;
  onChange: (valueString: string) => void;
  compact?: boolean;
}

export function ComplexionPicker({
  value,
  onChange,
  compact = false,
}: ComplexionPickerProps) {
  // Find selected shade by ID or matching substring in value string
  const selectedShade =
    COMPLEXION_SHADES.find(
      (s) =>
        s.valueString === value ||
        (value && value.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])) ||
        (value && value.toLowerCase().includes(s.id))
    ) || COMPLEXION_SHADES[5]; // Default to Deep

  return (
    <div className="space-y-4">
      {/* Visual Color Swatches Row */}
      <div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {COMPLEXION_SHADES.map((shade) => {
            const isSelected = selectedShade.id === shade.id;

            return (
              <button
                key={shade.id}
                type="button"
                onClick={() => onChange(shade.valueString)}
                className={`group relative p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#47583D] shadow-md ring-2 ring-[#47583D]/20 scale-102'
                    : 'bg-[#FAF8F5] border-[#EAE4D7] hover:bg-[#FFFFFF] hover:border-[#DDD5C7]'
                }`}
              >
                {/* Visual Color Icon Circle */}
                <div
                  className={`relative w-12 h-12 rounded-full mb-2 flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner border border-black/15 ${
                    isSelected ? 'ring-2 ring-[#47583D] ring-offset-2' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${shade.hex} 0%, ${shade.gradientHex} 100%)`,
                  }}
                >
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 text-[#151413] stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Shade name */}
                <span className="text-xs font-bold text-[#151413] block leading-tight">
                  {shade.name}
                </span>

                {/* Undertone badge */}
                <span className="text-[10px] text-[#78716C] font-medium mt-0.5">
                  {shade.undertone}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Color Harmony & Flattering Palettes Card */}
      {!compact && selectedShade && (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D7] space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-2xs"
                style={{ backgroundColor: selectedShade.hex }}
              />
              <span className="text-xs font-bold text-[#151413]">
                {selectedShade.name} • {selectedShade.undertone} Undertone
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E7ECE3] text-[#2A3524]">
              Active Undertone
            </span>
          </div>

          <p className="text-xs text-[#686561] leading-relaxed">
            {selectedShade.description}
          </p>

          <div className="pt-1.5 border-t border-[#F0EBE1] flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-[#151413] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#5A6E4F]" />
              Recommended Palette Matches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedShade.flatteringColors.map((col) => (
                <span
                  key={col.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DDD5C7] text-[11px] font-semibold text-[#151413] shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
