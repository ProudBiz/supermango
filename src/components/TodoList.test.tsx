import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/todo-actions", () => ({
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import TodoList from "./TodoList";
import TodoItem from "./TodoItem";

describe("TodoList", () => {
  it("should export a default component", () => {
    expect(TodoList).toBeDefined();
    expect(typeof TodoList).toBe("function");
  });

  it("should render a list of todos", () => {
    const todos = [
      { id: 1, text: "Buy milk", completed: 0, createdAt: new Date() },
      { id: 2, text: "Walk dog", completed: 0, createdAt: new Date() },
    ];
    const result = TodoList({ todos });
    expect(result.type).toBe("ul");

    const children = Array.isArray(result.props.children)
      ? result.props.children
      : [result.props.children];
    expect(children).toHaveLength(2);
  });

  it("should render TodoItem components for each todo", () => {
    const todos = [
      { id: 1, text: "Buy milk", completed: 0, createdAt: new Date() },
      { id: 2, text: "Walk dog", completed: 1, createdAt: new Date() },
    ];
    const result = TodoList({ todos });
    const children = Array.isArray(result.props.children)
      ? result.props.children
      : [result.props.children];

    children.forEach((child: any) => {
      expect(child.type).toBe(TodoItem);
    });
  });

  it("should pass correct props to TodoItem", () => {
    const todos = [
      { id: 1, text: "Buy milk", completed: 0, createdAt: new Date() },
    ];
    const result = TodoList({ todos });
    const child = Array.isArray(result.props.children)
      ? result.props.children[0]
      : result.props.children;

    expect(child.props.id).toBe(1);
    expect(child.props.text).toBe("Buy milk");
    expect(child.props.completed).toBe(0);
  });

  it("should show empty state when no todos", () => {
    const result = TodoList({ todos: [] });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("No todos yet");
  });
});
