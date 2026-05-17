import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getDatabase } from './../../../utils/db';

export async function GET(req) {
  const token = req.cookies.get('user_token')?.value;

  if (!token) return NextResponse.json({ orders: [] }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    // Find only the orders that match this user's email
    const db = getDatabase();
    const userOrders = db.orders.filter(order => order.email === payload.email);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }
}