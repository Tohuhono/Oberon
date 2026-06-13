# Remove Next.js From Core Implementation Review

## Scope

This reviews the current uncommitted implementation against
[remove-nextjs-from-core-requirements.md](remove-nextjs-from-core-requirements.md),
[CONTEXT.md](../CONTEXT.md), [AGENTS.md](../../AGENTS.md), and [CODESTYLE.md](../CODESTYLE.md).

The implementation does remove direct `next` imports and the direct `next` dependency from
`@oberoncms/core`, but it does not yet meet the requirements captured in the requirements document.

## Spec Gaps

### Plugin actions and action transport are not implemented

Requirement: `initOberon(config)` returns composed `actions`; Plugins contribute actions using the
same accumulated-surface composition model as Plugin adapters; Next action files are thin top-level
`"use server"` wrappers over composed actions; the Next Framework integration owns
`unstable_rethrow(error)` handling.

Current gap:

- [packages/oberoncms/core/src/lib/utils.ts](../../packages/oberoncms/core/src/lib/utils.ts#L85)
  still owns the `wrap()` response envelope.
- [packages/oberoncms/core/src/lib/utils.ts](../../packages/oberoncms/core/src/lib/utils.ts#L92) now
  genericizes every non-`ResponseError`, with no replacement for Next control-flow passthrough.
- [packages/plugins/nextjs/src/index.ts](../../packages/plugins/nextjs/src/index.ts#L1) does not
  expose any Plugin action contribution or call `unstable_rethrow(error)`.
- [apps/playground/oberon/actions.ts](../../apps/playground/oberon/actions.ts#L1),
  [apps/documentation/src/oberon/actions.ts](../../apps/documentation/src/oberon/actions.ts#L1), and
  [recipes/nextjs/oberon/actions.ts](../../recipes/nextjs/oberon/actions.ts#L1) still hand-write
  actions around `wrap(adapter.method(...))`.

Consequence: core no longer imports the private Next redirect helper, but the promised framework
transport layer does not exist. Any Next control-flow exception thrown inside an Oberon action can
be swallowed into a generic Oberon action response.

### Next action files are still behavior implementations

Requirement: Next action files remain compiler-visible, but only as explicit exported async wrappers
that delegate to composed runtime actions.

Current gap:

- [apps/playground/oberon/actions.ts](../../apps/playground/oberon/actions.ts#L5) still exports a
  single object literal with inline `"use server"` directives inside each method.
- [recipes/nextjs/oberon/actions.ts](../../recipes/nextjs/oberon/actions.ts#L5) has the same shape.
- The actions delegate directly to the raw adapter plus `wrap()`, not to composed Oberon actions.

### Routing is not part of the flat Adapter contract

Requirement: routing behavior is exposed as flat Adapter methods, supplied by the Framework
integration, with missing implementations throwing `NotImplementedError`.

Current gap:

- [apps/playground/app/(oberon)/cms/[[...path]]/page.tsx](<../../apps/playground/app/(oberon)/cms/[[...path]]/page.tsx#L3>)
  imports `notFound` and `redirect` from `next/navigation` and passes them manually as props.
- [recipes/nextjs/app/(oberon)/cms/[[...path]]/page.tsx](<../../recipes/nextjs/app/(oberon)/cms/[[...path]]/page.tsx#L3>)
  does the same.
- [packages/oberoncms/core/src/provider.tsx](../../packages/oberoncms/core/src/provider.tsx#L11)
  defines a local `defaultRouting` instead of calling flat Adapter routing methods.
- [packages/oberoncms/core/src/render.tsx](../../packages/oberoncms/core/src/render.tsx#L10) accepts
  a one-off `notFound` prop, not a flat Adapter method.

Consequence: routing is framework-neutral at the import level, but not implemented through the
agreed flat Adapter capability.

### Link and client route effects are not implemented through UI providers

Requirement: Link lives in the UI library and is provider-backed like Image; client route effects
are a tiny provider-backed `navigate` / `refresh` capability, not a full router clone.

Current gap:

- [packages/oberoncms/core/src/components/provider.tsx](../../packages/oberoncms/core/src/components/provider.tsx#L32)
  defines fallback browser navigation directly.
- [packages/oberoncms/core/src/provider.tsx](../../packages/oberoncms/core/src/provider.tsx#L108)
  never receives or installs framework client route effects.
- [packages/plugins/nextjs/src/index.ts](../../packages/plugins/nextjs/src/index.ts#L1) does not
  expose a client entrypoint for Link or client route effects.
- [packages/tohuhono/ui/src/components/link.tsx](../../packages/tohuhono/ui/src/components/link.tsx#L10)
  is a hand-rolled anchor wrapper instead of a provider-backed wrapper around framework Link.

Consequence: Link behavior loses framework semantics, and post-auth/post-migration flows fall back
to browser navigation/reload rather than framework-provided route effects.

### Image transform provider is only partially implemented

Requirement: `@tohuhono/ui/image` should own `ImageTransformProvider`, `useImageTransform`, and
`Image`, while framework-specific behavior is supplied by the framework integration.

Current gap:

- [packages/tohuhono/ui/src/components/image.tsx](../../packages/tohuhono/ui/src/components/image.tsx#L26)
  creates the provider and component.
- [packages/oberoncms/core/src/components/provider.tsx](../../packages/oberoncms/core/src/components/provider.tsx#L117)
  wires the provider.
- No Next Framework integration supplies any image transform value to that provider.

Consequence: the shared primitive exists, but the framework-supplied transform half of the
requirement is absent.

### Auth capability names do not match the agreed contract

Requirement: request authority is exposed as `getRequestHeaders()` and framework auth-library
plugins are exposed as `getAuthPlugins()`.

Current gap:

- [packages/oberoncms/core/src/lib/dtd.ts](../../packages/oberoncms/core/src/lib/dtd.ts#L307)
  introduces `OberonFrameworkAuthAdapter` into the core Plugin adapter shape.
- [packages/oberoncms/core/src/auth/better-auth.ts](../../packages/oberoncms/core/src/auth/better-auth.ts#L16)
  uses `getBetterAuthPlugins?.()` / `getAuthHeaders` naming rather than the agreed names.
- [packages/plugins/nextjs/src/index.ts](../../packages/plugins/nextjs/src/index.ts#L14) supplies
  `getAuthHeaders` and `getBetterAuthPlugins` rather than `getRequestHeaders` and `getAuthPlugins`.

Consequence: the implementation points in the right direction but uses the pre-decision API names
and has no meaningful test proving the auth boundary works.

### Plugin ordering is not documented or tested

Requirement: Plugin order is semantically significant. Consumers of accumulated Adapter capabilities
must come after the Plugins that provide those capabilities. In the current Next + Better Auth
setup, the Next Framework integration must appear before the Auth Plugin.

Current gap:

- [apps/playground/oberon/config.ts](../../apps/playground/oberon/config.ts#L14) changes Plugin
  order so the Next Plugin precedes the Auth Plugin, which matches the requirement.
- [packages/create-oberon-app/src/installer/install-adapter.ts](../../packages/create-oberon-app/src/installer/install-adapter.ts#L71)
  removes the comment that explained Auth Plugin ordering, but there is no replacement test or
  documentation proving the generated order is required.

Consequence: the implementation relies on accumulated-Adapter ordering for auth framework plumbing,
but the ordering rule is easy to lose or accidentally reverse.

### Plugin-list canonicality is not met for framework facets

Requirement: the ordered Plugin list in an Oberon config remains the canonical list of installed
integrations, and client-safe plugin facets should be derived from that list rather than maintained
or passed as separate handwritten wiring.

Current gap:

- Routing is passed manually from app route files.
- Link and client route effects are not supplied by a Next client entrypoint at all.
- Image transform behavior is not supplied by the Next Plugin at all.
- Auth headers/plugins are supplied through the Adapter shape, but with the wrong method names.

Consequence: the implementation removes imports from core by pushing framework concerns into app
props and adapter additions, not by making the Next Plugin the canonical Framework integration.

### Final client fallback silently hides invalid context

Requirement: invalid or unknown CMS actions should be handled by server routing through flat Adapter
`redirect()` / `notFound()` methods before `OberonClientContext` is created. Client route effects
are for legitimate client-side workflows and recovery paths, not for hiding impossible
server-provided client context. If `OberonClient` receives an impossible action after context
creation, it should throw an ordinary client error.

Current gap:

- [packages/oberoncms/core/src/editor.tsx](../../packages/oberoncms/core/src/editor.tsx#L67) now
  returns `null` for an impossible/unknown client action.

Consequence: invalid client context can silently render nothing, making route and context bugs
harder to diagnose.

## Potential Scope Boundary Issue

### Uploadthing may not need to migrate away from Next.js

Clarification: Uploadthing is allowed to depend on Next.js. The relevant dependency-removal goal is
zero Next.js runtime or public type dependency from `@oberoncms/core`, not making every framework
plugin framework-neutral.

Current gap:

- [packages/plugins/uploadthing/src/uploadthing/file-router.ts](../../packages/plugins/uploadthing/src/uploadthing/file-router.ts#L1)
  was changed from `uploadthing/next` to `uploadthing/server`.

Remaining issue: this may be the wrong repair. If the original problem was that the returned handler
type was Next-specific, a narrower fix would keep Uploadthing's Next integration where appropriate
and adapt or erase only the public type exposed to the core `OberonHandler` boundary. The current
change needs either justification and tests proving behavioral equivalence, or rollback to a
narrower type-boundary fix.

## Undocumented In-Scope Work

### Vite build configuration change is undocumented and risky

- [dev/vite/vite.config.ts](../../dev/vite/vite.config.ts#L7) removes `rollup-preserve-directives`.
- [dev/vite/vite.config.ts](../../dev/vite/vite.config.ts#L101) changes `rollupOptions` to
  `rolldownOptions`.

Remaining issue: this may be relevant to preserving client/server directives during builds, but the
reason is not documented. It also needs focused validation because it changes the shared library
build pipeline.

### Button `asChild` support was removed/commented out

- [packages/tohuhono/ui/src/components/button.tsx](../../packages/tohuhono/ui/src/components/button.tsx#L76)
  no longer supports the previous `asChild: true` branch.
- [packages/tohuhono/ui/src/components/button.tsx](../../packages/tohuhono/ui/src/components/button.tsx#L85)
  leaves the old branch as commented-out code.

Remaining issue: this is part of the work after later clarification, but the reason for removing
`asChild` support is not documented. The commented-out branch also violates the code style rule to
avoid comments unless they reference an external bug or workaround.

## Repository Guideline Issues

### The implementation includes commented-out dead code

[CODESTYLE.md](../CODESTYLE.md) says to avoid comments unless referencing an external bug or
workaround. The commented `asChild` branch in
[packages/tohuhono/ui/src/components/button.tsx](../../packages/tohuhono/ui/src/components/button.tsx#L85)
is dead code, not an external-bug/workaround comment.

### Formatting needs cleanup in new UI files

[packages/tohuhono/ui/src/components/image.tsx](../../packages/tohuhono/ui/src/components/image.tsx#L9)
uses tab indentation and lacks the formatting style used by the surrounding package. The new UI
barrel files also need normal final newlines.

### There are effectively no meaningful implementation tests

[packages/oberoncms/core/src/dependency-boundary.test.ts](../../packages/oberoncms/core/src/dependency-boundary.test.ts#L1)
checks direct `next` imports/dependencies in core source and package metadata. Treat this as cruft
at this stage: it can catch a narrow regression, but it does not prove the implementation works. The
implementation has no meaningful coverage for the actual behavior changes:

- no Plugin action/transport test;
- no `unstable_rethrow` behavior test in the Next Plugin;
- no test that Routing adapter behavior comes from the Framework integration;
- no test that framework Link and client route effects are supplied instead of falling back to
  browser navigation/reload;
- no test proving auth still works without hard-coding Next behavior in core.

## What Is Correctly Covered

- Direct `NextRequest` usage in core and Flydrive handler types was replaced with standard
  `Request`.
- The mock plugin `signOut` no longer imports Next redirect behavior.
- Direct `next` imports were removed from core source.
- `next` was removed from `packages/oberoncms/core/package.json`.
- A dependency-boundary test was added for direct core `next` imports and package dependency
  declarations, but it should not be counted as meaningful coverage for the implementation.

## Net Assessment

The current implementation satisfies the narrow package-dependency check, but not the architectural
requirements. It removed direct Next.js usage from core mostly by pushing routing and client route
behavior into app props or browser fallbacks and by adding framework auth methods with pre-decision
names. The agreed target is a Next.js Framework integration that contributes flat Adapter
capabilities, Plugin actions, client Link/route-effect providers, and action transport behavior from
the canonical Plugin list and framework entrypoints. That work remains incomplete, and the
implementation effectively has no meaningful behavioral test coverage yet.
