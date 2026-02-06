import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import type { User, SessionData } from "./types";

const SESSION_COOKIE = "ucitel_roku_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Mock Microsoft login users.
 * In production, replace this with actual MSAL authentication.
 */
const MOCK_USERS: Record<string, { name: string; role: "student" | "admin" }> = {
  "student@skola.cz": { name: "Jan Novák", role: "student" },
  "studentka@skola.cz": { name: "Marie Svobodová", role: "student" },
  "student3@skola.cz": { name: "Tomáš Dvořák", role: "student" },
  "admin@skola.cz": { name: "Administrátor", role: "admin" },
};

export function getMockUsers() {
  return Object.entries(MOCK_USERS).map(([email, data]) => ({
    email,
    ...data,
  }));
}

export async function login(email: string): Promise<User | null> {
  const mockUser = MOCK_USERS[email];
  if (!mockUser) return null;

  const db = getDb();
  const userId = `user-${email.replace(/[@.]/g, "-")}`;

  // Upsert user
  db.prepare(
    `INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, role = excluded.role`
  ).run(userId, email, mockUser.name, mockUser.role);

  // Create session
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  // Remove old sessions for this user
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);

  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(
    sessionId,
    userId,
    expiresAt
  );

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });

  return { id: userId, email, name: mockUser.name, role: mockUser.role };
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const session = db
    .prepare(
      `SELECT s.id, s.expires_at, u.id as user_id, u.email, u.name, u.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`
    )
    .get(sessionId) as {
    id: string;
    expires_at: string;
    user_id: string;
    email: string;
    name: string;
    role: string;
  } | undefined;

  if (!session) return null;

  const expiresAt = new Date(session.expires_at).getTime();
  if (Date.now() > expiresAt) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    return null;
  }

  return {
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      role: session.role as "student" | "admin",
    },
    expires: expiresAt,
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}
