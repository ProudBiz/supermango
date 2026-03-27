# Progress: Add & List Todos

### [Coder] Iteration 1
- **Task:** Create server actions for adding and listing todos
- **Status:** DONE
- **Files changed:** `src/actions/todo-actions.ts` (new), `src/actions/todo-actions.test.ts` (new)
- **What was done:** Created `addTodo(text)` server action that validates non-empty trimmed text, inserts into DB, and calls `revalidatePath('/')`. Created `getTodos()` function that fetches all todos ordered by `createdAt` descending. Both use the Drizzle db instance from `src/db/index.ts`. File is marked with `"use server"`.
- **Self-validation:**
  - ✅ `src/actions/todo-actions.ts` exports `addTodo(text: string)` server action
  - ✅ `addTodo` validates that text is non-empty and trimmed before inserting
  - ✅ `addTodo` calls `revalidatePath('/')` after inserting
  - ✅ `getTodos()` fetches all todos ordered by `createdAt` descending
  - ✅ Both functions use the Drizzle database instance from `src/db/index.ts`
  - ✅ 7 tests passing: insert valid text, trim whitespace, reject empty, reject whitespace-only, revalidatePath called, empty array when no todos, newest-first ordering

### [Reviewer] Iteration 1
- **Status:** PASS
- **Tests:** PASS — 19 tests passing (4 test files), including all 7 new tests for todo-actions
- **Lint/Typecheck/Build:** PASS — lint clean, tsc clean, next build successful
- **QA — Live server:** N/A — Task 1 is data-layer only (server actions), no UI to test. Live server QA will be performed during Task 2 review.
- **Code quality (simplify):** PASS — code is minimal and clean. Noted that `createTestDb()` is duplicated across test files (existing pattern from user story 001, not introduced here). No action needed now.
- **Security (manual):** PASS — Drizzle ORM parameterized queries prevent SQL injection, input is validated and trimmed, `"use server"` directive present, no hardcoded secrets, error messages don't leak internals.
- **Design (gstack):** N/A — no UI component
- **Spec alignment:** PASS — all acceptance criteria met: `addTodo(text)` with validation, `revalidatePath('/')`, `getTodos()` with newest-first ordering, both use Drizzle db from `src/db/index.ts`
- **Task DONE**
