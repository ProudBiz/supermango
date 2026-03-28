# Ralph Loop Stream Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real-time streaming output to ralph-loop.sh so you can watch Claude's tool calls and responses as they happen.

**Architecture:** Replace `--print` with `--print --verbose --output-format stream-json`, pipe through a formatter script for human-readable output, save raw JSON logs per iteration.

**Tech Stack:** Bash, jq

**Spec:** `docs/superpowers/specs/2026-03-28-ralph-loop-stream-output-design.md`

---

### Task 1: Create the formatter script

**Files:**
- Create: `ralph-engine/ralph-format.sh`

- [ ] **Step 1: Create ralph-format.sh**

```bash
#!/bin/bash
# Ralph stream-json formatter
# Reads NDJSON from stdin, prints human-readable lines to stdout.
# Usage: claude --print --verbose --output-format stream-json | ralph-format.sh

while IFS= read -r line; do
  # Skip malformed lines
  TYPE=$(echo "$line" | jq -r '.type // empty' 2>/dev/null) || continue
  [[ -z "$TYPE" ]] && continue

  TS=$(date +"%H:%M:%S")

  case "$TYPE" in
    assistant)
      # Show tool calls: "name<TAB>param" per line
      echo "$line" | jq -r '
        .message.content[]? | select(.type == "tool_use") |
        .name + "\t" + (
          if .name == "Bash" then (.input.command // "")[0:80]
          elif .name == "Grep" or .name == "Glob" then (.input.pattern // "")[0:80]
          else (.input.file_path // .input.path // "")[0:80]
          end
        )
      ' 2>/dev/null | while IFS=$'\t' read -r tool_name tool_param; do
        printf "[%s] %s — %s\n" "$TS" "$tool_name" "$tool_param"
      done

      # Show text content (separate pass to avoid delimiter issues)
      TEXT=$(echo "$line" | jq -r '
        [.message.content[]? | select(.type == "text") | .text] | join(" ")
      ' 2>/dev/null)
      if [[ -n "$TEXT" && "$TEXT" != "null" ]]; then
        [[ ${#TEXT} -gt 200 ]] && TEXT="${TEXT:0:197}..."
        printf "[%s] %s\n" "$TS" "$TEXT"
      fi
      ;;
    result)
      DURATION=$(echo "$line" | jq -r '.duration_ms // 0' 2>/dev/null)
      COST=$(echo "$line" | jq -r '.total_cost_usd // 0' 2>/dev/null)
      # Format duration
      SECS=$(( DURATION / 1000 ))
      printf "[%s] Done — %ds · \$%s\n" "$TS" "$SECS" "$COST"
      ;;
  esac
done
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x ralph-engine/ralph-format.sh
```

- [ ] **Step 3: Test the formatter with a sample NDJSON line**

```bash
echo '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read","input":{"file_path":"CLAUDE.md"}},{"type":"text","text":"Here is the content"}]}}' | ralph-engine/ralph-format.sh
```

Expected output (timestamps will vary):
```
[HH:MM:SS] Read — CLAUDE.md
[HH:MM:SS] Here is the content
```

- [ ] **Step 4: Test with a result event**

```bash
echo '{"type":"result","duration_ms":8200,"total_cost_usd":0.12}' | ralph-engine/ralph-format.sh
```

Expected:
```
[HH:MM:SS] Done — 8s · $0.12
```

- [ ] **Step 5: Test with malformed input**

```bash
echo 'not json at all' | ralph-engine/ralph-format.sh
```

Expected: no output, no errors.

- [ ] **Step 6: Commit**

```bash
git add ralph-engine/ralph-format.sh
git commit -m "feat: add ralph-format.sh stream-json formatter"
```

---

### Task 2: Update ralph-loop.sh

**Files:**
- Modify: `ralph-engine/ralph-loop.sh:75-96`

- [ ] **Step 1: Add logs directory creation before the main loop**

Add after line 73 (`jq` command), before the main loop comment:

```bash
# --- Ensure logs directory ---

mkdir -p "$WORKSPACE/logs"
```

- [ ] **Step 2: Replace the claude invocation block**

Replace lines 82-85 (the two comments and the `OUTPUT=...` line) with:

```bash
  # Stream JSON to log file and formatter for real-time visibility
  LOG_FILE="$WORKSPACE/logs/iteration-$i.jsonl"
  claude --dangerously-skip-permissions --print --verbose --output-format stream-json \
    < "$SCRIPT_DIR/ralph-prompt.md" 2>>"$LOG_FILE.stderr" \
    | tee "$LOG_FILE" \
    | "$SCRIPT_DIR/ralph-format.sh" || true
```

- [ ] **Step 3: Replace the completion detection block**

Replace lines 87-93 (the `if echo "$OUTPUT"` block):

```bash
  # Check for completion signal in assistant event text
  if grep '"type":"assistant"' "$LOG_FILE" | grep -q '<promise>COMPLETE</promise>'; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi
```

- [ ] **Step 4: Verify script parses correctly**

```bash
bash -n ralph-engine/ralph-loop.sh && echo "OK"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add ralph-engine/ralph-loop.sh
git commit -m "feat: switch ralph-loop.sh to stream-json with real-time formatter"
```

---

### Task 3: Smoke test with a real claude invocation

- [ ] **Step 1: Run a single iteration to verify the full pipeline**

```bash
pnpm loop 1
```

Expected:
- Timestamped tool call lines appear in real time as Claude works
- Text responses appear truncated
- A "Done" summary line appears at the end with duration and cost
- `ralph-workspace/logs/iteration-1.jsonl` exists and contains valid NDJSON
- No errors on stderr (check `ralph-workspace/logs/iteration-1.jsonl.stderr`)

Note: `pnpm loop 1` will exit with code 1 ("reached max iterations") — this is expected for a single-iteration smoke test, not a failure.

- [ ] **Step 2: Verify log file contains valid JSON**

```bash
head -5 ralph-workspace/logs/iteration-1.jsonl | jq -r '.type' 2>/dev/null
```

Expected: event types like `system`, `assistant`, `result`

- [ ] **Step 3: Verify completion detection still works**

Check that the completion grep pattern matches against the log file format:

```bash
grep '"type":"assistant"' ralph-workspace/logs/iteration-1.jsonl | head -1 | jq -r '.message.content[]? | select(.type == "text") | .text' | head -c 200
```

Expected: Claude's text response visible, confirming the grep target is correct.
