import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let withdrawals;
  if (payload.role === 'ADMIN') {
    withdrawals = await prisma.withdrawal.findMany({
      include: { user: { select: { username: true, investorName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    withdrawals = await prisma.withdrawal.findMany({
      where: { userId: payload.id as string },
      orderBy: { createdAt: 'desc' }
    });
  }

  return NextResponse.json(withdrawals);
}

export async function POST(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await request.json();
  
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'مبلغ السحب غير صحيح' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id as string } });
  
  if (!user || user.profit < amount) {
    return NextResponse.json({ error: 'الرصيد غير كافٍ' }, { status: 400 });
  }
  
  if (!user.rib) {
    return NextResponse.json({ error: 'يرجى إكمال معلوماتك البنكية أولاً' }, { status: 400 });
  }

  // Deduct profit and create withdrawal
  const withdrawal = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { profit: user.profit - amount }
    }),
    prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount: amount,
        bankFullName: user.bankFullName || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankName: user.bankName || '',
        rib: user.rib,
        status: 'قيد الانتظار'
      }
    })
  ]);

  return NextResponse.json({ success: true, withdrawal: withdrawal[1] });
}

export async function PUT(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, adminNote } = await request.json();

  const withdrawal = await prisma.withdrawal.update({
    where: { id },
    data: { status, adminNote }
  });

  return NextResponse.json({ success: true, withdrawal });
}
