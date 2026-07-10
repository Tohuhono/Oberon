# POC 1 Handoff: Core Runtime, Plugin Transport

## Purpose

Explore a design where `@oberoncms/core` owns all framework-neutral CMS runtime behavior, while
framework Plugins provide the transport and framework boundary needed to expose that runtime.

Use this when continuing the POC described as **Core Runtime, Plugin Transport**.

## Suggested Skills

- `design-an-interface` for comparing concrete server/client export shapes.
- `grill-with-docs` for testing the proposal against `.agents/CONTEXT.md` terminology.
- `tdd` only after the export shape is agreed and a narrow tracer-bullet is selected.

## Context To Read First

- `.agents/CONTEXT.md`
- `.agents/ARCHITECTURE.md`
- `.agents/TESTING.md`
- `packages/oberoncms/core/package.json`
- `packages/plugins/tanstack/package.json`
- `packages/plugins/tanstack/src/context.ts`
- `packages/plugins/tanstack/src/provider.client.tsx`

## Design Intent

Push everything comfortable in the shared layer into core:

- CMS path parsing and action resolution.
- CMS client context resolution.
- Permissioned Oberon action composition.
- Framework-neutral action response shape.
- Puck editor/render orchestration where no framework import is needed.
- Shared CMS UI provider internals.

Then let framework Plugins provide the remaining transport:

- TanStack `createServerFn` wrappers.
- TanStack loader helpers.
- TanStack redirect/notFound mapping.
- TanStack Link/navigation/refresh client services.
- Equivalent Next.js server actions, route handlers, navigation, and cache behavior.

## Proposed Boundary

Core exports should split by environment:

- `@oberoncms/core` for shared types, schemas, utilities, and client-safe constants.
- `@oberoncms/core/server` for runtime composition, context resolution, action graph creation, and
  handler composition. This entrypoint must not import TanStack or Next.js.
- `@oberoncms/core/client` for shared CMS UI, hooks, and framework-neutral provider contracts. This
  entrypoint must accept injected framework services instead of importing router APIs.

Framework Plugins should split similarly:

- `@oberoncms/plugin-tanstack/server` provides TanStack server functions, loader helpers, routing
  control-flow mapping, and request authority.
- `@oberoncms/plugin-tanstack/client` provides Link, navigate, refresh, and client shell services.

The app should mostly supply Oberon config and route mount points.

## POC Shape

Build one thin TanStack CMS route that imports a Plugin-provided server helper and a Plugin-provided
client shell. The route should not contain app-local action wrapping.

Example target shape:

```ts
export const Route = createFileRoute("/cms/$")(
  createTanstackCmsRoute({ getRuntime: () => import("#/oberon/runtime") }),
)
```

The exact API is intentionally unsettled. The POC should prove whether core can return a deep,
framework-neutral CMS route model that TanStack can transport without duplicating app glue.

## Questions To Resolve

- Does core expose an `actionGraph`, `runtime`, or `routeModel` object?
- Does the TanStack Plugin own `createServerFn` generation directly, or expose a factory the app
  must call from a compiler-visible file?
- Can Plugin-provided transport remain statically importable enough for TanStack Start?
- Which values are serializable loader data, and which must stay client/server services?

## Risks

- Hiding too much in core may recreate framework coupling under neutral names.
- TanStack compiler constraints may require app-local static files even if the logic is
  Plugin-owned.
- Client and server exports must be strict; mixed entrypoints caused confusion in the previous
  debugging session.

## Current Warning

There may be speculative edits from prior TanStack debugging in
`apps/newground/src/routes/cms/$.tsx` and `apps/newground/src/oberon/cms.client.tsx`. Inspect the
diff before using those files as design evidence, and do not revert user work without confirmation.
