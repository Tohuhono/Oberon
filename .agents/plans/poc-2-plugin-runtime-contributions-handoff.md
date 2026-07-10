# POC 2 Handoff: Plugin-Provided Runtime Contributions

## Purpose

Explore a design where Plugins can provide every runtime contribution they reasonably can, while
core owns the common composition model and apps remain thin.

Use this when continuing the POC described as **Plugin-Provided Runtime Contributions**.

## Suggested Skills

- `design-an-interface` for shaping the contribution interface.
- `improve-codebase-architecture` for comparing the new contribution model against current plugin
  composition.
- `grill-with-docs` for updating terminology if new contribution categories are accepted.

## Context To Read First

- `.agents/CONTEXT.md`
- `.agents/ARCHITECTURE.md`
- `packages/oberoncms/core/src/adapter/init-plugins.ts`
- `packages/oberoncms/core/src/adapter/init-oberon.ts`
- `packages/oberoncms/core/src/lib/dtd.ts`
- `packages/plugins/tanstack/src/index.ts`

## Design Intent

Keep the ordered Plugin list as the canonical source of installed integrations, but broaden what a
Plugin can contribute. Instead of treating Plugins mostly as adapter/handler providers, let them
contribute server facets, client facets, actions, route effects, handlers, bootstrap behavior,
metadata, and framework services.

Core should own the reduction/composition rules. Plugins should provide the concrete capabilities.
Apps should not maintain parallel lists of client providers, action wrappers, or framework helpers.

## Proposed Boundary

Core owns:

- The `Plugin` contribution contract.
- Ordering and override rules.
- Composition into an Oberon runtime.
- Environment validation: shared, server-only, and client-only contributions cannot be mixed
  accidentally.
- Framework-neutral action/context/UI contracts.

Plugins can provide:

- Adapter capabilities such as persistence, auth, send, storage, request authority, and routing.
- Plugin actions that extend or wrap the Oberon action surface.
- Framework action transports, such as TanStack server functions or Next server actions.
- HTTP handlers.
- Client services such as Link, navigate, refresh, image transform, and CMS shell providers.
- Bootstrap hooks and metadata.

Apps provide:

- Oberon config.
- Framework route mount files required by the host framework.
- App-specific Puck component config.

## POC Shape

Add a typed contribution model in core without replacing the current adapter model all at once.

Potential spike:

```ts
type OberonPluginContribution = {
  adapter?: Partial<OberonPluginAdapter>
  handlers?: Record<string, OberonHandler>
  actions?: OberonActionContribution
  server?: OberonServerContribution
  client?: OberonClientContribution
  bootstrap?: BootstrapContribution
}
```

Then migrate the TanStack Plugin to contribute explicit server/client framework facets rather than
requiring newground to wire those pieces by hand.

## Questions To Resolve

- Are server/client contributions loaded from the same `plugin` object or from explicit entrypoints?
- How does core prevent client bundles from importing server-only Plugin facets?
- Are framework action transports normal Plugin actions or a separate outer layer?
- Does Plugin order control action wrapping order, or are framework transports always final?
- What is the missing-capability behavior for routing, request authority, and navigation?

## Risks

- A single contribution model may become too broad if categories are not strongly separated.
- Environment-specific facets can accidentally create bundler leaks unless package exports are
  clear.
- Plugin order is already meaningful; adding more contribution types increases the cost of unclear
  ordering rules.

## Current Warning

Do not treat the current TanStack Playground app glue as the desired destination. The user has
explicitly said the direction is to move shared behavior to core and Plugin-provided behavior to
Plugins, not to keep adjusting app-local wrappers.
