import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('session')?.value;
  const payload = await decrypt(session);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(payload);
}
