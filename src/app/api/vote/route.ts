import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

  const db = getDb();

  // Check if teacher exists
  const teacher = db.prepare("SELECT id FROM teachers WHERE id = ?").get(teacherId);
  if (!teacher) {
    return NextResponse.json({ error: "Učitel nenalezen" }, { status: 404 });
  }

  // Check if user already voted
  const existingVote = db.prepare("SELECT id FROM votes WHERE user_id = ?").get(session.user.id);
  if (existingVote) {
    return NextResponse.json({ error: "Již jste hlasoval/a" }, { status: 409 });
  }

  // Cast vote
  db.prepare("INSERT INTO votes (user_id, teacher_id) VALUES (?, ?)").run(
    session.user.id,
    teacherId
  );

  return NextResponse.json({ ok: true, message: "Hlas byl zaznamenán" });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const db = getDb();
  const vote = db
    .prepare(
      `SELECT v.teacher_id, t.name as teacher_name
       FROM votes v
       JOIN teachers t ON v.teacher_id = t.id
       WHERE v.user_id = ?`
    )
    .get(session.user.id) as { teacher_id: number; teacher_name: string } | undefined;

  return NextResponse.json({ vote: vote || null });
}
