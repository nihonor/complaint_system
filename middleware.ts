import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register'];
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // If no token is present, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Role-based access control
    const { pathname } = request.nextUrl;

    // Admin routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Agency routes
    if (pathname.startsWith('/agency') && role !== 'AGENCY_OFFICIAL') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // User routes
    if (pathname.startsWith('/dashboard') && role !== 'USER') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agency/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}; 