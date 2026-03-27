export type ValidationResult =
  | { valid: true; title: string }
  | { valid: false; error: string };

export function validateTodoTitle(title: unknown): ValidationResult {
  if (typeof title !== "string" || title.trim() === "") {
    return { valid: false, error: "Title is required" };
  }

  const trimmed = title.trim();

  if (trimmed.length > 500) {
    return { valid: false, error: "Title must be 500 characters or less" };
  }

  return { valid: true, title: trimmed };
}
