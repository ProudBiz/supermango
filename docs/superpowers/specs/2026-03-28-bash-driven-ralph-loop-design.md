# Bash-Driven Ralph Loop

Replace the teammates-based `ralph.loop` orchestration with a bash-driven loop that pipes a prompt to `claude` per iteration.

## Goals

- Eliminate dependency on experimental agent teams (`TeamCreate`/`TeamDelete`/`SendMessage`)
- Simpler orchestration: bash loop + self-dispatching prompt
- Keep coder/reviewer separation with independent review loop
- Global progress tracking via structured `progress.json`
- Full story QA validation after all tasks pass
- Fully automated — no human in the loop until completion

## Non-Goals

- Changing the planning phase (`ralph.planner` stays interactive)
- Changing the coder's TDD approach or reviewer's 7-step verification
- Cleaning up `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` from settings.json (harmless, leave it)

## Architecture

### File Structure

```
ralph/
  ralph-loop.sh          # headless bash loop
  ralph-once.sh          # interactive single iteration
  ralph-prompt.md        # self-dispatching prompt (agent reads state + acts)
  spec.md                # feature spec (goals, non-goals, tech stack)
  progress.json          # global state (all stories, tasks, statuses)
  known-issues.md        # issues that exceeded retry caps (human review)
  001-{userstory}/
    story.md             # user story description, acceptance criteria
    tasks.md             # task breakdown
    log.md               # coder/reviewer/QA detailed log (append-only)
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
- Only one instance should run at a time (no concurrent loops)
- Usage: `pnpm loop` or `pnpm loop 50`

### 2. ralph/ralph-once.sh

Single interactive iteration.

- Same validation as ralph-loop.sh
- Runs `claude --dangerously-skip-permissions` without `--print` (user sees terminal UI)
- No loop — runs once and exits
- Usage: `pnpm loop:once`

### 3. ralph/ralph-prompt.md

Self-dispatching prompt. Same prompt every iteration. The agent reads state and determines its own action:

1. Reads `ralph/spec.md`, `ralph/progress.json`, project `CLAUDE.md`
2. Finds the first incomplete story
3. Reads that story's `tasks.md` and `log.md` for context
4. Determines role from state in `progress.json`:

**Task-level dispatch:**
- Task `pending` → read `.claude/skills/ralph.coder/SKILL.md`, follow it
- Task `coder_done` → read `.claude/skills/ralph.reviewer/SKILL.md`, follow it
- Task `reviewer_issues` → read `.claude/skills/ralph.coder/SKILL.md`, follow it (fix issues from log.md)
- Task `reviewer_pass` → skip to next task

**Story-level dispatch (all tasks `reviewer_pass`):**
- Story not yet QA'd → run QA validation (reviewer's 7 verification steps scoped to the full story, not per-task — no separate QA skill file)
- Story `qa_issues` → read `.claude/skills/ralph.coder/SKILL.md`, follow it (fix QA issues from log.md)
- Story `qa_pass` → mark story `done`, move to next story

**Completion:**
- All stories `done` → output `<promise>COMPLETE</promise>`

**5-round cap:** If a task cycles coder→reviewer 5 times without `reviewer_pass`, or a story cycles coder→QA 5 times without `qa_pass`, write the issue to `ralph/known-issues.md` and skip to the next task/story.

The prompt contains NO coder or reviewer logic — it is instructions for the agent to read state and dispatch itself.

### 4. ralph.coder Skill (rewritten)

Changes from current:
- **Remove:** `SendMessage`, `wait for reviewer`, `notify reviewer`, teammate lifecycle
- **Remove:** Task selection logic (prompt assigns the task)
- **Keep:** Pre-flight (run tests, lint, typecheck), TDD loop, self-validation, conventional commits, `log.md` append-only format, CLAUDE.md updates

The coder receives its assignment from the dispatch context in ralph-prompt.md, which tells it exactly which story directory and task to work on, and whether it's a fresh task or fixing reviewer/QA issues.

Does its work, appends to `log.md`, updates `progress.json` task status to `coder_done`, exits.

### 5. ralph.reviewer Skill (rewritten)

Changes from current:
- **Remove:** `SendMessage`, `wait for coder`, `notify leader`, teammate lifecycle
- **Remove:** Task selection logic
- **Keep:** All 7 verification steps (tests, lint/typecheck/build, QA/live server, code quality via simplify, security, design review, spec alignment)

The reviewer receives its assignment from the dispatch context, which tells it which story directory and task to review.

Reviews, appends PASS or ISSUES with details to `log.md`, updates `progress.json` to `reviewer_pass` or `reviewer_issues`, exits.

### 6. ralph.planner Skill (updated)

Additional outputs beyond current spec.md and tasks.md:
- Generates `ralph/progress.json` with all stories and tasks initialized to `pending` (generated after Phase 7, task breakdown)
- Generates `ralph/NNN-{userstory}/story.md` per story with user story description and acceptance criteria

### story.md Format

```markdown
# {User Story Title}

## Description
{What the user wants to accomplish and why}

## Acceptance Criteria
- {Criterion 1}
- {Criterion 2}
- {Criterion 3}
```

User story details are in `story.md`, not duplicated in `spec.md`. `spec.md` covers the overall feature (goals, non-goals, tech stack, constraints). `story.md` covers individual user story scope.

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
                                                    → reviewer_issues → ... (max 5 rounds)
                                                                      → known_issue (written to known-issues.md, skip)
```

### Story Status Flow

```
pending → in_progress → qa → qa_pass → done
                             qa_issues → coder fixes → qa → qa_pass → done
                                                           qa_issues → ... (max 5 rounds)
                                                                     → known_issue (skip)
```

- `pending` — no tasks started
- `in_progress` — at least one task being worked on
- `qa` — all tasks passed, QA validation running
- `qa_issues` — QA found problems, coder fixing
- `qa_pass` — QA passed (transient, immediately becomes `done`)
- `done` — story complete

**Who updates status:**
The dispatch prompt (ralph-prompt.md) handles ALL `progress.json` updates. Coder and reviewer skills only write to `log.md` — they do not touch `progress.json`. After the skill completes, the dispatch logic updates the appropriate status in `progress.json` before ending the iteration.

## log.md Format (append-only)

```markdown
### [Coder] Round 1
- **Task:** Login endpoint
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Implemented login endpoint with bcrypt password verification
- **Self-validation:** All tests pass, lint clean

### [Reviewer] Round 2
- **Task:** Login endpoint
- **Status:** ISSUES
- **Tests:** PASS
- **Lint/Typecheck/Build:** PASS
- **QA — Live server:** FAIL — returns 500 on empty email field
- **Code quality (simplify):** PASS
- **Security:** Missing rate limiting on login attempts
- **Design:** N/A
- **Spec alignment:** PASS

### [Coder] Round 3
- **Task:** Login endpoint (fix reviewer issues)
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Added input validation for empty email, added rate limiting
- **Self-validation:** All tests pass including new edge cases

### [Reviewer] Round 4
- **Task:** Login endpoint
- **Status:** PASS
- **Task DONE**

### [QA] Round 5
- **Story:** 001-auth
- **Status:** ISSUES
- **Findings:** User can bypass auth by hitting /api/dashboard directly without session
- **Screenshots:** (if applicable)

### [Coder] Round 6
- **Task:** QA fix — auth bypass
- **Status:** DONE
- **Files changed:** src/middleware/auth-guard.ts
- **What was done:** Added auth middleware to all /api/* routes

### [QA] Round 7
- **Story:** 001-auth
- **Status:** PASS
- **Story DONE**
```

## known-issues.md Format

Written when a task or story exceeds its 5-round cap:

```markdown
## Task: 001-auth / Task 2: Login endpoint
- **Rounds exhausted:** 5
- **Last reviewer issues:** (copied from log.md)
- **Skipped at:** 2026-03-28 14:30

## Story QA: 002-dashboard
- **Rounds exhausted:** 5
- **Last QA issues:** (copied from log.md)
- **Skipped at:** 2026-03-28 16:45
```

This file is for human review after the loop completes.

## Deliverables

### New files
- `ralph/ralph-loop.sh`
- `ralph/ralph-once.sh`
- `ralph/ralph-prompt.md`
- `package.json` (with pnpm scripts)

### Rewritten files
- `.claude/skills/ralph.coder/SKILL.md` — remove teammates, remove task selection
- `.claude/skills/ralph.reviewer/SKILL.md` — remove teammates, remove task selection
- `.claude/skills/ralph.planner/SKILL.md` — add progress.json, story.md generation

### Removed files
- `.claude/skills/ralph.loop/SKILL.md` — replaced by ralph-loop.sh
- `.claude/skills/ralph.leader/SKILL.md` — older duplicate

### Updated files
- `CLAUDE.md` — update conventions to reflect new structure (progress.json, log.md, no teammates)
