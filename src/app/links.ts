import { initDb, listLinks, type LinkRecord } from "../lib/db.js";
import type Database from "better-sqlite3";

const DEFAULT_DB_PATH = process.env.DB_PATH ?? "supermango.db";

let cachedDb: Database.Database | null = null;
let cachedDbPath: string | null = null;

function getDb(dbPath: string): Database.Database {
  if (!cachedDb || cachedDbPath !== dbPath) {
    cachedDb?.close();
    cachedDb = initDb(dbPath);
    cachedDbPath = dbPath;
  }
  return cachedDb;
}

export function getLinks(dbPath: string = DEFAULT_DB_PATH): LinkRecord[] {
  return listLinks(getDb(dbPath));
}

/** Reset the cached DB connection. Used by tests. */
export function _resetDbCache(): void {
  cachedDb?.close();
  cachedDb = null;
  cachedDbPath = null;
}
