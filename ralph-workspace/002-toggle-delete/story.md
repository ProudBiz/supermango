# Toggle & Delete Todos

## Description

As a user, I want to mark todos as complete and delete todos I no longer need. This adds toggle and delete functionality to the existing todo list, completing the CRUD operations.

## Acceptance Criteria

- A `toggleTodo` server action toggles the completed status of a todo by ID
- A `deleteTodo` server action removes a todo by ID
- Each todo in the list has a checkbox/button to toggle completion
- Each todo has a delete button (small "x" or trash icon)
- Completed todos show strikethrough text and reduced opacity (opacity-50)
- Unit tests verify toggleTodo and deleteTodo actions (happy path + non-existent ID)
- A headless browser test confirms toggling and deleting work in a real browser
