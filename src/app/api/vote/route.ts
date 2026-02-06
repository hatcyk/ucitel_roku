import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { teacherId } = await request.json();
  if (!teacherId || typeof teacherId !== "number") {
    return NextResponse.json({ error: "Neplatný učitel" }, { status: 400 });
  }

  if (!store.getTeacher(teacherId)) {
    return NextResponse.json({ error: "Učitel nenalezen" }, { status: 404 });
  }

  const success = store.castVote(session.user.id, teacherId);
  if (!success) {
    return NextResponse.json({ error: "Již jste hlasoval/a" }, { status: 409 });
  }

  return NextResponse.json({ ok: true, message: "Hlas byl zaznamenán" });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const vote = store.getVote(session.user.id);
  return NextResponse.json({ vote });
}
