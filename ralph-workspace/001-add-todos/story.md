# Add Todos

## Description

As a user, I want to add todos to a list so I can track things I need to do. This is the foundational vertical slice: database schema, server action, page UI with form, and styling. After this story, the app should be runnable and a user can add todos and see them listed.

## Acceptance Criteria

- A todos table exists in SQLite with columns: id (integer PK), title (text, not null), completed (integer, default 0), createdAt (text, default current timestamp)
- An `addTodo` server action accepts a title string, creates a new todo, and revalidates the page
- The main page (`/`) displays a list of all todos ordered by creation date (newest first)
- An input field and "Add" button allow submitting new todos
- The page is styled with Tailwind: centered container (max-w-lg), clean typography, visible form elements
- Unit tests verify the addTodo action works correctly (happy path + edge cases)
- A headless browser test confirms the add flow works in a real browser (navigate to localhost, type a title, submit, verify it appears in the list)
