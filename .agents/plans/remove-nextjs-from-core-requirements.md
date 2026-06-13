# Remove Next.js From Core Requirements

## Purpose

Remove all Next.js runtime and public type dependency from `@oberoncms/core` while keeping Oberon
UI, runtime composition, auth, routing, image rendering, and action transport usable through
Framework integrations.

This document is the implementation requirements source of truth for this slice. The older
[remove-nextjs-from-core-handoff.md](remove-nextjs-from-core-handoff.md) is useful historical
context, but the decisions below supersede it where they differ.

## Non-Goals

- Do not make every Plugin framework-neutral. Framework-specific Plugins may depend on their host
  framework.
- Do not make the **Adapter** expose which framework is installed.
- Do not move presentation components wholesale into framework Plugins.
- Do not generalize auth beyond the current Better Auth implementation before another auth system
  forces the design.
- Do not expose routing control flow as client-callable Oberon server actions until there is a real
  UI need.

## Core Boundary

- `@oberoncms/core` must not import `next`, `next/*`, `better-auth/next-js`, or private Next
  helpers.
- `@oberoncms/core` must not declare `next` as a dependency, peer dependency, or optional
  dependency.
- Core handler contracts use standard `Request` and `Response`, not `NextRequest` or `NextResponse`.
- Framework-specific behavior must be contributed by Plugins from the canonical ordered **Plugin**
  list in an **Oberon config**.

## Plugin And Adapter Composition

- A **Plugin** may contribute Plugin adapters, Plugin actions, Handlers, framework entrypoints, or
  bootstrap behavior.
- The **Adapter** is the composed CMS programmatic interface, not a data/persistence adapter.
- Adapter methods stay flat. New server framework capabilities such as routing and request authority
  are flat Adapter methods.
- Missing framework Adapter capabilities use the existing missing-capability behavior:
  `NotImplementedError`.
- Adapter composition keeps the current decorator-like reducer semantics:
  - each Plugin receives the accumulated Adapter so far;
  - a Plugin may return replacement methods that close over that accumulated Adapter;
  - returned methods replace previous keys on the accumulated Adapter.
- Plugin order is therefore semantically significant. Plugins that consume capabilities from the
  accumulated Adapter must come after Plugins that provide those capabilities.
- For the current Next + Better Auth setup, the Next Framework integration must appear before the
  Auth Plugin so the Auth Plugin can close over `getRequestHeaders()` and `getAuthPlugins()`.

## Routing

- Core decides when a routing outcome is needed because only core knows whether `null` is valid in a
  given context. For example, `getPageData()` returning `null` is valid while editing a new Page but
  means not-found for public rendering.
- Routing behavior is exposed as flat Adapter methods:
  - `redirect(href: string): never`
  - `notFound(): never`
- The Next Framework integration provides those methods with Next `redirect()` and `notFound()`.
- Core server surfaces such as `Render` and `OberonProvider` call Adapter routing methods. They must
  not accept ad hoc `routing={{ redirect, notFound }}` props.
- `redirect` and `notFound` are not part of `OberonServerActions` for this slice.

## Auth

- The Auth Plugin owns Oberon auth behavior and User production.
- Framework-specific request/cookie/session plumbing is supplied through Framework integration
  Plugin contributions.
- Request authority is exposed through a flat Adapter method:
  - `getRequestHeaders(): Promise<Headers>`
- Framework-specific auth-library plugins are exposed through a flat Adapter method:
  - `getAuthPlugins(): OberonBetterAuthPlugin[]`
- `getAuthPlugins()` keeps a generic method name even though the current return type is Better
  Auth-specific. Broader auth abstraction waits until another auth implementation exists.
- The Next Framework integration supplies `getRequestHeaders()` using `next/headers` and
  `getAuthPlugins()` using `nextCookies()`.

## Client Link And Route Effects

- Link rendering belongs in the shared UI layer, following the same provider pattern as the Oberon
  Image component.
- Core imports and renders the Oberon Link component from the UI library, not `next/link`, TanStack
  Link, or a locally hand-rolled anchor wrapper.
- Framework client entrypoints provide their native Link component through the UI Link provider.
- The Link contract exposed to core stays small and Oberon-facing. Framework integrations adapt
  their native Link props internally.
- Client workflows still need tiny client route effects for non-Link flows, especially:
  - navigating after Better Auth OTP verification succeeds;
  - refreshing after sign-out;
  - refreshing after migration work updates route-visible data.
- Client route effects are a small provider-backed capability, not a full framework router
  abstraction:
  - `navigate(href: string): void`
  - `notFound(): never`
  - `refresh(): void`
- Recipes, the Playground, and the Documentation app should install the framework client provider.
  Graceful fallback remains acceptable for custom or non-framework setups.
- Client route effects are for legitimate client-side workflow effects and recovery paths. They are
  not a replacement for server routing decisions that happen before Oberon UI renders.
- Invalid or unknown CMS actions should be handled by server routing through the flat Adapter
  `redirect()` / `notFound()` methods before an `OberonClientContext` is created.
- If `OberonClient` receives an impossible action after context creation, preserve the previous 404
  behaviour by calling the provider-backed `notFound()` route effect. It must not echo the invalid
  action value because route and context values are attacker-controlled at the boundary.

## Image Rendering

- `@tohuhono/ui/image` owns the Oberon Image component, `ImageTransformProvider`, and
  `useImageTransform`.
- The Image component renders through `@unpic/react`.
- Framework client entrypoints may provide image transform options through the provider.
- Core admin image thumbnails use the Oberon Image component and do not import `next/image`.

## Plugin Actions And Action Transport

- **Plugin actions**, not action hooks, are the extension point for the Oberon action surface.
- Plugin actions compose similarly to Plugin adapters:
  - each Plugin action provider receives the accumulated Oberon action surface so far;
  - each Plugin action provider receives the accumulated Adapter so far;
  - a Plugin may add actions or replace action keys;
  - a Plugin may decorate a previous action by closing over the accumulated actions it received.
- The standard Oberon actions should be provided by core runtime composition rather than
  hand-written separately in each app or Recipe.
- `initOberon(config)` should return composed `actions` alongside `adapter` and `handler`.
- Adapter methods continue to throw normally. Oberon actions return the UI-facing `OberonResponse`
  success/error envelope.
- The Next Framework integration owns Next-aware action transport behavior, including public
  `unstable_rethrow(error)` handling so Next control-flow exceptions are not swallowed.
- Next apps still need explicit compiler-visible action entry files, but those files are
  user-maintained integration files and should remain contract-checked against core releases:
  - export an `actions` object that `satisfies OberonServerActions`;
  - mark each object action with inline `"use server"` so Next treats it as a Server Function;
  - delegate each object action to the composed action handlers from the runtime module;
  - do not reimplement action behavior with `wrap(adapter.method(...))` in app files.
- Prefer this object export over top-level `"use server"` named exports for Oberon action entry
  files. Oberon consumes actions as an object passed through a Server Component boundary, and the
  object shape lets user-maintained files fail type-checking when `OberonServerActions` changes in a
  future `@oberoncms/core` release.
- App runtime modules should avoid exporting those composed action handlers as `actions`; use a name
  such as `actionsHandlers` so the framework entrypoint `actions` object is not accidentally
  confused with the lower-level handlers it delegates to.

## Package-Specific Scope

- Flydrive and Uploadthing may continue depending on Next.js where they are explicitly
  framework-specific.
- If Uploadthing leaks a Next-specific return type across the `OberonHandler` boundary, prefer a
  narrow type-boundary fix over migrating Uploadthing away from its Next integration.
- Vite/build changes that preserve directive behavior are in scope only when they are required for
  the framework/client/server entrypoint split. They must be documented and validated because they
  affect shared package output.
- Button `asChild` changes are in scope only if required by the Link/provider design. They must not
  leave commented-out dead code.

## Required Tests

The dependency-boundary test is not enough to validate this work. Add meaningful behavioral tests
for the changed contracts:

- Runtime composition returns Plugin-provided actions.
- Plugin actions can decorate accumulated actions using the accumulated action surface and Adapter.
- Next action transport rethrows Next control-flow via public `unstable_rethrow(error)` before
  genericizing application errors.
- Routing methods are flat Adapter methods and missing implementations throw `NotImplementedError`.
- Core server surfaces call Adapter routing methods in the correct contexts.
- Auth uses `getRequestHeaders()` and `getAuthPlugins()` rather than Next imports in core.
- UI Link uses the provider-backed framework Link instead of a hand-rolled anchor navigation clone.
- Client route effects cover login verification navigation and refresh flows.
- Image provider behavior applies framework transforms through `@tohuhono/ui/image`.
