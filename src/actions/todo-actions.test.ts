import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { todos } from "@/db/schema";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    )
  `);
  return drizzle({ client: sqlite });
}

let db: ReturnType<typeof createTestDb>;

// Mock @/db to use our test db
vi.mock("@/db", () => ({
  get default() {
    return db;
  },
}));

describe("addTodo", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("inserts a todo with valid text", async () => {
    const { addTodo } = await import("./todo-actions");
    await addTodo("Buy groceries");

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Buy groceries");
  });

  it("trims whitespace from text before inserting", async () => {
    const { addTodo } = await import("./todo-actions");
    await addTodo("  Buy groceries  ");

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Buy groceries");
  });

  it("rejects empty string", async () => {
    const { addTodo } = await import("./todo-actions");
    await expect(addTodo("")).rejects.toThrow();

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("rejects whitespace-only string", async () => {
    const { addTodo } = await import("./todo-actions");
    await expect(addTodo("   ")).rejects.toThrow();

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("calls revalidatePath after inserting", async () => {
    const { revalidatePath } = await import("next/cache");
    const { addTodo } = await import("./todo-actions");
    await addTodo("Test todo");

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("getTodos", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("returns an empty array when no todos exist", async () => {
    const { getTodos } = await import("./todo-actions");
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it("returns todos in newest-first order", async () => {
    db.insert(todos)
      .values({ text: "First", createdAt: new Date(1000) })
      .run();
    db.insert(todos)
      .values({ text: "Second", createdAt: new Date(2000) })
      .run();
    db.insert(todos)
      .values({ text: "Third", createdAt: new Date(3000) })
      .run();

    const { getTodos } = await import("./todo-actions");
    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].text).toBe("Third");
    expect(result[1].text).toBe("Second");
    expect(result[2].text).toBe("First");
  });
});
