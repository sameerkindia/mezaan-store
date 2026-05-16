import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    // Delete the cookie to log out
    response.cookies.delete('admin_token');
    return response;
}