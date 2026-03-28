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
