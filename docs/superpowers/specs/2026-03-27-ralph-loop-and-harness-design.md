# Ralph Loop and Harness Design

## Goal

Build a multi-agent orchestration system using Claude Code's teammates feature. A planner brainstorms with the user to produce specs and tasks. A leader autonomously drives implementation by spawning coder+reviewer teammate pairs that iterate through tasks via file-based communication.

## Architecture

Four Claude Code skills orchestrate the workflow:

```
ralph.planner (interactive) → user invokes → ralph.leader (autonomous)
                                                  │
                                                  ├─ spawns coder + reviewer per task
                                                  ├─ on task DONE: fresh pair for next task
                                                  ├─ on user story DONE: next user story
                                                  └─ on all done: report to user
```

Coder and reviewer communicate through `progress.md` — a shared append-only log. Only the reviewer notifies the leader.

```
Coder: pick task → plan implementation → TDD → self-validate → progress.md → notify reviewer
Reviewer: review → if issues → progress.md → coder fixes → loop (no limit)
Reviewer: if pass → progress.md → notify leader (task DONE / user story DONE)
```

## Directory Structure

```
ralph/
  spec.md                      # feature spec with user stories
  001-{userstory}/
    task.md                    # multiple tasks for this user story
    progress.md                # shared coder/reviewer communication log
  002-{userstory}/
    task.md
    progress.md
  ...
```

## Skills

### ralph.planner

**Mode:** Interactive, runs in main session.

**Responsibilities:**
- Brainstorm with user one question at a time
- Generate `ralph/spec.md` with user stories
- Generate `ralph/NNN-{userstory}/task.md` for each user story
- Each task includes: description, acceptance criteria, TDD approach, validation steps
- Tasks are at a "what + how to verify" level — no exact file paths or code samples
- Done when all files are generated. User invokes `/ralph.leader` separately.

### ralph.leader

**Mode:** Autonomous, runs in main session.

**Responsibilities:**
- Read `ralph/` directory to find user stories in order
- Pick first incomplete user story
- Spawn coder + reviewer teammates, pass `task.md` and `spec.md` paths
- Wait for reviewer notification
- On task DONE: shut down both teammates, spawn fresh pair for next task in same user story
- On user story DONE: move to next user story folder
- On all user stories complete: report to user

**The leader does not manage task-level progression.** It only selects user stories and manages teammate lifecycle.

### ralph.coder

**Mode:** Teammate (headless).

**Receives:** `task.md` path, `spec.md` path.

**Per-task workflow:**
1. **Pre-flight:** Run existing tests. If broken, fix and commit before proceeding.
2. **Read progress.md** to determine which tasks are already completed.
3. **Pick next incomplete task** from task.md.
4. **Implementation planning:** Analyze the codebase, determine file structure, approach, and TDD steps.
5. **TDD loop:** Write failing test → implement minimal code → pass test.
6. **Pre-commit gates:** Run lint, typecheck, test, build.
7. **Commit every modification.**
8. **Self-validate** against task acceptance criteria.
9. **Append to progress.md:** What was done, files changed, status.
10. **Notify reviewer.**
11. **Update CLAUDE.md** if reusable patterns or gotchas were discovered.

After reviewer approval, pick next task. After all tasks done, notify reviewer that user story is complete.

### ralph.reviewer

**Mode:** Teammate (headless).

**Receives:** `task.md` path, `spec.md` path.

**Per-task workflow:**
1. **Wait for coder notification.**
2. **Read progress.md** for coder's completion entry.
3. **Review against task.md criteria + spec.md:** QA, design, code quality, security.
4. **If issues found:** Append issues to progress.md. Coder picks up and fixes. Loop until resolved (no iteration limit).
5. **If pass:** Append approval to progress.md.
6. **Notify leader:** Task DONE, or user story DONE if all tasks complete.
7. **Update CLAUDE.md** if reusable patterns or gotchas were discovered.

## progress.md Format

Append-only shared communication log. Never edit or delete entries.

```markdown
# Progress: 001-{userstory}

## Task 1: {task name}

### [Coder] Iteration 1
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Implemented login endpoint with JWT token generation
- **Self-validation:** All tests pass, meets task criteria

### [Reviewer] Iteration 1
- **Status:** ISSUES
- **QA:** Missing edge case — empty password should return 400
- **Security:** JWT secret hardcoded, should use env var

### [Coder] Iteration 2
- **Status:** DONE
- **Files changed:** src/auth/login.ts, src/auth/login.test.ts
- **What was done:** Added empty password validation, moved JWT secret to env
- **Self-validation:** All tests pass

### [Reviewer] Iteration 2
- **Status:** PASS
- **Task DONE**

## Task 2: {task name}
...

### [Reviewer] Final
- **USER STORY DONE**
```

## Learnings Persistence

Both coder and reviewer update the project's `CLAUDE.md` when they discover genuinely reusable knowledge:
- Code patterns and conventions
- Gotchas and non-obvious requirements
- API behaviors and configuration details
- Testing approaches that worked

Not every iteration produces updates — only when knowledge is reusable for future coder/reviewer pairs.

## Key Design Decisions

1. **No bash scripts.** Everything runs through Claude Code skills and teammates.
2. **Fresh teammates per task.** Clean context prevents accumulation of stale assumptions.
3. **File-based communication.** progress.md is the single channel between coder and reviewer.
4. **Only reviewer notifies leader.** Single point of coordination simplifies the protocol.
5. **No iteration limit on coder-reviewer loop.** Full automation — keep going until resolved.
6. **Commit every modification.** Small commits reduce blast radius and aid debugging.
7. **Coder does implementation planning.** task.md describes what, coder figures out how.
8. **Planner and leader are separate invocations.** User controls the transition.
9. **Learnings flow to CLAUDE.md.** Knowledge accumulates across teammate lifecycles.
