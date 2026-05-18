import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getDatabase } from './../../../utils/db';

export async function POST(req) {
  const { email, password } = await req.json();
  const db = getDatabase();
  
  if (!db.users) db.users = [];

  let role = 'user';
  let name = 'Customer';

  // 1. Check Hardcoded Admin Credentials First
  if (email === 'afroj@admin.com' && password === '12341234') {
    role = 'admin';
    name = 'Afroj (Admin)';
  } else {
    // 2. Check Standard Database Users
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    
    role = user.role || 'user'; // If they were promoted, this will apply 'admin'
    name = user.name;
  }

  // Generate a single unified token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
  const token = await new SignJWT({ role, email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const response = NextResponse.json({ success: true, role });
  response.cookies.set('user_token', token, { httpOnly: true, path: '/' });
  
  return response;
}