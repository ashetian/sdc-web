import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // /admin rotası için her istekte auth zorunlu
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Paneli"',
        },
      });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Paneli"',
        },
      });
    }
  }

  // /api altındaki POST, PUT, DELETE istekleri için auth zorunlu
  if (
    pathname.startsWith('/api') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  ) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="API"',
        },
      });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new NextResponse(null, {
        status: 403,
        headers: {
          'WWW-Authenticate': 'Basic realm="API"',
        },
      });
    }
  }

  return NextResponse.next();
} 