# Planner Live QA Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update ralph.planner Phase 4 so it resolves a concrete live QA method for every surface before proceeding to synthesis.

**Architecture:** Single file change to `.claude/skills/ralph.planner/SKILL.md`. Phase 4 gets a new "Live QA Resolution" flow replacing the current "Test strategy per surface" section. Phase 5's brainstorm.md template gets `## Live QA Playbook` replacing `## Test Strategy`.

**Tech Stack:** Markdown (skill definition file)

**Spec:** `docs/superpowers/specs/2026-03-28-planner-live-qa-resolution-design.md`

---

### Task 1: Update Phase 4 progress checklist label

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md:19`

- [ ] **Step 1: Update the checklist label**

Change line 19 from:
```markdown
4. **Phase 4: Risk & Test Strategy** — Risks, test approach, acceptance criteria
```
To:
```markdown
4. **Phase 4: Risk & Live QA (~15 min)** — Risks, live QA method per surface, secrets in .env
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat(planner): update Phase 4 checklist label to Risk & Live QA"
```

---

### Task 2: Replace Phase 4 content with Live QA Resolution flow

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md:123-144`

- [ ] **Step 1: Replace Phase 4 header and goal**

Replace:
```markdown
## Phase 4: Risk & Test Strategy (~15 min)

Goal: Identify what can go wrong and how to verify each surface works.
```

With:
```markdown
## Phase 4: Risk & Live QA (~15 min)

Goal: Identify what can go wrong and resolve a concrete live QA method for every surface.
```

- [ ] **Step 2: Replace "Test strategy per surface" with Live QA Resolution**

Note: The existing "Risks & dependencies" section (lines 129-133) stays as-is. Only replace from line 135 onward.

Replace lines 135-139 (the current "Test strategy per surface" section) with:

```markdown
2. **Live QA resolution per surface:**

   Go through each surface from Phase 1. One at a time.

   **Classify the surface:**

   | Surface type | Live QA method | Status |
   |---|---|---|
   | Browser-based (webapp, admin panel) | gstack (`$B` commands) | Already solved |
   | API endpoint | curl | Already solved |
   | Non-browser (Slack bot, Discord bot, CLI, webhook, etc.) | Needs resolution | Resolve below |

   **For each non-browser surface, resolve the QA method:**

   a. If you know a concrete method, propose it to the user:
      - What tool/API enables programmatic interaction? (e.g., Slack Web API as a test user)
      - What does the test do? (e.g., send message via API, poll for bot reply, check reactions)
      - What command does the reviewer run? (e.g., `pnpm test:e2e:slack`)

   b. If you don't know a method, research:
      - Use `find-docs` (Context7) to look up the platform's test APIs
      - Use web search if Context7 doesn't have it
      - Present findings to user and brainstorm until a concrete method is locked in

   c. **Concrete = the method answers:** "What exact command does the reviewer run, and what does it check?" If you can't answer this, keep brainstorming.

```

- [ ] **Step 3: Replace "Acceptance criteria sharpening" with prerequisites, secrets, playbook, and bake-in**

Replace lines 141-144 (everything from "Acceptance criteria sharpening" through the end of Phase 4, before the Phase 5 header) with:

```markdown
3. **Collect prerequisites per surface:**

   For each non-browser surface with a resolved QA method:
   - **Env vars needed:** variable names and purpose (e.g., `SLACK_TEST_USER_TOKEN` — xoxp token for a test user)
   - **External setup needed:** what must exist outside the codebase? (e.g., dedicated #bot-testing channel, test user account)
   - **Test harness needed?** Does the coder need to build something? (e.g., `e2e/slack-bot.e2e.ts` with `pnpm test:e2e:slack`)

4. **Collect secrets from user:**

   For each env var identified above:
   - Ask the user for the value — one secret at a time
   - If the user doesn't have it yet, add a setup prerequisite task in tasks.md and write a placeholder: `VAR_NAME=# TODO: description of what to create`
   - Write to `.env` immediately after receiving each value
   - Confirm `.env` is in `.gitignore` (add if missing)
   - **Never** log, echo, print, or commit secret values
   - Reference secrets by env var name only in all artifacts

5. **Write QA playbook:**

   Build a `## Live QA Playbook` section (to be included in brainstorm.md during Phase 5) with an entry per surface:

   ```
   ### Surface: {name}
   - **Method:** {concrete method}
   - **Setup:** {commands to start the surface}
   - **Env vars:** {VAR_NAME — purpose} (values in .env, never committed)
   - **Verification:** {exact steps the reviewer follows}
   - **Coder task:** {task name if a harness is needed, or N/A}
   ```

6. **Bake into task acceptance criteria:**

   For surfaces that need a test harness:
   - Add a coder task in tasks.md (e.g., "Build Slack e2e test harness")
   - The task's acceptance criteria must include the live QA verification steps
   - The task's TDD approach describes what the harness tests

   For surfaces that don't need a harness (browser, curl, CLI):
   - Add live QA verification steps to the acceptance criteria of the relevant feature tasks

7. **Acceptance criteria sharpening:** Review each user story's acceptance criteria:
   - Is each criterion objectively verifiable?
   - Can the reviewer actually test this with the resolved QA method?
   - What specific commands/actions prove it works?

### Gate: No surface left behind

Do NOT proceed to Phase 5 until every surface from Phase 1 has a QA playbook entry with a concrete method.

**Escape hatch:** If no automatable method exists after research, the user can explicitly accept "manual QA only." The playbook entry documents the manual steps but marks the surface as `Manual QA — not automatable`.
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat(planner): replace test strategy with Live QA Resolution flow"
```

---

### Task 3: Update brainstorm.md template in Phase 5

**Files:**
- Modify: `.claude/skills/ralph.planner/SKILL.md:178-179`

- [ ] **Step 1: Replace `## Test Strategy` with `## Live QA Playbook` in the brainstorm.md template**

In Phase 5, Step 1 (the brainstorm.md template), replace:
```markdown
## Test Strategy
{How to test each surface, integration test approach}
```

With:
```markdown
## Live QA Playbook
{Copy from Phase 4 — one entry per surface with method, setup, env vars, verification steps}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat(planner): update brainstorm.md template with Live QA Playbook section"
```

---

### Task 4: Verify the complete skill file reads correctly

- [ ] **Step 1: Read the full SKILL.md and verify**

Read `.claude/skills/ralph.planner/SKILL.md` end-to-end. Check:
- Phase 4 flows logically from risks → classify surfaces → resolve QA → prerequisites → secrets → playbook → bake into tasks → sharpen criteria → gate
- Phase 5 brainstorm.md template has `## Live QA Playbook` (not `## Test Strategy`)
- No orphaned references to "Test strategy per surface" remain
- The gate is clear: no proceeding to Phase 5 without all surfaces covered
- Important Rules section doesn't contradict the new Phase 4

- [ ] **Step 2: Commit any fixes**

If any issues found, fix and commit:
```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "fix(planner): fix issues found during verification"
```
