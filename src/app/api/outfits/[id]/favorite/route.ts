import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const outfit = await prisma.outfit.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!outfit) {
      return NextResponse.json({ success: false, error: 'Outfit not found' }, { status: 404 });
    }

    const updated = await prisma.outfit.update({
      where: { id: params.id },
      data: { isFavorite: !outfit.isFavorite },
    });

    return NextResponse.json({
      success: true,
      isFavorite: updated.isFavorite,
    });
  } catch (error) {
    console.error('Error toggling outfit favorite:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
