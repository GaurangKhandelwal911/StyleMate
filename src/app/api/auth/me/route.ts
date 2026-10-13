import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const prefs = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        gender: user.gender || prefs?.gender || "Masculine / Men's silhouettes",
        complexion: user.complexion || prefs?.complexion || 'Deep with rich undertones',
        height: user.height || prefs?.height || "5'10\" – 6'1\" (178 – 185 cm)",
        preferredStyles: JSON.parse(prefs?.preferredStyles || '["Smart Casual", "Casual", "Minimal"]'),
        preferredColors: JSON.parse(prefs?.preferredColors || '["White", "Navy", "Black", "Beige", "Olive"]'),
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch current user' }, { status: 500 });
  }
}
