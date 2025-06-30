import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin', '/profile', '/properties/create'];
const adminRoutes = ['/admin'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for certain paths to avoid issues
  if (pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/debug') ||
      pathname.startsWith('/test')) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  const userData = request.cookies.get('user_data')?.value;

  let userRole: string | null = null;
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userRole = user.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If route requires admin access and user is not admin, redirect to user dashboard
  if (isAdminRoute && token && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue (removed the auth page redirect to avoid loops)
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
