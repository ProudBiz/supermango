# UI & Edge Cases

## Description
Polish the todo app with Tailwind styling, proper empty state handling, completed todo visual differentiation, and responsive layout. This story depends on Stories 1 and 2 for the working CRUD functionality.

## Acceptance Criteria
- Page uses a centered container (max-w-lg) with clear visual hierarchy: title > add-form > todo list > item count
- Empty state displays "No todos yet. Add one above!" in centered, muted text
- Completed todos show strikethrough title and reduced opacity (opacity-50)
- Delete button is a small "x" aligned right on each todo row
- Add-form has a full-width input with a submit button
- Validation error text displays in red below the input
- Layout works on all viewport sizes (single column, no breakpoint-specific changes needed)
- Native HTML form elements used throughout (no custom checkbox components)
- `pnpm dev` shows a clean, demo-worthy interface
- `pnpm build` and `pnpm lint` pass without errors or warnings
- All existing tests still pass
