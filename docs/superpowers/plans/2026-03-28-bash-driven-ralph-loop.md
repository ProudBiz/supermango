# Bash-Driven Ralph Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace teammates-based ralph.loop with a bash-driven loop that pipes a prompt to `claude` per iteration, using `progress.json` for global state and per-story `log.md` for detailed coder/reviewer communication.

**Architecture:** Bash scripts (`ralph-loop.sh`, `ralph-once.sh`) loop over iterations, piping a static prompt (`ralph-prompt.md`) to `claude --dangerously-skip-permissions --print`. The prompt instructs the agent to read `progress.json`, determine the current state, and invoke the appropriate skill (coder or reviewer) by reading its SKILL.md. Coder and reviewer skills are rewritten to remove all teammate references and task selection logic.

**Tech Stack:** Bash, Claude Code CLI, JSON (progress.json), Markdown (log.md, skills)

**Spec:** `docs/superpowers/specs/2026-03-28-bash-driven-ralph-loop-design.md`

---

### Task 1: Create package.json with pnpm scripts

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "supermango",
  "version": "1.0.0",
  "private": true,
  "description": "Multi-agent orchestration system using Claude Code",
  "scripts": {
    "loop": "bash ralph/ralph-loop.sh",
    "loop:once": "bash ralph/ralph-once.sh"
  },
  "license": "MIT",
  "packageManager": "pnpm@10.12.3"
}
```

Note: A `package.json` was already initialized by pnpm. Overwrite it with the above content. Preserve the `packageManager` field for corepack compatibility.

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add package.json with loop pnpm scripts"
```

---

### Task 2: Create ralph/ralph-loop.sh

**Files:**
- Create: `ralph/ralph-loop.sh`

- [ ] **Step 1: Create the ralph directory if it doesn't exist**

```bash
mkdir -p ralph
```

- [ ] **Step 2: Write ralph/ralph-loop.sh**

```bash
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
echo "Check ralph/progress.json for status."
exit 1
```

- [ ] **Step 3: Make it executable**

```bash
chmod +x ralph/ralph-loop.sh
```

- [ ] **Step 4: Commit**

```bash
git add ralph/ralph-loop.sh
git commit -m "feat: add ralph-loop.sh headless bash loop"
```

---

### Task 3: Create ralph/ralph-once.sh

**Files:**
- Create: `ralph/ralph-once.sh`

- [ ] **Step 1: Write ralph/ralph-once.sh**

```bash
#!/bin/bash
# Ralph - Single interactive iteration for Claude Code
# Usage: pnpm loop:once

set -e

# --- Path resolution ---

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

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

# --- Move to repo root ---

cd "$REPO_DIR"

# --- Display info ---

echo "Starting Ralph (interactive, single iteration)"
echo "  Repo root : $REPO_DIR"
echo ""
echo "Stories:"
jq -r '.stories[] | "  \(.id): \(.title) [\(.status)]"' "$SCRIPT_DIR/progress.json"
echo ""

# Launch claude in interactive mode (no --print = terminal UI visible)
claude --dangerously-skip-permissions < "$SCRIPT_DIR/ralph-prompt.md"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x ralph/ralph-once.sh
```

- [ ] **Step 3: Commit**

```bash
git add ralph/ralph-once.sh
git commit -m "feat: add ralph-once.sh interactive single iteration"
```

---

### Task 4: Create ralph/ralph-prompt.md

**Files:**
- Create: `ralph/ralph-prompt.md`

This is the self-dispatching prompt. It contains no coder or reviewer logic — only state-reading and dispatch instructions.

- [ ] **Step 1: Write ralph/ralph-prompt.md**

```markdown
# Ralph Agent Instructions

You are an autonomous coding agent. Each iteration you read the project state, determine what needs to happen next, and execute it.

## Step 1: Read State

1. Read `CLAUDE.md` for project patterns and conventions
2. Read `ralph/spec.md` for feature goals and context
3. Read `ralph/progress.json` for global task state

## Step 2: Find Current Work

Scan `progress.json` for the first story that is NOT `done`. Check rules in order — first match wins:

1. If a story has status `qa_issues` → go to **Step 4: Fix QA Issues**
2. If a story has status `qa` → go to **Step 5: Run QA**
3. If a story has status `in_progress` and ALL its tasks have `reviewer_pass` → go to **Step 5: Run QA** (transition to QA)
4. If a story has status `in_progress` or `pending` → find the first task that is NOT `reviewer_pass`:
   - Task `pending` → go to **Step 3a: Run Coder**
   - Task `coder_done` → go to **Step 3b: Run Reviewer**
   - Task `reviewer_issues` → go to **Step 3a: Run Coder** (fixing issues)
5. If ALL stories have status `done` → go to **Step 6: Complete**

## Step 3a: Run Coder

Read the story's `tasks.md` and `log.md` from `ralph/{story-id}/`.

**Count rounds:** Look at `log.md` for alternating [Coder]/[Reviewer] entries for the current task. If the coder has already been invoked 5 times for this task (5 coder→reviewer cycles without `reviewer_pass`), this task is stuck:
- Write the issue to `ralph/known-issues.md` (copy the last reviewer's issues from `log.md`)
- Set the task status to `known_issue` in `progress.json`
- End this iteration (next iteration picks up the next task)

**Otherwise:** Read `.claude/skills/ralph.coder/SKILL.md` and follow its instructions exactly.

Context for the coder:
- **Story directory:** `ralph/{story-id}/`
- **Task:** Task {N}: {task name}
- **Mode:** If task status is `reviewer_issues`, tell the coder: "Reviewer found issues. Read log.md for details and fix them." If task status is `pending`, tell the coder: "This is a fresh task."

After following the coder skill, update `progress.json`:
- Set the task status to `coder_done`
- If the story status is `pending`, set it to `in_progress`

End this iteration.

## Step 3b: Run Reviewer

Read the story's `tasks.md` and `log.md` from `ralph/{story-id}/`.

Read `.claude/skills/ralph.reviewer/SKILL.md` and follow its instructions exactly.

Context for the reviewer:
- **Story directory:** `ralph/{story-id}/`
- **Task:** Task {N}: {task name}
- **Mode:** "Coder completed work. Review it."

After following the reviewer skill, update `progress.json`:
- If review passed: set task status to `reviewer_pass`
- If issues found: set task status to `reviewer_issues`

Check: if ALL tasks in this story now have `reviewer_pass`, set story status to `qa`.

End this iteration.

## Step 4: Fix QA Issues

Read the story's `log.md` from `ralph/{story-id}/`.

**Count rounds:** Look at `log.md` for alternating [Coder]/[QA] entries at the story level. If the coder has been invoked 5 times for QA fixes without `qa_pass`, this story is stuck:
- Write the issue to `ralph/known-issues.md` (copy the last QA issues from `log.md`)
- Set the story status to `known_issue` in `progress.json`
- End this iteration (next iteration picks up the next story)

**Otherwise:** Read `.claude/skills/ralph.coder/SKILL.md` and follow its instructions.

Context for the coder:
- **Story directory:** `ralph/{story-id}/`
- **Task:** "QA fix — {summary of QA issues from log.md}"
- **Mode:** "QA found issues with the full story. Read log.md for details and fix them."

After following the coder skill, set story status to `qa` in `progress.json`.

End this iteration.

## Step 5: Run QA

Read the story's `story.md`, `tasks.md`, and `log.md` from `ralph/{story-id}/`.

Run QA validation for the full story. This means performing the reviewer's 7 verification steps (tests, lint/typecheck/build, live server QA, code quality, security, design review, spec alignment) but scoped to ALL tasks in the story together, not just a single task. Read `.claude/skills/ralph.reviewer/SKILL.md` for the verification steps.

Focus on:
- Cross-task integration (do all tasks work together?)
- Full story acceptance criteria from `story.md`
- End-to-end user flows spanning multiple tasks

Append to `log.md`:

If PASS:
```markdown
### [QA] Round N
- **Story:** {story-id}
- **Status:** PASS
- **Story DONE**
```
Set story status to `done` in `progress.json`.

If ISSUES:
```markdown
### [QA] Round N
- **Story:** {story-id}
- **Status:** ISSUES
- **Findings:** {detailed description of what failed}
- **Screenshots:** (if applicable)
```
Set story status to `qa_issues` in `progress.json`.

End this iteration.

## Step 6: Complete

All stories are done. Output:

<promise>COMPLETE</promise>

## Rules

- **One action per iteration.** Do one thing (coder, reviewer, or QA), then end.
- **Read the skill file.** Do not improvise coder or reviewer behavior — read and follow the SKILL.md.
- **Update progress.json.** Always update state before ending the iteration.
- **Append to log.md.** Never edit or delete existing log entries.
- **Commit every change.** Use conventional commit messages.
```

- [ ] **Step 2: Commit**

```bash
git add ralph/ralph-prompt.md
git commit -m "feat: add ralph-prompt.md self-dispatching prompt"
```

---

### Task 5: Rewrite ralph.coder skill

**Files:**
- Modify: `.claude/skills/ralph.coder/SKILL.md`

Remove all teammate references (SendMessage, wait for reviewer, notify, leader). Remove task selection logic. Keep TDD, pre-flight, self-validation, conventional commits, log.md append format.

- [ ] **Step 1: Read the current skill**

Read `.claude/skills/ralph.coder/SKILL.md` to understand what to keep.

- [ ] **Step 2: Rewrite the skill**

Replace the entire content of `.claude/skills/ralph.coder/SKILL.md` with:

```markdown
---
name: ralph.coder
description: TDD implementation of a single task with pre-flight checks and self-validation
---

# Ralph Coder

You are an autonomous coder. You implement exactly **one task**, then stop. The dispatch prompt (ralph-prompt.md) tells you which story and task to work on.

## Inputs

These are provided by the dispatch context:
- **Story directory:** path to `ralph/{story-id}/`
- **Task:** which task from `tasks.md` to implement
- **Mode:** fresh task OR fixing reviewer/QA issues (check `log.md` for details)

## Workflow

### 1. Read Context

- Read project root `CLAUDE.md` for patterns and conventions
- Read `ralph/spec.md` for feature context
- Read `ralph/{story-id}/story.md` for user story details
- Read `ralph/{story-id}/tasks.md` for the task description and acceptance criteria
- Read `ralph/{story-id}/log.md` (if it exists) for previous rounds

### 2. Pre-flight

Before doing anything new, verify the existing codebase is healthy:

- Run existing tests. If any fail, fix and commit before proceeding.
- Run lint and typecheck if the project supports them. Fix any issues.

If pre-flight required fixes, commit them with a message like `fix: resolve pre-flight issues`.

### 3. Implementation Planning

Analyze the codebase before writing code:

- Understand relevant files, patterns, and structure
- Plan which files to create or modify
- Plan TDD steps based on the task's acceptance criteria
- When working with libraries, frameworks, or APIs, use the `find-docs` skill (Context7) to look up the latest documentation. Don't guess API signatures — verify them.

### 4. TDD Loop

For each requirement in the task:

1. **Write a failing test** that captures the expected behavior
2. **Run the test** to confirm it fails for the right reason
3. **Implement minimal code** to make the test pass. When building UI components or pages, use the `frontend-design` skill for distinctive interfaces.
4. **Run the test** to confirm it passes
5. **Commit** with a conventional commit message (e.g., `feat: add login endpoint`)

Repeat for all requirements.

### 5. Pre-commit Gates

After implementation is complete, run the full quality suite:

- Lint
- Typecheck
- All tests (not just yours)
- Build (if applicable)

Fix any issues. Commit fixes separately.

### 6. Self-validate

Check your work against the task's acceptance criteria. Every criterion must pass. If something is missing, implement it now.

### 7. Write to log.md

Append (never edit or delete existing content) to `ralph/{story-id}/log.md`:

```
### [Coder] Round N
- **Task:** {task name from tasks.md}
- **Status:** DONE
- **Files changed:** {list of files created or modified}
- **What was done:** {brief summary of implementation}
- **Self-validation:** {results against each acceptance criterion}
```

Increment the round number from the last entry in log.md. If this is the first entry, use Round 1.

### 8. Update CLAUDE.md

Before finishing, check if you discovered genuinely reusable knowledge:

- Code patterns and conventions specific to this project
- Gotchas or non-obvious requirements
- Testing approaches that worked well
- Configuration or environment details

If so, append to the project root `CLAUDE.md`. Not every task produces new learnings.

## Important Rules

- You handle exactly **ONE task** (or one QA fix). Do not loop through multiple tasks.
- **Commit every modification.** Small, frequent commits with conventional messages.
- **Never skip pre-flight.** A broken codebase must be fixed before new work.
- **TDD is mandatory.** Write the failing test first, always.
- **log.md is append-only.** Never edit or delete existing entries.
- Follow existing code patterns. Don't restructure code outside your task.
- Do NOT update `progress.json` — the dispatch prompt handles that.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.coder/SKILL.md
git commit -m "refactor: rewrite ralph.coder skill for bash-driven loop"
```

---

### Task 6: Rewrite ralph.reviewer skill

**Files:**
- Modify: `.claude/skills/ralph.reviewer/SKILL.md`

Remove all teammate references (SendMessage, wait for coder, notify leader, coder acknowledgment). Remove task selection logic. Keep all 7 verification steps, log.md append format.

- [ ] **Step 1: Read the current skill**

Read `.claude/skills/ralph.reviewer/SKILL.md` to understand what to keep.

- [ ] **Step 2: Rewrite the skill**

Replace the entire content of `.claude/skills/ralph.reviewer/SKILL.md` with:

```markdown
---
name: ralph.reviewer
description: QA, design, code quality, and security review of coder's work
---

# Ralph Reviewer

You are an autonomous reviewer. You review the coder's work against task acceptance criteria and the broader feature spec. The dispatch prompt (ralph-prompt.md) tells you which story and task to review.

## Inputs

These are provided by the dispatch context:
- **Story directory:** path to `ralph/{story-id}/`
- **Task:** which task from `tasks.md` to review

## Workflow

### 1. Read Context

- Read project root `CLAUDE.md` for patterns and conventions
- Read `ralph/spec.md` for the full feature context
- Read `ralph/{story-id}/story.md` for user story details
- Read `ralph/{story-id}/tasks.md` for the task list and acceptance criteria
- Read `ralph/{story-id}/log.md` for the coder's latest round entry
- Read the actual code changes — use `git diff` or read the modified files listed in the coder's log entry

### 2. Review the Work

Perform ALL of the following verification steps **in order, one at a time.** Complete each step fully before starting the next. Do not skip any step. Do not run steps in parallel. If a step errors, adapt and complete it manually — never skip it.

#### Step 1: Run All Tests

Run the full test suite independently. Every test must pass.

#### Step 2: Lint, Typecheck, Build

Run lint, typecheck, and build (whatever the project supports). All must pass clean with zero warnings.

#### Step 3: QA — Live Server Verification

This is the real QA. You test the actual running application.

**Stop any running dev server.** Start it fresh:

1. Kill any existing server process
2. Start the dev server clean
3. Wait for it to be fully ready

**Then verify every acceptance criterion from tasks.md against the live server:**

- **UI features:** Use `gstack` to open the app in a headless browser. Navigate to affected pages, click buttons, fill forms, verify renders, check error states. Take screenshots as evidence.
- **API endpoints:** Use `curl` to hit every affected endpoint. Verify status codes, response bodies, error responses, edge cases.
- **Data flows:** If the task involves data persistence, verify data is actually saved and retrievable — create, read, update, delete through the live server.
- **Server actions / backend logic:** Write and run a small script or use the server to exercise the code against the real database.
- **Edge cases:** Test invalid inputs, empty states, boundary values.

**Go through the acceptance criteria list one by one.** For each criterion, describe exactly what you did to verify it and what the result was.

Do NOT skip this step. "App loads without errors" is not QA. Verify each acceptance criterion actually works through the running application.

Stop the server when done.

#### Step 4: Code Quality

Run the `simplify` skill on all changed files. Every issue it flags is a real issue.

#### Step 5: Security

Manually review all changed files for:
- Input validation at system boundaries
- No injection risks (SQL, command, XSS)
- No hardcoded secrets or credentials
- Proper error handling that doesn't leak internals
- OWASP top 10 awareness

Read every changed file line by line.

#### Step 6: Design Review

If the task has no UI component, skip this step.

Start the dev server if not already running. Use `gstack` to take screenshots of every affected page/component.

Evaluate:
- **Design quality:** Does it feel like a coherent whole?
- **Originality:** Evidence of custom decisions, not template defaults?
- **Craft:** Typography hierarchy, spacing consistency, color harmony, contrast ratios.
- **Functionality:** Can users understand and complete tasks without guessing?

#### Step 7: Spec Alignment

- Does this task's implementation serve the broader goals in spec.md?
- Does it conflict with or undermine other user stories?

### 3. Write Results to log.md

Append (never edit or delete existing content) to `ralph/{story-id}/log.md`:

**If Issues Found:**

```
### [Reviewer] Round N
- **Task:** {task name}
- **Status:** ISSUES
- **Tests:** {PASS or FAIL with details}
- **Lint/Typecheck/Build:** {PASS or FAIL with details}
- **QA — Live server:** {what was tested, what failed, screenshots}
- **Code quality (simplify):** {findings, or PASS}
- **Security (manual):** {findings, or PASS}
- **Design (gstack):** {findings, or N/A}
- **Spec alignment:** {findings, or PASS}
```

**If Pass:**

```
### [Reviewer] Round N
- **Task:** {task name}
- **Status:** PASS
- **Task DONE**
```

Increment the round number from the last entry in log.md.

### 4. Update CLAUDE.md

If you discover genuinely reusable patterns during review, append them to the project root `CLAUDE.md`.

## Important Rules

- **No mercy.** Verify everything. If you didn't see it work with your own eyes, it doesn't work.
- **Steps are sequential.** Complete each step fully before moving to the next.
- **log.md is append-only.** Never edit or delete existing entries.
- **Verify independently.** Don't trust the coder's self-validation — run tests, start the server fresh, test in the browser, read the actual code.
- Do NOT update `progress.json` — the dispatch prompt handles that.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "refactor: rewrite ralph.reviewer skill for bash-driven loop"
```

---

### Task 7: Update ralph.planner skill

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md`

Add generation of `progress.json`, `story.md` per user story. Update file references from `task.md` to `tasks.md`. Update Phase 8 message.

- [ ] **Step 1: Read the current skill**

Read `.claude/skills/ralph.planner/SKILL.md` to understand current structure.

- [ ] **Step 2: Rewrite the skill**

Replace the entire content of `.claude/skills/ralph.planner/SKILL.md` with:

````markdown
---
name: ralph.planner
description: Interactive brainstorming to generate spec, stories, tasks, and progress.json for autonomous implementation
---

# Ralph Planner

You are an interactive planner (PM). Your job is to brainstorm with the user to produce a complete feature specification, user stories, task breakdowns, and progress tracking that the bash-driven ralph loop can execute autonomously.

## Process

### Phase 1: CEO Review

Before brainstorming, invoke the `gstack-plan-ceo-review` skill.

This challenges premises, validates ambition, and ensures we're solving the right problem at the right scope. Apply any insights from this review to inform the brainstorming phase.

### Phase 2: Brainstorming

Ask the user questions **one at a time** to understand what they want to build. Prefer multiple choice questions when possible.

Focus on understanding:
- **Purpose:** What problem does this solve? Who is it for?
- **User stories:** What are the key user-facing behaviors?
- **Constraints:** Technical limitations, dependencies, existing patterns
- **Success criteria:** How do we know it's done correctly?
- **Non-goals:** What is explicitly out of scope?

Keep going until you have a clear picture. Don't rush — missing requirements here means wasted autonomous cycles later.

When the discussion involves specific libraries, frameworks, or APIs, use the `find-docs` skill (Context7) to look up the latest documentation. Don't rely on your training data for API signatures, configuration options, or version-specific behavior.

### Phase 3: Draft spec.md

Once you understand the feature, draft `ralph/spec.md` internally (do not write to disk yet):

```markdown
# {Feature Name}

## Overview
{1-2 paragraph description of what this feature does and why}

## Non-Goals
- {What this feature explicitly does NOT do}

## Technical Considerations
- {Relevant architecture decisions, dependencies, patterns to follow}
- {Tech stack choices and constraints}
```

Note: User stories are NOT included in spec.md — they live in individual `story.md` files (see Phase 6b).

### Phase 4: Engineering Review

Invoke the `gstack-plan-eng-review` skill on the drafted spec.

This locks in architecture, data flow, edge cases, test coverage, and performance considerations. Apply all findings back into the spec before presenting to the user.

### Phase 5: Review spec.md with user

Present the spec to the user **section by section**. For each section:

1. Show the section content
2. Ask if it looks right
3. If the user requests changes, revise and re-present
4. Only move to the next section after approval

Sections to review in order:
- Overview
- Each user story (one at a time)
- Non-goals
- Technical considerations

### Phase 6: Write spec.md

After all sections are approved, write the final `ralph/spec.md` to disk.

### Phase 6b: Generate story.md per user story

For each user story, create `ralph/NNN-{userstory-slug}/story.md`:

```markdown
# {User Story Title}

## Description
{What the user wants to accomplish and why}

## Acceptance Criteria
- {Criterion 1}
- {Criterion 2}
- {Criterion 3}
```

### Phase 7: Generate tasks.md per user story

For each user story, create `ralph/NNN-{userstory-slug}/tasks.md`:

```markdown
# Tasks: {User Story Title}

## Task 1: {Task Name}
**Description:** {What to build — focus on WHAT, not HOW}
**Acceptance Criteria:**
- {Specific, verifiable criterion}
- {Specific, verifiable criterion}
**TDD Approach:** {What tests to write first — describe behavior to test, not implementation}
**Validation:** {How the coder self-validates before declaring done — commands to run, behaviors to check}

## Task 2: {Task Name}
...
```

**Task guidelines:**
- Each task must fit in a **single coder loop iteration** (one ralph.coder invocation)
- Tasks are ordered by dependency — earlier tasks should not depend on later ones
- Describe **what** to build and **how to verify**, not exact file paths or code samples
- The coder will figure out implementation details autonomously
- Include enough acceptance criteria that a reviewer can objectively judge pass/fail

### Phase 7b: Generate progress.json

Generate `ralph/progress.json` with all stories and tasks initialized:

```json
{
  "stories": [
    {
      "id": "001-{slug}",
      "title": "{User Story Title}",
      "status": "pending",
      "tasks": [
        { "id": 1, "name": "{Task Name}", "status": "pending" },
        { "id": 2, "name": "{Task Name}", "status": "pending" }
      ]
    }
  ]
}
```

All statuses start as `pending`.

### Phase 8: Done

When all files are generated, inform the user:

> "Spec and tasks are ready in `ralph/`. Run `pnpm loop` to start autonomous execution, or `pnpm loop:once` for a single interactive iteration."

Do NOT start the loop yourself. The user controls when to start autonomous execution.
````

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat: update ralph.planner to generate progress.json and story.md"
```

---

### Task 8: Remove ralph.loop and ralph.leader skills

**Files:**
- Delete: `.claude/skills/ralph.loop/SKILL.md`
- Delete: `.claude/skills/ralph.loop/` (directory)
- Delete: `.claude/skills/ralph.leader/SKILL.md`
- Delete: `.claude/skills/ralph.leader/` (directory)

- [ ] **Step 1: Remove the skill directories**

```bash
rm -rf .claude/skills/ralph.loop
rm -rf .claude/skills/ralph.leader
```

- [ ] **Step 2: Commit**

```bash
git add -A .claude/skills/ralph.loop .claude/skills/ralph.leader
git commit -m "refactor: remove ralph.loop and ralph.leader skills (replaced by bash loop)"
```

---

### Task 9: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

Update conventions to reflect the new structure.

- [ ] **Step 1: Read current CLAUDE.md**

Read `CLAUDE.md` to see what needs changing.

- [ ] **Step 2: Update CLAUDE.md**

Replace the content with:

```markdown
# Supermango

Multi-agent orchestration system using Claude Code with bash-driven loop.

## Skills

- `/ralph.planner` — Interactive brainstorming, generates spec.md, story.md, tasks.md, and progress.json
- `ralph.coder` — TDD implementation of a single task
- `ralph.reviewer` — QA, design, code quality, and security review

## Running

- `pnpm loop` — Start headless autonomous loop
- `pnpm loop:once` — Run single interactive iteration

## Conventions

- Skills live in `.claude/skills/{skill-name}/SKILL.md`
- Feature specs and tasks live in `ralph/` directory
- Global state tracked in `ralph/progress.json`
- Coder and reviewer communicate via `ralph/NNN-{userstory}/log.md`
- All log.md entries are append-only
- Commit every modification with conventional commit messages
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for bash-driven ralph loop"
```

---

### Task 10: Update README.md

**Files:**
- Modify: `README.md`

Update to reflect the new bash-driven approach.

- [ ] **Step 1: Read current README.md**

Read `README.md` to understand current content.

- [ ] **Step 2: Update README.md**

Update the workflow section to reference `pnpm loop` and `pnpm loop:once` instead of `/ralph.loop`. Remove references to teammates. Update the skill list. Keep the prerequisites section but remove the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` requirement note if present.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README.md for bash-driven ralph loop"
```

---

### Task 11: Smoke test the bash scripts

**Files:**
- No changes — verification only

- [ ] **Step 1: Verify ralph-loop.sh runs and fails gracefully without spec.md**

```bash
# Should fail with "spec.md not found" since we haven't run the planner
bash ralph/ralph-loop.sh
```

Expected: Error message about missing spec.md, exit code 1.

- [ ] **Step 2: Verify ralph-once.sh runs and fails gracefully without spec.md**

```bash
bash ralph/ralph-once.sh
```

Expected: Same error message, exit code 1.

- [ ] **Step 3: Verify pnpm scripts work**

```bash
pnpm loop 2>&1 || true
pnpm loop:once 2>&1 || true
```

Expected: Both show the spec.md error via the bash scripts.

- [ ] **Step 4: Create a minimal test fixture and verify the loop starts**

Create temporary test files to verify the loop would start correctly:

```bash
# Create minimal fixture
mkdir -p ralph/001-test
echo "# Test spec" > ralph/spec.md
echo '{"stories":[{"id":"001-test","title":"Test","status":"pending","tasks":[{"id":1,"name":"Test task","status":"pending"}]}]}' > ralph/progress.json
echo "# Test story" > ralph/001-test/story.md
echo "# Test tasks" > ralph/001-test/tasks.md

# Verify ralph-loop.sh passes validation (it will fail at claude command, that's fine)
bash ralph/ralph-loop.sh 1 2>&1 || true
```

Expected: Should pass validation (ralph-prompt.md already exists from Task 4), display stories, then fail at the `claude` command (since claude CLI may not be available or will error on the prompt without a real feature to work on). The important thing is it gets past validation and into the loop.

- [ ] **Step 5: Clean up test fixture**

```bash
rm -rf ralph/spec.md ralph/progress.json ralph/001-test
```

- [ ] **Step 6: Update BACKLOG.md**

Read `BACKLOG.md` and mark the first item (STOP teammates, using BASH) as done:

```bash
git add BACKLOG.md
git commit -m "docs: mark bash loop backlog item as done"
```
