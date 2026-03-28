# Tasks: Todo CRUD Operations

## Task 1: Server Actions and Page Component
**Description:** Create the three Server Actions (addTodo, toggleTodo, deleteTodo) with full input validation, and the page component that renders the interactive todo list with forms.
**Acceptance Criteria:**
- `app/actions.ts` with `'use server'` directive exports addTodo, toggleTodo, deleteTodo
- addTodo: trims title, returns error string if empty or >500 chars, inserts into DB, calls revalidatePath('/')
- toggleTodo: accepts FormData with hidden id field, flips completed boolean, calls revalidatePath('/')
- deleteTodo: accepts FormData with hidden id field, deletes row, calls revalidatePath('/')
- `app/page.tsx` queries todos via Drizzle, renders full list with add-form (using useActionState for error display), toggle buttons, and delete buttons
- Forms use the `action` prop (not onClick handlers)
- Input clears and retains focus after successful add
- `pnpm build` passes (verifies 'use server' directive and native module externalization)
**TDD Approach:** Write tests for each Server Action: addTodo happy path (inserts and returns), addTodo with empty title (returns error), addTodo with >500 char title (returns error), toggleTodo flips completion, toggleTodo with non-existent ID (no error), deleteTodo removes row, deleteTodo with non-existent ID (no error). Mock next/cache and db/index.ts.
**Validation:** `pnpm test` passes. `pnpm build` passes. Manual check: `pnpm dev` shows the todo page with working add/toggle/delete.

## Task 2: Comprehensive Action and Component Tests
**Description:** Add thorough tests for all Server Actions and verify the page component renders correctly.
**Acceptance Criteria:**
- Tests for addTodo: happy path, empty title rejected, whitespace-only title rejected, >500 char title rejected
- Tests for toggleTodo: toggle true->false, toggle false->true, non-existent ID is no-op
- Tests for deleteTodo: delete existing todo, non-existent ID is no-op
- Component test: page renders todo list with correct items, shows empty state with 0 todos
- All tests use the in-memory DB test helper from `__tests__/helpers/db.ts`
- All tests mock `next/cache` and `db/index.ts`
- `pnpm test` passes with all tests green
**TDD Approach:** Tests ARE the deliverable for this task. Write comprehensive test cases for every edge case listed above.
**Validation:** `pnpm test` passes. Test count increases. Coverage covers all action branches.
