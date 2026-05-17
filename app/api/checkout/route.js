import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jwtVerify } from 'jose';

// FIX: Both getDatabase AND saveDatabase are now imported!
import { getDatabase, saveDatabase } from './../../utils/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const userToken = req.cookies.get('user_token')?.value;

  if (!userToken) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    // 1. Get the logged-in user's details from the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(userToken, secret);
    const userEmail = payload.email;
    const userName = payload.name;

    const { cartItems } = await req.json();
    let orderTotal = 0;

    // 2. Format items for Stripe & Calculate Total
    const lineItems = cartItems.map(item => {
      orderTotal += (item.basePrice * item.quantity);
      return {
        price_data: {
          currency: 'inr',
          product_data: { name: item.name },
          unit_amount: item.basePrice * 100, // Stripe uses paise
        },
        quantity: item.quantity,
      };
    });

    // 3. Save Order to data.json
    const db = getDatabase();
    
    // SAFETY CHECK: Make sure orders array exists!
    if (!db.orders) db.orders = [];

    const newOrder = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`, // Generate random #1234 ID
      customer: userName || userEmail,
      email: userEmail,
      items: cartItems,
      total: orderTotal,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    
    db.orders.push(newOrder);
    saveDatabase(db);

    // 4. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/cart?success=true`,
      cancel_url: `${req.headers.get('origin')}/cart?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}