# Bash-Driven Ralph Loop

Replace the teammates-based `ralph.loop` orchestration with a bash-driven loop that pipes a prompt to `claude` per iteration.

## Goals

- Eliminate dependency on experimental agent teams (`TeamCreate`/`TeamDelete`/`SendMessage`)
- Simpler orchestration: bash loop + stateless prompt dispatcher
- Keep coder/reviewer separation with independent review loop
- Global progress tracking via structured `progress.json`

## Non-Goals

- Changing the planning phase (`ralph.planner` stays interactive)
- Changing the coder's TDD approach or reviewer's 7-step verification
- Removing `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` from settings.json

## Architecture

### File Structure

```
ralph/
  ralph-loop.sh          # headless bash loop
  ralph-once.sh          # interactive single iteration
  ralph-prompt.md        # stateless dispatcher prompt
  spec.md                # feature spec (goals, non-goals, tech stack)
  progress.json          # global state (all stories, tasks, statuses)
  001-{userstory}/
    story.md             # user story description, acceptance criteria
    tasks.md             # task breakdown
    log.md               # coder/reviewer detailed log (append-only)
```

### pnpm Scripts

```json
{
  "loop": "bash ralph/ralph-loop.sh",
  "loop:once": "bash ralph/ralph-once.sh"
}
```

## Components

### 1. ralph/ralph-loop.sh

Headless bash loop modeled on proudskills' `ralph.sh`.

- Resolves git repo root
- Validates: `ralph/ralph-prompt.md` exists, `ralph/spec.md` exists
- Loops up to MAX_ITERATIONS (default 100, configurable via argument)
- Each iteration: pipes `ralph/ralph-prompt.md` to `claude --dangerously-skip-permissions --print`
- Checks output for `<promise>COMPLETE</promise>` — exits on match
- Tracks elapsed time, logs start/end timestamps
- Usage: `pnpm loop` or `pnpm loop 50`

### 2. ralph/ralph-once.sh

Single interactive iteration.

- Same validation as ralph-loop.sh
- Runs `claude --dangerously-skip-permissions` without `--print` (user sees terminal UI)
- No loop — runs once and exits
- Usage: `pnpm loop:once`

### 3. ralph/ralph-prompt.md

Stateless dispatcher. Same prompt every iteration. The agent:

1. Reads `ralph/spec.md`, `ralph/progress.json`
2. Finds the first incomplete story, then the first incomplete task
3. Reads that story's `tasks.md` and `log.md` for context
4. Determines role from task status in `progress.json`:
   - `pending` → invoke `/ralph.coder`
   - `coder_done` → invoke `/ralph.reviewer`
   - `reviewer_issues` → invoke `/ralph.coder` (with context: "fix issues in log.md")
   - `reviewer_pass` → skip to next task
5. Passes explicit assignment to the skill: which story, which task, what to do
6. After all tasks in a story have `reviewer_pass` → move to next story
7. After all stories complete → output `<promise>COMPLETE</promise>`

The prompt contains NO coder or reviewer logic — purely a state machine.

### 4. ralph.coder Skill (rewritten)

Changes from current:
- **Remove:** `SendMessage`, `wait for reviewer`, `notify reviewer`, teammate lifecycle
- **Remove:** Task selection logic (ralph-prompt.md assigns the task)
- **Keep:** Pre-flight (run tests, lint, typecheck), TDD loop, self-validation, conventional commits, `log.md` append-only format, CLAUDE.md updates

Receives assignment like:
> "You are working on ralph/001-auth/, Task 2: Login endpoint."
> or
> "You are working on ralph/001-auth/, Task 2: Login endpoint. Reviewer found issues. Check log.md."

Does its work, appends to `ralph/001-auth/log.md`, updates `progress.json` status to `coder_done`, exits.

### 5. ralph.reviewer Skill (rewritten)

Changes from current:
- **Remove:** `SendMessage`, `wait for coder`, `notify leader`, teammate lifecycle
- **Remove:** Task selection logic
- **Keep:** All 7 verification steps (tests, lint/typecheck/build, QA/live server, code quality via simplify, security, design review, spec alignment)

Receives assignment like:
> "You are working on ralph/001-auth/, Task 2: Login endpoint. Coder completed work. Review it."

Reviews, appends PASS or ISSUES with details to `ralph/001-auth/log.md`, updates `progress.json` to `reviewer_pass` or `reviewer_issues`, exits.

### 6. ralph.planner Skill (updated)

Additional output:
- Generates `ralph/progress.json` with all stories and tasks initialized to `pending`
- Generates `ralph/NNN-{userstory}/story.md` per story (in addition to `tasks.md`)

## progress.json Format

```json
{
  "stories": [
    {
      "id": "001-auth",
      "title": "User authentication",
      "status": "in_progress",
      "tasks": [
        { "id": 1, "name": "Setup auth middleware", "status": "reviewer_pass" },
        { "id": 2, "name": "Login endpoint", "status": "coder_done" },
        { "id": 3, "name": "Session management", "status": "pending" }
      ]
    },
    {
      "id": "002-dashboard",
      "title": "Dashboard layout",
      "status": "pending",
      "tasks": [
        { "id": 1, "name": "Dashboard grid", "status": "pending" }
      ]
    }
  ]
}
```

### Task Status Flow

```
pending → coder_done → reviewer_pass
                     → reviewer_issues → coder_done → reviewer_pass
                                                    → reviewer_issues → ...
```

### Story Status

- `pending` — no tasks started
- `in_progress` — at least one task started
- `done` — all tasks have `reviewer_pass`

## log.md Format (append-only)

```markdown
### [Coder] Iteration 1
- **Task:** Login endpoint
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Implemented login endpoint with bcrypt password verification
- **Self-validation:** All tests pass, lint clean

### [Reviewer] Iteration 2
- **Task:** Login endpoint
- **Status:** ISSUES
- **Tests:** PASS
- **Lint/Typecheck/Build:** PASS
- **QA — Live server:** FAIL — returns 500 on empty email field
- **Code quality (simplify):** PASS
- **Security:** Missing rate limiting on login attempts
- **Design:** N/A
- **Spec alignment:** PASS

### [Coder] Iteration 3
- **Task:** Login endpoint (fix reviewer issues)
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Added input validation for empty email, added rate limiting
- **Self-validation:** All tests pass including new edge cases

### [Reviewer] Iteration 4
- **Task:** Login endpoint
- **Status:** PASS
- **Task DONE**
```

## Removed

- `.claude/skills/ralph.loop/SKILL.md` — replaced by `ralph/ralph-loop.sh`
- `.claude/skills/ralph.leader/SKILL.md` — older duplicate of ralph.loop

## Unchanged

- `.claude/settings.json` — kept as-is
- `ralph.planner` — same interactive flow, additional outputs
