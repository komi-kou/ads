import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/me',
  ];
  
  // Skip static assets
  if (path.startsWith('/_next/') || path.startsWith('/static/') || path === '/favicon.ico') {
    return NextResponse.next();
  }
  
  // Check if path is public
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }
  
  // Get token from cookie or Authorization header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/api/meta') || 
                           path.startsWith('/api/google') ||
                           path.startsWith('/api/data') ||
                           path.startsWith('/api/accounts');
  
  if (isProtectedRoute) {
    // Check if user has auth token
    if (!token) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Token exists, pass it to the application for verification
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-auth-token', token);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};