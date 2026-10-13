import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const normalizedEmail = (email || 'aryan@example.com').trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // If user doesn't exist, create a clean starter profile
      const defaultName = normalizedEmail.split('@')[0];
      const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      user = await prisma.user.create({
        data: {
          name: capitalized,
          email: normalizedEmail,
          gender: "Masculine / Men's silhouettes",
          complexion: 'Deep with rich undertones',
          height: "5'10\" – 6'1\" (178 – 185 cm)",
        },
      });

      await prisma.userPreference.create({
        data: {
          userId: user.id,
          gender: user.gender,
          complexion: user.complexion,
          height: user.height,
          preferredStyles: JSON.stringify(['Smart Casual', 'Casual', 'Minimal']),
          preferredColors: JSON.stringify(['White', 'Navy', 'Black', 'Beige', 'Olive']),
          dislikedColors: JSON.stringify([]),
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
        complexion: user.complexion,
        height: user.height,
      },
    });

    // Set persistent session cookie (30 days)
    response.cookies.set('stylemate_user_id', user.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
