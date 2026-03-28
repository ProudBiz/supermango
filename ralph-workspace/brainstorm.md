# Brainstorm Notes: Slack Link Summarizer Bot

## Problem & Context
Team members share links in Slack channels but nobody has time to read them all. Important content gets missed. This bot automatically summarizes any public link shared in a channel, posting the summary as a thread reply so the channel stays clean. A companion web page shows all collected links and summaries in one place.

## User Stories Rationale
We kept the scope tight to two stories — one per surface. The Slack bot story covers the full automation flow: detect link, signal processing (⏳), summarize, reply in thread, signal done (✅). We chose thread replies over a separate summary channel to keep context close to the original message. The web app story is intentionally minimal — a chronological list with no auth, search, or filtering — to validate the concept before adding complexity. Slash commands, summary editing, and private link support were explicitly excluded as non-goals.

## Design Decisions
**Slack surface:** Plain text summaries in thread replies — no Block Kit, no rich formatting. Keeps it simple and readable. Emoji reaction flow (⏳→✅/❌) gives immediate visual feedback without cluttering the channel. Error messages include specific reasons (e.g., "site returned 403") rather than generic failures.

**Web surface:** Minimal list layout — title, URL, summary, date, channel name. No cards, no tables, no sorting. Empty state guides users: "No links yet. Share a link in a connected Slack channel to get started." Error state: "Something went wrong. Please refresh."

**Rejected approaches:** Block Kit messages (unnecessary complexity), separate summary channel (loses context), ephemeral messages (other team members can't see them).

## Tech Stack Rationale
**Bolt + Socket Mode** over Events API HTTP: Slack's recommended approach, no public URL needed for dev, handles retries and verification automatically. Trade-off is two processes (Bolt + Next.js) but cleaner separation.

**Gemini (`@google/genai`)** for summarization: user preference. Using `gemini-3-flash-preview` model — fast, free tier available. SDK is straightforward: `ai.models.generateContent()`. Verified via Context7.

**Next.js** for web app: server components, no client-side fetching needed for a simple list page. Also serves as the natural home if we add API routes later.

**SQLite** for storage: zero setup, file-based, sufficient for current scale. WAL mode for concurrent access. Will migrate to Postgres when scaling to SaaS.

**`@mozilla/readability` + `linkedom`** for link content extraction: lightweight, works for most articles without a headless browser. Accepted trade-off that some JS-rendered sites won't extract cleanly.

## Architecture Decisions
**Two-process architecture:** Bolt process handles Slack events and writes to SQLite. Next.js process reads from SQLite and renders the web page. Both share the same SQLite database file. No API layer between them — direct DB access from both sides.

**Data model:** Single `links` table — URL, title, summary, channel ID, channel name, message timestamp, Slack user ID, created_at. Only successful summaries are saved. Failed links are not stored — they can be retried by sharing again. Duplicate detection by URL lookup before processing.

**Event flow:** `message.channels` event → extract URLs from message text → for each URL: react ⏳, check duplicate, fetch HTML, extract readable text, send to Gemini, post thread reply, swap to ✅, save to DB.

**Bot safety:** Two layers — ignore messages from bot users, never include links in summary replies. Prevents self-triggering loops.

## Environment Requirements
**Slack app setup (completed):**
- Socket Mode enabled
- Bot scopes: `channels:history`, `chat:write`, `reactions:write`
- Event subscription: `message.channels`
- Installed to "Proud Biz" workspace
- Bot invited to `#supermango` channel

**Env variables (saved in `.env`):**
- `SLACK_BOT_TOKEN` — Bot OAuth token (xoxb-...)
- `SLACK_APP_TOKEN` — App-level token for Socket Mode (xapp-...)
- `SLACK_SIGNING_SECRET` — Request verification
- `GEMINI_API_KEY` — Google Gemini API access
- `SLACK_TEST_CHANNEL_ID` — Test channel for integration tests

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Link content extraction fails (blocked, paywalled, JS-rendered) | Medium-high | Single link unsummarized | Show ❌ with specific error reason, skip gracefully |
| Gemini rate limits or downtime | Low | Summaries delayed/fail | Basic timeout + retry strategy; queue system for future SaaS |
| Bot self-triggering loop | High if unhandled | Infinite loop | Ignore bot user messages + never include links in replies |
| SQLite concurrent access | Medium | Read errors / locked DB | WAL mode for concurrent reads and writes |

## Test Strategy
**Unit tests (fast, TDD loop):**
- Link extraction from message text
- HTML content parsing with readability
- Summary formatting and length scaling
- Duplicate detection logic
- Bot message filtering
- Error handling and error message formatting
- All external APIs mocked (Slack, Gemini, HTTP fetches)

**Integration tests (reviewer):**
- **Slack (via Slack API):** Post a link in `#supermango` test channel, verify ⏳ reaction, thread reply with summary, ✅ swap, record in SQLite. Test error and duplicate cases.
- **Web app (via gstack headless browser):** Navigate to the web page, verify link list renders, check empty state, verify summary content matches what was posted in Slack.

## Demo Scenario
I paste a link to a blog post in `#supermango`. The bot reacts with ⏳, fetches the content, replies with a summary in the thread, and swaps the reaction to ✅. Other team members can read the summary right there in the thread. I open the web app and see all previously shared links with their summaries in a chronological list.
