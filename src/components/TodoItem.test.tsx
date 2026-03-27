import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/todo-actions", () => ({
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import TodoItem from "./TodoItem";

function flattenTree(node: any): any[] {
  if (!node || typeof node !== "object") return [];
  const result = [node];
  const children = node.props?.children;
  if (Array.isArray(children)) {
    children.forEach((c: any) => result.push(...flattenTree(c)));
  } else if (children && typeof children === "object") {
    result.push(...flattenTree(children));
  }
  return result;
}

function findByType(tree: any, type: string) {
  return flattenTree(tree).filter((n) => n?.type === type);
}

describe("TodoItem", () => {
  it("should render a checkbox", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 0 });
    const checkboxes = findByType(result, "input").filter(
      (n) => n.props?.type === "checkbox"
    );
    expect(checkboxes).toHaveLength(1);
  });

  it("should render checkbox as unchecked for incomplete todo", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 0 });
    const checkbox = findByType(result, "input").find(
      (n) => n.props?.type === "checkbox"
    );
    expect(checkbox.props.defaultChecked).toBe(false);
  });

  it("should render checkbox as checked for complete todo", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 1 });
    const checkbox = findByType(result, "input").find(
      (n) => n.props?.type === "checkbox"
    );
    expect(checkbox.props.defaultChecked).toBe(true);
  });

  it("should render a delete button", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 0 });
    const buttons = findByType(result, "button");
    expect(buttons).toHaveLength(1);
  });

  it("should apply strikethrough styling to completed todo", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 1 });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("line-through");
  });

  it("should not apply strikethrough to incomplete todo", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 0 });
    const rendered = JSON.stringify(result);
    expect(rendered).not.toContain("line-through");
  });

  it("should display the todo text", () => {
    const result = TodoItem({ id: 1, text: "Buy groceries", completed: 0 });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("Buy groceries");
  });

  it("should apply muted text color to completed todo", () => {
    const result = TodoItem({ id: 1, text: "Test", completed: 1 });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("text-gray-400");
  });
});
