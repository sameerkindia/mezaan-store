import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    
    // Delete BOTH possible cookies to completely sign the person out
    response.cookies.delete('user_token');
    response.cookies.delete('admin_token');
    
    return response;
}