import { describe, it, expect } from "vitest";

describe("Project Setup", () => {
  it("can import @slack/bolt", async () => {
    const bolt = await import("@slack/bolt");
    expect(bolt.App).toBeDefined();
  });

  it("can import @google/genai", async () => {
    const genai = await import("@google/genai");
    expect(genai.GoogleGenAI).toBeDefined();
  });

  it("can import better-sqlite3", async () => {
    const Database = (await import("better-sqlite3")).default;
    expect(Database).toBeDefined();
  });

  it("can import @mozilla/readability", async () => {
    const readability = await import("@mozilla/readability");
    expect(readability.Readability).toBeDefined();
  });

  it("can import linkedom", async () => {
    const linkedom = await import("linkedom");
    expect(linkedom.parseHTML).toBeDefined();
  });
});
