import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();

    const history = await prisma.outfitHistory.findMany({
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
    });

    const formatted = history.map((h) => ({
      id: h.id,
      wornAt: h.wornAt.toISOString(),
      notes: h.notes,
      outfit: {
        ...h.outfit,
        items: h.outfit.items.map((i) => ({
          role: i.role,
          item: {
            ...i.closetItem,
            occasions: JSON.parse(i.closetItem.occasions || '[]'),
            seasons: JSON.parse(i.closetItem.seasons || '[]'),
          },
        })),
      },
    }));

    return NextResponse.json({ success: true, history: formatted });
  } catch (error) {
    console.error('Error fetching outfit history:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
