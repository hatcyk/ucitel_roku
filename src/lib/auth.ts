import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { store } from "./db";
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

export async function login(email: string): Promise<User | null> {
  const mockUser = MOCK_USERS[email];
  if (!mockUser) return null;

  const userId = `user-${email.replace(/[@.]/g, "-")}`;
  const user: User = { id: userId, email, name: mockUser.name, role: mockUser.role };

  store.upsertUser(user);

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  store.createSession(sessionId, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });

  return user;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = store.getSession(sessionId);
  if (!session) return null;

  return {
    user: session.user,
    expires: new Date(session.expiresAt).getTime(),
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    store.deleteSession(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}
