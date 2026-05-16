import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const userToken = req.cookies.get('user_token')?.value;

    if (!userToken) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    try {
        const { cartItems } = await req.json();

        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: { name: item.name },
                unit_amount: item.basePrice * 100, 
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/cart?success=true`,
            cancel_url: `${req.headers.get('origin')}/cart?canceled=true`,
        });

        // NEW: Return the full URL instead of just the ID
        return NextResponse.json({ url: session.url });
        
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}