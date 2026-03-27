# Todo Webapp — Ralph Demo

## Overview

A todo webapp built with Next.js 16 (App Router), SQLite, and Drizzle ORM. This app serves as the first end-to-end test case for the ralph multi-agent orchestration system. The goal is to verify that ralph.planner → ralph.loop → ralph.coder/reviewer can autonomously build a working, browser-testable webapp from scratch.

The app supports adding, completing, deleting, filtering, and editing todos, with data persisted in a local SQLite database via Drizzle ORM and Next.js server actions. Mobile-first design using Tailwind CSS.

## User Stories

### 001: Project Setup

**Description:** Set up the Next.js project with App Router, Tailwind CSS, Drizzle ORM, and SQLite. Create the database schema for todos.

**Acceptance Criteria:**
- Next.js 16 app scaffolded with App Router (TypeScript)
- Tailwind CSS v4.2 configured and working
- Drizzle ORM installed and configured with SQLite (`better-sqlite3`)
- `todos` table schema defined: `id` (integer, primary key, auto-increment), `text` (text, not null), `completed` (integer/boolean, default 0), `createdAt` (integer/timestamp, default now)
- Drizzle migration generated and applied
- App runs with `pnpm dev` and shows a placeholder page
- `drizzle.config.ts` and `src/db/` directory structure in place
- Old untracked `.next/` and `node_modules/` cleaned up before scaffolding

### 002: Add & List Todos

**Description:** Users can add new todos via a form and see all existing todos in a list.

**Acceptance Criteria:**
- Text input and "Add" button at the top of the page
- Submitting the form creates a new todo in the database via a server action
- Empty text submissions are rejected (client-side validation)
- All todos display in a list below the form, ordered by creation date (newest first)
- Each todo shows its text
- Page uses server components for the todo list (fetches from DB on each request)
- The form is a client component that calls the server action
- After adding a todo, the list refreshes to show the new item

### 003: Complete & Delete Todos

**Description:** Users can mark todos as complete/incomplete and delete them.

**Acceptance Criteria:**
- Each todo has a checkbox to toggle completed status
- Toggling calls a server action that updates the `completed` field in the database
- Completed todos show with strikethrough text styling
- Each todo has a delete button (visible on hover or always visible)
- Clicking delete removes the todo from the database via a server action
- The list refreshes after each toggle or delete

### 004: Filter Todos

**Description:** Users can filter the todo list by status: All, Active, or Completed.

**Acceptance Criteria:**
- Three filter buttons/tabs at the top of the list: "All", "Active", "Completed"
- "All" shows all todos (default)
- "Active" shows only todos where `completed` is false
- "Completed" shows only todos where `completed` is true
- Active filter is visually highlighted
- Filtering uses URL search params (e.g., `?filter=active`) so the state is bookmarkable
- Filter logic runs on the server (query the database with the filter condition)
- A count of remaining active todos is displayed (e.g., "3 items left")

### 005: Edit Todo Text

**Description:** Users can edit the text of an existing todo inline.

**Acceptance Criteria:**
- Double-clicking a todo's text enters edit mode
- Edit mode shows a text input pre-filled with the current text
- Pressing Enter or blurring the input saves the change via a server action
- Pressing Escape cancels the edit and reverts to the original text
- Empty text is rejected (validation — cannot save an empty todo)
- The list refreshes after a successful edit
- Only one todo can be in edit mode at a time

## Non-Goals

- No user authentication or multi-user support
- No cloud deployment (runs locally only)
- No real-time/websocket updates
- No drag-and-drop reordering
- No categories, tags, or priority levels
- No due dates or reminders

## Technical Considerations

- **Package manager:** pnpm
- **Framework:** Next.js 16 with App Router, TypeScript
- **Database:** SQLite via `better-sqlite3`
- **ORM:** Drizzle ORM with `drizzle-kit` for migrations
- **Styling:** Tailwind CSS v4.2, mobile-first design
- **Data mutation:** Next.js Server Actions (no API routes)
- **State refresh:** `revalidatePath('/')` after mutations
- **Filter state:** URL search params (`?filter=active|completed`)
- **Directory structure:** `src/app/` for routes, `src/db/` for schema/connection, `src/components/` for UI, `src/actions/` for server actions
- **Testing:** Vitest for unit/integration tests
- **Cleanup:** Delete untracked `.next/` and `node_modules/` before scaffolding
