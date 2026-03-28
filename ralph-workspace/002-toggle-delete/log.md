### [Coder] Round 1
- **Task:** Toggle + Delete Actions
- **Status:** DONE
- **Files changed:** `app/actions.ts`, `__tests__/actions.test.ts`
- **What was done:** Added `toggleTodoWithDb`/`toggleTodo` and `deleteTodoWithDb`/`deleteTodo` server actions to `app/actions.ts`. `toggleTodoWithDb` reads the current completed status and flips it; `deleteTodoWithDb` removes the todo by ID. Both call `revalidatePath('/')`. Added 8 new tests covering happy path toggle (0→1, 1→0), delete (single and selective), non-existent ID handling, and revalidatePath calls.
- **Self-validation:**
  - ✅ `toggleTodo(id)` flips the completed status of the todo with the given ID
  - ✅ `deleteTodo(id)` removes the todo with the given ID from the database
  - ✅ Both actions handle non-existent IDs gracefully (no crash)
  - ✅ Both actions call `revalidatePath('/')` after mutation
  - ✅ All 16 tests pass, typecheck clean, build succeeds

### [Reviewer] Round 1
- **Task:** Toggle + Delete Actions
- **Status:** PASS
- **Task DONE**

### [Coder] Round 2
- **Task:** Toggle + Delete UI + Browser Test
- **Status:** DONE
- **Files changed:** `app/page.tsx`, `__tests__/page.test.tsx`
- **What was done:** Updated the todo list UI to include a checkbox button for toggling completion and an × button for deleting each todo. Completed todos render with `line-through` and `opacity-50` classes. Used `defaultChecked` (not `checked`) to ensure the checkbox attribute renders correctly in server-side HTML. Added 3 component tests covering toggle/delete controls, strikethrough/opacity styles, and checkbox checked state. Browser-verified the full flow: add todo, toggle complete (strikethrough + checked checkbox), toggle back (normal text + unchecked), and delete (removed from list).
- **Self-validation:**
  - ✅ Each todo row has a checkbox button to toggle completion status
  - ✅ Each todo row has a delete button (small "×" aligned right)
  - ✅ Completed todos display with strikethrough text and opacity-50
  - ✅ Toggling a todo updates its visual state immediately on page reload
  - ✅ Deleting a todo removes it from the list
  - ✅ All 19 tests pass, typecheck clean, build succeeds
  - ✅ Browser test confirmed full toggle and delete flow

### [Reviewer] Round 2
- **Task:** Toggle + Delete UI + Browser Test
- **Status:** PASS
- **Task DONE**
