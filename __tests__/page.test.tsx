import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createTestDb } from "./helpers/db";
import { todos } from "@/db/schema";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock db/index.ts with per-test database
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

// Mock server actions (they can't run in jsdom)
vi.mock("@/app/actions", () => ({
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

// Mock useActionState for the AddForm client component
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(() => [{ error: "", successCount: 0 }, vi.fn()]),
  };
});

const { default: Page } = await import("@/app/page");

describe("Page component", () => {
  beforeEach(() => {
    mockDb.current = createTestDb();
  });

  it("renders empty state when there are no todos", () => {
    render(<Page />);
    expect(screen.getByText("No todos yet. Add one above!")).toBeDefined();
  });

  it("renders a list of todos with correct items", () => {
    mockDb.current!.insert(todos).values({ title: "Buy groceries" }).run();
    mockDb.current!.insert(todos).values({ title: "Walk the dog" }).run();

    render(<Page />);

    expect(screen.getByText("Buy groceries")).toBeDefined();
    expect(screen.getByText("Walk the dog")).toBeDefined();
  });

  it("renders page title", () => {
    render(<Page />);
    expect(screen.getByText("Todos")).toBeDefined();
  });

  it("renders completed todos with strikethrough styling", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Done task", completed: 1 })
      .run();

    render(<Page />);

    const todoText = screen.getByText("Done task");
    expect(todoText.style.textDecoration).toBe("line-through");
    expect(todoText.style.opacity).toBe("0.5");
  });

  it("renders uncompleted todos without strikethrough", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Open task", completed: 0 })
      .run();

    render(<Page />);

    const todoText = screen.getByText("Open task");
    expect(todoText.style.textDecoration).toBe("none");
    expect(todoText.style.opacity).toBe("1");
  });

  it("renders toggle and delete buttons for each todo", () => {
    mockDb.current!.insert(todos).values({ title: "Test todo" }).run();

    render(<Page />);

    expect(screen.getByText("○")).toBeDefined(); // uncompleted toggle
    expect(screen.getByText("✕")).toBeDefined(); // delete button
  });

  it("renders checkmark for completed todos", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Done todo", completed: 1 })
      .run();

    render(<Page />);

    expect(screen.getByText("✓")).toBeDefined(); // completed toggle
  });
});
