# Tasks: Complete & Delete Todos

## Task 1: Create server actions for toggling and deleting todos

**Description:** Add server actions to toggle a todo's completed status and to delete a todo by ID.

**Acceptance Criteria:**
- `toggleTodo(id: number)` server action flips the `completed` field in the database
- `deleteTodo(id: number)` server action removes the todo from the database
- Both actions call `revalidatePath('/')` after the mutation
- Both actions validate that the ID exists before mutating

**TDD Approach:** Write tests that create a todo, toggle it, and verify `completed` changed. Test toggling back. Test deleting a todo and verifying it's gone. Test with non-existent IDs.

**Validation:** Run the tests. Verify actions are marked with `"use server"`.

## Task 2: Add completion toggle and delete button to todo items

**Description:** Update the todo list UI to include a checkbox for toggling completion and a delete button for each todo item.

**Acceptance Criteria:**
- Each todo item has a checkbox that reflects its `completed` state
- Clicking the checkbox calls the `toggleTodo` server action
- Completed todos display with strikethrough text and muted styling
- Each todo item has a delete button (always visible on mobile, visible on hover on desktop)
- Clicking delete calls the `deleteTodo` server action
- The list refreshes after each action
- Mobile-first layout: checkbox, text, and delete button are well-spaced on small screens

**TDD Approach:** Write component tests verifying the checkbox renders checked/unchecked based on todo state. Test that the delete button is present for each item.

**Validation:** Run `pnpm dev`, create todos, toggle some as complete (verify strikethrough), delete some (verify removal). Test on mobile viewport.
