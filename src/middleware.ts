import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // Lazy load auth to prevent initialization issues at top level
  const { auth } = await import("@/auth");
  const session = await auth();
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude internal paths
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Subdomain detection logic
  let subdomain = '';
  
  if (hostname.includes('team-goals.com')) {
    const hostParts = hostname.split('.');
    // If it's something.team-goals.com
    if (hostParts.length >= 3) {
      const sub = hostParts[0].toLowerCase();
      if (sub === 'www') {
        return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://team-goals.com'));
      }
      if (sub !== 'team-goals') {
        subdomain = sub;
      }
    }
  } else if (hostname.includes('.pages.dev')) {
    // Optional: for preview URLs, maybe default to nspg or just no subdomain
    // Let's keep it empty for preview URLs to see the marketing page by default
  }

  // Path-based fallback detection (team-goals.com/nspg)
  if (!subdomain && url.pathname !== '/') {
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
      const potentialSub = pathParts[1].toLowerCase();
      const reserved = ['api', 'admin', 'onboarding', 'favicon.ico', '_next', 'static', 'master'];
      if (!reserved.includes(potentialSub)) {
        subdomain = potentialSub;
      }
    }
  }

  // Pass subdomain to header for the app to use
  const requestHeaders = new Headers(request.headers);
  if (subdomain) {
    requestHeaders.set('x-realtor-subdomain', subdomain);
  } else {
    requestHeaders.set('x-realtor-subdomain', 'demo'); // Fallback for marketing page
  }

  // Route protection
  const isAdminRoute = url.pathname.includes('/admin') || (subdomain && url.pathname.startsWith(`/${subdomain}/admin`));
  const isLoginPage = url.pathname.includes('/login') || (subdomain && url.pathname.startsWith(`/${subdomain}/admin/login`));
  const isPublicAdminRoute = url.pathname.includes('/forgot-password') || url.pathname.includes('/reset-password');
  const isMasterRoute = url.pathname.startsWith('/master');

  // Master Route Protection
  if (isMasterRoute && !isLoginPage) {
    const adminEmails = ['phillsimpson@gmail.com'];
    if (!session || !session.user || !adminEmails.includes(session.user.email || '')) {
       return NextResponse.redirect(new URL('/master/login', request.url));
    }
  }

  if (isAdminRoute && !isLoginPage && !isPublicAdminRoute && !session) {
    return NextResponse.redirect(new URL(subdomain ? `/${subdomain}/admin/login` : '/admin/login', request.url));
  }

  // Rewrite if we detected a subdomain and we're not already on the subdomain path
  let response: NextResponse;
  if (subdomain && !url.pathname.startsWith(`/${subdomain}`)) {
    url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
