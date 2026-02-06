import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Nepřihlášen" }, { status: 401 }) };
  }
  if (session.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Nemáte oprávnění" }, { status: 403 }) };
  }
  return { session };
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { name, subject } = await request.json();
  if (!name || !subject) {
    return NextResponse.json({ error: "Jméno a předmět jsou povinné" }, { status: 400 });
  }

  const teacher = store.addTeacher(name, subject);
  return NextResponse.json({ id: teacher.id, message: "Učitel přidán" });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "ID je povinné" }, { status: 400 });
  }

  store.deleteTeacher(id);
  return NextResponse.json({ message: "Učitel odstraněn" });
}
