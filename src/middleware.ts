import { NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = '/login';
const DASHBOARD_REDIRECT = '/dashboard';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;
  const isAuthenticated = !!token;

  if (pathname === LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(DASHBOARD_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analytics/:path*', '/keys/:path*', '/users/:path*', '/settings/:path*', '/login'],
};
