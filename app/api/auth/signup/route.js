import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req) {
  const { name, email, password } = await req.json();

  // Validate input
  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { message: 'Full name, email, and 6+ char password required' }, 
      { status: 400 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
  
  // Include full name in the token
  const token = await new SignJWT({ role: 'user', email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const response = NextResponse.json({ success: true, user: { name, email } });
  
  // Set the cookie
  response.cookies.set('user_token', token, { 
    httpOnly: true, 
    path: '/' 
  });
  
  return response;
}