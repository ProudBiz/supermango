# Slack Link Summarizer Bot

## Overview
A Slack bot that automatically summarizes public links shared in channels. When a team member posts a link, the bot reacts with ⏳, fetches the page content, generates a summary using Gemini, and replies in a thread. The reaction swaps to ✅ on success or ❌ with a detailed error reason on failure. A companion web app displays all collected links and summaries in a chronological list.

## Design Direction

**Slack:**
- Plain text summaries in thread replies
- Emoji reaction flow: ⏳ (processing) → ✅ (done) / ❌ (failed)
- Error replies include specific reason (e.g., "Couldn't summarize: site returned 403")
- Summary length scales with content (1-2 sentences for short, 4-5 for long)
- Multiple links in one message get separate thread replies
- Duplicate links return cached summary

**Web app:**
- Minimal list (most recent first): title, URL, summary, date, channel name
- Empty state: "No links yet. Share a link in a connected Slack channel to get started."
- Error state: "Something went wrong. Please refresh."

## Non-Goals
- Summarizing private/authenticated links (behind logins)
- User accounts or auth on the web app
- Editing or rating summaries
- Multi-language support
- Slack slash commands
- Search, filtering, or sorting on the web app

## Technical Considerations
- **Runtime:** Node.js / TypeScript, **pnpm** as package manager
- **Slack:** Bolt (`@slack/bolt`) with Socket Mode — two-process architecture (Bolt + Next.js)
- **LLM:** Gemini (`@google/genai`, `gemini-3-flash-preview`)
- **Web:** Next.js with server components
- **DB:** SQLite with WAL mode for concurrent access
- **Link parsing:** `@mozilla/readability` + `linkedom` for content extraction
- **Data model:** Single `links` table — URL, title, summary, channel ID, channel name, message timestamp, Slack user ID, created_at. Only successful summaries are saved; failed links are not stored.
- **Bot safety:** Ignore bot user messages, never include links in summary replies
- **Retry:** Basic timeout + retry for Gemini API calls

## Risks
- **Link extraction failure** (medium-high likelihood, low impact): Some sites block bots or are JS-rendered. Mitigation: show ❌ with specific error reason, skip gracefully.
- **Gemini rate limits/downtime** (low likelihood, medium impact): Free tier has usage limits. Mitigation: basic timeout + retry; queue system for future SaaS.
- **Bot self-triggering** (high likelihood if unhandled, high impact): Bot could loop on its own messages. Mitigation: ignore bot users + never include links in replies.
- **SQLite concurrent access** (medium likelihood, medium impact): Two processes sharing one DB file. Mitigation: WAL mode.
