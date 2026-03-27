# Tasks: Add & List Todos

## Task 1: Create server actions for adding and listing todos

**Description:** Create server actions that add a new todo to the database and fetch all todos ordered by creation date (newest first). These are the data layer that the UI will call.

**Acceptance Criteria:**
- `src/actions/todo-actions.ts` exports `addTodo(text: string)` server action
- `addTodo` validates that text is non-empty and trimmed before inserting
- `addTodo` calls `revalidatePath('/')` after inserting
- A query function `getTodos()` fetches all todos ordered by `createdAt` descending
- Both functions use the Drizzle database instance from `src/db/index.ts`

**TDD Approach:** Write tests that call `addTodo` with valid text and verify a row is inserted. Test with empty string and whitespace-only string to verify rejection. Test `getTodos` returns items in newest-first order.

**Validation:** Run the tests. Verify the server actions are properly marked with `"use server"`.

## Task 2: Build the add todo form and todo list UI

**Description:** Create the main page with a form to add todos and a list to display them. The form is a client component, the list uses server components.

**Acceptance Criteria:**
- Main page (`src/app/page.tsx`) displays a heading, the add form, and the todo list
- `src/components/AddTodoForm.tsx` is a client component with a text input and "Add" button
- Submitting the form calls the `addTodo` server action
- Empty submissions are prevented (HTML required attribute + client-side check)
- The input clears after successful submission
- `src/components/TodoList.tsx` displays all todos from the database
- Each todo item shows its text
- The page has clean, mobile-first styling with Tailwind CSS
- Layout is centered, max-width constrained, with proper spacing

**TDD Approach:** Write component tests that verify the form renders with input and button. Test that the todo list renders items passed to it.

**Validation:** Run `pnpm dev`, add a few todos via the form, and verify they appear in the list. Check mobile viewport looks good.
