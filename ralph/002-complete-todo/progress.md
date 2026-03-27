### [Coder] Iteration 1
- **Task:** Add toggle completion functionality
- **Status:** DONE
- **Files changed:** `src/app/page.tsx`, `src/__tests__/complete-todo.test.tsx`
- **What was done:** Added `completed` boolean to the Todo interface. Added a `toggleTodo` function that toggles completion state by todo ID. Each todo item now renders a checkbox and wraps the text in a `<span>` that applies `line-through` and `opacity-50` classes when completed. Created 5 tests covering: checkbox rendering, toggling to completed, completed styles applied, toggling back to active, and independent toggling of multiple todos.
- **Self-validation:**
  - ✅ Each todo item has a clickable checkbox
  - ✅ Clicking the checkbox toggles the todo between active and completed
  - ✅ Completed todos display with strikethrough text and reduced opacity
  - ✅ Toggling back to active restores normal appearance
  - ✅ All 12 tests pass (7 existing + 5 new)
  - ✅ Lint passes (only pre-existing warning)

### [Reviewer] Iteration 1
- **Status:** PASS
- **Task DONE**
