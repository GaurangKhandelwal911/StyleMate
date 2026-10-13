import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    let notes: string | undefined;

    try {
      const body = await req.json();
      notes = body.notes;
    } catch {
      // Body is optional
    }

    const outfit = await prisma.outfit.findFirst({
      where: { id: params.id, userId: user.id },
      include: { items: true },
    });

    if (!outfit) {
      return NextResponse.json({ success: false, error: 'Outfit not found' }, { status: 404 });
    }

    const wornAt = new Date();

    // 1. Mark outfit as worn
    await prisma.outfit.update({
      where: { id: params.id },
      data: { isWorn: true },
    });

    // 2. Create history log
    const historyEntry = await prisma.outfitHistory.create({
      data: {
        userId: user.id,
        outfitId: outfit.id,
        wornAt,
        notes: notes || `Worn on ${wornAt.toLocaleDateString()}`,
      },
    });

    // 3. Increment wearCount and update lastWornAt for all constituent items
    const itemIds = outfit.items.map((i) => i.closetItemId);
    await prisma.closetItem.updateMany({
      where: { id: { in: itemIds } },
      data: {
        wearCount: { increment: 1 },
        lastWornAt: wornAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Outfit recorded as worn. Wardrobe statistics updated.',
      history: historyEntry,
    });
  } catch (error) {
    console.error('Error recording outfit as worn:', error);
    return NextResponse.json({ success: false, error: 'Failed to record outfit as worn' }, { status: 500 });
  }
}
