# Coder Systematic Debugging

## Problem

When the coder is in fix mode (reviewer_issues or QA fix), it reads the reviewer's findings in log.md and tries to fix them directly — guessing at patches without investigating root cause. This wastes autonomous cycles when the fix doesn't address the actual problem.

## Goal

The coder invokes the `systematic-debugging` skill before implementing any fix, ensuring root cause is identified before code changes.

## What Changes

Only `.claude/skills/ralph.coder/SKILL.md`. No changes to reviewer, planner, or loop prompt.

## Design

Add a new step 2 "Diagnose Issues (fix mode only)" between the current step 1 (Read Context) and step 2 (Pre-flight). Current steps 2-8 shift to 3-9.

When the coder is in fix mode (task status `reviewer_issues` or QA fix):
- Read the reviewer's or QA's findings in `log.md`
- Invoke the `systematic-debugging` skill to identify root cause before writing code
- After diagnosis completes, resume normal workflow (pre-flight → TDD → validate)

Skip this step for fresh tasks.

## What Stays the Same

- **ralph.reviewer/SKILL.md** — no changes
- **ralph.planner/SKILL.md** — no changes
- **ralph-prompt.md** — no changes
- All other coder steps (pre-flight, TDD, validate, log, CLAUDE.md update) — unchanged, just renumbered
