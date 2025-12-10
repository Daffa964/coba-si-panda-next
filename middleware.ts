import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Get the session ID from the cookie
  const sessionId = request.cookies.get(auth.sessionCookieName)?.value;

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isPublicPath && !sessionId) {
    // Redirect to login if not authenticated and trying to access protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicPath && sessionId) {
    // If user is logged in and on public path, redirect to dashboard
    const { session } = await auth.validateSession(sessionId);
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Validate session for protected routes
  if (!isPublicPath && sessionId) {
    const { session } = await auth.validateSession(sessionId);
    if (!session) {
      // If session is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};