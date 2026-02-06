import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { teachers, totalVotes } = store.getResults();
  return NextResponse.json({ results: teachers, totalVotes });
}
