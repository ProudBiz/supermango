# Todo CRUD Operations

## Description
Implement the core todo functionality: adding, toggling completion, and deleting todos. Server Actions handle mutations with input validation, and a Server Component page renders the interactive todo list. This story depends on Story 1 (Database Foundation) for the schema and connection.

## Acceptance Criteria
- `app/actions.ts` exports three Server Actions: addTodo, toggleTodo, deleteTodo
- addTodo trims whitespace, rejects empty titles, rejects titles over 500 characters, and returns an error message on validation failure
- toggleTodo flips the completed status of a todo by ID; no-op if ID doesn't exist
- deleteTodo removes a todo by ID; no-op if ID doesn't exist
- All actions call `revalidatePath('/')` after successful mutation
- `app/page.tsx` is a Server Component that queries todos from DB and renders: page title, add-form with input + button, todo list with toggle and delete forms per item
- The add-form uses `useActionState` (React 19) to display validation error messages as red text below the input
- Forms use the `action` prop for Server Action binding
- All three Server Actions have tests covering happy path, edge cases (empty title, >500 chars, non-existent ID), and error paths
- Tests mock `next/cache` and use `vi.mock('db/index.ts')` for DB injection
- `pnpm test` passes, `pnpm build` passes
