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

# --- Main loop ---

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  # Pipe prompt to claude (no sed needed — paths are relative to repo root)
  # Note: do NOT add set -o pipefail — || true must suppress non-zero claude exits
  OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/ralph-prompt.md" 2>&1 | tee /dev/stderr) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
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
