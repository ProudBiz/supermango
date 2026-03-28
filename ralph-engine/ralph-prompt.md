# Ralph Agent Instructions

You are an autonomous coding agent. Each iteration you read the project state, determine what needs to happen next, and execute it.

## Step 1: Read State

1. Read `CLAUDE.md` for project patterns and conventions
2. Read `ralph-workspace/spec.md` for feature goals and context
3. Read `ralph-workspace/progress.json` for global task state

## Step 2: Find Current Work

Scan `progress.json` for the first story that is NOT `done` and NOT `known_issue`. Check rules in order — first match wins:

1. If a story has status `qa_issues` → go to **Step 4: Fix QA Issues**
2. If a story has status `qa` → go to **Step 5: Run QA**
3. If a story has status `in_progress` and ALL its tasks have `reviewer_pass` or `known_issue` → go to **Step 5: Run QA** (transition to QA)
4. If a story has status `in_progress` or `pending` → find the first task that is NOT `reviewer_pass` and NOT `known_issue`:
   - Task `pending` → go to **Step 3a: Run Coder**
   - Task `coder_done` → go to **Step 3b: Run Reviewer**
   - Task `reviewer_issues` → go to **Step 3a: Run Coder** (fixing issues)
5. If ALL stories have status `done` or `known_issue` → go to **Step 6: Complete**

## Step 3a: Run Coder

Read the story's `tasks.md` and `log.md` from `ralph-workspace/{story-id}/`.

**Count rounds:** Look at `log.md` for alternating [Coder]/[Reviewer] entries for the current task. If the coder has already been invoked 5 times for this task (5 coder→reviewer cycles without `reviewer_pass`), this task is stuck:
- Write the issue to `ralph-workspace/known-issues.md` (copy the last reviewer's issues from `log.md`)
- Set the task status to `known_issue` in `progress.json`
- End this iteration (next iteration picks up the next task)

**Otherwise:** Read `.claude/skills/ralph.coder/SKILL.md` and follow its instructions exactly.

Context for the coder:
- **Story directory:** `ralph-workspace/{story-id}/`
- **Task:** Task {N}: {task name}
- **Mode:** If task status is `reviewer_issues`, tell the coder: "Reviewer found issues. Read log.md for details and fix them." If task status is `pending`, tell the coder: "This is a fresh task."

After following the coder skill, update `progress.json`:
- Set the task status to `coder_done`
- If the story status is `pending`, set it to `in_progress`

End this iteration.

## Step 3b: Run Reviewer

Read the story's `tasks.md` and `log.md` from `ralph-workspace/{story-id}/`.

Read `.claude/skills/ralph.reviewer/SKILL.md` and follow its instructions exactly.

Context for the reviewer:
- **Story directory:** `ralph-workspace/{story-id}/`
- **Task:** Task {N}: {task name}
- **Mode:** "Coder completed work. Review it."

After following the reviewer skill, update `progress.json`:
- If review passed: set task status to `reviewer_pass`
- If issues found: set task status to `reviewer_issues`

Check: if ALL tasks in this story now have `reviewer_pass` or `known_issue`, set story status to `qa`.

End this iteration.

## Step 4: Fix QA Issues

Read the story's `log.md` from `ralph-workspace/{story-id}/`.

**Count rounds:** Look at `log.md` for alternating [Coder]/[QA] entries at the story level. If the coder has been invoked 5 times for QA fixes without `qa_pass`, this story is stuck:
- Write the issue to `ralph-workspace/known-issues.md` (copy the last QA issues from `log.md`)
- Set the story status to `known_issue` in `progress.json`
- End this iteration (next iteration picks up the next story)

**Otherwise:** Read `.claude/skills/ralph.coder/SKILL.md` and follow its instructions.

Context for the coder:
- **Story directory:** `ralph-workspace/{story-id}/`
- **Task:** "QA fix — {summary of QA issues from log.md}"
- **Mode:** "QA found issues with the full story. Read log.md for details and fix them."

After following the coder skill, set story status to `qa` in `progress.json`.

End this iteration.

## Step 5: Run QA

Read the story's `story.md`, `tasks.md`, and `log.md` from `ralph-workspace/{story-id}/`.

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
