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

### [Reviewer] Pass 1
- **Task:** Task 1: Add filtered query support and active count
- **Verdict:** PASS
- **Details:**
  - All 53 tests pass (including 8 new filter/count tests)
  - TypeScript type check: clean
  - Next.js build: successful
  - `getTodos(filter?)` signature correct with proper union type
  - All three filter modes (`active`, `completed`, `all`/undefined) use DB-level `where` clauses
  - `getActiveTodoCount()` uses SQL `count()` aggregate — efficient
  - Test coverage is thorough: edge cases (empty DB, all completed, mixed) covered
- **Task DONE**

### [Coder] Iteration 2
- **Task:** Task 2: Build filter tabs UI with URL search params
- **Status:** DONE
- **Files changed:** src/components/FilterTabs.tsx, src/components/FilterTabs.test.tsx, src/app/page.tsx, src/app/page.test.tsx
- **What was done:** Created FilterTabs component with three filter links (All, Active, Completed) styled as a button group with active tab highlighting (bg-gray-900). Links use URL search params (?filter=active, ?filter=completed, / for all). Displays active todo count with singular/plural ("N items left"). Updated Home page to accept searchParams (Promise-based for Next.js 16), parse and validate the filter param, pass it to getTodos(), and render FilterTabs between the form and list. Added 11 FilterTabs tests and 3 new page integration tests.
- **Self-validation:**
  - Three filter buttons/tabs displayed between form and list — PASS
  - Tabs styled as button group, active tab visually highlighted — PASS
  - Clicking tab navigates to correct URL search param — PASS
  - Page reads filter search param and passes to getTodos() — PASS
  - Count of active todos displayed (e.g., "3 items left") — PASS
  - Filter tabs and count are mobile-friendly — PASS
  - Page component accepts searchParams and uses them server-side — PASS
