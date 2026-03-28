# Planner Live QA Resolution

## Problem

The planner's Phase 4 asks surface-level questions about test strategy ("mock API? real workspace? test channel?") but doesn't force a concrete, actionable answer. The reviewer then has no guidance for non-browser surfaces and falls back to handler-level integration tests — calling it "live QA" when it never touched the real surface.

Example: A Slack bot feature where the reviewer tested handler functions with mocked Slack clients and a real database, but never sent an actual Slack message to a channel and watched the bot respond.

## Goal

Phase 4 produces a concrete live QA method per surface. If a surface requires secrets, the planner collects them and writes `.env`. If a surface requires a test harness, the planner adds it as a coder task. The verification steps are baked into task acceptance criteria in tasks.md — not just documented in brainstorm.md.

## What Changes

Only `ralph.planner/SKILL.md`, Phase 4. No changes to coder, reviewer, or loop prompt.

## Design

### Phase 4: Replace "Test strategy per surface" with Live QA Resolution

After risks are discussed, the planner resolves live QA for each surface identified in Phase 1. One surface at a time.

#### Step 1: Classify each surface

| Surface type | Live QA method | Status |
|---|---|---|
| Browser-based (webapp, admin panel) | gstack (`$B` commands) | Already solved |
| API endpoint | curl | Already solved |
| Non-browser (Slack bot, Discord bot, CLI, webhook receiver, etc.) | Needs resolution | Resolve below |

#### Step 2: Resolve non-browser surfaces

For each non-browser surface:

1. **Check if you know a concrete method.** If yes, propose it to the user with specifics:
   - What tool/API enables programmatic interaction? (e.g., Slack Web API as a test user)
   - What does the test do? (e.g., send message via API, poll for bot reply, check reactions)
   - What command does the reviewer run? (e.g., `pnpm test:e2e:slack`)

2. **If you don't know a method,** research:
   - Use `find-docs` (Context7) to look up the platform's test APIs
   - Use web search if Context7 doesn't have it
   - Present findings to user and brainstorm until a concrete method is locked in

3. **The method must answer this question:** "What exact command does the reviewer run, and what does it check?" If you can't answer this, the method is not concrete enough.

#### Step 3: Collect prerequisites per surface

For each non-browser surface with a resolved QA method:

- **Env vars needed:** List variable names and their purpose (e.g., `SLACK_TEST_USER_TOKEN` — xoxp token for a test user)
- **External setup needed:** What must exist outside the codebase? (e.g., dedicated #bot-testing channel, test user account, OAuth app)
- **Test harness needed?** Does the coder need to build something? (e.g., `e2e/slack-bot.e2e.ts` with a `pnpm test:e2e:slack` script)

#### Step 4: Collect secrets from user

For each env var identified in Step 3:

1. Ask the user for the value — one secret at a time
2. Write to `.env` immediately after receiving each value
3. Confirm `.env` is listed in `.gitignore` (add if missing)
4. **Never** log, echo, print, or commit secret values
5. Reference secrets by env var name only in all artifacts (brainstorm.md, tasks.md, spec.md)

#### Step 5: Write QA playbook in brainstorm.md

Add a `## Live QA Playbook` section to brainstorm.md with an entry per surface:

```markdown
## Live QA Playbook

### Surface: {name}
- **Method:** {concrete method — e.g., "Slack Web API test harness"}
- **Setup:** {commands to start the surface — e.g., "pnpm bot"}
- **Env vars:** {VAR_NAME — purpose} (values in .env, never committed)
- **Verification:** {exact steps the reviewer follows}
- **Coder task:** {task name if a harness is needed, or N/A}
```

This section is background context. The reviewer reads it as part of brainstorm.md but follows task acceptance criteria.

#### Step 6: Bake into task acceptance criteria

For each surface that needs a test harness:
- Add a coder task in tasks.md (e.g., "Build Slack e2e test harness")
- The task's acceptance criteria must include the live QA verification steps
- The task's TDD approach describes what the harness tests

For surfaces that don't need a harness (browser, curl, CLI):
- Add live QA verification steps to the acceptance criteria of the relevant feature tasks
- Example: a Slack bot task's acceptance criteria includes "Reviewer runs `pnpm test:e2e:slack` and bot replies within 30s"

### Gate: No surface left behind

The planner must not proceed to Phase 5 (Synthesis) until every surface from Phase 1 has a QA playbook entry with a concrete method. This is a hard gate.

## What Stays the Same

- **ralph.coder/SKILL.md** — no changes. Coder builds what acceptance criteria say.
- **ralph.reviewer/SKILL.md** — no changes. Reviewer verifies acceptance criteria against live server. The QA playbook in brainstorm.md gives context, task acceptance criteria give orders.
- **ralph-prompt.md** — no changes.
- **brainstorm.md structure** — adds `## Live QA Playbook` section, rest unchanged.

## Security: .env handling

- `.env` is the only place secrets are stored
- `.env` must be in `.gitignore` before any secret is written
- No secret values appear in brainstorm.md, spec.md, tasks.md, log.md, or any committed file
- All artifacts reference secrets by env var name only (e.g., `$SLACK_TEST_USER_TOKEN`)
- The planner writes `.env` directly — it does not ask the user to do it manually
