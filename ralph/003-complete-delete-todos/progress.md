### [Coder] Iteration 1
- **Task:** Task 1 — Create server actions for toggling and deleting todos
- **Status:** DONE
- **Files changed:** `src/actions/todo-actions.ts`, `src/actions/todo-actions.test.ts`
- **What was done:** Added `toggleTodo(id)` and `deleteTodo(id)` server actions. `toggleTodo` reads the current completed state and flips it (0→1, 1→0). `deleteTodo` removes the todo by ID. Both validate the ID exists (throw "Todo not found" otherwise) and call `revalidatePath('/')`. Added 8 tests covering toggle, delete, non-existent IDs, and revalidation.
- **Self-validation:**
  - ✅ `toggleTodo(id)` flips the `completed` field
  - ✅ `deleteTodo(id)` removes the todo from the database
  - ✅ Both call `revalidatePath('/')`
  - ✅ Both validate ID exists before mutating

### [Coder] Iteration 1 (cont.)
- **Task:** Task 2 — Add completion toggle and delete button to todo items
- **Status:** DONE
- **Files changed:** `src/components/TodoItem.tsx` (new), `src/components/TodoItem.test.tsx` (new), `src/components/TodoList.tsx`, `src/components/TodoList.test.tsx`
- **What was done:** Extracted `TodoItem` as a `"use client"` component from `TodoList`. Each todo item renders a checkbox (bound to `toggleTodo` via form action), the todo text with conditional strikethrough/muted styling, and a delete button (bound to `deleteTodo` via form action). Delete button is always visible on mobile, hover-only on desktop. `TodoList` remains a server component that delegates rendering to `TodoItem`. Added 8 component tests and updated TodoList tests.
- **Self-validation:**
  - ✅ Checkbox reflects `completed` state (`defaultChecked`)
  - ✅ Clicking checkbox submits form calling `toggleTodo`
  - ✅ Completed todos display with strikethrough and muted text
  - ✅ Delete button present (always on mobile, hover on desktop)
  - ✅ Delete button submits form calling `deleteTodo`
  - ✅ List refreshes via `revalidatePath('/')`
  - ✅ Mobile-first layout with proper gap spacing

**Task DONE**
