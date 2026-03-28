#!/bin/bash
# Ralph - Headless agent loop for Claude Code
# Usage: pnpm loop [max_iterations]

set -e

# --- Path resolution ---

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE="$REPO_DIR/ralph-workspace"

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
  echo "Error: ralph-engine/ralph-prompt.md not found."
  echo "Use /ralph.planner to generate the feature spec first."
  exit 1
fi

if [[ ! -f "$WORKSPACE/spec.md" ]]; then
  echo "Error: ralph-workspace/spec.md not found."
  echo "Use /ralph.planner to generate the feature spec first."
  exit 1
fi

if [[ ! -f "$WORKSPACE/progress.json" ]]; then
  echo "Error: ralph-workspace/progress.json not found."
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
jq -r '.stories[] | "  \(.id): \(.title) [\(.status)]"' "$WORKSPACE/progress.json"

# --- Ensure logs directory ---

mkdir -p "$WORKSPACE/logs"

# --- Main loop ---

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  # Stream JSON to log file and formatter for real-time visibility
  LOG_FILE="$WORKSPACE/logs/iteration-$i.jsonl"
  claude --dangerously-skip-permissions --print --verbose --output-format stream-json \
    < "$SCRIPT_DIR/ralph-prompt.md" 2>>"$LOG_FILE.stderr" \
    | tee "$LOG_FILE" \
    | "$SCRIPT_DIR/ralph-format.sh" || true

  # Check for completion signal in assistant event text
  if grep '"type":"assistant"' "$LOG_FILE" | grep -q '<promise>COMPLETE</promise>'; then
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
echo "Check ralph-workspace/progress.json for status."
exit 1
