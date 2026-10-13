import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const item = await prisma.closetItem.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        availabilityLogs: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        occasions: JSON.parse(item.occasions || '[]'),
        seasons: JSON.parse(item.seasons || '[]'),
      },
    });
  } catch (error) {
    console.error('Error fetching item details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();

    const existing = await prisma.closetItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const {
      name,
      category,
      type,
      color,
      pattern,
      material,
      fit,
      style,
      occasions,
      seasons,
      brand,
      notes,
      imageUrl,
      isFavorite,
    } = body;

    const updated = await prisma.closetItem.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        category: category ?? existing.category,
        type: type ?? existing.type,
        color: color ?? existing.color,
        pattern: pattern ?? existing.pattern,
        material: material ?? existing.material,
        fit: fit ?? existing.fit,
        style: style ?? existing.style,
        occasions: occasions !== undefined ? JSON.stringify(occasions) : existing.occasions,
        seasons: seasons !== undefined ? JSON.stringify(seasons) : existing.seasons,
        brand: brand !== undefined ? brand : existing.brand,
        notes: notes !== undefined ? notes : existing.notes,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        isFavorite: isFavorite !== undefined ? Boolean(isFavorite) : existing.isFavorite,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        ...updated,
        occasions: JSON.parse(updated.occasions),
        seasons: JSON.parse(updated.seasons),
      },
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const existing = await prisma.closetItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Permanently remove item from closet
    await prisma.closetItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item permanently removed from your closet.',
    });
  } catch (error) {
    console.error('Error removing item from closet:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove item' }, { status: 500 });
  }
}
