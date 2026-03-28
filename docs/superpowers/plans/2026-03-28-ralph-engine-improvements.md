# Ralph Engine Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the reviewer use explicit `/gstack` browse commands (not raw MCP) and make the planner commit its generated files.

**Architecture:** Two skill file edits — no new files, no engine changes.

**Tech Stack:** Markdown skill files

---

### Task 1: Rewrite reviewer Step 3 UI testing instructions

**Files:**
- Modify: `.claude/skills/ralph.reviewer/SKILL.md:50-51`

- [ ] **Step 1: Replace the vague gstack reference in Step 3**

Find this line (line 51):

```markdown
- **UI features:** Use `gstack` to open the app in a headless browser. Navigate to affected pages, click buttons, fill forms, verify renders, check error states. Take screenshots as evidence.
```

Replace with:

```markdown
- **UI features:** Invoke the `/gstack` skill for all browser testing. Use `$B` commands:
  ```
  $B goto http://localhost:3000
  $B snapshot -i                    # get interactive elements with @e refs
  $B fill @e2 "test input"          # fill form fields by @e ref
  $B click @e3                      # click buttons by @e ref
  $B snapshot -D                    # diff to see what changed
  $B screenshot /path/to/evidence.png  # capture evidence
  ```
  Navigate to affected pages, interact with elements using `@e` refs from snapshots, and take screenshots as evidence.
```

- [ ] **Step 2: Verify the edit**

Read `.claude/skills/ralph.reviewer/SKILL.md` lines 49-62. Confirm the `$B` command examples appear under Step 3's UI features bullet.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "fix(reviewer): use explicit /gstack $B commands for QA browser testing"
```

---

### Task 2: Rewrite reviewer Step 6 Design Review browser instructions

**Files:**
- Modify: `.claude/skills/ralph.reviewer/SKILL.md:80-83`

- [ ] **Step 1: Replace the vague gstack reference in Step 6**

Find these lines (lines 82-83):

```markdown
Start the dev server if not already running. Use `gstack` to take screenshots of every affected page/component.
```

Replace with:

```markdown
Start the dev server if not already running. Invoke the `/gstack` skill to take screenshots:

```
$B goto http://localhost:3000
$B screenshot ralph-workspace/{story-id}/design-screenshot.png
$B responsive ralph-workspace/{story-id}/responsive    # mobile + tablet + desktop
```
```

- [ ] **Step 2: Verify the edit**

Read `.claude/skills/ralph.reviewer/SKILL.md` lines 80-90. Confirm the `$B` screenshot commands appear under Step 6.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "fix(reviewer): use explicit /gstack $B commands for design review screenshots"
```

---

### Task 3: Add MCP prohibition to reviewer Important Rules

**Files:**
- Modify: `.claude/skills/ralph.reviewer/SKILL.md:129-135`

- [ ] **Step 1: Add the browser MCP prohibition rule**

In the "Important Rules" section, add after the last bullet (`- Do NOT update progress.json`):

```markdown
- **No browser MCP tools.** Never use `mcp__chrome-devtools__*`, `mcp__claude-in-chrome__*`, or any other browser-related MCP tools. All browser interaction goes through the `/gstack` skill using `$B` commands.
```

- [ ] **Step 2: Verify the edit**

Read `.claude/skills/ralph.reviewer/SKILL.md` and confirm the new rule appears as the last bullet in Important Rules.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "fix(reviewer): prohibit browser MCP tools in favor of /gstack"
```

---

### Task 4: Add Phase 7c to planner — commit planning artifacts

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md:140-148`

- [ ] **Step 1: Insert Phase 7c between Phase 7b and Phase 8**

Find the blank line between Phase 7b's last line (`All statuses start as \`pending\`.`, line 140) and Phase 8's heading (`### Phase 8: Done`, line 142).

Insert:

```markdown
### Phase 7c: Commit planning artifacts

Commit all generated files to git:

```
git add ralph-workspace/
git commit -m "chore: add planning artifacts for {feature-name}"
```

Use the spec.md title as `{feature-name}`.
```

- [ ] **Step 2: Verify the edit**

Read `.claude/skills/ralph.planner/SKILL.md` lines 140-158. Confirm Phase 7c appears between Phase 7b and Phase 8.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "fix(planner): add commit step for planning artifacts"
```
