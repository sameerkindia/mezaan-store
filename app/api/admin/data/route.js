import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

function getDatabase() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ products: [], orders: [], users: [], categories: [] }, null, 2));
  }
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  const db = JSON.parse(fileData);
  
  if(!db.users) db.users = [];
  if(!db.categories) db.categories = ['POP Sections', 'Accessories', 'Uncategorized']; 
  return db;
}

function saveDatabase(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db);
}

export async function POST(req) {
  const { action, payload } = await req.json();
  const db = getDatabase();

  // --- CATEGORIES ---
  if (action === 'ADD_CATEGORY') {
    if (!db.categories.includes(payload.name)) db.categories.push(payload.name);
  }
  if (action === 'EDIT_CATEGORY') {
    const idx = db.categories.indexOf(payload.oldName);
    if (idx !== -1) {
      db.categories[idx] = payload.newName;
      // Magically update ALL products that used the old category!
      db.products = db.products.map(p => p.category === payload.oldName ? { ...p, category: payload.newName } : p);
    }
  }
  if (action === 'DELETE_CATEGORY') {
    db.categories = db.categories.filter(c => c !== payload.name);
    // Safely move orphaned products to 'Uncategorized'
    db.products = db.products.map(p => p.category === payload.name ? { ...p, category: 'Uncategorized' } : p);
  }

  // --- PRODUCTS ---
  if (action === 'ADD_PRODUCT') db.products.push({ ...payload, id: Date.now() });
  if (action === 'EDIT_PRODUCT') db.products = db.products.map(p => p.id === payload.id ? { ...p, ...payload } : p);
  if (action === 'DELETE_PRODUCT') db.products = db.products.filter(p => p.id !== payload.id);
  
  // --- ORDERS ---
  if (action === 'UPDATE_ORDER_STATUS') db.orders = db.orders.map(o => o.id === payload.id ? { ...o, status: payload.status } : o);

  // --- USERS (Moderation) ---
  if (action === 'BAN_USER') {
    const banUntil = Date.now() + (payload.hours * 60 * 60 * 1000); 
    db.users = db.users.map(u => u.id === payload.id ? { ...u, banUntil } : u);
  }
  if (action === 'UNBAN_USER') {
    db.users = db.users.map(u => u.id === payload.id ? { ...u, banUntil: null } : u); // Remove the ban
  }
  if (action === 'MAKE_ADMIN') {
    db.users = db.users.map(u => u.id === payload.id ? { ...u, role: 'admin' } : u);
  }
  if (action === 'DELETE_USER') {
    db.users = db.users.filter(u => u.id !== payload.id);
  }

  saveDatabase(db);
  return NextResponse.json({ success: true, ...db });
}