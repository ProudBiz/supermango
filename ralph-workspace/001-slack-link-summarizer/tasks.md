# Tasks: Slack Link Summarizer

## Task 1: Project Setup
**Description:** Initialize the Node.js/TypeScript project with pnpm. Set up the project structure for a two-process architecture (Bolt Slack bot + Next.js web app). Install core dependencies: `@slack/bolt`, `@google/genai`, `better-sqlite3`, `@mozilla/readability`, `linkedom`. Create `.env.example` with all required env var names. Configure TypeScript. Add pnpm script for Next.js dev server.
**Acceptance Criteria:**
- `pnpm install` succeeds
- TypeScript compiles without errors
- `.env.example` lists all required env vars
- pnpm script exists for running the Next.js web app (`pnpm next dev`)
**TDD Approach:** Verify TypeScript compilation and dependency resolution
**Validation:** Run `pnpm install && pnpm tsc --noEmit` — no errors

## Task 2: SQLite Database Layer
**Description:** Create a database module that initializes SQLite with WAL mode and provides functions to save a link record, look up a link by URL (for duplicate detection), and list all links ordered by creation date. The `links` table should include: id, url, title, summary, channel_id, channel_name, message_ts, slack_user_id, created_at.
**Acceptance Criteria:**
- Database initializes with WAL mode enabled
- `saveLink()` inserts a new record
- `findLinkByUrl()` returns existing record or null
- `listLinks()` returns all links ordered by created_at descending
- Table schema matches the specified columns
**TDD Approach:** Write tests for each DB function — save, find by URL (hit and miss), list ordering
**Validation:** Run unit tests — all pass

## Task 3: Link Content Extraction
**Description:** Create a module that takes a URL, fetches the HTML content, and extracts readable text using `@mozilla/readability` and `linkedom`. Handle errors gracefully: timeouts, non-200 responses, empty content. Return the extracted title and text content, or a specific error reason on failure.
**Acceptance Criteria:**
- Fetches HTML from a given URL
- Extracts readable text and title using readability
- Returns specific error reason for: timeouts, non-200 status codes, empty/unparseable content
- Has a configurable timeout
**TDD Approach:** Write tests with mocked HTTP responses — success case, 403, 500, timeout, empty HTML, non-HTML content
**Validation:** Run unit tests — all pass

## Task 4: Gemini Summarization
**Description:** Create a module that takes extracted text content and generates a summary using Gemini (`@google/genai`). Summary length should scale with content length (1-2 sentences for short content, 4-5 for long). Include basic timeout and retry logic (1 retry). The summary must never contain URLs/links. Return the summary text or a specific error reason on failure.
**Acceptance Criteria:**
- Generates a summary from text content using Gemini
- Summary length scales with content length
- Summary never contains URLs or links
- Retries once on failure
- Returns specific error reason on final failure
**TDD Approach:** Write tests with mocked Gemini API — success case (short content, long content), API error, timeout, retry behavior
**Validation:** Run unit tests — all pass

## Task 5: Slack Bot Core
**Description:** Create the Bolt app with Socket Mode. Listen for `message.channels` events. Extract URLs from message text. Ignore messages from bot users. For each URL: add ⏳ reaction, check for duplicate (return cached summary if found), extract content, summarize, post thread reply with plain text summary, swap reaction to ✅. On error: swap to ❌ and post error reason in thread. Handle multiple links in one message with separate thread replies.
**Acceptance Criteria:**
- Bot connects via Socket Mode
- Detects URLs in channel messages
- Ignores messages from bot users
- Adds ⏳ reaction immediately
- Posts plain text summary as thread reply
- Swaps ⏳ to ✅ on success
- Swaps ⏳ to ❌ on failure with specific error reason in thread
- Returns cached summary for duplicate URLs
- Handles multiple links with separate replies
- Saves each link to SQLite
**TDD Approach:** Write tests with mocked Slack client and mocked dependencies (DB, extractor, summarizer) — test message handling, bot filtering, duplicate detection, error flow, multi-link handling
**Validation:** Run unit tests — all pass. Manual test: start the bot, post a link in `#supermango`, verify the full flow.

## Task 6: Bot Entry Point and Process Scripts
**Description:** Create the entry point script that starts the Bolt app. Add pnpm scripts: `pnpm bot` to start the Slack bot, `pnpm dev` to run both bot and Next.js in parallel. Ensure the bot loads environment variables from `.env`.
**Acceptance Criteria:**
- `pnpm bot` starts the Slack bot and connects to Slack
- `pnpm dev` runs both bot and Next.js web app concurrently
- Bot loads env vars from `.env`
**TDD Approach:** Verify the bot starts without errors with valid env vars
**Validation:** Run `pnpm bot` — bot connects and logs "Bolt app started"
