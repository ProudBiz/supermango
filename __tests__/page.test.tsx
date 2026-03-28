import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock the db module to return controlled data
const mockAll = vi.fn();
vi.mock("@/db", () => {
  const mockDb = {
    select: () => ({
      from: () => ({
        orderBy: () => ({
          all: mockAll,
        }),
      }),
    }),
    insert: vi.fn(),
  };
  return { default: mockDb, createDb: vi.fn(() => mockDb) };
});

describe("Home page", () => {
  beforeEach(() => {
    mockAll.mockReset();
  });

  it("renders the page title", async () => {
    mockAll.mockReturnValue([]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    expect(screen.getByText("Todos")).toBeInTheDocument();
  });

  it("renders a form with input and Add button", async () => {
    mockAll.mockReturnValue([]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("renders todos from the database", async () => {
    mockAll.mockReturnValue([
      { id: 1, title: "Buy groceries", completed: 0, createdAt: "2026-01-01" },
      { id: 2, title: "Walk the dog", completed: 0, createdAt: "2026-01-02" },
    ]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("renders toggle and delete controls for each todo", async () => {
    mockAll.mockReturnValue([
      { id: 1, title: "Buy groceries", completed: 0, createdAt: "2026-01-01" },
      { id: 2, title: "Walk the dog", completed: 0, createdAt: "2026-01-02" },
    ]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("renders completed todos with strikethrough and opacity", async () => {
    mockAll.mockReturnValue([
      { id: 1, title: "Done task", completed: 1, createdAt: "2026-01-01" },
      { id: 2, title: "Active task", completed: 0, createdAt: "2026-01-02" },
    ]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    const doneText = screen.getByText("Done task");
    expect(doneText).toHaveClass("line-through");
    expect(doneText).toHaveClass("opacity-50");

    const activeText = screen.getByText("Active task");
    expect(activeText).not.toHaveClass("line-through");
    expect(activeText).not.toHaveClass("opacity-50");
  });

  it("shows empty state message when there are no todos", async () => {
    mockAll.mockReturnValue([]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    expect(
      screen.getByText("No todos yet. Add one above!")
    ).toBeInTheDocument();
  });

  it("does not show empty state message when there are todos", async () => {
    mockAll.mockReturnValue([
      { id: 1, title: "A todo", completed: 0, createdAt: "2026-01-01" },
    ]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    expect(
      screen.queryByText("No todos yet. Add one above!")
    ).not.toBeInTheDocument();
  });

  it("toggle checkbox is checked for completed todos", async () => {
    mockAll.mockReturnValue([
      { id: 1, title: "Done task", completed: 1, createdAt: "2026-01-01" },
      { id: 2, title: "Active task", completed: 0, createdAt: "2026-01-02" },
    ]);
    const { default: Home } = await import("@/app/page");
    const result = await Home();
    render(result);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
  });
});
