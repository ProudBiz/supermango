# Web Link List

## Description
As a user, I can view a chronological list of all collected links with their summaries on a web page. This provides a single place to browse all links shared across Slack channels without needing to scroll through Slack history.

## Acceptance Criteria
- Page displays a list of all saved links, most recent first
- Each entry shows: title, URL, summary, date, channel name
- Empty state displays: "No links yet. Share a link in a connected Slack channel to get started."
- Error state displays: "Something went wrong. Please refresh."
- Page loads data from the shared SQLite database
