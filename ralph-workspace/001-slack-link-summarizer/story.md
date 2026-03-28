# Slack Link Summarizer

## Description
As a team member, when I share a public link in a monitored channel, the bot automatically reacts with ⏳, fetches the linked content, generates a summary using Gemini, replies with the summary in a thread, and swaps the reaction to ✅. On failure, the reaction swaps to ❌ with a detailed error reason in the thread. This lets team members quickly understand shared content without clicking through every link.

## Acceptance Criteria
- Bot reacts with ⏳ within 3 seconds of a link being posted
- Summary appears as a thread reply in plain text, not a channel message
- Summary length scales with content (1-2 sentences for short, 4-5 for long)
- Reaction swaps from ⏳ to ✅ after summary is posted
- On failure: reaction swaps to ❌, error reason posted in thread (e.g., "Couldn't summarize: site returned 403")
- Bot ignores messages from bot users
- Bot summary replies never contain links
- Duplicate links return cached summary from SQLite
- Multiple links in one message get separate thread replies
- Each link and summary is saved to SQLite
