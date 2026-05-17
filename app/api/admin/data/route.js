import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Safely find the data.json file in the root folder
const dataFilePath = path.join(process.cwd(), 'data.json');

// Helper: Read the JSON file
function getDatabase() {
  if (!fs.existsSync(dataFilePath)) {
    // If the file gets deleted by accident, recreate it empty
    fs.writeFileSync(dataFilePath, JSON.stringify({ products: [], orders: [] }, null, 2));
  }
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData);
}

// Helper: Save changes to the JSON file
function saveDatabase(data) {
  // null, 2 formats the JSON nicely so it's readable
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db);
}

export async function POST(req) {
  const { action, payload } = await req.json();
  const db = getDatabase();

  // MANIPULATE PRODUCTS
  if (action === 'ADD_PRODUCT') {
    db.products.push({ ...payload, id: Date.now(), stock: 100 });
  }
  if (action === 'EDIT_PRODUCT') {
    db.products = db.products.map(p => p.id === payload.id ? { ...p, ...payload } : p);
  }
  if (action === 'DELETE_PRODUCT') {
    db.products = db.products.filter(p => p.id !== payload.id);
  }

  // MANIPULATE ORDERS
  if (action === 'UPDATE_ORDER_STATUS') {
    db.orders = db.orders.map(o => o.id === payload.id ? { ...o, status: payload.status } : o);
  }

  // SAVE CHANGES PERMANENTLY TO data.json
  saveDatabase(db);
  
  return NextResponse.json({ success: true, products: db.products, orders: db.orders });
}