# Tasks: Polish & Edge Cases

## Task 1: Empty State + Validation + Input UX + Browser Test

**Description:** Add empty state UI, input validation in the addTodo action (reject empty and too-long titles with error messages), error display in the form using `useActionState`, and auto-clear + focus retention after successful add. Verify all edge cases in a headless browser.

**Acceptance Criteria:**
- Empty state: "No todos yet. Add one above!" shown when todo list is empty, centered and muted
- addTodo rejects empty titles (after trimming whitespace) and returns an error message
- addTodo rejects titles over 500 characters and returns an error message
- Error messages display as red text below the input field
- After a successful add, the input clears and retains focus for rapid entry
- Page renders correctly on a narrow mobile viewport (no horizontal overflow)
- The form uses `useActionState` (React 19) to handle the action state and display errors

**TDD Approach:** Write unit tests for addTodo validation: empty string returns error, whitespace-only string returns error, 501-char string returns error, valid string succeeds. Write a component test for the empty state rendering.

**Validation:** Run `pnpm dev`, then use gstack-browse to: (1) verify empty state message when no todos exist, (2) submit empty form and verify error message appears, (3) add a valid todo and verify input clears + focus retained, (4) resize viewport to mobile width and verify no horizontal scroll. Take screenshots. Also run `pnpm test`.
