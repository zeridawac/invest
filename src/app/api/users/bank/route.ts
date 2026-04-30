import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: {
      bankFullName: true,
      bankAccountNumber: true,
      bankName: true,
      rib: true,
    }
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  
  if (!data.rib) {
    return NextResponse.json({ error: 'RIB is required' }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: payload.id as string },
    data: {
      bankFullName: data.bankFullName,
      bankAccountNumber: data.bankAccountNumber,
      bankName: data.bankName,
      rib: data.rib,
    }
  });

  return NextResponse.json({ success: true });
}
