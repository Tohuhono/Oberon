# Discuss Auth Handoff

> Historical note: this handoff has been superseded by
> [remove-nextjs-from-core-requirements.md](remove-nextjs-from-core-requirements.md). It remains
> only as context for the earlier auth design discussion. Do not treat it as current guidance where
> it differs from the requirements document.

## Purpose

Continue the design session for removing Next.js dependencies from `@oberoncms/core`, focusing only
on the remaining auth boundary. The broader dependency-removal plan and settled decisions are
already captured in [remove-nextjs-from-core-handoff.md](remove-nextjs-from-core-handoff.md) and
canonical terms are in [CONTEXT.md](../CONTEXT.md).

## Current State

Most framework-dependency design questions are settled enough for implementation. Do not reopen
action wrapping, routing, navigation, image rendering, cache, or framework wiring unless new code
exploration proves an assumption false.

The remaining design puzzle is auth: how the current Better Auth integration should move out of the
core package and into the Next.js Framework integration without inventing a premature generic auth
abstraction.

## Relevant Existing Artifacts

- [remove-nextjs-from-core-handoff.md](remove-nextjs-from-core-handoff.md): current source of truth
  for the Next-removal dependency catalogue, resolved decisions, and implementation slices.
- [CONTEXT.md](../CONTEXT.md): canonical glossary. Use these terms instead of inventing new ones.
- [AGENTS.md](../../AGENTS.md): repo instructions. Read before edits.
- [CODESTYLE.md](../CODESTYLE.md): required before edits.

## Auth-Specific Starting Point

The known Next-specific core auth points are listed in the main handoff. Start from those exact
files and verify current behavior before asking the user design questions.

The design session should clarify:

- What remains core-owned about auth contracts and Oberon UI expectations.
- What belongs specifically to the Next.js Framework integration.
- Whether Better Auth support is a framework integration concern, an auth Plugin concern, or a small
  collaboration between the two.
- How current cookie/header/session behavior maps to a future non-Next framework, using TanStack as
  the counterexample when useful.
- How auth handler exposure should relate to Plugin HTTP handlers and framework entrypoints.

## User Preferences Captured

- The user wants framework-specific customization to live in the Plugin layer where possible.
- The user does not want large generic abstractions added before they are justified.
- The user prefers concrete code-grounded questions over broad theory.
- If a question can be answered by exploring the codebase, explore first.
- The user wants to be consulted during implementation for the final action composition shape.
- Framework wiring should be straightforward; avoid heavy defensive programming around missing or
  inconsistent Framework integrations.

## Suggested Skills

- `grill-with-docs`: use for the auth discussion. Ask one question at a time, update
  [CONTEXT.md](../CONTEXT.md) only if new canonical terms are resolved, and avoid duplicating
  implementation notes into the glossary.
- `design-an-interface`: use only if the auth boundary needs multiple concrete API shapes compared
  side by side.
- `tdd`: use later, once the auth design is settled and implementation begins.
- `review`: use after an implementation branch exists to check standards and scope against the
  handoff artifacts.

## Immediate Next Step

Read the current auth files and Better Auth usage, then ask the first auth-boundary question with a
recommended answer. Keep the question specific to current behavior and the desired framework split.
