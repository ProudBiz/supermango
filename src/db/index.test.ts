import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { todos } from "./schema";

describe("todos CRUD with in-memory SQLite", () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    db = drizzle({ client: sqlite });

    // Create the table directly for testing (no migrations needed)
    sqlite.exec(`
      CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);
  });

  it("inserts a todo and reads it back", () => {
    db.insert(todos).values({ text: "Buy milk" }).run();

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Buy milk");
    expect(result[0].completed).toBe(0);
    expect(result[0].id).toBe(1);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it("updates completed status", () => {
    db.insert(todos).values({ text: "Walk the dog" }).run();

    db.update(todos).set({ completed: 1 }).where(eq(todos.id, 1)).run();

    const result = db.select().from(todos).where(eq(todos.id, 1)).all();
    expect(result[0].completed).toBe(1);
  });

  it("deletes a todo", () => {
    db.insert(todos).values({ text: "Clean house" }).run();

    db.delete(todos).where(eq(todos.id, 1)).run();

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("auto-increments ids", () => {
    db.insert(todos).values({ text: "First" }).run();
    db.insert(todos).values({ text: "Second" }).run();

    const result = db.select().from(todos).all();
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});
