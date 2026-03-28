import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export function createDb(path?: string) {
  const sqlite = new Database(path ?? "./sqlite.db");
  const db = drizzle(sqlite, { schema });

  // Ensure tables exist (for in-memory DBs used in tests)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  return db;
}

const db = createDb();
export default db;
