---
name: prototype
description:
  Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check
  whether a state model or logic feels right, or explore what a UI should look like.
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

Read [CONTEXT.md](../../CONTEXT.md) for domain names and [ARCHITECTURE.md](../../ARCHITECTURE.md)
for the affected runtime or Framework integration.

## Pick a branch

Identify which question is being answered, using the user's prompt, the surrounding code, or by
asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a single shareable
  HTML file (free-play buttons plus tabbed guided walkthroughs) that pushes the state machine
  through cases that are hard to reason about on paper, and that a non-developer can drive.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI
  variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce different artifacts. If the question is ambiguous, confirm whether the user
wants to explore logic or UI before building it.

## Rules that apply to both

1. **Keep it temporary.** Put standalone logic demos in `.tmp/`. Put UI variants next to their host
   page in the affected Playground, clearly named as prototypes. Follow the host's routing
   convention and keep prototype-only code out of published package exports.
2. **Use the root workflow.** Run UI prototypes with the existing root command for their host:
   `pnpm dev:oberon` for the Next.js Playground or `pnpm dev:new` for the TanStack Playground. Use
   `pnpm dev:docs` only when the task concerns the Documentation app. A logic demo opens as a single
   HTML file. If no root script covers the need, ask before changing the root workflow.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is
   _checking_, not something it should depend on. If the question explicitly involves a database,
   hit a scratch DB or a local file with a clear "PROTOTYPE, wipe me" name.
4. **Keep the scope small.** Build only what answers the question. Use existing UI and error
   reporting; avoid production abstractions and a separate prototype test suite.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or
   render the full relevant state so the user can see what changed.
6. **Verify the demo.** Check that the host responds and the controls work in the browser. Run
   `pnpm format` and `pnpm validate` from the root before handoff. Report what the prototype does
   and does not verify.

## Capture the answer and choose the follow-up

Record the question, verdict, and supporting prototype path or URL in the existing implementation
issue or discussion. If there is no issue, summarise them to the user.

Offer to integrate the validated decision or preserve the prototype on a throwaway branch. Create a
branch, commit, or push only when the user requests it. Keep the prototype available until the user
decides which follow-up they want.

If the user requests integration, implement the decision to production standards with the coverage
in [TESTING.md](../../TESTING.md), then remove the temporary shell, losing variants, and switcher.
Preserving a prototype on a branch is optional, not a completion requirement.
