import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export function createDb(path?: string) {
  return drizzle(path ?? "./sqlite.db", { schema });
}

export const db = createDb();
