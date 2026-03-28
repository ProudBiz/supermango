import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockAddTodo = vi.fn();
vi.mock("@/app/actions", () => ({
  addTodo: mockAddTodo,
}));

describe("AddTodoForm", () => {
  beforeEach(() => {
    mockAddTodo.mockReset();
    mockAddTodo.mockResolvedValue({ error: null });
  });

  it("renders an input and submit button", async () => {
    const { default: AddTodoForm } = await import("@/app/add-todo-form");
    render(<AddTodoForm />);

    expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("input receives focus on mount", async () => {
    const { default: AddTodoForm } = await import("@/app/add-todo-form");
    render(<AddTodoForm />);

    const input = screen.getByPlaceholderText(/add a todo/i);
    expect(input).toHaveFocus();
  });

  it("does not display an error message initially", async () => {
    const { default: AddTodoForm } = await import("@/app/add-todo-form");
    render(<AddTodoForm />);

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
