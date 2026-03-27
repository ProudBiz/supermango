import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const db = drizzle({
  connection: { source: process.env.DATABASE_URL ?? "sqlite.db" },
  schema,
});

export default db;
