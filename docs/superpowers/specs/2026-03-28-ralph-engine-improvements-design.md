# Ralph Engine Improvements: Reviewer Browser Testing & Planner Commits

## Overview

Two targeted improvements to the ralph engine skills:

1. **Reviewer: Replace vague gstack references with explicit `/gstack` browse commands and prohibit all browser-related MCP tools.** The current reviewer skill says "use `gstack`" but doesn't give concrete instructions, causing the agent to fall back to raw `mcp__chrome-devtools__*` calls. Observed on `todo-04` branch in supermango repo — the reviewer used `mcp__chrome-devtools__navigate_page`, `mcp__chrome-devtools__fill`, `mcp__chrome-devtools__click`, etc. instead of the `/gstack` skill.

2. **Planner: Add a commit step after generating planning artifacts.** The planner generates `spec.md`, `story.md`, `tasks.md`, and `progress.json` but never commits them. On `todo-04`, these files were never committed to git — `spec.md`, `story.md`, and `tasks.md` are completely absent from the branch history.

## Changes

### 1. Reviewer Skill (`ralph.reviewer/SKILL.md`)

#### 1a. Add MCP prohibition to Important Rules

Add to the "Important Rules" section:

```
- **No browser MCP tools.** Never use `mcp__chrome-devtools__*`, `mcp__claude-in-chrome__*`, or any other browser-related MCP tools. All browser interaction goes through the `/gstack` skill using `$B` commands.
```

#### 1b. Rewrite Step 3 UI testing instructions

Replace the current vague "Use `gstack` to open the app in a headless browser" bullet with explicit `/gstack` browse patterns:

```markdown
- **UI features:** Invoke the `/gstack` skill for all browser testing. Use `$B` commands:
  ```
  $B goto http://localhost:3000
  $B snapshot -i                    # get interactive elements with @e refs
  $B fill @e2 "test input"          # fill form fields by @e ref
  $B click @e3                      # click buttons by @e ref
  $B snapshot -D                    # diff to see what changed
  $B screenshot /path/to/evidence.png  # capture evidence
  ```
  Navigate to affected pages, interact with elements using `@e` refs from snapshots, and take screenshots as evidence.
```

#### 1c. Rewrite Step 6 Design Review browser instructions

Replace the current "Use `gstack` to take screenshots" with:

```markdown
Start the dev server if not already running. Invoke the `/gstack` skill to take screenshots:

```
$B goto http://localhost:3000
$B screenshot ralph-workspace/{story-id}/design-screenshot.png
$B responsive ralph-workspace/{story-id}/responsive    # mobile + tablet + desktop
```
```

### 2. Planner Skill (`ralph.planner/SKILL.md`)

#### 2a. Add Phase 7c: Commit planning artifacts

Insert between Phase 7b and Phase 8:

```markdown
### Phase 7c: Commit planning artifacts

Commit all generated files to git:

```
git add ralph-workspace/
git commit -m "chore: add planning artifacts for {feature-name}"
```
```

## Non-Goals

- Not changing the loop engine scripts (`ralph-loop.sh`, `ralph-prompt.md`)
- Not adding `--disallowedTools` CLI flags (skill-level fix only)
- Not changing the coder skill
- Not changing the reviewer's verification steps or log format

## Technical Considerations

- The `/gstack` skill must be available in the environment where `ralph-loop.sh` runs. It's an external skill (not local to this repo).
- The `$B` command pattern requires the gstack browse daemon to be running. The `/gstack` skill handles daemon lifecycle.
- The planner runs interactively (not in the headless loop), so `git commit` will work normally with the user's git config.
