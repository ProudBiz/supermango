# Tasks: Add a Todo

## Task 1: Set up Next.js project
**Description:** Initialize a new Next.js project with TypeScript in the repository root. Set up the basic app structure with a single page.
**Acceptance Criteria:**
- Next.js project is initialized with TypeScript
- The app builds and runs without errors
- A basic page renders at the root route
**TDD Approach:** Write a test that the home page renders without crashing
**Validation:** Run `npm run build` and `npm run dev` — the app starts and shows content at localhost:3000

## Task 2: Build the add todo functionality
**Description:** Create the main TODO page with an input field and add button. Implement React state to manage the todo list. When a user types a todo and submits (Enter or button click), it appears in the list below.
**Acceptance Criteria:**
- An input field and add button are visible on the page
- Typing text and pressing Enter adds the todo to the list
- Typing text and clicking the add button adds the todo to the list
- The input field clears after successful submission
- Empty or whitespace-only input does not add a todo
- Each todo is displayed as a list item with its text
**TDD Approach:** Test that submitting the form adds an item to the rendered list; test that empty input does not add an item; test that input clears after submission
**Validation:** Run tests. Manually verify in the browser that adding todos works as expected.
