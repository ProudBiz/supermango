# Improved Ralph Planner

## Overview

Rewrite `ralph.planner` as a 5-phase interactive brainstorming skill that produces thorough planning artifacts for the autonomous ralph loop. The current planner invokes heavyweight external review skills (`gstack-plan-ceo-review`, `gstack-plan-eng-review`) that pull in prior context and cause confusion. The improved planner is self-contained with no external review skill invocations, covers user stories, design, engineering, test strategy, and risk analysis, and produces a new `brainstorm.md` artifact that preserves decision reasoning for the coder and reviewer.

Target: ~2 hour interactive brainstorming session that feeds a ~5 hour autonomous loop.

## Non-Goals

- Not replacing gstack review skills globally. User runs those manually when wanted.
- Not changing the autonomous loop engine (`ralph-loop.sh`, `ralph-prompt.md` state machine).
- Not changing the coder's TDD workflow or reviewer's 7-step verification.
- Not adding new bash scripts or engine infrastructure.

## Design Direction

This is a prompt-only change. The planner SKILL.md is rewritten. The coder and reviewer SKILL.md files get minor updates to read `brainstorm.md`. The orchestration prompt `ralph-prompt.md` gets a minor update to pass `brainstorm.md` as context.

## Phases

### Phase 1: Product Vision (~25 min)

Goal: Understand what we're building, for whom, and what "done" looks like.

Interactive flow:
1. Ask about the problem: what pain does this solve? Who feels it?
2. Ask about surfaces: webapp? Slack bot? CLI? Mobile? (one at a time)
3. Brainstorm user stories: for each surface, what are the key user-facing behaviors?
4. Define demo scenario: "When this is done, I can show someone X and they see Y"
5. Define non-goals: what is explicitly out of scope?

Question style:
- One question at a time
- Prefer multiple choice when possible
- Keep going until user stories and demo scenario are concrete

Output feeds into:
- `spec.md` -> Overview, Non-Goals
- `story.md` per user story
- `brainstorm.md` -> Problem context, why these stories matter

### Phase 2: Design (~20 min)

Goal: Establish visual direction and interaction patterns per surface before the coder starts.

Interactive flow:
1. For each surface, ask about design direction:
   - Webapp: Layout style, visual tone, key screens, navigation pattern
   - Slack bot: Message formats, slash commands, button/modal layouts, ephemeral vs persistent
   - Other surfaces as applicable
2. Interaction state coverage: for each key feature, define what the user sees during loading, empty, error, success, partial states
3. AI slop check: challenge any generic patterns
4. Edge cases: what if the name is 47 chars? Zero results? First-time vs power user?

AI slop blacklist (borrowed from gstack):
1. Purple/violet gradient backgrounds
2. 3-column feature grid with icon-in-circle + title + description
3. Icons in colored circles as section decoration
4. Centered everything
5. Uniform bubbly border-radius on every element
6. Decorative blobs, floating circles, wavy SVG dividers
7. Emoji as design elements
8. Colored left-border on cards
9. Generic hero copy ("Welcome to [X]", "Unlock the power of...")
10. Cookie-cutter section rhythm

Interaction state coverage table:
```
FEATURE          | LOADING | EMPTY | ERROR | SUCCESS | PARTIAL
-----------------|---------|-------|-------|---------|--------
[each feature]   | [spec]  | [spec]| [spec]| [spec]  | [spec]
```

Output feeds into:
- `spec.md` -> Design Direction section
- `brainstorm.md` -> Design rationale, rejected visual approaches
- `tasks.md` -> Design-specific acceptance criteria per task

### Phase 3: Technical Foundation (~25 min)

Goal: Lock in tech stack, architecture, environment setup, and cross-surface integration.

Interactive flow:
1. Tech stack: for each surface, propose options. Use `find-docs` (Context7) to verify API signatures, configuration options, version-specific behavior. Compare alternatives with real docs.
2. Architecture: how do surfaces talk to each other? Shared database? API layer? Event-driven? Data model sketch.
3. Environment & setup: API keys, OAuth apps, env vars, external service accounts, local dev setup (webhook tunneling, etc.). What must exist BEFORE the coder starts?
4. Integration points: where do surfaces connect? Shared auth, shared state, event flows.

Output feeds into:
- `spec.md` -> Technical Considerations (enhanced with real API details from Context7)
- `brainstorm.md` -> Tech stack rationale with Context7 findings, rejected alternatives, integration decisions
- `tasks.md` -> Setup tasks come first in dependency order
- `CLAUDE.md` -> New conventions, env var names, API patterns

### Phase 4: Risk & Test Strategy (~15 min)

Goal: Identify what can go wrong and how to verify each surface works.

Interactive flow:
1. Risks & dependencies:
   - External dependencies (API keys not yet created, services not provisioned)
   - Technical risks (timeouts, rate limits, OAuth complexity)
   - Cross-surface risks (if one surface breaks, does the other break too?)
   - For each risk: likelihood, impact, mitigation
2. Test strategy per surface:
   - Webapp: standard TDD + browser QA via `/gstack`
   - Slack bot / non-browser surfaces: specific test approach (mock API? real workspace? test channel?)
   - Integration: how to verify cross-surface flows end-to-end
3. Acceptance criteria sharpening:
   - Is each criterion objectively verifiable?
   - Can the reviewer actually test this?
   - What specific commands/actions prove it works?

Output feeds into:
- `spec.md` -> Risks section
- `brainstorm.md` -> Risk analysis, test strategy reasoning
- `tasks.md` -> Sharper acceptance criteria, validation commands per task
- `story.md` -> Testable acceptance criteria

### Phase 5: Synthesis & Context (~15 min)

Goal: Generate all output artifacts and preserve brainstorming reasoning.

Flow:
1. Draft `brainstorm.md`: compile from all 4 phases
2. Draft `spec.md`: assemble final spec from approved content
3. Review with user section by section, revise until approved
4. Generate per-story artifacts: `story.md` and `tasks.md` in dependency order
5. Generate `progress.json`: all stories and tasks as `pending`
6. Lightweight spec review: dispatch subagent to check for gaps, contradictions, vague criteria. Fix issues.
7. Commit all artifacts
8. Tell user to run `pnpm loop` or `pnpm loop:once`

## New Artifact: brainstorm.md

Location: `ralph-workspace/brainstorm.md`

Structure:
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

## Changes to Existing Skills

### ralph.coder — Step 1 (Read Context)

Add: Read `ralph-workspace/brainstorm.md` for design intent and technical decisions.

The coder uses this to:
- Follow the chosen architecture and tech stack
- Respect design direction when invoking `frontend-design`
- Understand why certain approaches were chosen over alternatives

### ralph.reviewer — Step 1 (Read Context)

Add: Read `ralph-workspace/brainstorm.md` for design intent.

The reviewer uses this to:
- Check implementation honors design direction (not just "tests pass")
- Verify architecture matches what was planned
- Reference demo scenario during QA

### ralph-prompt.md — Step 1 (Read State)

Add: Read `ralph-workspace/brainstorm.md` alongside `spec.md` and `progress.json`.

## What's Removed from Current Planner

- `gstack-plan-ceo-review` invocation (Phase 1: CEO Review)
- `gstack-plan-eng-review` invocation (Phase 4: Engineering Review)
- These reviews are still available for the user to run manually

## What's Borrowed from gstack

From `gstack-plan-design-review`:
- AI slop blacklist (10 patterns)
- Interaction state coverage table
- Edge case paranoia principle

These are embedded directly in Phase 2 of the planner skill, not invoked as external skills.

## Spec Review

Instead of heavyweight gstack reviews, Phase 5 dispatches a lightweight subagent via the Agent tool (general-purpose subagent):
- Check for: TODOs, placeholders, contradictions, vague acceptance criteria, missing sections
- Fix issues found
- Max 3 iterations
- If subagent unavailable, skip and present unreviewed spec

## Fallbacks

- `find-docs` (Context7) unavailable: proceed with training knowledge, flag uncertainty in `brainstorm.md`
- Spec review subagent unavailable: skip review, present unreviewed spec to user
- Phase timing: ~100 min across 5 phases + ~20 min buffer for iteration and back-and-forth
