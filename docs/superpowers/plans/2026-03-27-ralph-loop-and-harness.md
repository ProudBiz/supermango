# Ralph Loop and Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four Claude Code skills (planner, leader, coder, reviewer) that orchestrate autonomous feature implementation through teammate-based multi-agent coordination.

**Architecture:** Skills live in `.claude/skills/`. The planner interactively brainstorms specs with the user. The leader autonomously manages coder+reviewer teammate pairs per task. Coder and reviewer communicate via append-only `progress.md` files. Only the reviewer notifies the leader.

**Tech Stack:** Claude Code skills (SKILL.md markdown), Claude Code teammates API (Task tool, SendMessage, TeamCreate)

---

## File Structure

```
.claude/
  skills/
    ralph.planner/
      SKILL.md              # Interactive brainstorming + spec/task generation
    ralph.leader/
      SKILL.md              # Autonomous orchestrator
    ralph.coder/
      SKILL.md              # Teammate: TDD implementation
    ralph.reviewer/
      SKILL.md              # Teammate: QA/design/code/security review
```

All skills are standalone markdown files. No code dependencies between them — they communicate through filesystem (`ralph/` directory) and Claude Code's teammate messaging (SendMessage).

---

### Task 1: Initialize git and project CLAUDE.md

**Files:**
- Create: `CLAUDE.md`
- Create: `.gitignore`

- [ ] **Step 1: Initialize git repository**

```bash
git init
```

- [ ] **Step 2: Create .gitignore**

Write `.gitignore`:
```
node_modules/
.DS_Store
```

- [ ] **Step 3: Create project CLAUDE.md**

Write `CLAUDE.md` with initial project conventions:

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .gitignore .claude/settings.json
git commit -m "chore: initialize supermango project with CLAUDE.md"
```

---

### Task 2: Create ralph.planner skill

**Files:**
- Create: `.claude/skills/ralph.planner/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/ralph.planner
```

- [ ] **Step 2: Write the SKILL.md**

Write `.claude/skills/ralph.planner/SKILL.md` with the following behavior:

**Skill metadata:**
- name: `ralph.planner`
- description: Interactive brainstorming to generate feature specs and task breakdowns

**Skill body — the planner must:**

1. **Brainstorm with the user** one question at a time (prefer multiple choice). Understand: purpose, user stories, constraints, success criteria.

2. **Generate `ralph/spec.md`** containing:
   - Feature overview
   - User stories (numbered: 001, 002, ...)
   - Each user story has: title, description, acceptance criteria
   - Non-goals
   - Technical considerations

3. **Generate `ralph/NNN-{userstory}/task.md`** for each user story containing:
   - Multiple tasks per file, ordered by dependency
   - Each task has: title, description, acceptance criteria, TDD approach, validation steps
   - Tasks are at "what + how to verify" level — no exact file paths or code samples
   - Each task should fit in a single coder loop iteration

4. **Output format for task.md:**

```markdown
# Tasks: {user story title}

## Task 1: {task name}
**Description:** {what to build}
**Acceptance Criteria:**
- {criterion 1}
- {criterion 2}
**TDD Approach:** {what tests to write first}
**Validation:** {how coder self-validates before declaring done}

## Task 2: {task name}
...
```

5. **Done** when all files are generated. Inform user to invoke `/ralph.leader` to start autonomous execution.

- [ ] **Step 3: Verify the skill loads**

Run: `ls .claude/skills/ralph.planner/SKILL.md`
Expected: File exists

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat: add ralph.planner skill for interactive brainstorming"
```

---

### Task 3: Create ralph.coder skill

**Files:**
- Create: `.claude/skills/ralph.coder/SKILL.md`

This is created before the leader because the leader's prompt references the coder's behavior.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/ralph.coder
```

- [ ] **Step 2: Write the SKILL.md**

Write `.claude/skills/ralph.coder/SKILL.md` — this is a **teammate prompt**, not a user-invocable skill. It will be injected into the coder teammate's prompt by the leader.

**Skill body — the coder must:**

1. **Read inputs:**
   - Read project root `CLAUDE.md` for patterns and conventions
   - Read `spec.md` at the provided path for feature context
   - Read `task.md` at the provided path for task list
   - Read `progress.md` (if exists) to know which tasks are completed

2. **Pre-flight:**
   - Run existing tests. If any fail, fix and commit before proceeding.
   - Run lint, typecheck if available.

3. **Pick next incomplete task** from task.md (skip tasks already marked done in progress.md).

4. **Implementation planning:**
   - Analyze the codebase to understand relevant files, patterns, structure
   - Plan the approach: which files to create/modify, TDD steps
   - Do NOT ask the leader or reviewer — figure it out autonomously

5. **TDD loop:**
   - Write failing test first
   - Implement minimal code to pass
   - Repeat for each requirement in the task

6. **Pre-commit gates:**
   - Run lint, typecheck, test, build (whatever the project supports)
   - Fix any issues before proceeding

7. **Commit every modification** with conventional commit messages.

8. **Self-validate** against task's acceptance criteria.

9. **Append to progress.md** using this format:

```markdown
### [Coder] Iteration N
- **Task:** {task name}
- **Status:** DONE
- **Files changed:** {list}
- **What was done:** {summary}
- **Self-validation:** {results against acceptance criteria}
```

10. **Notify reviewer** via SendMessage: "Task N complete. Review progress.md for details."

11. **Wait for reviewer response** via SendMessage:
    - If reviewer sends issues: read progress.md for details, fix issues, re-commit, append new iteration to progress.md, notify reviewer again.
    - If reviewer sends approval: **stop**. The coder's job is done. The leader will spawn a fresh coder for the next task.

12. **Update CLAUDE.md** if genuinely reusable patterns or gotchas were discovered. Not every iteration warrants an update.

**Important:** The coder handles exactly ONE task per spawn. It does not loop through multiple tasks.

- [ ] **Step 3: Verify the skill loads**

Run: `ls .claude/skills/ralph.coder/SKILL.md`
Expected: File exists

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.coder/SKILL.md
git commit -m "feat: add ralph.coder teammate skill for TDD implementation"
```

---

### Task 4: Create ralph.reviewer skill

**Files:**
- Create: `.claude/skills/ralph.reviewer/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/ralph.reviewer
```

- [ ] **Step 2: Write the SKILL.md**

Write `.claude/skills/ralph.reviewer/SKILL.md` — teammate prompt, not user-invocable.

**Skill body — the reviewer must:**

1. **Read inputs:**
   - Read project root `CLAUDE.md` for patterns and conventions
   - Read `spec.md` at the provided path for feature context
   - Read `task.md` at the provided path for task list and acceptance criteria

2. **Wait for coder notification** via SendMessage.

3. **On coder notification:**
   - Read `progress.md` for the coder's latest iteration entry
   - Read the actual code changes (git diff or read modified files)

4. **Review against multiple dimensions:**
   - **QA:** Does the implementation satisfy the task's acceptance criteria? Edge cases covered?
   - **Design:** Does the code follow project patterns? Is the architecture sound?
   - **Code quality:** DRY, KISS, naming, readability, maintainability
   - **Security:** Input validation, injection risks, secrets handling, OWASP top 10
   - **Spec alignment:** Does the task implementation serve the broader spec.md goals?

5. **If issues found:**
   - Append to progress.md:

```markdown
### [Reviewer] Iteration N
- **Status:** ISSUES
- **QA:** {issues or PASS}
- **Design:** {issues or PASS}
- **Code quality:** {issues or PASS}
- **Security:** {issues or PASS}
- **Spec alignment:** {issues or PASS}
```

   - Notify coder via SendMessage: "Issues found. Check progress.md for details."
   - Wait for coder to fix and re-notify.

6. **If pass:**
   - Append to progress.md:

```markdown
### [Reviewer] Iteration N
- **Status:** PASS
- **Task DONE**
```

   - Check if all tasks in task.md are now complete (all have PASS entries in progress.md).
   - If more tasks remain: notify leader via SendMessage: "Task N complete. More tasks remain."
   - If all tasks done: append `**USER STORY DONE**` to progress.md. Notify leader via SendMessage: "User story complete."

**Important:** The reviewer always notifies the leader when a task passes — never the coder. The leader decides whether to spawn a fresh pair for the next task.

7. **Update CLAUDE.md** if genuinely reusable patterns discovered during review.

- [ ] **Step 3: Verify the skill loads**

Run: `ls .claude/skills/ralph.reviewer/SKILL.md`
Expected: File exists

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "feat: add ralph.reviewer teammate skill for QA/code review"
```

---

### Task 5: Create ralph.leader skill

**Files:**
- Create: `.claude/skills/ralph.leader/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/ralph.leader
```

- [ ] **Step 2: Write the SKILL.md**

Write `.claude/skills/ralph.leader/SKILL.md` — user-invocable skill.

**Skill body — the leader must:**

1. **Read inputs:**
   - Read project root `CLAUDE.md`
   - Read `ralph/spec.md` for feature overview
   - Scan `ralph/` directory for user story folders (001-*, 002-*, ...)

2. **Determine first incomplete user story:**
   - For each user story folder in order, check if `progress.md` contains `**USER STORY DONE**`
   - Pick the first one that doesn't

3. **For the selected user story:**
   - Read `task.md` to understand what needs to be done
   - Read the coder skill from `.claude/skills/ralph.coder/SKILL.md`
   - Read the reviewer skill from `.claude/skills/ralph.reviewer/SKILL.md`

4. **Spawn teammates using Task tool:**

   First, create a team:
   ```
   TeamCreate:
     team_name: "ralph-{userstory-folder}"
     description: "Coder+Reviewer for {userstory title}"
   ```

   Then spawn the coder:
   ```
   Task tool:
     team_name: "ralph-{userstory-folder}"
     name: "coder"
     description: "TDD implementation for {userstory}"
     prompt: |
       {contents of ralph.coder/SKILL.md}

       ## Your Assignment
       - spec.md path: ralph/spec.md
       - task.md path: ralph/{userstory-folder}/task.md
       - progress.md path: ralph/{userstory-folder}/progress.md
       - Reviewer agent name: reviewer (use SendMessage to communicate)
   ```

   Then spawn the reviewer:
   ```
   Task tool:
     team_name: "ralph-{userstory-folder}"
     name: "reviewer"
     description: "QA/code review for {userstory}"
     prompt: |
       {contents of ralph.reviewer/SKILL.md}

       ## Your Assignment
       - spec.md path: ralph/spec.md
       - task.md path: ralph/{userstory-folder}/task.md
       - progress.md path: ralph/{userstory-folder}/progress.md
       - Coder agent name: coder (use SendMessage to communicate)
       - Leader agent: send "User story complete" when all tasks pass
   ```

5. **Wait for reviewer notification.** The reviewer will send one of:
   - "Task N complete. More tasks remain." → shut down both teammates, go to step 4 (spawn fresh pair for next task in same user story)
   - "User story complete." → shut down both teammates, go to step 2 (pick next incomplete user story)

6. **When all user stories are complete:** report to user "All user stories complete. Ralph is done."

- [ ] **Step 3: Verify the skill loads**

Run: `ls .claude/skills/ralph.leader/SKILL.md`
Expected: File exists

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.leader/SKILL.md
git commit -m "feat: add ralph.leader skill for autonomous orchestration"
```

---

### Task 6: End-to-end smoke test

- [ ] **Step 1: Verify all skills exist**

```bash
ls .claude/skills/ralph.planner/SKILL.md
ls .claude/skills/ralph.coder/SKILL.md
ls .claude/skills/ralph.reviewer/SKILL.md
ls .claude/skills/ralph.leader/SKILL.md
```
Expected: All four files exist

- [ ] **Step 2: Verify skill content**

Read each SKILL.md and verify:
- ralph.planner has brainstorming flow and spec/task generation
- ralph.coder has pre-flight, TDD, progress.md, SendMessage to reviewer
- ralph.reviewer has review dimensions, progress.md, SendMessage to leader
- ralph.leader has user story scanning, TeamCreate, Task spawning, wait loop

- [ ] **Step 3: Test ralph.planner invocation**

Invoke `/ralph.planner` in Claude Code and verify it starts brainstorming interactively. Cancel after confirming the flow starts correctly.

- [ ] **Step 4: Commit any fixes**

If any issues were found and fixed during verification:
```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```
