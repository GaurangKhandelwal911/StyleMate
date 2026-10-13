import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const { searchParams } = new URL(req.url);
    const favoriteOnly = searchParams.get('favorite') === 'true';

    const outfits = await prisma.outfit.findMany({
      where: {
        userId: user.id,
        ...(favoriteOnly ? { isFavorite: true } : {}),
      },
      include: {
        items: {
          include: {
            closetItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedOutfits = outfits.map((o) => ({
      ...o,
      items: o.items.map((i) => ({
        role: i.role,
        item: {
          ...i.closetItem,
          occasions: JSON.parse(i.closetItem.occasions || '[]'),
          seasons: JSON.parse(i.closetItem.seasons || '[]'),
        },
      })),
    }));

    return NextResponse.json({ success: true, outfits: parsedOutfits });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch outfits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();

    const {
      title,
      occasion,
      style,
      weather,
      score = 85,
      explanation,
      items, // array of { closetItemId: string, role: string }
      plannedDate,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Outfit must contain at least one item' },
        { status: 400 }
      );
    }

    const created = await prisma.outfit.create({
      data: {
        userId: user.id,
        title: title || `${occasion} Ensemble`,
        occasion: occasion || 'Casual',
        style: style || 'Casual',
        weather: weather || 'Mild',
        score: score || 85,
        explanation: explanation || 'Curated stylistic combination.',
        plannedDate: plannedDate ? new Date(plannedDate) : null,
        items: {
          create: items.map((i: any) => ({
            closetItemId: i.closetItemId || i.item?.id,
            role: i.role || 'MAIN',
          })),
        },
      },
      include: {
        items: {
          include: {
            closetItem: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      outfit: {
        ...created,
        items: created.items.map((i) => ({
          role: i.role,
          item: {
            ...i.closetItem,
            occasions: JSON.parse(i.closetItem.occasions || '[]'),
            seasons: JSON.parse(i.closetItem.seasons || '[]'),
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error saving outfit:', error);
    return NextResponse.json({ success: false, error: 'Failed to save outfit' }, { status: 500 });
  }
}
