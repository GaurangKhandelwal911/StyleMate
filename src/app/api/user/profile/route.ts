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

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      gender: user.gender || prefs?.gender || 'Masculine',
      complexion: user.complexion || prefs?.complexion || 'Deep with rich undertones',
      height: user.height || prefs?.height || "5'10\" – 6'1\" (178 – 185 cm)",
      preferredStyles: JSON.parse(prefs?.preferredStyles || '["Smart Casual", "Casual", "Minimal"]'),
      preferredColors: JSON.parse(prefs?.preferredColors || '["White", "Navy", "Black", "Beige", "Olive"]'),
      dislikedColors: JSON.parse(prefs?.dislikedColors || '[]'),
      preferredFit: prefs?.preferredFit || 'Regular',
      otherPreferences: prefs?.otherPreferences || null,
    };

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();

    const {
      name,
      gender,
      complexion,
      height,
      preferredStyles,
      preferredColors,
      dislikedColors,
      preferredFit,
      otherPreferences,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(gender ? { gender } : {}),
        ...(complexion ? { complexion } : {}),
        ...(height ? { height } : {}),
      },
    });

    const updatedPrefs = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        ...(gender ? { gender } : {}),
        ...(complexion ? { complexion } : {}),
        ...(height ? { height } : {}),
        ...(preferredStyles ? { preferredStyles: JSON.stringify(preferredStyles) } : {}),
        ...(preferredColors ? { preferredColors: JSON.stringify(preferredColors) } : {}),
        ...(dislikedColors ? { dislikedColors: JSON.stringify(dislikedColors) } : {}),
        ...(preferredFit ? { preferredFit } : {}),
        ...(otherPreferences !== undefined ? { otherPreferences } : {}),
      },
      create: {
        userId: user.id,
        gender: gender || 'Masculine',
        complexion: complexion || 'Deep with rich undertones',
        height: height || "5'10\" – 6'1\" (178 – 185 cm)",
        preferredStyles: JSON.stringify(preferredStyles || ['Smart Casual', 'Casual', 'Minimal']),
        preferredColors: JSON.stringify(preferredColors || ['White', 'Navy', 'Black', 'Beige', 'Olive']),
        dislikedColors: JSON.stringify(dislikedColors || []),
        preferredFit: preferredFit || 'Regular',
        otherPreferences: otherPreferences || null,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        gender: updatedUser.gender || 'Masculine',
        complexion: updatedUser.complexion || 'Deep with rich undertones',
        height: updatedUser.height || "5'10\" – 6'1\" (178 – 185 cm)",
        preferredStyles: JSON.parse(updatedPrefs.preferredStyles),
        preferredColors: JSON.parse(updatedPrefs.preferredColors),
        dislikedColors: JSON.parse(updatedPrefs.dislikedColors),
        preferredFit: updatedPrefs.preferredFit,
        otherPreferences: updatedPrefs.otherPreferences,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user profile' }, { status: 500 });
  }
}
