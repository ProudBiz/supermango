#!/bin/bash
# Ralph - Headless agent loop for Claude Code
# Usage: pnpm loop [max_iterations]

set -e

# --- Path resolution ---

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Arguments ---

MAX_ITERATIONS=100

while [[ $# -gt 0 ]]; do
  case $1 in
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

# --- Validate ---

if [[ ! -f "$SCRIPT_DIR/ralph-prompt.md" ]]; then
  echo "Error: ralph/ralph-prompt.md not found."
  echo "Use /ralph.planner to generate the feature spec first."
  exit 1
fi

if [[ ! -f "$SCRIPT_DIR/spec.md" ]]; then
  echo "Error: ralph/spec.md not found."
  echo "Use /ralph.planner to generate the feature spec first."
  exit 1
fi

if [[ ! -f "$SCRIPT_DIR/progress.json" ]]; then
  echo "Error: ralph/progress.json not found."
  echo "Use /ralph.planner to generate the feature spec first."
  exit 1
fi

# --- Elapsed time tracking ---

START_EPOCH=$(date +%s)

finish() {
  local end_epoch=$(date +%s)
  local elapsed=$((end_epoch - START_EPOCH))
  local hours=$((elapsed / 3600))
  local minutes=$(( (elapsed % 3600) / 60 ))
  local seconds=$((elapsed % 60))
  echo ""
  printf "Elapsed: %dh %dm %ds\n" "$hours" "$minutes" "$seconds"
}
trap finish EXIT

# --- Move to repo root ---

cd "$REPO_DIR"

# --- Display info ---

echo "Starting Ralph - Max iterations: $MAX_ITERATIONS"
echo "  Repo root : $REPO_DIR"
echo ""
echo "Stories:"
jq -r '.stories[] | "  \(.id): \(.title) [\(.status)]"' "$SCRIPT_DIR/progress.json"

# --- Log directory ---

LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# --- Main loop ---

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  LOG_FILE="$LOG_DIR/iteration-${i}-${TIMESTAMP}.jsonl"
  echo "  Log: $LOG_FILE"

  # Stream JSON output — every tool call, result, and message is logged
  claude --dangerously-skip-permissions -p \
    --output-format stream-json --verbose \
    < "$SCRIPT_DIR/ralph-prompt.md" \
    > "$LOG_FILE" 2>&1 || true

  # Render a human-readable summary to terminal
  if [[ -f "$LOG_FILE" ]]; then
    python3 -c "
import json, sys
for line in open('$LOG_FILE'):
    line = line.strip()
    if not line: continue
    try: msg = json.loads(line)
    except: continue
    if msg.get('type') == 'assistant' and 'message' in msg:
        for block in msg['message'].get('content', []):
            if isinstance(block, dict):
                if block.get('type') == 'text' and block['text'].strip():
                    print(f\"⏺ {block['text'][:300]}\")
                elif block.get('type') == 'tool_use':
                    name = block.get('name','')
                    inp = block.get('input',{})
                    detail = inp.get('file_path','') or inp.get('command','')[:100] or inp.get('pattern','') or inp.get('description','') or inp.get('skill','') or ''
                    print(f'  ⎿  {name}({detail})')
" 2>/dev/null
  fi

  # Check for completion signal
  if grep -q "<promise>COMPLETE</promise>" "$LOG_FILE" 2>/dev/null; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check ralph/progress.json for status."
exit 1
