import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email je povinný" }, { status: 400 });
  }

  const user = await login(email);
  if (!user) {
    return NextResponse.json({ error: "Neplatný účet" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
