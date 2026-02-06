import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Route-specific rate limit configs
const AUTH_ROUTES: Record<string, { windowMs: number; maxRequests: number; name: string }> = {
  '/api/auth/register': { windowMs: 15 * 60 * 1000, maxRequests: 5, name: 'register' },
  '/api/mobile/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 10, name: 'mobile-login' },
  '/api/auth/verify-credentials': { windowMs: 15 * 60 * 1000, maxRequests: 10, name: 'verify-credentials' },
};

const API_LIMIT = { windowMs: 60 * 1000, maxRequests: 100, name: 'api' };

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip NextAuth's internal routes
  if (pathname.startsWith('/api/auth/') && !AUTH_ROUTES[pathname]) {
    return NextResponse.next();
  }

  const ip = getIP(request);
  const config = AUTH_ROUTES[pathname] || API_LIMIT;
  const result = checkRateLimit(config.name, ip, config);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter || 60),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
