import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req) {
    const { email, password } = await req.json();

    // UPDATED: New Admin Credentials
    if (email === 'afroj@admin.com' && password === '12341234') {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
        
        // Added name: 'Afroj' so the avatar can extract the 'A'
        const token = await new SignJWT({ role: 'admin', email, name: 'Afroj' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('admin_token', token, { httpOnly: true, path: '/' });
        return response;
    }
    
    return NextResponse.json({ message: 'Wrong email or password' }, { status: 401 });
}