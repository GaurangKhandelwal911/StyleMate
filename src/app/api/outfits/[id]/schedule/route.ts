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
    const { plannedDate } = body;

    const outfit = await prisma.outfit.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!outfit) {
      return NextResponse.json({ success: false, error: 'Outfit not found' }, { status: 404 });
    }

    const updated = await prisma.outfit.update({
      where: { id: params.id },
      data: {
        plannedDate: plannedDate ? new Date(plannedDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      plannedDate: updated.plannedDate,
    });
  } catch (error) {
    console.error('Error scheduling outfit:', error);
    return NextResponse.json({ success: false, error: 'Failed to schedule outfit' }, { status: 500 });
  }
}
