import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "ucitel_roku.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      teacher_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed teachers if empty
  const count = db.prepare("SELECT COUNT(*) as c FROM teachers").get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare("INSERT INTO teachers (name, subject) VALUES (?, ?)");
    const teachers = [
      ["Mgr. Jana Nováková", "Matematika"],
      ["Ing. Petr Svoboda", "Fyzika"],
      ["Mgr. Eva Dvořáková", "Český jazyk"],
      ["PhDr. Martin Černý", "Dějepis"],
      ["Mgr. Lucie Procházková", "Angličtina"],
      ["RNDr. Tomáš Veselý", "Chemie"],
      ["Mgr. Kateřina Horákova", "Biologie"],
      ["Ing. Pavel Kučera", "Informatika"],
    ];
    const insertMany = db.transaction((items: string[][]) => {
      for (const [name, subject] of items) {
        insert.run(name, subject);
      }
    });
    insertMany(teachers);
  }

  // Seed admin user if no admin exists
  const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number };
  if (adminCount.c === 0) {
    db.prepare("INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)").run(
      "admin-001",
      "admin@skola.cz",
      "Administrátor",
      "admin"
    );
  }
}
