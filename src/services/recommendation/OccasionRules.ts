import { ClosetItemEntity } from '@/types';

export const OCCASION_MAPPINGS: Record<string, { preferredTypes: string[]; forbiddenTypes: string[]; idealStyles: string[] }> = {
  'College Presentation': {
    preferredTypes: ['Shirt', 'Polo', 'Trousers', 'Chinos', 'Loafers', 'Sneakers', 'Watch'],
    forbiddenTypes: ['Shorts', 'Sandals'],
    idealStyles: ['Smart Casual', 'Formal', 'Minimal'],
  },
  'Office': {
    preferredTypes: ['Shirt', 'Trousers', 'Chinos', 'Loafers', 'Shoes', 'Belt', 'Watch'],
    forbiddenTypes: ['Shorts', 'Sandals', 'Hoodie'],
    idealStyles: ['Smart Casual', 'Formal', 'Minimal'],
  },
  'Interview': {
    preferredTypes: ['Shirt', 'Trousers', 'Loafers', 'Shoes', 'Belt', 'Coat'],
    forbiddenTypes: ['Shorts', 'Sandals', 'Hoodie', 'T-Shirt', 'Cap'],
    idealStyles: ['Formal', 'Smart Casual'],
  },
  'Casual Outing': {
    preferredTypes: ['T-Shirt', 'Shirt', 'Jeans', 'Chinos', 'Shorts', 'Sneakers', 'Hoodie', 'Cap'],
    forbiddenTypes: ['Sherwani'],
    idealStyles: ['Casual', 'Streetwear', 'Minimal'],
  },
  'College': {
    preferredTypes: ['T-Shirt', 'Shirt', 'Jeans', 'Chinos', 'Sneakers', 'Hoodie', 'Cap', 'Bag'],
    forbiddenTypes: ['Sherwani'],
    idealStyles: ['Casual', 'Smart Casual', 'Streetwear'],
  },
  'Date': {
    preferredTypes: ['Shirt', 'Polo', 'Chinos', 'Trousers', 'Jeans', 'Loafers', 'Sneakers', 'Watch', 'Jacket'],
    forbiddenTypes: ['Sandals'],
    idealStyles: ['Smart Casual', 'Minimal', 'Elegant'],
  },
  'Party': {
    preferredTypes: ['Shirt', 'Jacket', 'Jeans', 'Trousers', 'Sneakers', 'Boots', 'Watch'],
    forbiddenTypes: ['Sandals'],
    idealStyles: ['Streetwear', 'Smart Casual', 'Casual'],
  },
  'Wedding': {
    preferredTypes: ['Sherwani', 'Kurta', 'Coat', 'Trousers', 'Shoes', 'Loafers'],
    forbiddenTypes: ['Shorts', 'Sandals', 'T-Shirt', 'Hoodie', 'Cap'],
    idealStyles: ['Traditional', 'Formal', 'Elegant'],
  },
  'Ethnic Event': {
    preferredTypes: ['Kurta', 'Sherwani', 'Loafers', 'Sandals'],
    forbiddenTypes: ['Shorts', 'Hoodie'],
    idealStyles: ['Traditional', 'Elegant'],
  },
  'Formal Event': {
    preferredTypes: ['Shirt', 'Trousers', 'Coat', 'Shoes', 'Loafers', 'Belt', 'Watch'],
    forbiddenTypes: ['Shorts', 'Sandals', 'Hoodie', 'T-Shirt', 'Cap'],
    idealStyles: ['Formal', 'Elegant'],
  },
  'Dinner': {
    preferredTypes: ['Shirt', 'Polo', 'Trousers', 'Chinos', 'Loafers', 'Sneakers', 'Watch'],
    forbiddenTypes: ['Shorts', 'Sandals'],
    idealStyles: ['Smart Casual', 'Minimal', 'Casual'],
  },
  'Travel': {
    preferredTypes: ['T-Shirt', 'Hoodie', 'Jeans', 'Chinos', 'Sneakers', 'Cap', 'Bag'],
    forbiddenTypes: ['Sherwani', 'Coat'],
    idealStyles: ['Casual', 'Streetwear', 'Sporty'],
  },
  'Gym': {
    preferredTypes: ['T-Shirt', 'Shorts', 'Sneakers'],
    forbiddenTypes: ['Shirt', 'Trousers', 'Loafers', 'Coat'],
    idealStyles: ['Sporty', 'Casual'],
  },
};

export function evaluateOccasionCompatibility(
  occasion: string,
  items: ClosetItemEntity[]
): { score: number; explanation: string; matchesOccasion: boolean } {
  const rule = OCCASION_MAPPINGS[occasion] || {
    preferredTypes: ['Shirt', 'T-Shirt', 'Jeans', 'Chinos', 'Sneakers'],
    forbiddenTypes: [],
    idealStyles: ['Casual', 'Smart Casual'],
  };

  const itemTypes = items.map((i) => i.type);
  const forbiddenFound = itemTypes.filter((t) => rule.forbiddenTypes.includes(t));

  if (forbiddenFound.length > 0) {
    return {
      score: 30,
      explanation: `Contains ${forbiddenFound.join(', ')} which is generally inappropriate for a ${occasion}.`,
      matchesOccasion: false,
    };
  }

  // Check how many items explicitly list this occasion or fall under preferred types
  let preferredMatchCount = 0;
  for (const item of items) {
    const explicitlyTagged = (item.occasions || []).some(
      (occ) => occ.toLowerCase() === occasion.toLowerCase()
    );
    const isPreferredType = rule.preferredTypes.includes(item.type);
    if (explicitlyTagged || isPreferredType) {
      preferredMatchCount++;
    }
  }

  const matchRatio = preferredMatchCount / (items.length || 1);
  const score = Math.min(100, Math.round(75 + matchRatio * 25));

  return {
    score,
    explanation: `Tailored precision for ${occasion} with well-suited pieces.`,
    matchesOccasion: score >= 60,
  };
}
