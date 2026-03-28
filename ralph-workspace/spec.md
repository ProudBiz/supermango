# Todo CRUD App (Ralph Loop Validation)

## Overview

Minimal CRUD todo webapp to validate the ralph multi-agent orchestration loop. The goal is to prove that the planner/coder/reviewer bash loop can autonomously produce a working, well-structured web application across multiple coordinated user stories using vertical feature slices.

Each user story delivers a complete feature from database to UI, tested with both unit tests (Vitest + in-memory SQLite) and headless browser tests (gstack-browse against a running dev server). This validates not just code generation but real end-to-end functionality.

## Non-Goals

- No real browser / E2E test frameworks (Playwright, Cypress). Use gstack-browse for browser verification.
- No authentication or multi-user support
- No categories, tags, priorities, or due dates
- No deployment or production infrastructure
- No SSR/ISR optimization beyond Next.js defaults

## Technical Considerations

- **Stack:** Next.js + React 19 + Tailwind 4 + SQLite (better-sqlite3) + Drizzle ORM + Vitest
- **Patterns:** Server Components for rendering, Server Actions for mutations, `revalidatePath('/')` after each mutation
- **DB:** `db/index.ts` exports a factory function `createDb(path?)` for test isolation. Default export uses file-based `./sqlite.db`
- **Testing:** Actions tested against real in-memory SQLite (not mocked DB). `vi.mock('next/cache')` for revalidatePath. Component tests with Testing Library + jsdom. Each task also verifies UI via gstack-browse headless browser.
- **Migration:** Use `drizzle-kit push` for schema sync (simplest for local SQLite)
- **Dependencies:** Use what's already in `pnpm-lock.yaml`. Install new deps as needed (Next.js, React, Tailwind, Drizzle, etc.)
- **Pre-requisites:** Create `next.config.ts` with `serverExternalPackages: ['better-sqlite3']`. Ensure `tsconfig.json` exists.
