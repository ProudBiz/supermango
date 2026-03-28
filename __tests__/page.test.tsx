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
});
