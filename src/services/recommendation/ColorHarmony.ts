// Color harmony rules and scoring matrix for fashion styling

const NEUTRALS = new Set([
  'white', 'black', 'grey', 'gray', 'navy', 'beige', 'cream', 'tan', 'khaki', 'charcoal', 'off-white'
]);

const HARMONIC_PAIRS: [string, string][] = [
  ['white', 'black'],
  ['white', 'navy'],
  ['white', 'blue'],
  ['white', 'beige'],
  ['white', 'olive'],
  ['white', 'grey'],
  ['white', 'brown'],
  ['black', 'grey'],
  ['black', 'beige'],
  ['black', 'white'],
  ['blue', 'beige'],
  ['blue', 'brown'],
  ['navy', 'beige'],
  ['navy', 'grey'],
  ['navy', 'white'],
  ['olive', 'white'],
  ['olive', 'beige'],
  ['olive', 'black'],
  ['brown', 'beige'],
  ['brown', 'white'],
  ['brown', 'navy'],
  ['grey', 'navy'],
  ['grey', 'black'],
  ['charcoal', 'white'],
];

export function calculateColorHarmony(
  colors: string[],
  complexion?: string
): { score: number; explanation: string } {
  const normalized = colors.map((c) => (c || '').trim().toLowerCase());
  if (normalized.length <= 1) {
    return { score: 95, explanation: 'Monochromatic minimalist elegance' };
  }

  // Complexion harmony adjustment
  let complexionBonus = 0;
  let complexionNote = '';
  if (complexion) {
    const compLower = complexion.toLowerCase();
    if (compLower.includes('deep')) {
      if (normalized.includes('white') || normalized.includes('navy') || normalized.includes('blue')) {
        complexionBonus = 4;
        complexionNote = ' High-contrast tones accentuate deep rich undertones.';
      }
    } else if (compLower.includes('medium') || compLower.includes('warm')) {
      if (normalized.includes('olive') || normalized.includes('beige') || normalized.includes('brown')) {
        complexionBonus = 4;
        complexionNote = ' Earthy tones complement medium warm undertones.';
      }
    } else if (compLower.includes('fair') || compLower.includes('cool')) {
      if (normalized.includes('navy') || normalized.includes('grey') || normalized.includes('black')) {
        complexionBonus = 4;
        complexionNote = ' Crisp cool hues accentuate fair complexion.';
      }
    }
  }

  // Count neutral pieces
  const neutralCount = normalized.filter((c) => NEUTRALS.has(c)).length;
  const isHighNeutral = neutralCount >= normalized.length - 1;

  // Check specific harmonic pairings between top, bottom, and footwear
  let matchedHarmonics = 0;
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const c1 = normalized[i];
      const c2 = normalized[j];
      const matches = HARMONIC_PAIRS.some(
        ([p1, p2]) => (c1 === p1 && c2 === p2) || (c1 === p2 && c2 === p1)
      );
      if (matches || c1 === c2) {
        matchedHarmonics++;
      }
    }
  }

  // Avoid more than 3 distinct non-neutral bright colors
  const nonNeutrals = new Set(normalized.filter((c) => !NEUTRALS.has(c)));
  if (nonNeutrals.size > 2) {
    return {
      score: 65,
      explanation: 'Slightly high chromatic contrast with multiple non-neutral tones.' + complexionNote,
    };
  }

  if (isHighNeutral && matchedHarmonics >= 1) {
    return {
      score: Math.min(100, 96 + complexionBonus),
      explanation: 'Timeless neutral grounding with high aesthetic cohesion.' + complexionNote,
    };
  }

  if (matchedHarmonics >= 2) {
    return {
      score: Math.min(100, 92 + complexionBonus),
      explanation: 'Balanced palette utilizing classic complementary fashion pairings.' + complexionNote,
    };
  }

  if (matchedHarmonics >= 1) {
    return {
      score: Math.min(100, 85 + complexionBonus),
      explanation: 'Pleasant color balance between primary pieces.' + complexionNote,
    };
  }

  return {
    score: Math.min(100, 75 + complexionBonus),
    explanation: 'Subtle contrast with acceptable visual interest.' + complexionNote,
  };
}
