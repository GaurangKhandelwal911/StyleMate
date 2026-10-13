import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { WardrobeAnalytics } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();

    // Active items
    const items = await prisma.closetItem.findMany({
      where: { userId: user.id, status: { not: 'REMOVED' } },
    });

    const totalItems = items.length;
    const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
    const unavailableItems = items.filter((i) => i.status === 'TEMPORARILY_UNAVAILABLE');
    const unavailableCount = unavailableItems.length;
    const favoriteCount = items.filter((i) => i.isFavorite).length;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const styleCounts: Record<string, number> = {};

    for (const item of items) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
      styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
    }

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / (totalItems || 1)) * 100),
    }));

    const colorDistribution = Object.entries(colorCounts)
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);

    const styleDistribution = Object.entries(styleCounts)
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count);

    // Most worn items
    const mostWornItemsRaw = [...items].sort((a, b) => b.wearCount - a.wearCount).slice(0, 6);
    const mostWornItems = mostWornItemsRaw.map((item) => ({
      ...item,
      status: item.status as any,
      occasions: JSON.parse(item.occasions || '[]'),
      seasons: JSON.parse(item.seasons || '[]'),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      lastWornAt: item.lastWornAt ? item.lastWornAt.toISOString() : null,
      unavailableUntil: item.unavailableUntil ? item.unavailableUntil.toISOString() : null,
    }));

    // Outfits & History
    const totalOutfitsGenerated = await prisma.outfit.count({
      where: { userId: user.id },
    });

    const recentHistory = await prisma.outfitHistory.findMany({
      where: { userId: user.id },
      include: {
        outfit: {
          include: {
            items: {
              include: {
                closetItem: true,
              },
            },
          },
        },
      },
      orderBy: { wornAt: 'desc' },
      take: 5,
    });

    const totalOutfitsWorn = await prisma.outfitHistory.count({
      where: { userId: user.id },
    });

    const recentlyWornHistory = recentHistory.map((h) => ({
      id: h.id,
      wornAt: h.wornAt.toISOString(),
      outfitTitle: h.outfit.title,
      occasion: h.outfit.occasion,
      itemNames: h.outfit.items.map((i) => i.closetItem.name),
    }));

    // Unavailable summary grouped by reason
    const reasonGroups: Record<string, { count: number; items: { id: string; name: string; until?: string | null }[] }> = {};
    for (const item of unavailableItems) {
      const reason = item.unavailableReason || 'Other';
      if (!reasonGroups[reason]) {
        reasonGroups[reason] = { count: 0, items: [] };
      }
      reasonGroups[reason].count++;
      reasonGroups[reason].items.push({
        id: item.id,
        name: item.name,
        until: item.unavailableUntil ? item.unavailableUntil.toISOString() : null,
      });
    }

    const unavailableSummary = Object.entries(reasonGroups).map(([reason, data]) => ({
      reason,
      count: data.count,
      items: data.items,
    }));

    const analytics: WardrobeAnalytics = {
      totalItems,
      availableCount,
      unavailableCount,
      favoriteCount,
      totalOutfitsGenerated,
      totalOutfitsWorn,
      categoryDistribution,
      colorDistribution,
      styleDistribution,
      mostWornItems,
      recentlyWornHistory,
      unavailableSummary,
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
