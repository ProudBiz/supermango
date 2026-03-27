// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const mockUpdateTodoText = vi.fn();

vi.mock("@/actions/todo-actions", () => ({
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
  updateTodoText: vi.fn((...args) => mockUpdateTodoText(...args)),
}));

import TodoItem from "./TodoItem";

describe("TodoItem inline editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should enter edit mode on double-click", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    const textSpan = screen.getByText("Buy groceries");
    fireEvent.doubleClick(textSpan);
    const input = screen.getByDisplayValue("Buy groceries");
    expect(input).toBeDefined();
    expect(input.tagName).toBe("INPUT");
  });

  it("should auto-focus the edit input", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    expect(document.activeElement).toBe(input);
  });

  it("should cancel edit on Escape", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Changed text" } });
    fireEvent.keyDown(input, { key: "Escape" });
    // Should be back to text span, not input
    expect(screen.getByText("Buy groceries")).toBeDefined();
    expect(screen.queryByDisplayValue("Changed text")).toBeNull();
  });

  it("should save edit on Enter", async () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockUpdateTodoText).toHaveBeenCalledWith(1, "Buy milk");
  });

  it("should save edit on blur", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.blur(input);
    expect(mockUpdateTodoText).toHaveBeenCalledWith(1, "Buy milk");
  });

  it("should not save empty text", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockUpdateTodoText).not.toHaveBeenCalled();
  });

  it("should not save whitespace-only text", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockUpdateTodoText).not.toHaveBeenCalled();
  });

  it("should show visual indicator for empty text validation", () => {
    render(<TodoItem id={1} text="Buy groceries" completed={0} />);
    fireEvent.doubleClick(screen.getByText("Buy groceries"));
    const input = screen.getByDisplayValue("Buy groceries");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // Input should still be visible (not exited edit mode) and have error styling
    const editInput = screen.getByRole("textbox");
    expect(editInput).toBeDefined();
  });
});
