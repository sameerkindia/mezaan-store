import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req) {
    const { email, password } = await req.json();

    // Mock check: As long as they provide an email and a 6+ char password, let them in.
    if (email && password.length >= 6) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
        const token = await new SignJWT({ role: 'user', email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('user_token', token, { httpOnly: true, path: '/' });
        
        return response;
    }
    
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
}