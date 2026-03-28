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
- Engine scripts live in `ralph-engine/` directory
- Feature specs and tasks live in `ralph-workspace/` directory
- Global state tracked in `ralph-workspace/progress.json`
- Coder and reviewer communicate via `ralph-workspace/NNN-{userstory}/log.md`
- All log.md entries are append-only
- Commit every modification with conventional commit messages
- Package manager: pnpm
- Two-process architecture: Bolt (Slack bot) + Next.js (web app), sharing SQLite
- Env vars defined in `.env` (gitignored), template in `.env.example`
- SQLite database uses WAL mode for concurrent access
