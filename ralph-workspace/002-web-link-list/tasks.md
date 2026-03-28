# Tasks: Web Link List

## Task 1: Next.js Page — Link List
**Description:** Create a Next.js server component page at `/` that reads all links from the SQLite database and renders them as a list (most recent first). Each entry shows: title, URL, summary text, date (formatted), and channel name. Handle empty state with guidance message and error state with a simple error message. Depends on Story 001 Task 2 (SQLite Database Layer) for the database schema.
**Acceptance Criteria:**
- Page at `/` renders a list of all saved links
- Each entry displays: title, URL, summary, date, channel name
- Links ordered by most recent first
- Empty state shows: "No links yet. Share a link in a connected Slack channel to get started."
- Error state shows: "Something went wrong. Please refresh."
- Uses server components — no client-side data fetching
**TDD Approach:** Write tests for the data fetching logic (mocked DB). Visual verification via gstack headless browser for rendering.
**Validation:** Run `pnpm dev`, open the web app, verify empty state renders. After posting a link in Slack, refresh and verify the link appears in the list.
