import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in-memory, resets on server restart)
// For production with multiple instances, consider using Redis
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Get credentials from environment (no fallbacks for security)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (behind proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return false;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempts.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now - attempts.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

function validateCredentials(request: NextRequest): { valid: boolean; shouldRecordFailure: boolean } {
  // Check if credentials are configured
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('SECURITY ERROR: ADMIN_USERNAME or ADMIN_PASSWORD not configured!');
    return { valid: false, shouldRecordFailure: false };
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { valid: false, shouldRecordFailure: false };
  }

  try {
    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic' || !credentials) {
      return { valid: false, shouldRecordFailure: true };
    }

    const decoded = Buffer.from(credentials, 'base64').toString();
    const [username, password] = decoded.split(':');

    // Use timing-safe comparison to prevent timing attacks
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = password === ADMIN_PASSWORD;

    if (usernameMatch && passwordMatch) {
      return { valid: true, shouldRecordFailure: false };
    }

    return { valid: false, shouldRecordFailure: true };
  } catch {
    return { valid: false, shouldRecordFailure: true };
  }
}

function createUnauthorizedResponse(message?: string): NextResponse {
  return new NextResponse(message || null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Paneli"',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}

function createForbiddenResponse(message: string): NextResponse {
  return new NextResponse(message, {
    status: 403,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const clientIP = getClientIP(request);

  // Check for rate limiting on protected routes
  if (pathname.startsWith('/admin') || (pathname.startsWith('/api') && method !== 'GET')) {
    if (isRateLimited(clientIP)) {
      const remainingTime = Math.ceil(RATE_LIMIT_WINDOW_MS / 60000);
      return createForbiddenResponse(
        `Çok fazla başarısız giriş denemesi. Lütfen ${remainingTime} dakika sonra tekrar deneyin.`
      );
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const { valid, shouldRecordFailure } = validateCredentials(request);

    if (!valid) {
      if (shouldRecordFailure) {
        recordFailedAttempt(clientIP);
      }
      return createUnauthorizedResponse();
    }

    // Successful login - clear rate limit
    clearAttempts(clientIP);
  }

  // Protect API write operations
  if (
    pathname.startsWith('/api') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  ) {
    // Allow registration endpoint (public)
    if (pathname.startsWith('/api/registrations') && method === 'POST') {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow applicant submission (public - department applications)
    if (pathname.startsWith('/api/applicants') && method === 'POST') {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow election voting endpoints (public)
    if (pathname.match(/^\/api\/elections\/[^/]+\/(verify|vote)$/) && method === 'POST') {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow auth endpoints (public)
    if (pathname.startsWith('/api/auth')) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow comments endpoints (uses JWT authentication, not Basic Auth)
    if (pathname.startsWith('/api/comments')) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow projects endpoints (uses JWT authentication for user actions)
    if (pathname.startsWith('/api/projects')) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Allow uploads only from admin context (check referer) or with auth
    if (pathname.startsWith('/api/upload')) {
      const referer = request.headers.get('referer') || '';
      const isFromAdmin = referer.includes('/admin');
      const isFromRegistration = referer.includes('/register');

      if (isFromAdmin || isFromRegistration) {
        // Allow if coming from admin or registration page
        const response = NextResponse.next();
        return addSecurityHeaders(response);
      }

      // Otherwise require auth
      const { valid, shouldRecordFailure } = validateCredentials(request);
      if (!valid) {
        if (shouldRecordFailure) {
          recordFailedAttempt(clientIP);
        }
        return createUnauthorizedResponse();
      }
    } else {
      // Other API write operations require auth
      // Allow if coming from admin pages (already authenticated via Basic Auth to access those pages)
      const referer = request.headers.get('referer') || '';
      const isFromAdmin = referer.includes('/admin');

      if (isFromAdmin) {
        const response = NextResponse.next();
        return addSecurityHeaders(response);
      }

      const { valid, shouldRecordFailure } = validateCredentials(request);

      if (!valid) {
        if (shouldRecordFailure) {
          recordFailedAttempt(clientIP);
        }
        return createUnauthorizedResponse();
      }

      clearAttempts(clientIP);
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};