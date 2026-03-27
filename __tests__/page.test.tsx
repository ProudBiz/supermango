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
    const emptyMsg = screen.getByText("No todos yet. Add one above!");
    expect(emptyMsg).toBeDefined();
  });

  it("renders empty state with muted text styling", () => {
    render(<Page />);
    const emptyMsg = screen.getByText("No todos yet. Add one above!");
    expect(emptyMsg.className).toMatch(/text-gray-500/);
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

  it("renders completed todos with line-through class", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Done task", completed: 1 })
      .run();

    render(<Page />);

    const todoText = screen.getByText("Done task");
    expect(todoText.className).toMatch(/line-through/);
  });

  it("renders completed todo rows with opacity-50 class", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Done task", completed: 1 })
      .run();

    render(<Page />);

    const todoText = screen.getByText("Done task");
    const row = todoText.closest("li");
    expect(row?.className).toMatch(/opacity-50/);
  });

  it("renders uncompleted todos without line-through class", () => {
    mockDb
      .current!.insert(todos)
      .values({ title: "Open task", completed: 0 })
      .run();

    render(<Page />);

    const todoText = screen.getByText("Open task");
    expect(todoText.className).not.toMatch(/line-through/);
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

  it("renders item count footer", () => {
    mockDb.current!.insert(todos).values({ title: "Task 1" }).run();
    mockDb
      .current!.insert(todos)
      .values({ title: "Task 2", completed: 1 })
      .run();
    mockDb.current!.insert(todos).values({ title: "Task 3" }).run();

    render(<Page />);

    expect(screen.getByText("3 items, 1 completed")).toBeDefined();
  });

  it("does not render item count when no todos exist", () => {
    render(<Page />);

    expect(screen.queryByText(/items/)).toBeNull();
  });

  it("renders centered container with max-w-lg", () => {
    const { container } = render(<Page />);
    const main = container.querySelector("main");
    expect(main?.className).toMatch(/max-w-lg/);
    expect(main?.className).toMatch(/mx-auto/);
  });
});
