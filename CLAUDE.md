# Supermango

Multi-agent orchestration system using Claude Code teammates.

## Skills

- `/ralph.planner` — Interactive brainstorming, generates spec.md and task.md files
- `/ralph.leader` — Autonomous orchestrator, spawns coder+reviewer pairs
- `ralph.coder` — Teammate skill, TDD implementation
- `ralph.reviewer` — Teammate skill, QA/design/code/security review

## Conventions

- Skills live in `.claude/skills/{skill-name}/SKILL.md`
- Feature specs and tasks live in `ralph/` directory
- Coder and reviewer communicate via `ralph/NNN-{userstory}/progress.md`
- All progress.md entries are append-only
- Commit every modification with conventional commit messages
