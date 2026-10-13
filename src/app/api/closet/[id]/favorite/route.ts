import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const item = await prisma.closetItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const updated = await prisma.closetItem.update({
      where: { id: params.id },
      data: {
        isFavorite: !item.isFavorite,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: updated.isFavorite,
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
