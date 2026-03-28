# Tasks: Toggle & Delete Todos

## Task 1: Toggle + Delete Actions

**Description:** Add toggleTodo and deleteTodo server actions to `app/actions.ts`. Both use Drizzle for DB mutation and call `revalidatePath('/')`.

**Acceptance Criteria:**
- `toggleTodo(id)` flips the completed status of the todo with the given ID
- `deleteTodo(id)` removes the todo with the given ID from the database
- Both actions handle non-existent IDs gracefully (no crash)
- Both actions call `revalidatePath('/')` after mutation

**TDD Approach:** Write tests for toggleTodo (verify status flips, verify non-existent ID doesn't crash) and deleteTodo (verify todo is removed, verify non-existent ID doesn't crash). Use in-memory SQLite.

**Validation:** Run `pnpm test` and verify all action tests pass.

## Task 2: Toggle + Delete UI + Browser Test

**Description:** Update the page to show toggle and delete controls for each todo. Completed todos should have visual distinction (strikethrough + reduced opacity). Verify the full toggle and delete flow in a headless browser.

**Acceptance Criteria:**
- Each todo row has a checkbox or button to toggle completion status
- Each todo row has a delete button (small "x" aligned right)
- Completed todos display with strikethrough text and opacity-50
- Toggling a todo updates its visual state immediately on page reload
- Deleting a todo removes it from the list

**TDD Approach:** Write component tests verifying completed todos render with the correct CSS classes, and that toggle/delete form elements exist.

**Validation:** Run `pnpm dev`, then use gstack-browse to: (1) add a todo, (2) toggle it complete and verify strikethrough appears, (3) toggle it back and verify strikethrough is removed, (4) delete it and verify it's gone from the list. Take screenshots. Also run `pnpm test`.
