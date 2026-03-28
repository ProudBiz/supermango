# Ralph Engine/Workspace Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate ralph engine scripts from per-run workspace artifacts into `ralph-engine/` and `ralph-workspace/`.

**Architecture:** Rename `ralph/` → `ralph-engine/` for engine files, create `ralph-workspace/` for generated artifacts, update all path references across scripts, skills, and docs.

**Tech Stack:** Bash, Markdown, JSON

**Spec:** `docs/superpowers/specs/2026-03-28-ralph-engine-workspace-split-design.md`

---

### Task 1: Move engine files to ralph-engine/

**Files:**
- Move: `ralph/ralph-loop.sh` → `ralph-engine/ralph-loop.sh`
- Move: `ralph/ralph-once.sh` → `ralph-engine/ralph-once.sh`
- Move: `ralph/ralph-prompt.md` → `ralph-engine/ralph-prompt.md`

- [ ] **Step 1: Create ralph-engine/ and move engine files**

```bash
mkdir ralph-engine
git mv ralph/ralph-loop.sh ralph-engine/ralph-loop.sh
git mv ralph/ralph-once.sh ralph-engine/ralph-once.sh
git mv ralph/ralph-prompt.md ralph-engine/ralph-prompt.md
```

- [ ] **Step 2: Move workspace artifacts to ralph-workspace/**

```bash
mkdir ralph-workspace
git mv ralph/progress.json ralph-workspace/progress.json
git mv ralph/001-test ralph-workspace/001-test
```

- [ ] **Step 3: Delete the old ralph/ directory**

```bash
rm -rf ralph
```

If git already removed it (empty after moves), this is a no-op.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move ralph files to ralph-engine/ and ralph-workspace/"
```

---

### Task 2: Update shell scripts for new paths

**Files:**
- Modify: `ralph-engine/ralph-loop.sh`
- Modify: `ralph-engine/ralph-once.sh`

- [ ] **Step 1: Update ralph-loop.sh**

Change the validation section. The `WORKSPACE` variable replaces `$SCRIPT_DIR` for artifact paths:

```bash
# Add after REPO_DIR line:
WORKSPACE="$REPO_DIR/ralph-workspace"
```

Update the three validation checks:
- `$SCRIPT_DIR/ralph-prompt.md` — stays as-is (engine file)
- `$SCRIPT_DIR/spec.md` → `$WORKSPACE/spec.md`
- `$SCRIPT_DIR/progress.json` → `$WORKSPACE/progress.json`

Update error messages to reference new paths:
- `"ralph/ralph-prompt.md"` → `"ralph-engine/ralph-prompt.md"`
- `"ralph/spec.md"` → `"ralph-workspace/spec.md"`
- `"ralph/progress.json"` → `"ralph-workspace/progress.json"`

Update the `jq` command:
- `$SCRIPT_DIR/progress.json` → `$WORKSPACE/progress.json`

Update the final error message:
- `"Check ralph/progress.json"` → `"Check ralph-workspace/progress.json"`

- [ ] **Step 2: Update ralph-once.sh**

Same pattern as ralph-loop.sh:

```bash
# Add after REPO_DIR line:
WORKSPACE="$REPO_DIR/ralph-workspace"
```

Update validation checks:
- `$SCRIPT_DIR/ralph-prompt.md` — stays as-is
- `$SCRIPT_DIR/spec.md` → `$WORKSPACE/spec.md`
- `$SCRIPT_DIR/progress.json` → `$WORKSPACE/progress.json`

Update error messages to reference new paths.

Update the `jq` command:
- `$SCRIPT_DIR/progress.json` → `$WORKSPACE/progress.json`

- [ ] **Step 3: Verify scripts parse correctly**

```bash
bash -n ralph-engine/ralph-loop.sh && echo "loop OK"
bash -n ralph-engine/ralph-once.sh && echo "once OK"
```

Expected: both print OK.

- [ ] **Step 4: Commit**

```bash
git add ralph-engine/ralph-loop.sh ralph-engine/ralph-once.sh
git commit -m "refactor: update shell scripts for ralph-engine/ralph-workspace paths"
```

---

### Task 3: Update ralph-prompt.md artifact paths

**Files:**
- Modify: `ralph-engine/ralph-prompt.md`

- [ ] **Step 1: Replace all `ralph/` artifact references with `ralph-workspace/`**

Replace all `ralph/` artifact references:

- `ralph/spec.md` → `ralph-workspace/spec.md`
- `ralph/progress.json` → `ralph-workspace/progress.json`
- `ralph/{story-id}/` → `ralph-workspace/{story-id}/`
- `ralph/known-issues.md` → `ralph-workspace/known-issues.md`

Do NOT change references to skill files (`.claude/skills/ralph.*/`) — those stay.

- [ ] **Step 2: Verify no stale `ralph/` references remain (excluding skill paths)**

```bash
grep -n 'ralph/' ralph-engine/ralph-prompt.md | grep -v '.claude/skills'
```

Expected: no output (all artifact paths updated).

- [ ] **Step 3: Commit**

```bash
git add ralph-engine/ralph-prompt.md
git commit -m "refactor: update ralph-prompt.md artifact paths to ralph-workspace/"
```

---

### Task 4: Update skill files

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md`
- Modify: `.claude/skills/ralph.coder/SKILL.md`
- Modify: `.claude/skills/ralph.reviewer/SKILL.md`

- [ ] **Step 1: Update ralph.planner/SKILL.md**

Replace all `ralph/` artifact references with `ralph-workspace/`:

- `ralph/spec.md` → `ralph-workspace/spec.md`
- `ralph/NNN-{userstory-slug}/` → `ralph-workspace/NNN-{userstory-slug}/`
- `ralph/progress.json` → `ralph-workspace/progress.json`
- Phase 8 message: `"ralph/"` → `"ralph-workspace/"`

- [ ] **Step 2: Update ralph.coder/SKILL.md**

Replace all `ralph/` artifact references with `ralph-workspace/`:

- `ralph/{story-id}/` → `ralph-workspace/{story-id}/`
- `ralph/spec.md` → `ralph-workspace/spec.md`

- [ ] **Step 3: Update ralph.reviewer/SKILL.md**

Replace all `ralph/` artifact references with `ralph-workspace/`:

- `ralph/{story-id}/` → `ralph-workspace/{story-id}/`
- `ralph/spec.md` → `ralph-workspace/spec.md`

- [ ] **Step 4: Verify no stale `ralph/` artifact references remain across all skills**

```bash
grep -rn 'ralph/' .claude/skills/ralph.*/SKILL.md | grep -v 'ralph-workspace/' | grep -v 'ralph-engine/'
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md .claude/skills/ralph.coder/SKILL.md .claude/skills/ralph.reviewer/SKILL.md
git commit -m "refactor: update skill files for ralph-workspace/ paths"
```

---

### Task 5: Update package.json and CLAUDE.md

**Files:**
- Modify: `package.json`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update package.json script paths**

Change:
- `"loop": "bash ralph/ralph-loop.sh"` → `"loop": "bash ralph-engine/ralph-loop.sh"`
- `"loop:once": "bash ralph/ralph-once.sh"` → `"loop:once": "bash ralph-engine/ralph-once.sh"`

- [ ] **Step 2: Update CLAUDE.md conventions**

Change:
- `"Feature specs and tasks live in `ralph/` directory"` → `"Feature specs and tasks live in `ralph-workspace/` directory"`
- `"Global state tracked in `ralph/progress.json`"` → `"Global state tracked in `ralph-workspace/progress.json`"`
- `"Coder and reviewer communicate via `ralph/NNN-{userstory}/log.md`"` → `"Coder and reviewer communicate via `ralph-workspace/NNN-{userstory}/log.md`"`
- `"Skills live in `.claude/skills/{skill-name}/SKILL.md`"` — stays as-is
- Add: `"Engine scripts live in `ralph-engine/` directory"`

- [ ] **Step 3: Verify pnpm scripts resolve**

```bash
pnpm loop --help 2>&1 | head -1
```

Expected: script found (no "missing script" error). It will fail on missing workspace files, which is fine.

- [ ] **Step 4: Commit**

```bash
git add package.json CLAUDE.md
git commit -m "refactor: update package.json and CLAUDE.md for new ralph paths"
```

---

### Task 6: Smoke test

- [ ] **Step 1: Verify directory structure**

```bash
ls ralph-engine/
ls ralph-workspace/
```

Expected:
- `ralph-engine/`: `ralph-loop.sh`, `ralph-once.sh`, `ralph-prompt.md`
- `ralph-workspace/`: `progress.json`, `001-test/`

- [ ] **Step 2: Verify old ralph/ directory is gone**

```bash
test -d ralph && echo "FAIL: ralph/ still exists" || echo "PASS: ralph/ removed"
```

Expected: PASS

- [ ] **Step 3: Verify no stale `ralph/` references in active files**

```bash
grep -rn 'ralph/' package.json CLAUDE.md ralph-engine/ .claude/skills/ralph.*/SKILL.md | grep -v 'ralph-workspace/' | grep -v 'ralph-engine/'
```

Expected: no output.

- [ ] **Step 4: Run bash syntax check on scripts**

```bash
bash -n ralph-engine/ralph-loop.sh && bash -n ralph-engine/ralph-once.sh && echo "All scripts OK"
```

Expected: "All scripts OK"
