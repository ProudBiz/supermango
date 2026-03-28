import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createDb } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("addTodo action", () => {
  let db: ReturnType<typeof createDb>;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  it("creates a todo with the given title", async () => {
    const { addTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Buy groceries");

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Buy groceries");
    expect(result[0].completed).toBe(0);
  });

  it("stores the title correctly", async () => {
    const { addTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Walk the dog");

    const result = db.select().from(todos).where(eq(todos.title, "Walk the dog")).all();
    expect(result).toHaveLength(1);
  });

  it("handles empty title gracefully", async () => {
    const { addTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "");

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("handles whitespace-only title gracefully", async () => {
    const { addTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "   ");

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("calls revalidatePath after adding", async () => {
    const { revalidatePath } = await import("next/cache");
    const { addTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Test todo");

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("toggleTodo action", () => {
  let db: ReturnType<typeof createDb>;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  it("toggles a todo from incomplete to complete", async () => {
    const { addTodoWithDb, toggleTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Test toggle");

    const before = db.select().from(todos).all();
    expect(before[0].completed).toBe(0);

    await toggleTodoWithDb(db, before[0].id);

    const after = db.select().from(todos).all();
    expect(after[0].completed).toBe(1);
  });

  it("toggles a todo from complete back to incomplete", async () => {
    const { addTodoWithDb, toggleTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Test toggle back");

    const inserted = db.select().from(todos).all();
    await toggleTodoWithDb(db, inserted[0].id);
    await toggleTodoWithDb(db, inserted[0].id);

    const result = db.select().from(todos).all();
    expect(result[0].completed).toBe(0);
  });

  it("handles non-existent ID gracefully", async () => {
    const { toggleTodoWithDb } = await import("@/app/actions");
    await expect(toggleTodoWithDb(db, 9999)).resolves.not.toThrow();
  });

  it("calls revalidatePath after toggling", async () => {
    const { revalidatePath } = await import("next/cache");
    const { addTodoWithDb, toggleTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Test revalidate");

    const inserted = db.select().from(todos).all();
    await toggleTodoWithDb(db, inserted[0].id);

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("deleteTodo action", () => {
  let db: ReturnType<typeof createDb>;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  it("removes a todo by ID", async () => {
    const { addTodoWithDb, deleteTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "To be deleted");

    const inserted = db.select().from(todos).all();
    expect(inserted).toHaveLength(1);

    await deleteTodoWithDb(db, inserted[0].id);

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(0);
  });

  it("only removes the specified todo", async () => {
    const { addTodoWithDb, deleteTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Keep me");
    await addTodoWithDb(db, "Delete me");

    const all = db.select().from(todos).all();
    const toDelete = all.find((t) => t.title === "Delete me")!;
    await deleteTodoWithDb(db, toDelete.id);

    const result = db.select().from(todos).all();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Keep me");
  });

  it("handles non-existent ID gracefully", async () => {
    const { deleteTodoWithDb } = await import("@/app/actions");
    await expect(deleteTodoWithDb(db, 9999)).resolves.not.toThrow();
  });

  it("calls revalidatePath after deleting", async () => {
    const { revalidatePath } = await import("next/cache");
    const { addTodoWithDb, deleteTodoWithDb } = await import("@/app/actions");
    await addTodoWithDb(db, "Test revalidate");

    const inserted = db.select().from(todos).all();
    await deleteTodoWithDb(db, inserted[0].id);

    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
