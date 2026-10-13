import { RecommendedOutfitItem } from '@/types';

export function generateOutfitExplanation(params: {
  items: RecommendedOutfitItem[];
  occasion: string;
  style: string;
  weather: string;
  colorScore: number;
}): string {
  const { items, occasion, style, weather } = params;

  const topItem = items.find((i) => i.role === 'TOP')?.item;
  const bottomItem = items.find((i) => i.role === 'BOTTOM')?.item;
  const footwearItem = items.find((i) => i.role === 'FOOTWEAR')?.item;
  const outerItem = items.find((i) => i.role === 'OUTERWEAR')?.item;
  const accessoryItem = items.find((i) => i.role === 'ACCESSORY')?.item;

  const parts: string[] = [];

  // Top & Bottom dynamic synergy
  if (topItem && bottomItem) {
    if (topItem.color.toLowerCase() === 'white' && bottomItem.color.toLowerCase() === 'black') {
      parts.push(`The ${topItem.name.toLowerCase()} establishes a crisp, high-contrast anchor, while the ${bottomItem.name.toLowerCase()} delivers tailored structure.`);
    } else if (topItem.color.toLowerCase() === 'white' || topItem.color.toLowerCase() === 'blue') {
      parts.push(`The ${topItem.name.toLowerCase()} creates a clean, approachable foundation that pairs seamlessly with the ${bottomItem.name.toLowerCase()}.`);
    } else {
      parts.push(`The ${topItem.color.toLowerCase()} ${topItem.name.toLowerCase()} harmonizes with the ${bottomItem.name.toLowerCase()} to form a balanced palette.`);
    }
  }

  // Outerwear touch if present
  if (outerItem) {
    parts.push(`Layering with the ${outerItem.name.toLowerCase()} adds functional warmth and depth suited for ${weather.toLowerCase()} conditions.`);
  }

  // Footwear role
  if (footwearItem) {
    if (footwearItem.type === 'Sneakers') {
      if (style === 'Smart Casual' || occasion.includes('Presentation')) {
        parts.push(`The clean ${footwearItem.name.toLowerCase()} lends a contemporary edge, keeping the outfit modern yet sharp for ${occasion}.`);
      } else {
        parts.push(`The ${footwearItem.name.toLowerCase()} ensures effortless walking comfort and casual ease.`);
      }
    } else if (footwearItem.type === 'Loafers' || footwearItem.type === 'Shoes') {
      parts.push(`The ${footwearItem.name.toLowerCase()} elevates the formality, ensuring you look poised and presentable.`);
    } else {
      parts.push(`The ${footwearItem.name.toLowerCase()} anchors the overall silhouette.`);
    }
  }

  // Accessory accent
  if (accessoryItem) {
    parts.push(`The ${accessoryItem.name.toLowerCase()} adds a refined finishing detail.`);
  }

  // Conclusion statement
  parts.push(`Overall, this ensemble achieves an effortless ${style} aesthetic optimized for your ${occasion}.`);

  return parts.join(' ');
}
