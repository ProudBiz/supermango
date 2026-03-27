import { describe, it, expect } from "vitest";
import { createTestDb } from "./helpers/db";
import { todos } from "@/db/schema";

describe("Database: Test Helper and Seed", () => {
  it("creates an in-memory DB with the schema applied", () => {
    const db = createTestDb();
    const results = db.select().from(todos).all();
    expect(results).toHaveLength(0);
  });

  it("creates a seeded DB with fixture todos", () => {
    const db = createTestDb({ seed: true });
    const results = db.select().from(todos).all();
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.length).toBeLessThanOrEqual(3);

    for (const todo of results) {
      expect(typeof todo.id).toBe("number");
      expect(typeof todo.title).toBe("string");
      expect(todo.title.length).toBeGreaterThan(0);
      expect([0, 1]).toContain(todo.completed);
      expect(typeof todo.createdAt).toBe("number");
      expect(todo.createdAt).toBeGreaterThan(0);
    }
  });

  it("seeds fixture data with at least one completed todo", () => {
    const db = createTestDb({ seed: true });
    const results = db.select().from(todos).all();
    const completedCount = results.filter((t) => t.completed === 1).length;
    expect(completedCount).toBeGreaterThanOrEqual(1);
  });

  it("seeds fixture data with at least one incomplete todo", () => {
    const db = createTestDb({ seed: true });
    const results = db.select().from(todos).all();
    const incompleteCount = results.filter((t) => t.completed === 0).length;
    expect(incompleteCount).toBeGreaterThanOrEqual(1);
  });
});
