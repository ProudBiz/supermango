# Supermango

Multi-agent orchestration system for autonomous feature implementation using Claude Code teammates.

## How It Works

```
/ralph.planner (interactive)     /ralph.loop (autonomous)
         |                              |
   brainstorm with user          pick user story
   CEO review                    spawn coder + reviewer
   draft spec                    wait for task DONE
   eng review                    TeamDelete, spawn fresh pair
   review with user              repeat until all done
   generate tasks                      |
         |                       coder <-> reviewer
   "invoke /ralph.loop"          via progress.md
```

1. **`/ralph.planner`** — Brainstorm with user, generate spec and tasks
2. **`/ralph.loop`** — Autonomously spawn coder+reviewer pairs per task
3. **`ralph.coder`** — TDD implementation, one task per spawn
4. **`ralph.reviewer`** — QA (live server), code quality, security, design review

## Usage

```bash
# Step 1: Plan the feature interactively
/ralph.planner

# Step 2: Run autonomous implementation
/ralph.loop
```

## Directory Structure

```
ralph/
  spec.md                      # feature spec with user stories
  001-{userstory}/
    task.md                    # tasks for this user story
    progress.md                # coder/reviewer communication log
  002-{userstory}/
    ...
```

## Prerequisites

### Installed Skills

- [superpowers](https://github.com/superpowers-marketplace/superpowers) — brainstorming, planning, execution workflows
- [gstack](https://gstack.dev) — headless browser QA, CEO/eng plan reviews
- [context7](https://context7.com) — library documentation lookup
- [frontend-design](https://github.com/anthropics/claude-code-plugins) — production-grade UI generation

## Architecture

### Planner Flow
1. `gstack-plan-ceo-review` — challenge premises, validate ambition
2. Brainstorm with user — one question at a time
3. Draft spec.md
4. `gstack-plan-eng-review` — architecture, edge cases, test coverage
5. Review spec with user — section by section approval
6. Write final spec.md + generate task.md files

### Loop Flow
1. Pick first incomplete user story
2. Spawn coder + reviewer teammates
3. Coder: pre-flight, pick task, TDD, self-validate, notify reviewer
4. Reviewer: run tests, live server QA (gstack + curl), code quality (simplify), security, design review
5. If issues: coder fixes, loop. If pass: notify loop.
6. TeamDelete old pair, spawn fresh pair for next task
7. Repeat until all user stories complete
