# Polish & Edge Cases

## Description

As a user, I want the app to handle edge cases gracefully and feel polished. Empty states should be informative, invalid input should show clear errors, and the input should be ready for rapid entry after adding a todo.

## Acceptance Criteria

- When there are no todos, display "No todos yet. Add one above!" in centered, muted text
- Submitting an empty title shows an error message (red text below the input)
- Submitting a title over 500 characters shows an error message
- After successfully adding a todo, the input field clears and retains focus
- The page works well on mobile viewports (single column, no horizontal scroll)
- Unit tests cover validation edge cases (empty title, too-long title)
- A headless browser test verifies the empty state, error messages, and input behavior
