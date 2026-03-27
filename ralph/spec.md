# TODO Web App

## Overview
A simple, sleek TODO web application built with Next.js. Users can add, complete, and delete todos in a single list. The app features a modern dark theme design. State is managed in React only — todos do not persist across page refreshes.

## User Stories

### 001: Add a Todo
**Description:** The user can type a todo into an input field and add it to the list.
**Acceptance Criteria:**
- An input field is visible at the top of the page
- User can submit a todo by pressing Enter or clicking an add button
- The new todo appears in the list below
- The input field clears after submission
- Empty todos cannot be added

### 002: Complete a Todo
**Description:** The user can mark a todo as completed.
**Acceptance Criteria:**
- Each todo has a clickable checkbox or toggle
- Clicking it toggles the todo between completed and active states
- Completed todos have a visual distinction (strikethrough, dimmed, etc.)

### 003: Delete a Todo
**Description:** The user can remove a todo from the list.
**Acceptance Criteria:**
- Each todo has a delete button
- Clicking delete removes the todo from the list immediately
- The remaining todos re-render correctly

### 004: Dark Theme UI
**Description:** The app has a sleek, modern dark theme.
**Acceptance Criteria:**
- Dark background with light text
- Subtle contrast between UI elements (input, list items, buttons)
- Clean typography and spacing
- Responsive layout that works on mobile and desktop

## Non-Goals
- No persistence (localStorage, database, or API)
- No filtering or sorting
- No multiple lists or projects
- No due dates, priorities, or tags
- No user authentication

## Technical Considerations
- Built with Next.js (App Router)
- All state managed via React useState
- Styling via CSS modules or Tailwind (whichever is simpler to set up)
- Single page application — no routing needed beyond the index page
