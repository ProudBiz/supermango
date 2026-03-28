# Minimal CRUD Todo App

## Overview
A minimal CRUD todo application built with Next.js Server Components, Server Actions, and Drizzle ORM with SQLite. The app allows users to add, complete, and delete todos. This serves as a validation exercise for the ralph multi-agent orchestration loop, testing its ability to autonomously produce a working web app across multiple dependent user stories with TDD and code review.

A preliminary Story 0 (Reviewer Stress Test) validates the full coder→reviewer→reject→fix→approve cycle before the real todo app work begins. It creates a `validateTodoTitle` utility with strict acceptance criteria designed to stress-test the reviewer's ability to catch missing edge cases and type safety issues. This utility is also reused by Story 2's Server Actions.

The app uses a single page (`/`) with a centered layout: add-form at top, todo list below, optional item count footer. Empty state displays "No todos yet. Add one above!" Completed todos show strikethrough + reduced opacity. Validation errors (empty title, >500 chars) display as red text below the input using `useActionState`.

## Non-Goals
- Authentication or multi-user support
- E2E / Playwright tests
- Deployment pipeline or CI/CD
- Drag-and-drop reordering, due dates, categories, filters
- Custom error pages or error boundaries
- Dark mode or theme switching
- Ralph self-hosting / status dashboard

## Technical Considerations
- Uses existing tech stack: Next.js 16, React 19, Tailwind 4, SQLite + Drizzle ORM, Vitest
- No new dependencies beyond what's in package.json
- Server Components for rendering, Server Actions for mutations
- `next.config.ts` must include `serverExternalPackages: ['better-sqlite3']` (native module)
- `tsconfig.json` must be created (currently missing from repo)
- DB connection via factory function (`createDb(path?)`) for test isolation
- Tests mock `next/cache` (`revalidatePath`) and use `vi.mock('db/index.ts')` for DB injection
- `drizzle-kit push` for migrations (simplest for local SQLite)
- Forms use the `action` prop for Server Action binding (no onClick + startTransition)
- After adding a todo, the input field clears and retains focus for rapid entry
