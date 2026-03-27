import { sql } from "drizzle-orm";
import { createDb } from "@/db";
import { seed } from "@/db/seed";

const CREATE_TABLE_SQL = sql`
  CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()) NOT NULL
  )
`;

export function createTestDb(options?: { seed?: boolean }) {
  const db = createDb(":memory:");
  db.run(CREATE_TABLE_SQL);

  if (options?.seed) {
    seed(db);
  }

  return db;
}
