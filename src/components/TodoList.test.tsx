import { describe, it, expect } from "vitest";
import TodoList from "./TodoList";

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

  it("should display each todo's text", () => {
    const todos = [
      { id: 1, text: "Buy milk", completed: 0, createdAt: new Date() },
    ];
    const result = TodoList({ todos });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("Buy milk");
  });

  it("should show empty state when no todos", () => {
    const result = TodoList({ todos: [] });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("No todos yet");
  });
});
