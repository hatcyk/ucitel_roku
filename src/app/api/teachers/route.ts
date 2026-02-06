import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Teacher } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const db = getDb();
  const teachers = db.prepare("SELECT * FROM teachers ORDER BY name").all() as Teacher[];
  return NextResponse.json({ teachers });
}
