import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: 'USER',
      investorName: data.investorName,
      investmentStartDate: data.investmentStartDate ? new Date(data.investmentStartDate) : null,
      totalInvestment: Number(data.totalInvestment) || 0,
      status: data.status || 'نشط',
      profit: Number(data.profit) || 0,
      bankFullName: data.bankFullName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      bankName: data.bankName || null,
      rib: data.rib || null,
    }
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const updateData: any = {
    username: data.username,
    investorName: data.investorName,
    investmentStartDate: data.investmentStartDate ? new Date(data.investmentStartDate) : null,
    totalInvestment: Number(data.totalInvestment) || 0,
    status: data.status || 'نشط',
    profit: Number(data.profit) || 0,
    bankFullName: data.bankFullName || null,
    bankAccountNumber: data.bankAccountNumber || null,
    bankName: data.bankName || null,
    rib: data.rib || null,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: data.id },
    data: updateData
  });

  return NextResponse.json(user);
}

export async function DELETE(request: Request) {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
