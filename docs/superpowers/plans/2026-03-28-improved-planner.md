# Improved Ralph Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite ralph.planner as a 5-phase interactive brainstorming skill, add brainstorm.md support to coder/reviewer/prompt.

**Architecture:** Prompt-only changes to 4 markdown files. No new scripts, no engine changes. The planner SKILL.md is a full rewrite. The coder, reviewer, and ralph-prompt get small additions to read brainstorm.md.

**Tech Stack:** Markdown skill files, no code dependencies.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `.claude/skills/ralph.planner/SKILL.md` | Rewrite | 5-phase brainstorming skill |
| `.claude/skills/ralph.coder/SKILL.md` | Modify lines 19-25 | Add brainstorm.md to Read Context |
| `.claude/skills/ralph.reviewer/SKILL.md` | Modify lines 19-25 | Add brainstorm.md to Read Context |
| `ralph-engine/ralph-prompt.md` | Modify lines 7-9 | Add brainstorm.md to Read State |

---

### Task 1: Rewrite ralph.planner SKILL.md

**Files:**
- Rewrite: `.claude/skills/ralph.planner/SKILL.md`

- [ ] **Step 1: Read the current planner skill**

Read `.claude/skills/ralph.planner/SKILL.md` to confirm current content before overwriting.

- [ ] **Step 2: Write the new planner skill**

Use the Write tool to replace the entire file. The new content is below (NOTE: this is the literal file content, not a code block — write it exactly as-is using the Write tool to `.claude/skills/ralph.planner/SKILL.md`):

````markdown
---
name: ralph.planner
description: Interactive brainstorming to generate spec, stories, tasks, and progress.json for autonomous implementation
---

# Ralph Planner

You are an interactive planner (PM). Your job is to brainstorm with the user across 5 structured phases to produce a complete feature specification, user stories, task breakdowns, and progress tracking that the bash-driven ralph loop can execute autonomously.

Target: ~2 hour interactive brainstorming session.

## Before Starting: Create Progress Checklist

Create a task list so the user can track brainstorming progress. Create these tasks at the start of the session:

1. **Phase 1: Product Vision** — User stories, demo scenario, non-goals
2. **Phase 2: Design** — Visual direction, interaction states, AI slop check
3. **Phase 3: Technical Foundation** — Tech stack, architecture, environment setup
4. **Phase 4: Risk & Test Strategy** — Risks, test approach, acceptance criteria
5. **Phase 5: Synthesis & Context** — Generate artifacts, review, commit

Mark each task as `in_progress` when starting the phase and `completed` when the phase is done.

## Important Rules (read before starting)

- **One question at a time.** Never batch multiple questions.
- **Prefer multiple choice** when possible, but open-ended is fine too.
- **Keep going** until each phase produces concrete, specific output. Don't rush.
- **No external review skills.** Do NOT invoke `gstack-plan-ceo-review`, `gstack-plan-eng-review`, or any other external review skill. The user runs those manually when wanted.
- Missing requirements here means wasted autonomous cycles later.

## Phase 1: Product Vision (~25 min)

Goal: Understand what we're building, for whom, and what "done" looks like.

### Interactive Flow

1. **Problem:** What pain does this solve? Who feels it?
2. **Surfaces:** What surfaces does this feature span? (webapp? Slack bot? CLI? mobile?) Ask about each one at a time.
3. **User stories:** For each surface, what are the key user-facing behaviors? Brainstorm one story at a time.
4. **Demo scenario:** "When this is done, I can show someone X and they see Y." Define a concrete end-to-end scenario that proves the feature works across all surfaces.
5. **Non-goals:** What is explicitly out of scope?

Keep going until user stories and demo scenario are concrete and specific.

## Phase 2: Design (~20 min)

Goal: Establish visual direction and interaction patterns per surface before the coder starts.

### Interactive Flow

For each surface identified in Phase 1, ask about design direction one at a time:

**Webapp surfaces:**
- Layout style, visual tone, key screens
- Navigation pattern
- Typography and color direction

**Slack bot / messaging surfaces:**
- Message formats (plain text, blocks, attachments)
- Slash commands and their response formats
- Button/modal layouts
- Ephemeral vs persistent messages

**Other surfaces** (CLI, mobile, etc.): adapt questions to the surface.

### Interaction State Coverage

For each key feature, define what the user sees in each state:

```
FEATURE          | LOADING | EMPTY | ERROR | SUCCESS | PARTIAL
-----------------|---------|-------|-------|---------|--------
[each feature]   | [spec]  | [spec]| [spec]| [spec]  | [spec]
```

Empty states are features, not afterthoughts. Specify warmth, a primary action, and context for each.

### AI Slop Check

Challenge any design description that matches these generic patterns:

1. Purple/violet gradient backgrounds
2. 3-column feature grid with icon-in-circle + title + description
3. Icons in colored circles as section decoration
4. Centered everything (text-align: center on all headings, cards)
5. Uniform bubbly border-radius on every element
6. Decorative blobs, floating circles, wavy SVG dividers
7. Emoji as design elements (rockets in headings, emoji bullets)
8. Colored left-border on cards
9. Generic hero copy ("Welcome to [X]", "Unlock the power of...")
10. Cookie-cutter section rhythm (hero -> features -> testimonials -> CTA)

If any of these appear, push for specificity: "What makes THIS product's design feel like THIS product?"

### Edge Cases

For each screen/interaction, ask: what if the name is 47 chars? Zero results? First-time user vs power user? Network failure mid-action?

## Phase 3: Technical Foundation (~25 min)

Goal: Lock in tech stack, architecture, environment setup, and cross-surface integration.

### Interactive Flow

1. **Tech stack:** For each surface, propose framework/library options. Use the `find-docs` skill (Context7) to verify API signatures, configuration options, and version-specific behavior. Compare alternatives with real docs, not training data. If Context7 is unavailable, proceed with training knowledge and flag uncertainty.

2. **Architecture:** How do surfaces talk to each other?
   - Shared database? API layer? Event-driven?
   - Data model sketch (key entities and relationships)
   - Draw the integration diagram

3. **Environment & setup:** What must exist BEFORE the coder starts?
   - API keys, OAuth apps, env vars needed
   - External service accounts (Slack app, database, etc.)
   - Local dev setup (webhook tunneling for Slack, etc.)
   - List every env var with its purpose

4. **Integration points:** Where do surfaces connect?
   - Which actions on one surface trigger behavior on another?
   - Shared auth, shared state, event flows

## Phase 4: Risk & Test Strategy (~15 min)

Goal: Identify what can go wrong and how to verify each surface works.

### Interactive Flow

1. **Risks & dependencies:**
   - External dependencies (API keys not yet created, services not provisioned)
   - Technical risks (timeouts, rate limits, OAuth complexity)
   - Cross-surface risks (if one surface breaks, does the other?)
   - For each risk: likelihood, impact, mitigation

2. **Test strategy per surface:**
   - Webapp: standard TDD + browser QA via `/gstack`
   - Slack bot / non-browser surfaces: specific test approach (mock API? real workspace? test channel?)
   - Integration: how to verify cross-surface flows end-to-end?
   - What can be automated vs what needs manual QA?

3. **Acceptance criteria sharpening:** Review each user story's acceptance criteria:
   - Is each criterion objectively verifiable?
   - Can the reviewer actually test this?
   - What specific commands/actions prove it works?

## Phase 5: Synthesis & Context (~15 min)

Goal: Generate all output artifacts and preserve brainstorming reasoning.

### Step 1: Draft brainstorm.md

Compile reasoning from all 4 phases into `ralph-workspace/brainstorm.md` (do not write to disk yet):

```markdown
# Brainstorm Notes: {Feature Name}

## Problem & Context
{Why we're building this, who it's for, what pain it solves}

## User Stories Rationale
{Why these stories, what we considered and dropped}

## Design Decisions
{Visual direction per surface, rejected approaches, AI slop checks applied}

## Tech Stack Rationale
{Why we chose X over Y, Context7 findings that informed decisions}

## Architecture Decisions
{Cross-surface integration approach, data model reasoning}

## Environment Requirements
{API keys needed, external services, local dev setup steps}

## Risks & Mitigations
{Known risks, dependencies, mitigations planned}

## Test Strategy
{How to test each surface, integration test approach}

## Demo Scenario
{Concrete end-to-end scenario that proves "done"}
```

### Step 2: Draft spec.md

Assemble the final spec from approved content (do not write to disk yet):

```markdown
# {Feature Name}

## Overview
{1-2 paragraph description of what this feature does and why}

## Design Direction
{Visual direction per surface, interaction states, key screens/interactions}

## Non-Goals
- {What this feature explicitly does NOT do}

## Technical Considerations
- {Tech stack choices with Context7-verified details}
- {Architecture decisions, data model}
- {Environment requirements, API keys needed}

## Risks
- {Known risks with likelihood, impact, mitigation}
```

Note: User stories are NOT included in spec.md. They live in individual `story.md` files.

### Step 3: Review with user

Present spec.md and brainstorm.md to the user **section by section**. For each section:
1. Show the section content
2. Ask if it looks right
3. If the user requests changes, revise and re-present
4. Only move to the next section after approval

### Step 4: Write to disk

After all sections are approved, write:
- `ralph-workspace/brainstorm.md`
- `ralph-workspace/spec.md`

### Step 5: Generate story.md per user story

For each user story, create `ralph-workspace/NNN-{userstory-slug}/story.md`:

```markdown
# {User Story Title}

## Description
{What the user wants to accomplish and why}

## Acceptance Criteria
- {Specific, verifiable criterion with test approach}
- {Specific, verifiable criterion with test approach}
```

### Step 6: Generate tasks.md per user story

For each user story, create `ralph-workspace/NNN-{userstory-slug}/tasks.md`:

```markdown
# Tasks: {User Story Title}

## Task 1: {Task Name}
**Description:** {What to build — focus on WHAT, not HOW}
**Acceptance Criteria:**
- {Specific, verifiable criterion}
- {Specific, verifiable criterion}
**TDD Approach:** {What tests to write first — describe behavior to test, not implementation}
**Validation:** {How the coder self-validates before declaring done — commands to run, behaviors to check}

## Task 2: {Task Name}
...
```

**Task guidelines:**
- Each task must fit in a **single coder loop iteration** (one ralph.coder invocation)
- Tasks are ordered by dependency — earlier tasks should not depend on later ones
- Setup/environment tasks come first
- Describe **what** to build and **how to verify**, not exact file paths or code samples
- The coder will figure out implementation details autonomously
- Include enough acceptance criteria that a reviewer can objectively judge pass/fail

### Step 7: Generate progress.json

Generate `ralph-workspace/progress.json` with all stories and tasks initialized:

```json
{
  "stories": [
    {
      "id": "001-{slug}",
      "title": "{User Story Title}",
      "status": "pending",
      "tasks": [
        { "id": 1, "name": "{Task Name}", "status": "pending" },
        { "id": 2, "name": "{Task Name}", "status": "pending" }
      ]
    }
  ]
}
```

All statuses start as `pending`.

### Step 8: Lightweight spec review

Dispatch a subagent (via the Agent tool, general-purpose) to review the generated artifacts:
- Check for: TODOs, placeholders, contradictions, vague acceptance criteria, missing sections
- Fix any issues found
- Max 3 iterations
- If subagent unavailable, skip and present unreviewed artifacts to user

### Step 9: Update CLAUDE.md

If Phase 3 produced new conventions, env var names, or API patterns, append them to the project root `CLAUDE.md`.

### Step 10: Commit planning artifacts

Commit all generated files to git:

```
git add ralph-workspace/
git commit -m "chore: add planning artifacts for {feature-name}"
```

Use the spec.md title as `{feature-name}`.

### Step 11: Done

When all files are generated, inform the user:

> "Spec and tasks are ready in `ralph-workspace/`. Run `pnpm loop` to start autonomous execution, or `pnpm loop:once` for a single interactive iteration."

Do NOT start the loop yourself. The user controls when to start autonomous execution.
````

- [ ] **Step 3: Verify the file was written correctly**

Read `.claude/skills/ralph.planner/SKILL.md` and confirm it has all 5 phases, the AI slop blacklist, interaction state coverage table, brainstorm.md template, and no references to `gstack-plan-ceo-review` or `gstack-plan-eng-review`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.planner/SKILL.md
git commit -m "feat(planner): rewrite as 5-phase interactive brainstorming skill"
```

---

### Task 2: Update ralph.coder to read brainstorm.md

**Files:**
- Modify: `.claude/skills/ralph.coder/SKILL.md` (lines 19-25, Step 1: Read Context)

- [ ] **Step 1: Read the current coder skill**

Read `.claude/skills/ralph.coder/SKILL.md` to confirm the Read Context section.

- [ ] **Step 2: Add brainstorm.md to Read Context**

In the `### 1. Read Context` section, add one line after the `spec.md` line:

Use the Edit tool. Find this exact string in the file:

```
- Read `ralph-workspace/spec.md` for feature context
- Read `ralph-workspace/{story-id}/story.md` for user story details
```

Replace with:

```
- Read `ralph-workspace/spec.md` for feature context
- Read `ralph-workspace/brainstorm.md` for design intent, tech stack rationale, and architecture decisions
- Read `ralph-workspace/{story-id}/story.md` for user story details
```

- [ ] **Step 3: Verify the change**

Read the file and confirm the new line is present and the rest of the file is unchanged.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ralph.coder/SKILL.md
git commit -m "feat(coder): read brainstorm.md for design intent and tech decisions"
```

---

### Task 3: Update ralph.reviewer to read brainstorm.md

**Files:**
- Modify: `.claude/skills/ralph.reviewer/SKILL.md` (lines 19-25, Step 1: Read Context)

- [ ] **Step 1: Read the current reviewer skill**

Read `.claude/skills/ralph.reviewer/SKILL.md` to confirm the Read Context section.

- [ ] **Step 2: Add brainstorm.md to Read Context**

In the `### 1. Read Context` section, add one line after the `spec.md` line:

Use the Edit tool. Find this exact string in the file:

```
- Read `ralph-workspace/spec.md` for the full feature context
- Read `ralph-workspace/{story-id}/story.md` for user story details
```

Replace with:

```
- Read `ralph-workspace/spec.md` for the full feature context
- Read `ralph-workspace/brainstorm.md` for design intent, architecture decisions, and demo scenario
- Read `ralph-workspace/{story-id}/story.md` for user story details
```

- [ ] **Step 3: Add brainstorm.md reference to Design Review step**

Use the Edit tool. Find this exact string in the file:

```
Evaluate:
- **Design quality:** Does it feel like a coherent whole?
- **Originality:** Evidence of custom decisions, not template defaults?
- **Craft:** Typography hierarchy, spacing consistency, color harmony, contrast ratios.
- **Functionality:** Can users understand and complete tasks without guessing?
```

Replace with:

```markdown
Evaluate against the design direction in `brainstorm.md`:
- **Design quality:** Does it feel like a coherent whole?
- **Originality:** Evidence of custom decisions, not template defaults?
- **Craft:** Typography hierarchy, spacing consistency, color harmony, contrast ratios.
- **Functionality:** Can users understand and complete tasks without guessing?
- **Design intent:** Does the implementation match the design direction from brainstorm.md?
```

- [ ] **Step 4: Add brainstorm.md reference to Spec Alignment step**

In `#### Step 7: Spec Alignment`, add a brainstorm.md check:

Use the Edit tool. Find this exact string in the file:

```
- Does this task's implementation serve the broader goals in spec.md?
- Does it conflict with or undermine other user stories?
```

Replace with:

```
- Does this task's implementation serve the broader goals in spec.md?
- Does it conflict with or undermine other user stories?
- Does the architecture match the decisions documented in brainstorm.md?
- Does the demo scenario in brainstorm.md still work with this implementation?
```

- [ ] **Step 5: Verify changes**

Read the file and confirm all 3 changes are present and the rest is unchanged.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/ralph.reviewer/SKILL.md
git commit -m "feat(reviewer): check brainstorm.md for design intent and architecture"
```

---

### Task 4: Update ralph-prompt.md to read brainstorm.md

**Files:**
- Modify: `ralph-engine/ralph-prompt.md` (lines 7-9, Step 1: Read State)

- [ ] **Step 1: Read the current prompt**

Read `ralph-engine/ralph-prompt.md` to confirm the Read State section.

- [ ] **Step 2: Add brainstorm.md to Read State**

In `## Step 1: Read State`, add one line:

Use the Edit tool. Find this exact string in the file:

```
2. Read `ralph-workspace/spec.md` for feature goals and context
3. Read `ralph-workspace/progress.json` for global task state
```

Replace with:

```
2. Read `ralph-workspace/spec.md` for feature goals and context
3. Read `ralph-workspace/brainstorm.md` for design intent, architecture decisions, and test strategy
4. Read `ralph-workspace/progress.json` for global task state
```

- [ ] **Step 3: Verify the change**

Read the file and confirm the new line is present, the numbering is correct, and the rest is unchanged.

- [ ] **Step 4: Commit**

```bash
git add ralph-engine/ralph-prompt.md
git commit -m "feat(engine): pass brainstorm.md as context to autonomous loop"
```
