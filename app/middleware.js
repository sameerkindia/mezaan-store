import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Only protect the /admin pages (but let them see the login page)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = req.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (err) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }
    return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };