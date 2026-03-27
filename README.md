# Supermango

Multi-agent orchestration system for autonomous feature implementation using Claude Code with a bash-driven loop.

## How It Works

```
/ralph.planner (interactive)     pnpm loop (autonomous)
         |                              |
   brainstorm with user          read progress.json
   CEO review                    pick story + task
   draft spec                    dispatch coder or reviewer
   eng review                    update progress.json
   review with user              repeat until all done
   generate tasks + progress           |
         |                       coder <-> reviewer
   "run pnpm loop"              via log.md
```

1. **`/ralph.planner`** — Brainstorm with user, generate spec, stories, tasks, and progress.json
2. **`pnpm loop`** — Bash loop that pipes a prompt to `claude` per iteration
3. **`ralph.coder`** — TDD implementation, one task per iteration
4. **`ralph.reviewer`** — QA (live server), code quality, security, design review

## Usage

```bash
# Step 1: Plan the feature interactively
/ralph.planner

# Step 2: Run autonomous implementation
pnpm loop

# Or run a single interactive iteration
pnpm loop:once
```

## Directory Structure

```
ralph/
  ralph-loop.sh              # headless bash loop
  ralph-once.sh              # interactive single iteration
  ralph-prompt.md            # self-dispatching prompt
  spec.md                    # feature spec (goals, non-goals, tech stack)
  progress.json              # global state (stories, tasks, statuses)
  known-issues.md            # issues that exceeded retry caps
  001-{userstory}/
    story.md                 # user story description, acceptance criteria
    tasks.md                 # task breakdown
    log.md                   # coder/reviewer/QA detailed log (append-only)
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
6. Write spec.md, story.md, tasks.md, progress.json

### Loop Flow
1. Read `progress.json` to find current work
2. Dispatch coder or reviewer based on task status
3. Coder: pre-flight, TDD, self-validate, write to log.md
4. Reviewer: run tests, live server QA (gstack + curl), code quality (simplify), security, design review
5. If issues: coder fixes, reviewer reviews again (max 5 rounds)
6. After all tasks pass: QA validates full story
7. Repeat until all stories complete
