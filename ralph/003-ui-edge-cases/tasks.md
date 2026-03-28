# Tasks: UI & Edge Cases

## Task 1: Tailwind Styling and Edge States
**Description:** Apply Tailwind CSS styling to create a clean, minimal todo interface. Handle empty state, completed todo visual differentiation, and ensure responsive behavior.
**Acceptance Criteria:**
- Centered container with `max-w-lg mx-auto` and appropriate padding
- Page title styled as a clear heading
- Add-form: full-width input + button in a row, with focus ring on input
- Todo list: vertical stack with subtle dividers or spacing between items
- Each todo row: toggle form (checkbox or button), title text, delete "x" button aligned right
- Completed todos: `line-through` on title, `opacity-50` on the row
- Empty state: "No todos yet. Add one above!" centered, text-gray-500 or similar muted color
- Validation error: red text below input field
- Item count footer (e.g., "3 items, 1 completed") in muted text
- Works on mobile, tablet, and desktop without breakpoint-specific CSS
- All existing tests still pass after styling changes
- `pnpm lint` passes
- `pnpm build` passes
**TDD Approach:** Write or update component tests to verify: empty state message renders when no todos, completed todos have appropriate CSS classes, item count displays correct numbers. Test that the page still renders correctly with the new styling.
**Validation:** `pnpm test` passes. `pnpm build` passes. `pnpm lint` passes. Visual check: `pnpm dev` shows a clean, professional-looking todo app.
