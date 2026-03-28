import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initDb, saveLink, findLinkByUrl, listLinks } from "./db.js";
import fs from "fs";
import os from "os";
import path from "path";

const TEST_DB_PATH = path.join(os.tmpdir(), `supermango-test-${process.pid}.db`);

describe("Database Layer", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDb(TEST_DB_PATH);
  });

  afterEach(() => {
    db.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      try { fs.unlinkSync(TEST_DB_PATH + suffix); } catch {}
    }
  });

  describe("initDb", () => {
    it("should enable WAL mode", () => {
      const mode = db.pragma("journal_mode", { simple: true });
      expect(mode).toBe("wal");
    });

    it("should create the links table with correct schema", () => {
      const columns = db.pragma("table_info(links)") as Array<{
        name: string;
        type: string;
        notnull: number;
        pk: number;
      }>;
      const colNames = columns.map((c) => c.name);
      expect(colNames).toEqual([
        "id",
        "url",
        "title",
        "summary",
        "channel_id",
        "channel_name",
        "message_ts",
        "slack_user_id",
        "created_at",
      ]);
      // id should be primary key
      const idCol = columns.find((c) => c.name === "id")!;
      expect(idCol.pk).toBe(1);
      // url should be NOT NULL
      const urlCol = columns.find((c) => c.name === "url")!;
      expect(urlCol.notnull).toBe(1);
    });
  });

  describe("saveLink", () => {
    it("should insert a new record and return it with an id", () => {
      const link = saveLink(db, {
        url: "https://example.com/article",
        title: "Example Article",
        summary: "A short summary.",
        channelId: "C123",
        channelName: "general",
        messageTs: "1234567890.123456",
        slackUserId: "U456",
      });

      expect(link.id).toBe(1);
      expect(link.url).toBe("https://example.com/article");
      expect(link.title).toBe("Example Article");
      expect(link.summary).toBe("A short summary.");
      expect(link.createdAt).toBeDefined();
    });

    it("should auto-generate created_at timestamp", () => {
      const link = saveLink(db, {
        url: "https://example.com",
        title: "Test",
        summary: "Test summary",
        channelId: "C1",
        channelName: "test",
        messageTs: "123.456",
        slackUserId: "U1",
      });

      // created_at should be a recent ISO-ish string
      expect(link.createdAt).toBeTruthy();
    });
  });

  describe("findLinkByUrl", () => {
    it("should return the existing record when URL exists", () => {
      saveLink(db, {
        url: "https://example.com/found",
        title: "Found",
        summary: "Found summary",
        channelId: "C1",
        channelName: "test",
        messageTs: "111.222",
        slackUserId: "U1",
      });

      const found = findLinkByUrl(db, "https://example.com/found");
      expect(found).not.toBeNull();
      expect(found!.url).toBe("https://example.com/found");
      expect(found!.summary).toBe("Found summary");
    });

    it("should return null when URL does not exist", () => {
      const found = findLinkByUrl(db, "https://example.com/missing");
      expect(found).toBeNull();
    });
  });

  describe("listLinks", () => {
    it("should return all links ordered by created_at descending", () => {
      saveLink(db, {
        url: "https://example.com/first",
        title: "First",
        summary: "First summary",
        channelId: "C1",
        channelName: "test",
        messageTs: "100.000",
        slackUserId: "U1",
      });
      saveLink(db, {
        url: "https://example.com/second",
        title: "Second",
        summary: "Second summary",
        channelId: "C1",
        channelName: "test",
        messageTs: "200.000",
        slackUserId: "U1",
      });

      const links = listLinks(db);
      expect(links).toHaveLength(2);
      // Most recent first
      expect(links[0].url).toBe("https://example.com/second");
      expect(links[1].url).toBe("https://example.com/first");
    });

    it("should return empty array when no links exist", () => {
      const links = listLinks(db);
      expect(links).toEqual([]);
    });
  });
});
