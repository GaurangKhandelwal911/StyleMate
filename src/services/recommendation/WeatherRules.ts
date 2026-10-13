import { WeatherCondition } from '@/types';

export function evaluateWeatherCompatibility(
  weather: WeatherCondition,
  items: { type: string; material?: string; category: string }[]
): { score: number; explanation: string } {
  if (weather === 'Auto') {
    return { score: 90, explanation: 'Adaptive for moderate weather conditions.' };
  }

  const types = items.map((i) => i.type);
  const categories = items.map((i) => i.category);
  const materials = items.map((i) => (i.material || '').toLowerCase());

  let score = 88;
  let explanation = 'Comfortable balance for the forecasted temperature.';

  switch (weather) {
    case 'Hot':
      // Penalize heavy outerwear in extreme heat
      if (types.includes('Coat') || types.includes('Hoodie') || materials.some((m) => m.includes('wool') || m.includes('fleece'))) {
        score -= 35;
        explanation = 'Contains heavy layering that will cause discomfort in hot weather.';
      } else if (materials.some((m) => m.includes('linen') || m.includes('cotton'))) {
        score += 8;
        explanation = 'Lightweight, breathable fabric composition ideal for high temperatures.';
      } else {
        explanation = 'Breezy and comfortable for warm sunshine.';
      }
      break;

    case 'Cold':
      // Must not wear shorts or sandals in cold
      if (types.includes('Shorts') || types.includes('Sandals')) {
        score -= 40;
        explanation = 'Inappropriate exposure for cold temperatures.';
      } else if (categories.includes('Outerwear') || types.includes('Sweater') || types.includes('Jacket') || types.includes('Coat')) {
        score += 10;
        explanation = 'Cozy insulation with proper layered warmth against the cold.';
      } else {
        score -= 10;
        explanation = 'Could benefit from an extra warm outer layer.';
      }
      break;

    case 'Rainy':
      if (types.includes('Sandals') || materials.some((m) => m.includes('suede'))) {
        score -= 25;
        explanation = 'Footwear is vulnerable to puddles and rainfall.';
      } else {
        score += 5;
        explanation = 'Practical, sturdy pieces resistant to wet weather.';
      }
      break;

    case 'Warm':
    case 'Mild':
    default:
      score = 92;
      explanation = 'Well-proportioned comfort for mild ambient conditions.';
      break;
  }

  return {
    score: Math.min(100, Math.max(30, score)),
    explanation,
  };
}
