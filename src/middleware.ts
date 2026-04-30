import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const payload = await decrypt(session);

  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname === '/login' || pathname.startsWith('/api/auth/login')) {
    if (payload) {
      if (payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin only paths
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname.startsWith('/api/users') && payload.role !== 'ADMIN' && !pathname.startsWith('/api/users/investors') && !pathname.startsWith('/api/users/bank')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // User only paths
  if (pathname.startsWith('/dashboard') && payload.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/bank-info/:path*', '/api/users/:path*', '/api/withdrawals/:path*', '/login'],
};
