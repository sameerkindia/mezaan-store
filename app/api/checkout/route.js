import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jwtVerify } from 'jose';
import { getDatabase, saveDatabase } from './../../utils/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const userToken = req.cookies.get('user_token')?.value;

  if (!userToken) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(userToken, secret);
    const userEmail = payload.email;
    const userName = payload.name;

    // --- BAN ENFORCEMENT CHECK ---
    const db = getDatabase();
    if (!db.users) db.users = [];
    const dbUser = db.users.find(u => u.email === userEmail);
    
    // Check if ban timestamp exists and is in the future
    if (dbUser && dbUser.banUntil && dbUser.banUntil > Date.now()) {
      const hoursLeft = Math.ceil((dbUser.banUntil - Date.now()) / (1000 * 60 * 60));
      return NextResponse.json({ 
        error: `Your account is banned from ordering. Try again in ${hoursLeft} hours.` 
      }, { status: 403 }); 
    }
    // ----------------------------

    const { cartItems } = await req.json();
    let orderTotal = 0;

    const lineItems = cartItems.map(item => {
      orderTotal += (item.basePrice * item.quantity);
      return {
        price_data: {
          currency: 'inr',
          product_data: { name: item.name },
          unit_amount: item.basePrice * 100,
        },
        quantity: item.quantity,
      };
    });

    if (!db.orders) db.orders = [];

    const newOrder = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customer: userName || userEmail,
      email: userEmail,
      items: cartItems,
      total: orderTotal,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };
    
    db.orders.push(newOrder);
    saveDatabase(db);

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