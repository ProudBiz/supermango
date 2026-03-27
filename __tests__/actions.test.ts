import { describe, it, expect, vi, beforeEach } from "vitest";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTestDb } from "./helpers/db";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock db/index.ts - override `db` export per test while keeping createDb
const mockDb = { current: null as ReturnType<typeof createTestDb> | null };
vi.mock("@/db/index", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/db/index")>();
  return {
    ...actual,
    get db() {
      return mockDb.current;
    },
  };
});

// Import after mocks
const { addTodo, toggleTodo, deleteTodo } = await import("@/app/actions");
const { revalidatePath } = await import("next/cache");

describe("Server Actions", () => {
  beforeEach(() => {
    mockDb.current = createTestDb();
    vi.clearAllMocks();
  });

  describe("addTodo", () => {
    it("inserts a todo and revalidates on valid title", async () => {
      const formData = new FormData();
      formData.set("title", "Buy groceries");

      const result = await addTodo({ error: "", successCount: 0 }, formData);

      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos).toHaveLength(1);
      expect(allTodos[0].title).toBe("Buy groceries");
      expect(allTodos[0].completed).toBe(0);
      expect(result).toEqual({ error: "", successCount: 1 });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("trims whitespace from title", async () => {
      const formData = new FormData();
      formData.set("title", "  Buy groceries  ");

      await addTodo({ error: "", successCount: 0 }, formData);

      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos[0].title).toBe("Buy groceries");
    });

    it("returns error for empty title", async () => {
      const formData = new FormData();
      formData.set("title", "");

      const result = await addTodo({ error: "", successCount: 0 }, formData);

      expect(result.error).toBe("Title is required");
      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos).toHaveLength(0);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("returns error for whitespace-only title", async () => {
      const formData = new FormData();
      formData.set("title", "   ");

      const result = await addTodo({ error: "", successCount: 0 }, formData);

      expect(result.error).toBe("Title is required");
      expect(result.successCount).toBe(0);
      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos).toHaveLength(0);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("returns error for title over 500 characters", async () => {
      const formData = new FormData();
      formData.set("title", "a".repeat(501));

      const result = await addTodo({ error: "", successCount: 0 }, formData);

      expect(result.error).toBe("Title must be 500 characters or less");
      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos).toHaveLength(0);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("toggleTodo", () => {
    it("flips completed from 0 to 1", async () => {
      mockDb.current!.insert(todos).values({ title: "Test" }).run();
      const formData = new FormData();
      formData.set("id", "1");

      await toggleTodo(formData);

      const todo = mockDb.current!.select().from(todos).where(eq(todos.id, 1)).get();
      expect(todo!.completed).toBe(1);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("flips completed from 1 to 0", async () => {
      mockDb.current!.insert(todos).values({ title: "Test", completed: 1 }).run();
      const formData = new FormData();
      formData.set("id", "1");

      await toggleTodo(formData);

      const todo = mockDb.current!.select().from(todos).where(eq(todos.id, 1)).get();
      expect(todo!.completed).toBe(0);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("is a no-op for non-existent ID", async () => {
      const formData = new FormData();
      formData.set("id", "999");

      await toggleTodo(formData);

      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("deleteTodo", () => {
    it("removes a todo by ID", async () => {
      mockDb.current!.insert(todos).values({ title: "Test" }).run();
      const formData = new FormData();
      formData.set("id", "1");

      await deleteTodo(formData);

      const allTodos = mockDb.current!.select().from(todos).all();
      expect(allTodos).toHaveLength(0);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("is a no-op for non-existent ID", async () => {
      const formData = new FormData();
      formData.set("id", "999");

      await deleteTodo(formData);

      // DELETE on non-existent row is a SQL no-op; revalidatePath still fires
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });
});
