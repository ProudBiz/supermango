# Tasks: Database Foundation

## Task 1: Schema, Connection, and Config
**Description:** Create the Drizzle ORM schema for the todos table, the database connection module with a testable factory function, and the Drizzle Kit config. Also create `tsconfig.json` and `next.config.ts` as project prerequisites.
**Acceptance Criteria:**
- `db/schema.ts` defines todos table with id (integer, primary key, autoincrement), title (text, not null), completed (integer, default 0), createdAt (integer, default current timestamp)
- `db/index.ts` exports `createDb(path?)` returning a Drizzle instance; default export uses `./sqlite.db`
- `drizzle.config.ts` configured for SQLite dialect with better-sqlite3 driver
- `tsconfig.json` created with proper Next.js TypeScript settings
- `next.config.ts` created with `serverExternalPackages: ['better-sqlite3']`
- `pnpm typecheck` passes
**TDD Approach:** Write a test that imports `createDb` with `:memory:`, creates the schema using raw SQL, inserts a todo, and queries it back. Verify the returned object has the expected shape (id, title, completed, createdAt).
**Validation:** `pnpm typecheck` passes. `pnpm test` passes. The test imports and uses the schema and connection successfully.

## Task 2: Migration and Seed Helper
**Description:** Run the initial database migration and create a seed helper for test data.
**Acceptance Criteria:**
- `drizzle-kit push` runs successfully and creates the todos table in `./sqlite.db`
- `db/seed.ts` exports a function that accepts a Drizzle DB instance and inserts 2-3 fixture todos
- `__tests__/helpers/db.ts` exports a helper that creates an in-memory DB, applies the schema via raw `CREATE TABLE` SQL, and optionally seeds it
- The test helper's CREATE TABLE SQL matches `db/schema.ts` column definitions
**TDD Approach:** Write a test that uses the test helper to create a seeded in-memory DB, then queries all todos and verifies the fixture data is present with correct types and values.
**Validation:** `pnpm test` passes. `npx drizzle-kit push` completes without errors. The seed function inserts expected fixture data.
