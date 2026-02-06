import type { Teacher, User } from "./types";

interface Vote {
  userId: string;
  teacherId: number;
  createdAt: string;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: string;
}

let nextTeacherId = 1;

const teachers: Map<number, Teacher> = new Map();
const users: Map<string, User> = new Map();
const votes: Map<string, Vote> = new Map(); // keyed by userId (1 vote per user)
const sessions: Map<string, Session> = new Map();

function seed() {
  if (teachers.size > 0) return;

  const seedTeachers: [string, string][] = [
    ["Mgr. Jana Nováková", "Matematika"],
    ["Ing. Petr Svoboda", "Fyzika"],
    ["Mgr. Eva Dvořáková", "Český jazyk"],
    ["PhDr. Martin Černý", "Dějepis"],
    ["Mgr. Lucie Procházková", "Angličtina"],
    ["RNDr. Tomáš Veselý", "Chemie"],
    ["Mgr. Kateřina Horákova", "Biologie"],
    ["Ing. Pavel Kučera", "Informatika"],
  ];

  for (const [name, subject] of seedTeachers) {
    const id = nextTeacherId++;
    teachers.set(id, {
      id,
      name,
      subject,
      image_url: null,
      created_at: new Date().toISOString(),
    });
  }

  users.set("admin-001", {
    id: "admin-001",
    email: "admin@skola.cz",
    name: "Administrátor",
    role: "admin",
  });
}

// Initialize on module load
seed();

export const store = {
  // Teachers
  getTeachers(): Teacher[] {
    return Array.from(teachers.values()).sort((a, b) => a.name.localeCompare(b.name, "cs"));
  },

  getTeacher(id: number): Teacher | undefined {
    return teachers.get(id);
  },

  addTeacher(name: string, subject: string): Teacher {
    const id = nextTeacherId++;
    const teacher: Teacher = {
      id,
      name,
      subject,
      image_url: null,
      created_at: new Date().toISOString(),
    };
    teachers.set(id, teacher);
    return teacher;
  },

  deleteTeacher(id: number): void {
    teachers.delete(id);
    for (const [userId, vote] of votes) {
      if (vote.teacherId === id) {
        votes.delete(userId);
      }
    }
  },

  // Users
  upsertUser(user: User): void {
    users.set(user.id, user);
  },

  getUser(id: string): User | undefined {
    return users.get(id);
  },

  // Sessions
  createSession(id: string, userId: string, expiresAt: string): void {
    for (const [sessId, sess] of sessions) {
      if (sess.userId === userId) {
        sessions.delete(sessId);
      }
    }
    sessions.set(id, { id, userId, expiresAt });
  },

  getSession(id: string): (Session & { user: User }) | null {
    const session = sessions.get(id);
    if (!session) return null;

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      sessions.delete(id);
      return null;
    }

    const user = users.get(session.userId);
    if (!user) return null;

    return { ...session, user };
  },

  deleteSession(id: string): void {
    sessions.delete(id);
  },

  // Votes
  getVote(userId: string): { teacher_id: number; teacher_name: string } | null {
    const vote = votes.get(userId);
    if (!vote) return null;
    const teacher = teachers.get(vote.teacherId);
    if (!teacher) return null;
    return { teacher_id: vote.teacherId, teacher_name: teacher.name };
  },

  castVote(userId: string, teacherId: number): boolean {
    if (votes.has(userId)) return false;
    votes.set(userId, {
      userId,
      teacherId,
      createdAt: new Date().toISOString(),
    });
    return true;
  },

  getResults(): { teachers: (Teacher & { vote_count: number })[]; totalVotes: number } {
    const voteCounts = new Map<number, number>();
    for (const vote of votes.values()) {
      voteCounts.set(vote.teacherId, (voteCounts.get(vote.teacherId) || 0) + 1);
    }

    const results = Array.from(teachers.values()).map((t) => ({
      ...t,
      vote_count: voteCounts.get(t.id) || 0,
    }));

    results.sort((a, b) => {
      if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
      return a.name.localeCompare(b.name, "cs");
    });

    return { teachers: results, totalVotes: votes.size };
  },
};
