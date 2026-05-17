import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getDatabase } from "./../../../utils/db";

export async function POST(req) {
  const { email, password } = await req.json();
  const db = getDatabase();

  // SAFETY CHECK
  if (!db.users) db.users = [];

  const user = db.users.find(
    (u) => u.email === email && u.password === password,
  );

  if (user) {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback_secret",
    );
    const token = await new SignJWT({
      role: "user",
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set("user_token", token, { httpOnly: true, path: "/" });
    return response;
  }

  return NextResponse.json(
    { message: "Invalid email or password" },
    { status: 401 },
  );
}
