import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Database session strategy: we only check for presence of session cookie.
  const sessionCookie = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
  const authenticated = Boolean(sessionCookie);

  // Public paths (including home page now)
  const publicPaths = ['/', '/login', '/register'];
  const pathname = request.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(pathname);

  // Check if user is trying to access API routes or static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // If user is not logged in and tries to access protected route (candidate/recruiter)
  if (!authenticated && (pathname.startsWith('/candidate') || pathname.startsWith('/recruiter'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // NOTE: Role-specific enforcement is now handled in the server route components.
  // Middleware only ensures authentication for protected areas.

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except api routes, static files, and images
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
