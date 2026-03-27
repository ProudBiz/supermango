# Tasks: Project Setup

## Task 1: Clean up and scaffold Next.js project

**Description:** Remove the old untracked `.next/` and `node_modules/` directories, then scaffold a new Next.js 16 app with TypeScript and App Router using `pnpm create next-app`. Configure Tailwind CSS v4.2.

**Acceptance Criteria:**
- Old `.next/` and `node_modules/` directories are deleted
- Next.js 16 app scaffolded with App Router and TypeScript via `pnpm create next-app`
- Tailwind CSS v4.2 is configured and working (verify with a styled element on the page)
- `pnpm dev` starts the dev server successfully
- The default page renders in the browser

**TDD Approach:** Verify the dev server starts without errors. Add a simple Vitest test that imports a module from the project to confirm TypeScript compilation works.

**Validation:** Run `pnpm dev` and confirm the page loads at localhost:3000. Check that Tailwind utility classes apply correctly.

## Task 2: Set up Drizzle ORM with SQLite

**Description:** Install Drizzle ORM and `better-sqlite3`. Create the database schema for the `todos` table. Configure `drizzle.config.ts`. Generate and apply the initial migration. Create the database connection module.

**Acceptance Criteria:**
- `drizzle-orm`, `better-sqlite3`, `drizzle-kit`, and their TypeScript types are installed
- `src/db/schema.ts` defines the `todos` table with columns: `id` (integer, primary key, auto-increment), `text` (text, not null), `completed` (integer, default 0), `createdAt` (integer, default current timestamp)
- `src/db/index.ts` exports a configured Drizzle database instance connected to a local SQLite file
- `drizzle.config.ts` is configured for SQLite
- Migration is generated with `drizzle-kit generate` and can be applied with `drizzle-kit migrate`
- Add `pnpm db:generate` and `pnpm db:migrate` scripts to package.json

**TDD Approach:** Write a test that imports the schema and verifies the table definition has the expected columns. Write a test that connects to an in-memory SQLite database, inserts a todo, and reads it back.

**Validation:** Run `pnpm db:generate` and `pnpm db:migrate` to confirm migrations work. Run the tests to confirm CRUD operations work at the database level.
