import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude internal paths
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/onboarding')
  ) {
    return NextResponse.next();
  }

  // Priority 1: Subdomain (e.g., 'nspg' from 'nspg.team-goals.com')
  let subdomain = '';
  if (hostname.includes('.pages.dev')) {
     subdomain = 'nspg'; 
  } else if (hostname.includes('team-goals.com')) {
    const parts = hostname.split('.team-goals.com')[0];
    if (parts && parts !== 'www') {
      subdomain = parts;
    }
  }

  // Priority 2: Path-based fallback (e.g., 'team-goals.com/nspg')
  // This helps if they don't have wildcard DNS setup yet
  if (!subdomain) {
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && 
        !['api', 'admin', 'onboarding', 'favicon.ico', '_next', 'static'].includes(pathParts[1])) {
      subdomain = pathParts[1];
    }
  }

  // Default fallback
  if (!subdomain) {
    subdomain = 'demo';
  }

  // Pass the subdomain to the app via a header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-realtor-subdomain', subdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

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
