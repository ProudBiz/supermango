# Ralph Loop Stream Output

## Overview

Replace the `--print` text output in ralph-loop.sh with `--print --verbose --output-format stream-json` piped through a formatter script. This gives real-time visibility into Claude's activity (tool calls, text responses, costs) during each loop iteration, while saving full JSON logs for debugging.

## Architecture

```
claude --print --verbose --output-format stream-json
  │
  ├─→ tee ralph-workspace/logs/iteration-N.jsonl  (raw JSON log)
  │
  └─→ ralph-engine/ralph-format.sh  (human-readable terminal output)
```

Each iteration streams NDJSON events in real time. The formatter parses each line and prints a concise, timestamped summary. The raw JSON is preserved in a log file for post-hoc debugging.

## Stream JSON Events

| `type` | `subtype` | Action |
|---|---|---|
| `system` | `init`, `hook_*` | Skip |
| `assistant` | — | Extract `content[]` blocks: show `tool_use` (name + key param), show `text` (truncated) |
| `user` | `tool_result` | Skip (tool results are internal) |
| `result` | `success` | Show duration + cost, check for completion signal |
| `rate_limit_event` | — | Skip |

## Formatter Output

```
[14:32:01] Read — ralph-workspace/spec.md
[14:32:01] Read — ralph-workspace/progress.json
[14:32:02] Read — .claude/skills/ralph.coder/SKILL.md
[14:32:03] Bash — pnpm vitest run
[14:32:05] Edit — src/app/page.tsx
[14:32:08] Write — ralph-workspace/001-test/log.md
[14:32:09] Coder round 1 complete. Task 1 implemented with TDD...
[14:32:09] Done — 8.2s · $0.12
```

Rules:
- `tool_use` → print tool name + key parameter (`file_path` for Read/Edit/Write, `command` for Bash, `pattern` for Grep/Glob)
- `text` → print first 200 characters, truncate with `...`
- `result` → print duration_ms (formatted) and total_cost_usd
- Everything else → skip

## Loop Script Changes

### ralph-loop.sh

Replace the claude invocation and output capture:

```bash
# Before:
OUTPUT=$(claude --dangerously-skip-permissions --print < ... 2>&1 | tee /dev/stderr) || true
if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then ...

# After:
LOG_FILE="$WORKSPACE/logs/iteration-$i.jsonl"
mkdir -p "$WORKSPACE/logs"
claude --dangerously-skip-permissions --print --verbose --output-format stream-json \
  < "$SCRIPT_DIR/ralph-prompt.md" 2>>"$LOG_FILE.stderr" \
  | tee "$LOG_FILE" \
  | "$SCRIPT_DIR/ralph-format.sh" || true

# Completion signal appears in assistant event text, not result event
if grep '"type":"assistant"' "$LOG_FILE" | grep -q '<promise>COMPLETE</promise>'; then ...
```

### ralph-once.sh

No changes — it runs interactive mode, not `--print`.

## New File

`ralph-engine/ralph-format.sh` — ~50 lines of bash+jq that reads NDJSON from stdin and prints formatted lines to stdout. Malformed lines (non-JSON) are silently skipped. Must be `chmod +x`.

## Non-Goals

- Per-character text streaming (`--include-partial-messages`)
- Log rotation or cleanup
- Dashboard or web UI
- Changes to ralph-once.sh (interactive mode)
