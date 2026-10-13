import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { recommendationEngine } from '@/services/recommendation/RecommendationEngine';
import { RecommendationRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body: RecommendationRequest = await req.json();

    if (!body.occasion || !body.stylePreference || !body.weather) {
      return NextResponse.json(
        { success: false, error: 'Occasion, style preference, and weather are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch user's active closet items
    const rawItems = await prisma.closetItem.findMany({
      where: {
        userId: user.id,
        status: { not: 'REMOVED' },
      },
    });

    const parsedItems = rawItems.map((item) => ({
      ...item,
      status: item.status as any,
      occasions: JSON.parse(item.occasions || '[]'),
      seasons: JSON.parse(item.seasons || '[]'),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      lastWornAt: item.lastWornAt ? item.lastWornAt.toISOString() : null,
      unavailableUntil: item.unavailableUntil ? item.unavailableUntil.toISOString() : null,
    }));

    // 2. Fetch recent worn logs (within past 14 days)
    const recentHistory = await prisma.outfitHistory.findMany({
      where: {
        userId: user.id,
        wornAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        outfit: {
          include: {
            items: true,
          },
        },
      },
    });

    const formattedWornLogs = recentHistory.map((h) => ({
      outfitId: h.outfitId,
      itemIds: h.outfit.items.map((i) => i.closetItemId),
      wornAt: h.wornAt,
    }));

    // 3. Fetch user preferences
    const prefs = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    const userPreferences = prefs
      ? {
          preferredStyles: JSON.parse(prefs.preferredStyles || '[]'),
          preferredColors: JSON.parse(prefs.preferredColors || '[]'),
          dislikedColors: JSON.parse(prefs.dislikedColors || '[]'),
          complexion: user.complexion || prefs.complexion || undefined,
        }
      : undefined;

    // 4. Run the recommendation scoring engine
    const recommendationResult = recommendationEngine.generateRecommendations({
      allItems: parsedItems,
      request: body,
      recentWornLogs: formattedWornLogs,
      userPreferences,
    });

    return NextResponse.json({
      success: true,
      ...recommendationResult,
    });
  } catch (error) {
    console.error('Error generating outfits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate outfit recommendations' },
      { status: 500 }
    );
  }
}
