import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function getOrCreateDefaultUser() {
  try {
    const cookieStore = cookies();
    const sessionUserId = cookieStore.get('stylemate_user_id')?.value;
    if (sessionUserId) {
      const existing = await prisma.user.findUnique({
        where: { id: sessionUserId },
      });
      if (existing) return existing;
    }
  } catch {
    // If called outside request header context, fall through
  }

  // Pick the most recently active / updated user who isn't the initial seed placeholder
  const activeUser = await prisma.user.findFirst({
    where: {
      email: { not: 'aryan@example.com' },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (activeUser) return activeUser;

  // Otherwise, find any existing user
  const anyUser = await prisma.user.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  if (anyUser) return anyUser;

  // Fallback for fresh unseeded database
  return await prisma.user.create({
    data: {
      name: 'Style Explorer',
      email: 'user@example.com',
      gender: "Masculine / Men's silhouettes",
      complexion: 'Deep with rich undertones',
      height: "5'10\" – 6'1\" (178 – 185 cm)",
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });
}
