import { describe, it, expect } from "vitest";
import { todos } from "./schema";
import { getTableColumns } from "drizzle-orm";

describe("todos schema", () => {
  it("defines a todos table with the expected columns", () => {
    const columns = getTableColumns(todos);
    expect(Object.keys(columns)).toEqual(["id", "text", "completed", "createdAt"]);
  });

  it("has id as integer primary key with autoIncrement", () => {
    const columns = getTableColumns(todos);
    expect(columns.id.dataType).toBe("number");
    expect((columns.id as any).primary).toBe(true);
  });

  it("has text as a non-nullable text column", () => {
    const columns = getTableColumns(todos);
    expect(columns.text.dataType).toBe("string");
    expect(columns.text.notNull).toBe(true);
  });

  it("has completed as integer defaulting to 0", () => {
    const columns = getTableColumns(todos);
    expect(columns.completed.dataType).toBe("number");
    expect(columns.completed.hasDefault).toBe(true);
  });

  it("has createdAt as integer with a default", () => {
    const columns = getTableColumns(todos);
    expect(columns.createdAt.dataType).toBe("date");
    expect(columns.createdAt.hasDefault).toBe(true);
  });
});
