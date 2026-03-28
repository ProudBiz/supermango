# Database Foundation

## Description
Set up the SQLite database layer using Drizzle ORM with better-sqlite3. This provides the persistence foundation that all subsequent stories depend on. The schema defines a todos table, the connection module provides a testable factory function, and the seed helper enables test data generation.

## Acceptance Criteria
- `db/schema.ts` defines a todos table with columns: id (integer, primary key, autoincrement), title (text, not null), completed (integer/boolean, default false), createdAt (integer/timestamp, default now)
- `db/index.ts` exports a `createDb(path?)` factory function that returns a Drizzle instance. Default path is `./sqlite.db` for the app; tests pass `:memory:` for isolation
- `drizzle.config.ts` is configured for SQLite with better-sqlite3
- `db/seed.ts` exports a function that inserts fixture todos into a given DB instance
- `drizzle-kit push` successfully creates the table in the SQLite file
- `tsconfig.json` exists and `pnpm typecheck` passes
- `next.config.ts` exists with `serverExternalPackages: ['better-sqlite3']`
