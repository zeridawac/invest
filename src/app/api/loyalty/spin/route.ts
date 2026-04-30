import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const POSSIBLE_POINTS = [5, 10, 20, 50, 100, 200];

export async function POST() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = payload.id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date();
  const lastSpin = user.lastSpinDate ? new Date(user.lastSpinDate) : null;
  
  let spinsUsedToday = user.spinsUsedToday;

  // Reset spins if last spin was on a different day
  if (!lastSpin || lastSpin.toDateString() !== now.toDateString()) {
    spinsUsedToday = 0;
  }

  if (spinsUsedToday >= 2) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 400 });
  }

  // Generate random result
  // We can weigh these if we want, but let's keep it simple for now
  const pointsWon = POSSIBLE_POINTS[Math.floor(Math.random() * POSSIBLE_POINTS.length)];

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      loyaltyPoints: { increment: pointsWon },
      spinsUsedToday: spinsUsedToday + 1,
      lastSpinDate: now,
    }
  });

  return NextResponse.json({
    pointsWon,
    newTotal: updatedUser.loyaltyPoints,
    spinsUsedToday: updatedUser.spinsUsedToday
  });
}
