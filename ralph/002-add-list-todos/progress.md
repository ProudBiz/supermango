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
