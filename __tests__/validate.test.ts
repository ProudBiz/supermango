import { describe, it, expect } from "vitest";
import { validateTodoTitle } from "@/lib/validate";

describe("validateTodoTitle", () => {
  it("returns valid result for a normal title", () => {
    const result = validateTodoTitle("Buy groceries");
    expect(result).toEqual({ valid: true, title: "Buy groceries" });
  });

  it("returns error for empty string", () => {
    const result = validateTodoTitle("");
    expect(result).toEqual({ valid: false, error: "Title is required" });
  });

  it("returns error for whitespace-only string", () => {
    const result = validateTodoTitle("   ");
    expect(result).toEqual({ valid: false, error: "Title is required" });
  });

  it("returns error for null", () => {
    const result = validateTodoTitle(null);
    expect(result).toEqual({ valid: false, error: "Title is required" });
  });

  it("returns error for undefined", () => {
    const result = validateTodoTitle(undefined);
    expect(result).toEqual({ valid: false, error: "Title is required" });
  });

  it("returns error for non-string input (number)", () => {
    const result = validateTodoTitle(42);
    expect(result).toEqual({ valid: false, error: "Title is required" });
  });

  it("accepts exactly 500 characters (boundary)", () => {
    const title = "a".repeat(500);
    const result = validateTodoTitle(title);
    expect(result).toEqual({ valid: true, title });
  });

  it("rejects 501 characters (boundary)", () => {
    const title = "a".repeat(501);
    const result = validateTodoTitle(title);
    expect(result).toEqual({
      valid: false,
      error: "Title must be 500 characters or less",
    });
  });

  it("trims leading and trailing whitespace", () => {
    const result = validateTodoTitle("  hello world  ");
    expect(result).toEqual({ valid: true, title: "hello world" });
  });

  it("validates length after trimming", () => {
    // 500 chars + whitespace padding — should be valid after trim
    const title = " " + "a".repeat(500) + " ";
    const result = validateTodoTitle(title);
    expect(result).toEqual({ valid: true, title: "a".repeat(500) });
  });

  it("rejects length after trimming when over 500", () => {
    // 501 chars + whitespace padding — should be invalid after trim
    const title = " " + "a".repeat(501) + " ";
    const result = validateTodoTitle(title);
    expect(result).toEqual({
      valid: false,
      error: "Title must be 500 characters or less",
    });
  });
});
