import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  completed: int().default(0).notNull(),
  createdAt: int({ mode: "timestamp_ms" })
    .default(sql`(unixepoch() * 1000)`)
    .notNull(),
});
