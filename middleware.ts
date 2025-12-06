import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /superadmin routes (Emergency Access - Basic Auth)
    if (pathname.startsWith('/superadmin') || pathname.startsWith('/api/superadmin')) {
        const authHeader = request.headers.get('authorization');

        if (authHeader) {
            const [scheme, credentials] = authHeader.split(' ');
            if (scheme === 'Basic' && credentials) {
                const decoded = atob(credentials);
                const [user, pass] = decoded.split(':');

                if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
                    return applySecurityHeaders(NextResponse.next());
                }
            }
        }

        return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Emergency Superadmin"',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
            },
        });
    }

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('returnUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            // Valid token, allow access
            return applySecurityHeaders(NextResponse.next());
        } catch (error) {
            // Invalid token
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('returnUrl', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('auth-token');
            return applySecurityHeaders(response);
        }
    }

    return applySecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: ['/admin/:path*', '/superadmin/:path*'],
};
