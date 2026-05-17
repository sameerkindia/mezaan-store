import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getDatabase, saveDatabase } from "./../../../utils/db";

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { message: "Invalid data provided" },
      { status: 400 },
    );
  }

  const db = getDatabase();

  // SAFETY CHECK: If users array doesn't exist, create it!
  if (!db.users) db.users = [];

  // Check if user already exists
  if (db.users.find((u) => u.email === email)) {
    return NextResponse.json(
      { message: "Email already in use" },
      { status: 400 },
    );
  }

  // Save new user
  db.users.push({ id: Date.now(), name, email, password });
  saveDatabase(db);

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback_secret",
  );
  const token = await new SignJWT({ role: "user", email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("user_token", token, { httpOnly: true, path: "/" });
  return response;
}
