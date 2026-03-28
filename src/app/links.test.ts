import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";
import { initDb, saveLink } from "../lib/db.js";
import { getLinks, _resetDbCache } from "./links.js";

const TEST_DB_PATH = path.join(os.tmpdir(), `supermango-links-test-${process.pid}.db`);

describe("getLinks", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDb(TEST_DB_PATH);
  });

  afterEach(() => {
    _resetDbCache();
    db.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      try { fs.unlinkSync(TEST_DB_PATH + suffix); } catch {}
    }
  });

  it("should return an empty array when no links exist", () => {
    const result = getLinks(TEST_DB_PATH);
    expect(result).toEqual([]);
  });

  it("should return links ordered by most recent first", () => {
    saveLink(db, {
      url: "https://example.com/first",
      title: "First Article",
      summary: "First summary.",
      channelId: "C100",
      channelName: "general",
      messageTs: "100.000",
      slackUserId: "U1",
    });
    saveLink(db, {
      url: "https://example.com/second",
      title: "Second Article",
      summary: "Second summary.",
      channelId: "C100",
      channelName: "random",
      messageTs: "200.000",
      slackUserId: "U2",
    });

    const result = getLinks(TEST_DB_PATH);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe("https://example.com/second");
    expect(result[1].url).toBe("https://example.com/first");
  });

  it("should return all expected fields", () => {
    saveLink(db, {
      url: "https://example.com/fields",
      title: "Field Test",
      summary: "Testing all fields.",
      channelId: "C200",
      channelName: "dev",
      messageTs: "300.000",
      slackUserId: "U3",
    });

    const result = getLinks(TEST_DB_PATH);
    expect(result).toHaveLength(1);
    const link = result[0];
    expect(link.url).toBe("https://example.com/fields");
    expect(link.title).toBe("Field Test");
    expect(link.summary).toBe("Testing all fields.");
    expect(link.channelName).toBe("dev");
    expect(link.createdAt).toBeTruthy();
  });
});
