# Progress: Filter Todos

### [Coder] Iteration 1
- **Task:** Task 1: Add filtered query support and active count
- **Status:** DONE
- **Files changed:** src/actions/todo-actions.ts, src/actions/todo-actions.test.ts
- **What was done:** Updated `getTodos()` to accept an optional `filter` parameter (`'all' | 'active' | 'completed'`). When `'active'`, queries for `completed = 0`; when `'completed'`, queries for `completed = 1`; otherwise returns all. Added `getActiveTodoCount()` that returns the count of incomplete todos using a SQL count query. All filtering is done at the database level via Drizzle ORM `where` clauses. Added 8 new tests covering all filter variants and the count function.
- **Self-validation:**
  - `getTodos(filter?)` accepts optional filter parameter — PASS
  - `'active'` filter returns only incomplete todos — PASS
  - `'completed'` filter returns only completed todos — PASS
  - `'all'` or undefined returns all todos — PASS
  - `getActiveTodoCount()` returns count of incomplete todos — PASS
  - Filtering at database query level (not JS) — PASS
