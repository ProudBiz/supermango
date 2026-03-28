import Database from "better-sqlite3";

export interface LinkRecord {
  id: number;
  url: string;
  title: string;
  summary: string;
  channelId: string;
  channelName: string;
  messageTs: string;
  slackUserId: string;
  createdAt: string;
}

export interface SaveLinkInput {
  url: string;
  title: string;
  summary: string;
  channelId: string;
  channelName: string;
  messageTs: string;
  slackUserId: string;
}

interface LinkRow {
  id: number;
  url: string;
  title: string;
  summary: string;
  channel_id: string;
  channel_name: string;
  message_ts: string;
  slack_user_id: string;
  created_at: string;
}

function rowToRecord(row: LinkRow): LinkRecord {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    summary: row.summary,
    channelId: row.channel_id,
    channelName: row.channel_name,
    messageTs: row.message_ts,
    slackUserId: row.slack_user_id,
    createdAt: row.created_at,
  };
}

export function initDb(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      message_ts TEXT NOT NULL,
      slack_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

export function saveLink(db: Database.Database, input: SaveLinkInput): LinkRecord {
  const row = db.prepare(`
    INSERT INTO links (url, title, summary, channel_id, channel_name, message_ts, slack_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    input.url,
    input.title,
    input.summary,
    input.channelId,
    input.channelName,
    input.messageTs,
    input.slackUserId,
  ) as LinkRow;

  return rowToRecord(row);
}

export function findLinkByUrl(db: Database.Database, url: string): LinkRecord | null {
  const row = db.prepare("SELECT * FROM links WHERE url = ?").get(url) as LinkRow | undefined;
  return row ? rowToRecord(row) : null;
}

export function listLinks(db: Database.Database): LinkRecord[] {
  const rows = db
    .prepare("SELECT * FROM links ORDER BY created_at DESC, id DESC")
    .all() as LinkRow[];
  return rows.map(rowToRecord);
}
