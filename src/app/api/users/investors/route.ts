import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = cookies().get('session')?.value;
    const payload = await decrypt(session);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = payload.id as string;

    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        investorName: true,
        investmentStartDate: true,
        totalInvestment: true,
        status: true,
        profit: true,
      },
    });

    const maskedUsers = allUsers.map(user => {
      if (user.id === currentUserId) {
        return user; // Return full details for current user
      }

      // Mask other users
      const name = user.investorName || '';
      const maskedName = name.length > 2 ? name.substring(0, 2) + '*'.repeat(name.length - 2) : name + '*';
      
      const invStr = user.totalInvestment.toString();
      const maskedInv = invStr.length > 2 ? invStr.substring(0, 2) + '*'.repeat(invStr.length - 2) : invStr;
      
      const profStr = user.profit.toString();
      const maskedProf = profStr.length > 2 ? profStr.substring(0, 2) + '*'.repeat(profStr.length - 2) : profStr;

      return {
        id: user.id,
        investorName: maskedName,
        investmentStartDate: user.investmentStartDate,
        totalInvestment: maskedInv,
        status: user.status,
        profit: maskedProf,
      };
    });

    return NextResponse.json(maskedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
