// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/actions/todo-actions", () => ({
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
  updateTodoText: vi.fn(),
}));

import TodoItem from "./TodoItem";

describe("TodoItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render a checkbox", () => {
    render(<TodoItem id={1} text="Test" completed={0} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDefined();
  });

  it("should render checkbox as unchecked for incomplete todo", () => {
    render(<TodoItem id={1} text="Test" completed={0} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.defaultChecked).toBe(false);
  });

  it("should render checkbox as checked for complete todo", () => {
    render(<TodoItem id={1} text="Test" completed={1} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.defaultChecked).toBe(true);
  });

  it("should render a delete button", () => {
    render(<TodoItem id={1} text="Test" completed={0} />);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDefined();
  });

  it("should apply strikethrough styling to completed todo", () => {
    render(<TodoItem id={1} text="Test" completed={1} />);
    const text = screen.getByText("Test");
    expect(text.className).toContain("line-through");
  });

  it("should not apply strikethrough to incomplete todo", () => {
    render(<TodoItem id={1} text="Test" completed={0} />);
    const text = screen.getByText("Test");
    expect(text.className).not.toContain("line-through");
  });

  it("should display the todo text", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    expect(screen.getByText("Buy groceries")).toBeDefined();
  });

  it("should apply muted text color to completed todo", () => {
    render(<TodoItem id={1} text="Test" completed={1} />);
    const text = screen.getByText("Test");
    expect(text.className).toContain("text-gray-400");
  });
});
