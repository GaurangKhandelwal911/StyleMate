export const TYPE_FORMALITY_MAP: Record<string, number> = {
  // Tops
  'T-Shirt': 2,
  'Polo': 5,
  'Shirt': 7,
  'Kurta': 6,
  'Sherwani': 9,

  // Bottoms
  'Shorts': 1,
  'Jeans': 4,
  'Chinos': 6,
  'Trousers': 8,

  // Outerwear
  'Hoodie': 2,
  'Sweater': 5,
  'Jacket': 5,
  'Coat': 8,

  // Shoes
  'Sandals': 1,
  'Sneakers': 4,
  'Boots': 6,
  'Loafers': 7,
  'Shoes': 8,

  // Accessories
  'Cap': 1,
  'Hat': 3,
  'Sunglasses': 4,
  'Watch': 6,
  'Belt': 6,
  'Bag': 5,
};

export const STYLE_TARGET_FORMALITY: Record<string, { min: number; max: number; ideal: number }> = {
  'Casual': { min: 1, max: 5, ideal: 3 },
  'Smart Casual': { min: 4, max: 8, ideal: 6 },
  'Formal': { min: 7, max: 10, ideal: 8.5 },
  'Streetwear': { min: 1, max: 5, ideal: 3 },
  'Minimal': { min: 4, max: 8, ideal: 6 },
  'Traditional': { min: 5, max: 9, ideal: 7 },
  'Sporty': { min: 1, max: 3, ideal: 2 },
  'Elegant': { min: 7, max: 10, ideal: 8.5 },
};

export function evaluateFormalityCompatibility(
  targetStyle: string,
  items: { type: string; style?: string }[]
): { score: number; explanation: string } {
  const target = STYLE_TARGET_FORMALITY[targetStyle] || { min: 2, max: 7, ideal: 5 };

  let totalItemFormality = 0;
  let maxFormality = 0;
  let minFormality = 10;

  for (const item of items) {
    const f = TYPE_FORMALITY_MAP[item.type] ?? 4;
    totalItemFormality += f;
    if (f > maxFormality) maxFormality = f;
    if (f < minFormality) minFormality = f;
  }

  const avgFormality = totalItemFormality / (items.length || 1);
  const spread = maxFormality - minFormality;

  // Clashing formality check (e.g. formal coat with beach shorts or slippers)
  if (spread >= 6) {
    return {
      score: 40,
      explanation: 'Noticeable clash between very formal and hyper-casual pieces.',
    };
  }

  // Distance from ideal style formality
  const distance = Math.abs(avgFormality - target.ideal);
  let score = Math.max(40, Math.round(98 - distance * 12 - (spread > 3 ? 10 : 0)));

  let explanation = 'Well-calibrated silhouette adhering to the requested dress code.';
  if (targetStyle === 'Smart Casual' && spread <= 3) {
    explanation = 'Excellent smart-casual balance bridging tailored and relaxed aesthetics.';
    score = Math.min(100, score + 5);
  } else if (targetStyle === 'Formal' && avgFormality >= 7) {
    explanation = 'Sharp, professional formality suitable for business or ceremonial settings.';
  }

  return { score, explanation };
}
