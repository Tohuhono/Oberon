# POC 3 Handoff: Core UI, Framework Shell

## Purpose

Explore a design where core owns the shared CMS React UI and provider internals, while framework
Plugins provide the shell services needed by that UI.

Use this when continuing the POC described as **Split Core UI From Framework Shell**.

## Suggested Skills

- `frontend-design` only if the UI contract itself changes visibly.
- `design-an-interface` for the provider and shell service API.
- `tdd` after choosing one CMS flow, such as login or pages, as the tracer-bullet.

## Context To Read First

- `.agents/CONTEXT.md`
- `packages/oberoncms/core/src/components/provider.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- `packages/oberoncms/core/src/components/login.tsx`
- `packages/oberoncms/core/src/components/pages.tsx`
- `packages/plugins/tanstack/src/provider.client.tsx`

## Design Intent

Keep all reusable CMS presentation and workflow UI in core. Do not move the login form, pages table,
editor shell, site page, users page, or image workflows into framework Plugins if they can remain
framework-neutral.

Core UI should depend on a small shell contract:

- Oberon actions.
- Navigation effects.
- Link component.
- Image transform.
- Optional refresh/revalidation signal.

Framework Plugins provide those shell services from client-only and server-only entrypoints.

## Proposed Boundary

Core client exports:

- `OberonClientProvider`
- `OberonClient`
- Shared CMS components and hooks.
- Shell contracts such as `OberonNavigation`, `OberonLinkComponent`, and `OberonImageTransform`.

Core server exports:

- `getOberonClientContext`
- Context/action composition needed to feed the provider.

Framework Plugin client exports:

- `TanstackOberonClientProvider` or `createTanstackClientShell()`.
- Link and navigation bindings using TanStack Router.

Framework Plugin server exports:

- Action transport and context loader helpers.

The app should not manually assemble these pieces unless the POC proves the compiler requires a thin
app-local wrapper.

## POC Shape

Pick one flow, preferably `/cms/login`, and prove that core UI can render unchanged while the
TanStack Plugin supplies all framework services.

Target shape:

```tsx
<TanstackOberonShell runtime={runtime}>
  <OberonClient />
</TanstackOberonShell>
```

or route-factory equivalent:

```ts
createTanstackCmsRoute({ config })
```

The important test is not the exact JSX. The test is whether core UI stays shared while the Plugin
owns Link, navigate, refresh, route context loading, and action transport.

## Questions To Resolve

- Should core provider accept `actions` directly, or a framework-provided action client?
- Is `linkComponent={({ href }) => ...}` enough, or does Oberon need a richer Link contract?
- Should navigation effects return promises so workflows can await route changes?
- Does the image transform belong in the same shell contract or a separate image provider?
- How should missing shell services fail?

## Risks

- A shell contract that mirrors every framework router feature would be too shallow and noisy.
- A shell contract that is too small may force app-local escape hatches.
- The previous debugging session hit context/provider confusion. Treat provider import identity and
  client/server entrypoint hygiene as first-class POC criteria.

## Current Warning

TanStack and Puck docs both reinforce the split: Puck editor is client-only, while public Render can
be server-capable if the config is safe. Do not let Puck concerns blur the framework shell boundary.
