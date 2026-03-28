import { initDb, listLinks, type LinkRecord } from "../lib/db.js";

const DEFAULT_DB_PATH = process.env.DB_PATH ?? "supermango.db";

export function getLinks(dbPath: string = DEFAULT_DB_PATH): LinkRecord[] {
  const db = initDb(dbPath);
  try {
    return listLinks(db);
  } finally {
    db.close();
  }
}
