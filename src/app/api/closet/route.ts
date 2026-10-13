import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const favorite = searchParams.get('favorite');
    const sort = searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = {
      userId: user.id,
      status: { not: 'REMOVED' },
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (favorite === 'true') {
      where.isFavorite = true;
    }

    let items = await prisma.closetItem.findMany({
      where,
      orderBy:
        sort === 'mostWorn'
          ? { wearCount: 'desc' }
          : sort === 'oldest'
          ? { createdAt: 'asc' }
          : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' },
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.color.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    const parsedItems = items.map((item) => ({
      ...item,
      occasions: JSON.parse(item.occasions || '[]'),
      seasons: JSON.parse(item.seasons || '[]'),
    }));

    return NextResponse.json({ success: true, items: parsedItems });
  } catch (error) {
    console.error('Error fetching closet items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch closet items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();

    const {
      name,
      category,
      type,
      color,
      pattern = 'Solid',
      material = 'Cotton',
      fit = 'Regular',
      style = 'Casual',
      occasions = ['Casual'],
      seasons = ['All Season'],
      brand,
      status = 'AVAILABLE',
      unavailableReason,
      unavailableUntil,
      notes,
      imageUrl,
      isFavorite = false,
    } = body;

    if (!name || !category || !type || !color) {
      return NextResponse.json(
        { success: false, error: 'Name, category, type, and color are required fields.' },
        { status: 400 }
      );
    }

    const item = await prisma.closetItem.create({
      data: {
        userId: user.id,
        name: name.trim(),
        category,
        type,
        color,
        pattern,
        material,
        fit: fit || 'Regular',
        style,
        occasions: JSON.stringify(Array.isArray(occasions) ? occasions : [occasions]),
        seasons: JSON.stringify(Array.isArray(seasons) ? seasons : [seasons]),
        brand: brand ? brand.trim() : null,
        status: status as string,
        unavailableReason: status === 'TEMPORARILY_UNAVAILABLE' ? unavailableReason : null,
        unavailableUntil: unavailableUntil ? new Date(unavailableUntil) : null,
        notes: notes ? notes.trim() : null,
        imageUrl: imageUrl || null,
        isFavorite: Boolean(isFavorite),
      },
    });

    if (status === 'TEMPORARILY_UNAVAILABLE') {
      await prisma.availabilityRecord.create({
        data: {
          closetItemId: item.id,
          status: 'TEMPORARILY_UNAVAILABLE',
          reason: unavailableReason || 'Unavailable',
          startDate: new Date(),
          endDate: unavailableUntil ? new Date(unavailableUntil) : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        occasions: JSON.parse(item.occasions),
        seasons: JSON.parse(item.seasons),
      },
    });
  } catch (error) {
    console.error('Error creating closet item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}
