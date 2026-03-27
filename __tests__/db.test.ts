import { describe, it, expect } from "vitest";
import { todos } from "@/db/schema";
import { createTestDb } from "./helpers/db";

describe("Database: Schema and Connection", () => {
  it("creates an in-memory DB and returns a Drizzle instance", () => {
    const db = createTestDb();
    expect(db).toBeDefined();
  });

  it("can insert and query a todo with correct shape", () => {
    const db = createTestDb();

    db.insert(todos)
      .values({ title: "Test todo" })
      .run();

    const results = db.select().from(todos).all();

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 1,
      title: "Test todo",
      completed: 0,
    });
    expect(typeof results[0].createdAt).toBe("number");
    expect(results[0].createdAt).toBeGreaterThan(0);
  });

  it("stores completed as integer (0 or 1)", () => {
    const db = createTestDb();

    db.insert(todos)
      .values({ title: "Done task", completed: 1 })
      .run();

    const results = db.select().from(todos).all();
    expect(results[0].completed).toBe(1);
  });

  it("auto-increments the id", () => {
    const db = createTestDb();

    db.insert(todos).values({ title: "First" }).run();
    db.insert(todos).values({ title: "Second" }).run();

    const results = db.select().from(todos).all();
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(2);
  });
});
