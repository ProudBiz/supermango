# Tasks: Add Todos

## Task 1: Database + addTodo Action

**Description:** Set up the database foundation and the addTodo server action. Create the Drizzle schema (todos table), database connection module with factory function for test isolation, drizzle config, and the addTodo server action. Install all necessary dependencies (Next.js, React, Tailwind, Drizzle, better-sqlite3, etc.). Create `next.config.ts` and `tsconfig.json` if they don't exist. Run `drizzle-kit push` to sync the schema.

**Acceptance Criteria:**
- `db/schema.ts` defines a todos table with id, title, completed, createdAt
- `db/index.ts` exports `createDb(path?)` factory and a default db instance using `./sqlite.db`
- `drizzle.config.ts` points to the SQLite database
- `app/actions.ts` exports `addTodo` server action that inserts a todo and calls `revalidatePath('/')`
- `drizzle-kit push` runs successfully and creates the table
- All necessary dependencies are installed and configured

**TDD Approach:** Write tests first for the addTodo action: verify it creates a todo in the DB, verify the title is stored correctly, verify it handles empty title gracefully. Use an in-memory SQLite DB for tests. Mock `next/cache` to stub `revalidatePath`.

**Validation:** Run `pnpm test` and verify all action tests pass. Verify `sqlite.db` exists after running push.

## Task 2: Page UI + Add Form + Browser Test

**Description:** Create the main page as a Server Component that queries todos from the DB and renders them as a list. Add an input form for creating new todos. Style with Tailwind: centered layout (max-w-lg), page title, input + button, todo list. Verify the complete add flow works in a headless browser.

**Acceptance Criteria:**
- `app/page.tsx` is a Server Component that queries all todos and renders them
- A form with an input field and "Add" button submits via the addTodo server action
- Todos are displayed in a vertical list, newest first
- Page has Tailwind styling: centered container, clean layout, readable typography
- `app/layout.tsx` includes Tailwind CSS setup and basic HTML structure
- `app/globals.css` imports Tailwind

**TDD Approach:** Write a component test that renders the page with mock data and verifies the todo list renders correctly. Test the form exists and has the expected elements.

**Validation:** Run `pnpm dev`, then use gstack-browse to navigate to `http://localhost:3000`, type a todo title in the input, submit the form, and verify the todo appears in the list. Take a screenshot as evidence. Also run `pnpm test` for unit tests.
