#!/bin/bash
# Ralph - Single interactive iteration for Claude Code
# Usage: pnpm loop:once

set -e

# --- Path resolution ---

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE="$REPO_DIR/ralph-workspace"

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

# --- Move to repo root ---

cd "$REPO_DIR"

# --- Display info ---

echo "Starting Ralph (interactive, single iteration)"
echo "  Repo root : $REPO_DIR"
echo ""
echo "Stories:"
jq -r '.stories[] | "  \(.id): \(.title) [\(.status)]"' "$WORKSPACE/progress.json"
echo ""

# Launch claude in interactive mode (no --print = terminal UI visible)
claude --dangerously-skip-permissions < "$SCRIPT_DIR/ralph-prompt.md"
