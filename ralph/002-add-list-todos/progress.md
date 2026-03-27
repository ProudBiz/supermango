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

### [Coder] Iteration 1
- **Task:** Build the add todo form and todo list UI
- **Status:** DONE
- **Files changed:** `src/components/AddTodoForm.tsx` (new), `src/components/AddTodoForm.test.tsx` (new), `src/components/TodoList.tsx` (new), `src/components/TodoList.test.tsx` (new), `src/app/page.tsx` (modified), `src/app/page.test.tsx` (modified)
- **What was done:** Created `AddTodoForm` client component (`"use client"`) with text input (required + client-side trim check), "Add" button, and form reset on success. Created `TodoList` server component that renders todos in a `<ul>` with empty state. Updated `page.tsx` to be an async server component that fetches todos via `getTodos()` and renders both components with centered, max-width Tailwind layout.
- **Self-validation:**
  - ✅ Main page displays heading, add form, and todo list
  - ✅ `AddTodoForm.tsx` is a client component with text input and "Add" button
  - ✅ Submitting the form calls the `addTodo` server action
  - ✅ Empty submissions prevented (HTML `required` attribute + client-side trim check)
  - ✅ Input clears after successful submission (`formRef.current?.reset()`)
  - ✅ `TodoList.tsx` displays all todos from the database
  - ✅ Each todo item shows its text
  - ✅ Page has clean, mobile-first styling with Tailwind CSS
  - ✅ Layout is centered (`mx-auto`), max-width constrained (`max-w-lg`), with proper spacing
  - ✅ 29 tests passing (6 test files), all pre-commit gates green (lint, typecheck, build)

### [Reviewer] Iteration 1
- **Task:** Build the add todo form and todo list UI
- **Status:** PASS
- **Tests:** PASS — 29 tests passing (6 test files), all green
- **Lint/Typecheck/Build:** PASS — lint clean, tsc clean, next build successful
- **QA — Live server:** PASS — verified on localhost:3099:
  - Page loads with heading "Supermango Todo", input, and "Add" button
  - Empty state shows "No todos yet. Add one above!"
  - Added "Buy groceries" — appears in list, input clears
  - Added "Walk the dog" — appears first (newest-first ordering confirmed)
  - Whitespace-only submission rejected (no new todo created)
  - Mobile viewport (375x812) renders cleanly with proper responsive layout
  - No console errors
- **Code quality (simplify):** PASS — code is minimal and clean. Notes: `flattenChildren` duplicated in test files (pre-existing pattern), `Todo` interface could use Drizzle `$inferSelect` (improvement for future). No blocking issues.
- **Security (manual):** PASS — `"use client"` directive present, React auto-escapes rendered text (no XSS), no `dangerouslySetInnerHTML`, no hardcoded secrets, form input validated with `required` + trim check, server action invocation via `action=` prop is safe.
- **Design (gstack):** PASS — clean mobile-first layout, centered with max-width, proper spacing, good input/button styling with focus states, empty state is well-styled.
- **Spec alignment:** PASS — all 8 acceptance criteria met. Components structured to support future user stories (003 complete/delete, 004 filter, 005 edit).
- **Task DONE**

### **USER STORY DONE**
