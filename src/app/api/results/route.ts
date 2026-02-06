import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { TeacherWithVotes } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const db = getDb();
  const results = db
    .prepare(
      `SELECT t.*, COALESCE(v.vote_count, 0) as vote_count
       FROM teachers t
       LEFT JOIN (
         SELECT teacher_id, COUNT(*) as vote_count
         FROM votes
         GROUP BY teacher_id
       ) v ON t.id = v.teacher_id
       ORDER BY vote_count DESC, t.name ASC`
    )
    .all() as TeacherWithVotes[];

  const totalVotes = db.prepare("SELECT COUNT(*) as c FROM votes").get() as { c: number };

  return NextResponse.json({ results, totalVotes: totalVotes.c });
}
