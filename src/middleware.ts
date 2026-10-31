import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isAdminPath = pathname.startsWith('/admin');

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/roadmap/:path*',
    '/learn/:path*',
    '/vocab/:path*',
    '/tutor/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/placement/:path*',
    '/admin/:path*',
  ],
};
