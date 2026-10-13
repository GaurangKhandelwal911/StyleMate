import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, gender, complexion, height } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: name.trim(),
        gender: gender || "Masculine / Men's silhouettes",
        complexion: complexion || 'Deep with rich undertones',
        height: height || "5'10\" – 6'1\" (178 – 185 cm)",
      },
      create: {
        name: name.trim(),
        email: normalizedEmail,
        gender: gender || "Masculine / Men's silhouettes",
        complexion: complexion || 'Deep with rich undertones',
        height: height || "5'10\" – 6'1\" (178 – 185 cm)",
        avatarUrl: null,
      },
    });

    // Upsert User Preferences
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        gender: user.gender,
        complexion: user.complexion,
        height: user.height,
      },
      create: {
        userId: user.id,
        gender: user.gender || 'Masculine',
        complexion: user.complexion || 'Deep with rich undertones',
        height: user.height || "5'10\" – 6'1\" (178 – 185 cm)",
        preferredStyles: JSON.stringify(['Smart Casual', 'Casual', 'Minimal']),
        preferredColors: JSON.stringify(['White', 'Navy', 'Black', 'Beige', 'Olive']),
        dislikedColors: JSON.stringify([]),
      },
    });

    // Check if new user has closet items; if 0, copy over base wardrobe items so they have an immediate experience
    const itemCount = await prisma.closetItem.count({
      where: { userId: user.id },
    });

    if (itemCount === 0) {
      // Find template items from default user or create starter items
      const templateUser = await prisma.user.findFirst({
        where: { email: 'aryan@example.com' },
        include: { items: true },
      });

      if (templateUser && templateUser.items.length > 0) {
        for (const item of templateUser.items) {
          await prisma.closetItem.create({
            data: {
              userId: user.id,
              name: item.name,
              category: item.category,
              type: item.type,
              color: item.color,
              pattern: item.pattern,
              material: item.material,
              fit: item.fit,
              style: item.style,
              occasions: item.occasions,
              seasons: item.seasons,
              brand: item.brand,
              status: item.status,
              unavailableReason: item.unavailableReason,
              unavailableUntil: item.unavailableUntil,
              notes: item.notes,
              imageUrl: item.imageUrl,
              isFavorite: item.isFavorite,
              wearCount: 0,
            },
          });
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Welcome to StyleMate, ${user.name}! Your styling preferences are set.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        complexion: user.complexion,
        height: user.height,
      },
    });

    // Set session cookie
    response.cookies.set('stylemate_user_id', user.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error during onboarding registration:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
