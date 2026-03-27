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

  it("returns all todos when filter is 'all'", async () => {
    db.insert(todos).values({ text: "Active", completed: 0 }).run();
    db.insert(todos).values({ text: "Done", completed: 1 }).run();

    const { getTodos } = await import("./todo-actions");
    const result = await getTodos("all");

    expect(result).toHaveLength(2);
  });

  it("returns only active todos when filter is 'active'", async () => {
    db.insert(todos).values({ text: "Active one", completed: 0 }).run();
    db.insert(todos).values({ text: "Done one", completed: 1 }).run();
    db.insert(todos).values({ text: "Active two", completed: 0 }).run();

    const { getTodos } = await import("./todo-actions");
    const result = await getTodos("active");

    expect(result).toHaveLength(2);
    expect(result.every((t) => t.completed === 0)).toBe(true);
  });

  it("returns only completed todos when filter is 'completed'", async () => {
    db.insert(todos).values({ text: "Active one", completed: 0 }).run();
    db.insert(todos).values({ text: "Done one", completed: 1 }).run();
    db.insert(todos).values({ text: "Done two", completed: 1 }).run();

    const { getTodos } = await import("./todo-actions");
    const result = await getTodos("completed");

    expect(result).toHaveLength(2);
    expect(result.every((t) => t.completed === 1)).toBe(true);
  });

  it("returns all todos when filter is undefined", async () => {
    db.insert(todos).values({ text: "Active", completed: 0 }).run();
    db.insert(todos).values({ text: "Done", completed: 1 }).run();

    const { getTodos } = await import("./todo-actions");
    const result = await getTodos();

    expect(result).toHaveLength(2);
  });
});

describe("getActiveTodoCount", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("returns 0 when no todos exist", async () => {
    const { getActiveTodoCount } = await import("./todo-actions");
    const count = await getActiveTodoCount();
    expect(count).toBe(0);
  });

  it("returns count of incomplete todos only", async () => {
    db.insert(todos).values({ text: "Active one", completed: 0 }).run();
    db.insert(todos).values({ text: "Active two", completed: 0 }).run();
    db.insert(todos).values({ text: "Done one", completed: 1 }).run();

    const { getActiveTodoCount } = await import("./todo-actions");
    const count = await getActiveTodoCount();
    expect(count).toBe(2);
  });

  it("returns 0 when all todos are completed", async () => {
    db.insert(todos).values({ text: "Done one", completed: 1 }).run();
    db.insert(todos).values({ text: "Done two", completed: 1 }).run();

    const { getActiveTodoCount } = await import("./todo-actions");
    const count = await getActiveTodoCount();
    expect(count).toBe(0);
  });
});

describe("toggleTodo", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("toggles a todo from incomplete to complete", async () => {
    db.insert(todos).values({ text: "Test todo" }).run();
    const [todo] = db.select().from(todos).all();

    expect(todo.completed).toBe(0);

    const { toggleTodo } = await import("./todo-actions");
    await toggleTodo(todo.id);

    const [updated] = db.select().from(todos).all();
    expect(updated.completed).toBe(1);
  });

  it("toggles a todo from complete back to incomplete", async () => {
    db.insert(todos).values({ text: "Test todo", completed: 1 }).run();
    const [todo] = db.select().from(todos).all();

    const { toggleTodo } = await import("./todo-actions");
    await toggleTodo(todo.id);

    const [updated] = db.select().from(todos).all();
    expect(updated.completed).toBe(0);
  });

  it("throws for non-existent ID", async () => {
    const { toggleTodo } = await import("./todo-actions");
    await expect(toggleTodo(999)).rejects.toThrow("Todo not found");
  });

  it("calls revalidatePath after toggling", async () => {
    db.insert(todos).values({ text: "Test todo" }).run();
    const [todo] = db.select().from(todos).all();

    const { revalidatePath } = await import("next/cache");
    const { toggleTodo } = await import("./todo-actions");
    await toggleTodo(todo.id);

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("deleteTodo", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("deletes a todo by ID", async () => {
    db.insert(todos).values({ text: "Test todo" }).run();
    const [todo] = db.select().from(todos).all();

    const { deleteTodo } = await import("./todo-actions");
    await deleteTodo(todo.id);

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("throws for non-existent ID", async () => {
    const { deleteTodo } = await import("./todo-actions");
    await expect(deleteTodo(999)).rejects.toThrow("Todo not found");
  });

  it("calls revalidatePath after deleting", async () => {
    db.insert(todos).values({ text: "Test todo" }).run();
    const [todo] = db.select().from(todos).all();

    const { revalidatePath } = await import("next/cache");
    const { deleteTodo } = await import("./todo-actions");
    await deleteTodo(todo.id);

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("only deletes the specified todo", async () => {
    db.insert(todos).values({ text: "Keep me" }).run();
    db.insert(todos).values({ text: "Delete me" }).run();
    const allTodos = db.select().from(todos).all();
    const toDelete = allTodos.find((t) => t.text === "Delete me")!;

    const { deleteTodo } = await import("./todo-actions");
    await deleteTodo(toDelete.id);

    const remaining = db.select().from(todos).all();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].text).toBe("Keep me");
  });
});

describe("updateTodoText", () => {
  beforeEach(() => {
    db = createTestDb();
  });

  it("updates the text of an existing todo", async () => {
    db.insert(todos).values({ text: "Original text" }).run();
    const [todo] = db.select().from(todos).all();

    const { updateTodoText } = await import("./todo-actions");
    await updateTodoText(todo.id, "Updated text");

    const [updated] = db.select().from(todos).all();
    expect(updated.text).toBe("Updated text");
  });

  it("trims whitespace from the new text", async () => {
    db.insert(todos).values({ text: "Original" }).run();
    const [todo] = db.select().from(todos).all();

    const { updateTodoText } = await import("./todo-actions");
    await updateTodoText(todo.id, "  Trimmed text  ");

    const [updated] = db.select().from(todos).all();
    expect(updated.text).toBe("Trimmed text");
  });

  it("rejects empty string", async () => {
    db.insert(todos).values({ text: "Original" }).run();
    const [todo] = db.select().from(todos).all();

    const { updateTodoText } = await import("./todo-actions");
    await expect(updateTodoText(todo.id, "")).rejects.toThrow("Todo text cannot be empty");

    const [unchanged] = db.select().from(todos).all();
    expect(unchanged.text).toBe("Original");
  });

  it("rejects whitespace-only string", async () => {
    db.insert(todos).values({ text: "Original" }).run();
    const [todo] = db.select().from(todos).all();

    const { updateTodoText } = await import("./todo-actions");
    await expect(updateTodoText(todo.id, "   ")).rejects.toThrow("Todo text cannot be empty");

    const [unchanged] = db.select().from(todos).all();
    expect(unchanged.text).toBe("Original");
  });

  it("throws for non-existent ID", async () => {
    const { updateTodoText } = await import("./todo-actions");
    await expect(updateTodoText(999, "New text")).rejects.toThrow("Todo not found");
  });

  it("calls revalidatePath after updating", async () => {
    db.insert(todos).values({ text: "Original" }).run();
    const [todo] = db.select().from(todos).all();

    const { revalidatePath } = await import("next/cache");
    const { updateTodoText } = await import("./todo-actions");
    await updateTodoText(todo.id, "Updated");

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
