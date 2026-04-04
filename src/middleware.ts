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

  // Get subdomain (e.g., 'nspg' from 'nspg.realtordash.com')
  // For local development, we can use a query param or a header
  let subdomain = '';
  if (hostname.includes('.pages.dev')) {
     // realtor-dashboard.pages.dev -> check if there's a prefix
     // This is tricky on pages.dev without custom domains.
     // For now, let's assume it's passed via header or fallback to 'nspg'
     subdomain = 'nspg'; 
  } else if (hostname.includes('.')) {
    subdomain = hostname.split('.')[0];
  }

  if (!subdomain || subdomain === 'www' || subdomain === 'realtor-dashboard') {
    subdomain = 'nspg'; // Default fallback for now
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
