# Reviewer Stress Test

## Description
Validate that the ralph reviewer can identify issues in code and that the coder can respond to rejection feedback. This story runs before the real todo app work to prove the full coder→reviewer→reject→fix→approve cycle works correctly. The task has intentionally strict acceptance criteria that require careful implementation — if the coder cuts corners, the reviewer should catch it.

## Acceptance Criteria
- A utility module `lib/validate.ts` is created with a `validateTodoTitle` function
- The function trims whitespace, rejects empty strings, rejects strings over 500 characters, and returns a result object (not throwing)
- The function has 100% branch coverage with tests in `__tests__/validate.test.ts`
- Tests cover: valid title, empty string, whitespace-only, exactly 500 chars (boundary), 501 chars (boundary), null/undefined input
- The module exports TypeScript types for the validation result
- `pnpm test` passes, `pnpm typecheck` passes, `pnpm lint` passes
