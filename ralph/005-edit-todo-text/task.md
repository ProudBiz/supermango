# Tasks: Edit Todo Text

## Task 1: Create server action for updating todo text

**Description:** Add a server action that updates the text of an existing todo.

**Acceptance Criteria:**
- `updateTodoText(id: number, text: string)` server action updates the todo's text in the database
- Validates that text is non-empty and trimmed
- Validates that the todo exists before updating
- Calls `revalidatePath('/')` after the mutation

**TDD Approach:** Write tests that create a todo, update its text, and verify the change persisted. Test with empty string (should reject). Test with non-existent ID.

**Validation:** Run the tests.

## Task 2: Build inline editing UI

**Description:** Add inline editing capability to todo items. Double-clicking a todo's text enters edit mode with an input field.

**Acceptance Criteria:**
- Double-clicking a todo's text enters edit mode
- Edit mode replaces the text with an input field pre-filled with the current text
- The input auto-focuses when edit mode activates
- Pressing Enter saves the change by calling the `updateTodoText` server action
- Pressing Escape cancels the edit and reverts to the original text
- Blurring the input (clicking away) saves the change
- Empty text is rejected — the input shows a visual indicator and does not save
- Only one todo can be in edit mode at a time
- Edit mode works well on mobile (input is full-width, tap-friendly)
- The todo item component manages edit state as a client component

**TDD Approach:** Write component tests verifying that double-clicking switches to edit mode. Test that the input appears with the correct value. Test Escape reverts.

**Validation:** Run `pnpm dev`, double-click a todo to edit it, press Enter to save, verify the text updated. Test Escape to cancel. Test on mobile viewport.
