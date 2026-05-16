import { NextResponse } from 'next/server';

// Global memory acts as a database while your server is running
global.products = global.products || [
    { id: 1, name: "POP Channel 0.45mm", price: 120, stock: 450 },
    { id: 2, name: "POP Channel 0.55mm", price: 150, stock: 200 }
];

global.orders = global.orders || [
    { id: '#1001', customer: 'Rahul Sharma', total: 4500, status: 'Pending', date: new Date().toLocaleDateString() },
    { id: '#1002', customer: 'Amit Patel', total: 12000, status: 'Shipped', date: new Date().toLocaleDateString() }
];

export async function GET() {
    return NextResponse.json({ products: global.products, orders: global.orders });
}

export async function POST(req) {
    const { action, payload } = await req.json();

    if (action === 'ADD_PRODUCT') {
        global.products.push({ ...payload, id: Date.now(), stock: 100 });
    }
    if (action === 'EDIT_PRODUCT') {
        global.products = global.products.map(p => p.id === payload.id ? { ...p, ...payload } : p);
    }
    if (action === 'DELETE_PRODUCT') {
        global.products = global.products.filter(p => p.id !== payload.id);
    }
    if (action === 'UPDATE_ORDER_STATUS') {
        global.orders = global.orders.map(o => o.id === payload.id ? { ...o, status: payload.status } : o);
    }

    return NextResponse.json({ success: true, products: global.products, orders: global.orders });
}