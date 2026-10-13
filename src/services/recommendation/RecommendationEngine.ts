import {
  ClosetItemEntity,
  RecommendationRequest,
  ScoredOutfitResult,
  RecommendedOutfitItem,
  RecommendationResponse,
  RecommendationDiagnostics,
} from '@/types';
import { calculateColorHarmony } from './ColorHarmony';
import { evaluateFormalityCompatibility } from './FormalityMatrix';
import { evaluateWeatherCompatibility } from './WeatherRules';
import { evaluateOccasionCompatibility } from './OccasionRules';
import { generateOutfitExplanation } from './OutfitExplanation';

interface HistoricalWornLog {
  outfitId: string;
  itemIds: string[];
  wornAt: Date;
}

export class OutfitRecommendationEngine {
  /**
   * Generates scored outfit recommendations strictly from available items,
   * while diagnosing helpful unavailable items when availability is constrained.
   */
  public generateRecommendations(params: {
    allItems: ClosetItemEntity[];
    request: RecommendationRequest;
    recentWornLogs?: HistoricalWornLog[];
    userPreferences?: {
      preferredStyles?: string[];
      preferredColors?: string[];
      dislikedColors?: string[];
      complexion?: string;
    };
  }): RecommendationResponse {
    const { allItems, request, recentWornLogs = [], userPreferences } = params;

    // 1. Separate Active closet: Never consider REMOVED items
    const activeItems = allItems.filter((i) => i.status !== 'REMOVED');

    // 2. Separate strictly AVAILABLE vs TEMPORARILY_UNAVAILABLE
    const availableItems = activeItems.filter((i) => i.status === 'AVAILABLE');
    const unavailableItems = activeItems.filter((i) => i.status === 'TEMPORARILY_UNAVAILABLE');

    // Categorize available items
    const tops = availableItems.filter((i) => i.category === 'Tops');
    const bottoms = availableItems.filter((i) => i.category === 'Bottoms');
    const shoes = availableItems.filter((i) => i.category === 'Shoes');
    const outerwear = availableItems.filter((i) => i.category === 'Outerwear');
    const accessories = availableItems.filter((i) => i.category === 'Accessories');

    const diagnostics: RecommendationDiagnostics = {
      totalClosetItems: activeItems.length,
      availableItemsCount: availableItems.length,
      unavailableItemsCount: unavailableItems.length,
      unavailableHelpfulItems: [],
    };

    // If missing core categories, diagnose helpful unavailable items immediately
    if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
      diagnostics.reasonIfEmpty = `We couldn't create a complete ${request.stylePreference} outfit from your currently available wardrobe because you are missing available ${
        tops.length === 0 ? 'tops ' : ''
      }${bottoms.length === 0 ? 'bottoms ' : ''}${shoes.length === 0 ? 'footwear' : ''}.`;

      diagnostics.unavailableHelpfulItems = unavailableItems.filter(
        (i) =>
          (tops.length === 0 && i.category === 'Tops') ||
          (bottoms.length === 0 && i.category === 'Bottoms') ||
          (shoes.length === 0 && i.category === 'Shoes')
      );

      return {
        outfits: [],
        diagnostics,
      };
    }

    // Recent wear item tracking (within past 4 days)
    const recentWornItemIds = new Set<string>();
    const now = new Date().getTime();
    for (const log of recentWornLogs) {
      const daysDiff = (now - new Date(log.wornAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 4) {
        log.itemIds.forEach((id) => recentWornItemIds.add(id));
      }
    }

    const candidateOutfits: ScoredOutfitResult[] = [];

    // Form combinations: Top + Bottom + Footwear (+ optional Outerwear / Accessory)
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoes) {
          // Determine if outerwear is suitable based on weather
          const needsOuterwear = request.weather === 'Cold' || (request.weather === 'Mild' && outerwear.length > 0);
          const chosenOuter = needsOuterwear
            ? outerwear.find((o) => o.seasons.includes('Winter') || o.seasons.includes('All Season')) || (request.weather === 'Cold' ? outerwear[0] : undefined)
            : undefined;

          // Pick an accessory that enhances the look if available
          const chosenAccessory = accessories.length > 0
            ? accessories.find((a) => a.occasions.includes(request.occasion as string)) || accessories[0]
            : undefined;

          const outfitItemsList: RecommendedOutfitItem[] = [
            { role: 'TOP', item: top },
            { role: 'BOTTOM', item: bottom },
            { role: 'FOOTWEAR', item: shoe },
          ];

          if (chosenOuter) {
            outfitItemsList.push({ role: 'OUTERWEAR', item: chosenOuter });
          }
          if (chosenAccessory && (request.occasion.includes('Presentation') || request.occasion.includes('Office') || request.occasion.includes('Date'))) {
            outfitItemsList.push({ role: 'ACCESSORY', item: chosenAccessory });
          }

          const rawEntities = outfitItemsList.map((oi) => oi.item);

          // 1. Color Harmony
          const colors = rawEntities.map((i) => i.color);
          const colorEval = calculateColorHarmony(colors, userPreferences?.complexion);

          // 2. Formality & Style
          const formalityEval = evaluateFormalityCompatibility(
            request.stylePreference,
            rawEntities.map((i) => ({ type: i.type, style: i.style }))
          );

          // 3. Weather
          const weatherEval = evaluateWeatherCompatibility(
            request.weather,
            rawEntities.map((i) => ({ type: i.type, material: i.material, category: i.category }))
          );

          // 4. Occasion
          const occasionEval = evaluateOccasionCompatibility(request.occasion, rawEntities);

          // If combination has forbidden piece for the occasion, skip it
          if (!occasionEval.matchesOccasion) {
            continue;
          }

          // 5. Diversity penalty (recently worn check)
          let diversityScore = 100;
          let recentlyWornPenalty = 0;
          for (const item of rawEntities) {
            if (recentWornItemIds.has(item.id)) {
              recentlyWornPenalty += 12;
            }
          }
          diversityScore = Math.max(40, 100 - recentlyWornPenalty);

          // 6. User preference & favorite item bonuses
          let preferenceBonus = 0;
          if (rawEntities.some((i) => i.isFavorite)) {
            preferenceBonus += 4;
          }
          if (userPreferences?.preferredStyles?.includes(request.stylePreference)) {
            preferenceBonus += 3;
          }
          if (userPreferences?.dislikedColors?.some((dc) => colors.includes(dc))) {
            preferenceBonus -= 15;
          }

          // Weighted Total Score (0 - 100)
          // Occasion: 30%, Formality/Style: 25%, Color: 20%, Weather: 15%, Diversity: 10%
          const weightedScore =
            occasionEval.score * 0.30 +
            formalityEval.score * 0.25 +
            colorEval.score * 0.20 +
            weatherEval.score * 0.15 +
            diversityScore * 0.10 +
            preferenceBonus;

          const finalScore = Math.min(99, Math.max(50, Math.round(weightedScore)));

          // Construct descriptive title
          const title = `${top.color} ${top.type} & ${bottom.color} ${bottom.type}`;

          const explanation = generateOutfitExplanation({
            items: outfitItemsList,
            occasion: request.occasion,
            style: request.stylePreference,
            weather: request.weather,
            colorScore: colorEval.score,
          });

          candidateOutfits.push({
            title,
            occasion: request.occasion,
            style: request.stylePreference,
            weather: request.weather,
            score: finalScore,
            explanation,
            items: outfitItemsList,
            colorHarmonyScore: colorEval.score,
            occasionScore: occasionEval.score,
            weatherScore: weatherEval.score,
            styleScore: formalityEval.score,
            diversityScore,
          });
        }
      }
    }

    // Sort descending by score
    candidateOutfits.sort((a, b) => b.score - a.score);

    // De-duplicate outfits with identical top and bottom
    const seenCombos = new Set<string>();
    const uniqueRankedOutfits: ScoredOutfitResult[] = [];

    for (const outfit of candidateOutfits) {
      const topId = outfit.items.find((i) => i.role === 'TOP')?.item.id;
      const bottomId = outfit.items.find((i) => i.role === 'BOTTOM')?.item.id;
      const shoeId = outfit.items.find((i) => i.role === 'FOOTWEAR')?.item.id;
      const key = `${topId}-${bottomId}-${shoeId}`;

      if (!seenCombos.has(key)) {
        seenCombos.add(key);
        uniqueRankedOutfits.push(outfit);
      }

      if (uniqueRankedOutfits.length >= 5) break;
    }

    // If no candidate outfits passed filter or score thresholds
    if (uniqueRankedOutfits.length === 0) {
      diagnostics.reasonIfEmpty = `We couldn't create a complete ${request.stylePreference} outfit for ${request.occasion} from your currently available items.`;
      // Find unavailable items that match the requested occasion or style
      diagnostics.unavailableHelpfulItems = unavailableItems.filter((item) => {
        const matchesOcc = (item.occasions || []).includes(request.occasion);
        const matchesStyle = item.style === request.stylePreference;
        return matchesOcc || matchesStyle;
      });
    }

    return {
      outfits: uniqueRankedOutfits,
      diagnostics,
    };
  }
}

export const recommendationEngine = new OutfitRecommendationEngine();
