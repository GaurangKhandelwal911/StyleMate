import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { status, reason, untilDate } = body;

    const item = await prisma.closetItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    if (status !== 'AVAILABLE' && status !== 'TEMPORARILY_UNAVAILABLE') {
      return NextResponse.json({ success: false, error: 'Invalid availability status' }, { status: 400 });
    }

    const updated = await prisma.closetItem.update({
      where: { id: params.id },
      data: {
        status,
        unavailableReason: status === 'TEMPORARILY_UNAVAILABLE' ? reason || 'Unavailable' : null,
        unavailableUntil: status === 'TEMPORARILY_UNAVAILABLE' && untilDate ? new Date(untilDate) : null,
      },
    });

    // Close any previous active availability record if becoming available
    if (status === 'AVAILABLE') {
      await prisma.availabilityRecord.updateMany({
        where: {
          closetItemId: params.id,
          endDate: null,
        },
        data: {
          endDate: new Date(),
        },
      });
    } else {
      // Record new unavailability session
      await prisma.availabilityRecord.create({
        data: {
          closetItemId: params.id,
          status: 'TEMPORARILY_UNAVAILABLE',
          reason: reason || 'Temporarily Unavailable',
          startDate: new Date(),
          endDate: untilDate ? new Date(untilDate) : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      item: {
        ...updated,
        occasions: JSON.parse(updated.occasions),
        seasons: JSON.parse(updated.seasons),
      },
    });
  } catch (error) {
    console.error('Error updating availability status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update availability' }, { status: 500 });
  }
}
