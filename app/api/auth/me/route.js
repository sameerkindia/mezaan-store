import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getDatabase } from './../../../utils/db';

export async function GET(req) {
    const userToken = req.cookies.get('user_token')?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

    try {
        if (userToken) {
            const { payload } = await jwtVerify(userToken, secret);
            
            // Fetch live user data from data.json to check ban status
            const db = getDatabase();
            const dbUser = db.users?.find(u => u.email === payload.email);
            
            return NextResponse.json({ 
                user: { 
                    email: payload.email, 
                    name: payload.name || payload.email, 
                    role: payload.role,
                    banUntil: dbUser?.banUntil || null // Pass live ban status to the frontend
                } 
            });
        }
    } catch (error) {
        // Token is invalid or expired
    }

    return NextResponse.json({ user: null }, { status: 401 });
}