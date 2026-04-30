import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculatePointsFromStats, calculateLevel } from '@/lib/gamification';

export async function GET() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = payload.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { withdrawals: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Calculate base points from stats
  const statsPoints = calculatePointsFromStats(user.totalInvestment, user.profit);
  
  // Daily login logic
  const now = new Date();
  const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
  let newDailyPointsEarned = user.dailyPointsEarned;
  let shouldUpdate = false;

  if (!lastLogin || lastLogin.toDateString() !== now.toDateString()) {
    // New day login
    newDailyPointsEarned += 10; // 10 points for daily login
    shouldUpdate = true;
  }

  const totalPoints = statsPoints + newDailyPointsEarned;
  const currentLevel = calculateLevel(totalPoints);

  if (shouldUpdate || currentLevel.name !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginDate: now,
        dailyPointsEarned: newDailyPointsEarned,
        level: currentLevel.name,
        loyaltyPoints: totalPoints
      }
    });
  }

  return NextResponse.json({
    ...user,
    loyaltyPoints: totalPoints,
    level: currentLevel.name
  });
}
