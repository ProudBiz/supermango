# Tasks: Reviewer Stress Test

## Task 1: Validation Utility with Strict TDD
**Description:** Create a `validateTodoTitle` utility function with strict acceptance criteria designed to stress-test the reviewer. The function must return a typed result object (not throw), handle all edge cases including null/undefined, and have 100% branch coverage. The reviewer should catch any missing boundary tests, incorrect return types, or sloppy error handling.
**Acceptance Criteria:**
- `lib/validate.ts` exports `validateTodoTitle(title: unknown): ValidationResult`
- `ValidationResult` type: `{ valid: true; title: string } | { valid: false; error: string }`
- Trims whitespace before validation
- Returns `{ valid: false, error: "Title is required" }` for empty, null, undefined, or whitespace-only input
- Returns `{ valid: false, error: "Title must be 500 characters or less" }` for strings over 500 chars
- Returns `{ valid: true, title: "<trimmed>" }` for valid input
- Input typed as `unknown` (not `string`) to force proper type narrowing
- Tests in `__tests__/validate.test.ts` cover: valid title, empty string, whitespace-only, null, undefined, non-string input (number), exactly 500 chars (valid boundary), 501 chars (invalid boundary), string with leading/trailing whitespace (trimmed)
- `pnpm test` passes, `pnpm typecheck` passes, `pnpm lint` passes
**TDD Approach:** Write ALL test cases first. Then implement the function to make them pass. The reviewer should verify: (1) tests were written before implementation (check git history), (2) all boundary cases are covered, (3) return types are correct, (4) no type assertions or `as` casts used.
**Validation:** `pnpm test` passes with all validate tests green. `pnpm typecheck` passes. `pnpm lint` passes. The reviewer specifically checks for missing edge cases and type safety.
