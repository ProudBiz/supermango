import { describe, it, expect, vi } from "vitest";

// Mock React hooks for testing client component as a plain function
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useRef: () => ({ current: null }),
  };
});

// Mock the server action
vi.mock("@/actions/todo-actions", () => ({
  addTodo: vi.fn(),
}));

describe("AddTodoForm", () => {
  it("should export a default component", async () => {
    const mod = await import("./AddTodoForm");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("should be a client component (file starts with 'use client')", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "AddTodoForm.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content.startsWith('"use client"')).toBe(true);
  });

  it("should render a form with text input and Add button", async () => {
    const { default: AddTodoForm } = await import("./AddTodoForm");
    const result = AddTodoForm();
    expect(result.type).toBe("form");

    const children = flattenChildren(result.props.children);
    const input = children.find(
      (c: any) => c?.type === "input" && c?.props?.type === "text"
    );
    const button = children.find(
      (c: any) => c?.type === "button" && c?.props?.type === "submit"
    );

    expect(input).toBeDefined();
    expect(input.props.required).toBe(true);
    expect(input.props.name).toBe("text");
    expect(button).toBeDefined();
  });

  it("should have a placeholder on the input", async () => {
    const { default: AddTodoForm } = await import("./AddTodoForm");
    const result = AddTodoForm();
    const children = flattenChildren(result.props.children);
    const input = children.find(
      (c: any) => c?.type === "input" && c?.props?.type === "text"
    );
    expect(input.props.placeholder).toBeDefined();
    expect(input.props.placeholder.length).toBeGreaterThan(0);
  });
});

function flattenChildren(children: any): any[] {
  if (!children) return [];
  if (!Array.isArray(children)) return [children];
  return children.flatMap((c: any) =>
    Array.isArray(c) ? flattenChildren(c) : [c]
  );
}
