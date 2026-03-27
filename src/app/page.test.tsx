import { describe, it, expect, vi } from "vitest";

// Mock the server action module
vi.mock("@/actions/todo-actions", () => ({
  addTodo: vi.fn(),
  getTodos: vi.fn().mockReturnValue([]),
  getActiveTodoCount: vi.fn().mockReturnValue(0),
}));

// Mock React hooks for AddTodoForm (client component)
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useRef: () => ({ current: null }),
  };
});

describe("Home Page", () => {
  it("should export a default async component", async () => {
    const mod = await import("./page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("should render a heading", async () => {
    const { default: Home } = await import("./page");
    const result = await Home({ searchParams: Promise.resolve({}) });
    const rendered = JSON.stringify(result);
    expect(rendered).toContain("Supermango Todo");
  });

  it("should include AddTodoForm, FilterTabs, and TodoList components", async () => {
    const { default: Home } = await import("./page");
    const result = await Home({ searchParams: Promise.resolve({}) });
    const children = flattenChildren(result.props.children);

    const { default: AddTodoForm } = await import(
      "@/components/AddTodoForm"
    );
    const { default: TodoList } = await import("@/components/TodoList");
    const { default: FilterTabs } = await import(
      "@/components/FilterTabs"
    );

    const hasForm = children.some((c: any) => c?.type === AddTodoForm);
    const hasList = children.some(
      (c: any) =>
        c?.type === TodoList ||
        c?.props?.children?.type === TodoList
    );
    const hasFilterTabs = children.some(
      (c: any) => c?.type === FilterTabs
    );

    expect(hasForm).toBe(true);
    expect(hasList).toBe(true);
    expect(hasFilterTabs).toBe(true);
  });

  it("should have a centered, max-width layout", async () => {
    const { default: Home } = await import("./page");
    const result = await Home({ searchParams: Promise.resolve({}) });
    expect(result.type).toBe("main");
    expect(result.props.className).toContain("max-w-");
    expect(result.props.className).toContain("mx-auto");
  });

  it("should pass todos from getTodos to TodoList", async () => {
    const { getTodos } = await import("@/actions/todo-actions");
    const mockTodos = [
      { id: 1, text: "Test", completed: 0, createdAt: new Date() },
    ];
    vi.mocked(getTodos).mockReturnValue(mockTodos as any);

    const { default: Home } = await import("./page");
    const result = await Home({ searchParams: Promise.resolve({}) });
    const { default: TodoList } = await import("@/components/TodoList");

    const children = flattenChildren(result.props.children);
    const listWrapper = children.find(
      (c: any) => c?.props?.children?.type === TodoList
    );
    expect(listWrapper.props.children.props.todos).toEqual(mockTodos);
  });

  it("should pass filter param to getTodos", async () => {
    const { getTodos } = await import("@/actions/todo-actions");
    vi.mocked(getTodos).mockReturnValue([] as any);

    const { default: Home } = await import("./page");
    await Home({ searchParams: Promise.resolve({ filter: "active" }) });

    expect(getTodos).toHaveBeenCalledWith("active");
  });

  it("should pass 'all' to getTodos when no filter param", async () => {
    const { getTodos } = await import("@/actions/todo-actions");
    vi.mocked(getTodos).mockReturnValue([] as any);

    const { default: Home } = await import("./page");
    await Home({ searchParams: Promise.resolve({}) });

    expect(getTodos).toHaveBeenCalledWith("all");
  });

  it("should pass activeFilter and activeCount to FilterTabs", async () => {
    const { getActiveTodoCount } = await import("@/actions/todo-actions");
    vi.mocked(getActiveTodoCount).mockReturnValue(3 as any);

    const { default: Home } = await import("./page");
    const { default: FilterTabs } = await import(
      "@/components/FilterTabs"
    );
    const result = await Home({
      searchParams: Promise.resolve({ filter: "completed" }),
    });
    const children = flattenChildren(result.props.children);
    const filterTabs = children.find(
      (c: any) => c?.type === FilterTabs
    );

    expect(filterTabs.props.activeFilter).toBe("completed");
    expect(filterTabs.props.activeCount).toBe(3);
  });
});

function flattenChildren(children: any): any[] {
  if (!children) return [];
  if (!Array.isArray(children)) return [children];
  return children.flatMap((c: any) =>
    Array.isArray(c) ? flattenChildren(c) : [c]
  );
}
