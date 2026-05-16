import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req) {
    const userToken = req.cookies.get('user_token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

    try {
        // 1. Check if an Admin is logged in first
        if (adminToken) {
            const { payload } = await jwtVerify(adminToken, secret);
            return NextResponse.json({ 
                user: { email: payload.email, name: payload.name || 'Admin', role: payload.role } 
            });
        }
        
        // 2. If not admin, check if a standard User is logged in
        if (userToken) {
            const { payload } = await jwtVerify(userToken, secret);
            return NextResponse.json({ 
                user: { email: payload.email, name: payload.name || payload.email, role: payload.role } 
            });
        }
    } catch (error) {
        // Token is invalid or expired
    }

    return NextResponse.json({ user: null }, { status: 401 });
}