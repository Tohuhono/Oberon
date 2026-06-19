# Action Transport Boundary Handoff

## Purpose

Continue the design review of where Oberon action transport should live for the TanStack Playground
and framework integrations. The next session should verify whether Next.js can move its
`"use server"` action wrappers into `@oberoncms/plugin-nextjs`; if that is not possible, treat the
TanStack action bridge as a TanStack-specific exception instead of making plugin-owned action
wrappers the general rule.

## Existing Context To Reuse

- Canonical language: `.agents/CONTEXT.md`
- Wider Next.js dependency-removal history: `.agents/plans/remove-nextjs-from-core-handoff.md`
- Current TanStack parity plan: `.agents/plans/tanstack-playground-cms-feature-parity.md`
- Current TanStack action bridge: `apps/newground/src/oberon/actions.ts`
- Core action initializer today: `packages/oberoncms/core/src/adapter/init-action-handler.ts`
- Core action/plugin types today: `packages/oberoncms/core/src/lib/dtd.ts`
- TanStack framework integration today: `packages/plugins/tanstack/src/index.ts`
- Next framework integration today: `packages/plugins/nextjs/src/index.ts`
- Provider reference pattern:
  - core reference provider: `packages/oberoncms/core/src/provider.tsx`
  - Next re-export/binding: `packages/plugins/nextjs/src/provider.tsx`
  - TanStack re-export/binding: `packages/plugins/tanstack/src/provider.tsx`

## Conversation Summary

The user asked for a critical review of the in-progress TanStack Start reference implementation in
the **TanStack Playground**, especially the boundary between app-level composition and the TanStack
Plugin. They are open to large architectural changes because the project is pre-alpha.

Resolved in conversation:

- The TanStack `createServerFn` bridge in `apps/newground/src/oberon/actions.ts` is mechanical
  framework action transport, not Playground-specific business logic.
- The preferred boundary is for core to own a reference Oberon action initializer, analogous to how
  core owns `OberonProvider`.
- Framework integrations should bind that reference surface to their framework-specific transport,
  analogous to `NextOberonProvider` and `TanstackOberonProvider`.
- The public runtime return name should likely move from `actionHandler` toward `actions`, because
  the glossary term is **Oberon action** and `Handler` already means the composed HTTP entrypoint.

Open concern raised by the user:

- Next.js may require `"use server"` wrappers to live in the application for compiler visibility. If
  wrappers cannot safely live in `@oberoncms/plugin-nextjs`, do not force TanStack to follow a false
  general rule. Instead, make TanStack's plugin-owned `createServerFn` bridge a documented
  TanStack-specific framework integration capability.

## Next Investigation

Start with a read-only subagent or exploration pass that answers this exact question:

> Can `@oberoncms/plugin-nextjs` own the explicit `"use server"` wrapper functions for Oberon
> actions, while apps/recipes import and pass those actions normally, or do Next.js compiler/runtime
> constraints require those wrappers to be authored in the consuming app/recipe?

The investigation should check:

- Current Next.js documentation and known constraints around `"use server"`, Server Functions,
  package exports, and client imports.
- The current app/recipe action files in `apps/playground`, `apps/documentation`, and
  `recipes/nextjs`.
- Whether a plugin export such as `@oberoncms/plugin-nextjs/actions` could practically contain
  server action wrappers without coupling to a specific app's `adapter` import.
- Whether a core `initOberonActions` reference initializer still makes sense even if Next wrappers
  remain app-local.

## Current Recommendation To Test

Use this as the hypothesis, not as a settled decision:

- Core should expose a reference `initOberonActions` or equivalent action composition surface.
- `initOberon(config)` should eventually return `actions` rather than `actionHandler`, with a
  compatibility path if needed.
- Framework integrations should own action transport only where their framework allows that
  boundary.
- If Next requires app-local `"use server"` files, then Next apps keep thin explicit wrappers and
  TanStack may still move its `createServerFn` bridge into `@oberoncms/plugin-tanstack`.

## Documentation Follow-Up

If the Next/TanStack boundary is resolved, update `.agents/CONTEXT.md` only if canonical language
changes. The existing terms **Oberon action**, **Oberon action transport**, **Framework
integration**, and **Framework contribution** probably already cover the decision.

Also update `.agents/ARCHITECTURE.md` if the settled architecture changes the current statement that
applications own server actions. That document currently appears older than the glossary.

Consider an ADR only if the final decision is both surprising and costly to reverse, for example if
Next requires app-local wrappers while TanStack intentionally centralizes wrappers in the plugin.

## Suggested Skills

- `grill-with-docs`: continue the one-question-at-a-time architecture interview and update glossary
  or ADR docs only when decisions settle.
- `design-an-interface`: compare concrete API shapes for `initOberonActions`, plugin action
  contributions, and framework action transport exports.
- `tdd`: use only once implementation starts; begin with small contract tests around action
  composition before changing apps/recipes.
- `review`: use after implementation to compare the result against the existing Next removal and
  TanStack parity plans.

## Suggested Subagent Brief

Use the `Explore` agent for a read-only pass:

> Thoroughly investigate whether Next.js `"use server"` action wrappers for Oberon actions can live
> in `@oberoncms/plugin-nextjs` rather than each consuming app/recipe. Check current Next docs if
> needed, inspect the existing Next app/recipe action modules and package export patterns, and
> report the smallest viable boundary. Do not edit files. Return: confirmed constraints, feasible
> API shapes, risks, and a recommendation on whether TanStack should be an exception.
