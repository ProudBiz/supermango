# Tasks: Filter Todos

## Task 1: Add filtered query support and active count

**Description:** Update the todo query function to support filtering by status (all, active, completed) based on a filter parameter. Add a function to count active (incomplete) todos.

**Acceptance Criteria:**
- `getTodos(filter?: 'all' | 'active' | 'completed')` accepts an optional filter parameter
- When `filter` is `'active'`, only todos with `completed = 0` are returned
- When `filter` is `'completed'`, only todos with `completed = 1` are returned
- When `filter` is `'all'` or undefined, all todos are returned
- `getActiveTodoCount()` returns the count of incomplete todos
- Filtering is done at the database query level (not in JS)

**TDD Approach:** Write tests that create a mix of complete and incomplete todos, then verify each filter returns the correct subset. Test the active count function.

**Validation:** Run the tests.

## Task 2: Build filter tabs UI with URL search params

**Description:** Add filter tabs (All, Active, Completed) to the page. Use URL search params to persist the active filter. Display the active todo count.

**Acceptance Criteria:**
- Three filter buttons/tabs displayed between the add form and the todo list
- Tabs are styled as a button group, with the active tab visually highlighted
- Clicking a tab navigates to `?filter=active` or `?filter=completed` (or removes the param for "all")
- The page reads the `filter` search param and passes it to `getTodos()`
- A count of active todos is displayed (e.g., "3 items left")
- The filter tabs and count are mobile-friendly (well-sized tap targets, readable text)
- Page component accepts `searchParams` and uses them server-side

**TDD Approach:** Write tests verifying that each filter tab renders. Test that the active tab gets highlighted styling. Test that the count displays correctly.

**Validation:** Run `pnpm dev`, create a mix of completed and active todos, click each filter tab and verify the list updates. Verify the URL changes. Bookmark a filtered URL and reload to confirm persistence.
