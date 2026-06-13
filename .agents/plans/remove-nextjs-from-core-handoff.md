# Remove Next.js From Core Handoff

> Historical context only. Current requirements and implementation decisions are captured in
> [remove-nextjs-from-core-requirements.md](remove-nextjs-from-core-requirements.md). Where this
> handoff differs from the requirements document, the requirements document wins.

## Purpose

Continue the design work for removing the Next.js dependency from `@oberoncms/core`. The next
session should use the decisions already captured in `.agents/CONTEXT.md` and continue from the
concrete dependency catalogue below.

## Current State

- `.agents/CONTEXT.md` has been updated with the resolved language from the design session.
- No implementation changes have been made yet.
- The goal is zero Next.js runtime or public type dependency from `@oberoncms/core`, not merely
  moving `next` from dependencies to peer/dev dependencies.
- The user wants framework-specific customization to move into the Plugin layer, ideally through the
  same canonical Plugin list.
- The user does not want presentation components moved wholesale into framework plugins if that can
  be avoided.

## Resolved Decisions

- **Plugin** is now broader than adapter/handler hooks. It can contribute runtime capabilities,
  framework entrypoints, or bootstrap behavior.
- The ordered Plugin list in an **Oberon config** remains the canonical list of installed
  integrations.
- Client-safe plugin facets should be derived from that canonical list, not maintained as a second
  handwritten plugin list.
- Core should become framework-neutral first. Do not enshrine a large primitive list prematurely.
- Client and server framework concerns must be split:
  - **Navigation adapter**: client-safe navigation and refresh behavior for Oberon UI.
  - **Routing adapter**: server-side redirect/not-found behavior.
- Core should own Oberon UI and contracts; framework plugins should provide small client/server
  facets consumed by that UI.
- `@oberoncms/plugin-nextjs` should broaden into the Next.js Framework integration, not remain only
  a cache plugin.
- Next cache behavior should stay as a server-side adapter-wrapper contribution from the Next
  Plugin.
- **Oberon action** means every operation currently exposed through `OberonServerActions`, including
  reads and mutations. This intentionally does not map one-to-one to Next.js terminology.
- **Oberon action response** is the framework-neutral success/error envelope consumed by Oberon UI.
- **Plugin actions** are the agreed extension point for contributing Oberon actions before a
  framework exposes them through an action entrypoint.
- The Framework integration owns final action transport behavior. For Next.js, that means the Next
  Plugin owns Next-aware action response wrapping, including public Next control-flow handling such
  as `unstable_rethrow(error)` rather than importing private redirect-error helpers in core.
- Flydrive and Uploadthing Next.js imports are their own package concerns; do not include them in
  the core dependency-removal slice unless the user explicitly expands scope.

## Resolved Action Implementation Approach

The current `wrap(adapter.method(...))` pattern should become a composed Oberon action pipeline,
with framework-specific transport exposed through explicit framework entry files.

Concrete shape:

1. Core keeps the raw **Adapter** unchanged. Adapter methods still throw normally and are used raw
   by rendering, bootstrap, plugin internals, tests, and plugin HTTP handlers.
2. Core keeps the `OberonServerActions` and `OberonResponse` contracts as the UI-facing action
   surface. The type name can stay even though the domain term is **Oberon action**.
3. Runtime composition should build canonical Oberon actions from Plugin-provided **Plugin
   actions**.
4. `@oberoncms/plugin-nextjs` should provide the Next Framework integration action contribution that
   performs Next-aware action response handling:
   - return normal `OberonResponse` success/error envelopes for Oberon UI;
   - expose `ResponseError` messages as expected user-facing errors;
   - genericize unknown application errors;
   - call the public Next `unstable_rethrow(error)` at the top of its catch path so Next
     control-flow exceptions such as `redirect()`, `notFound()`, `permanentRedirect()`, and
     request-time API control flow are not swallowed.
5. Other Plugins may add actions for response logging, metrics, auth, policy checks, or other
   cross-cutting server-side behavior without changing the Adapter or Oberon UI provider.
6. Next app and recipe action files should remain compiler-visible and thin. Prefer a top-level
   `"use server"` file with explicit exported async functions that delegate to the composed actions:

   ```ts
   "use server"

   import { actions } from "@/oberon/adapter"

   export async function addPage(data) {
     return actions.addPage(data)
   }
   ```

   Avoid relying on `export const addPage = actions.addPage` until proven safe against the Next
   compiler. The explicit async wrapper is boring on purpose.

7. Latest Next.js docs distinguish broad React **Server Functions** from **Server Actions** used in
   action/mutation contexts. They support invocation from Client Component event handlers and
   `useEffect`, not only form primitives, so this migration should modernise the action module shape
   without forcing a form-centric UI rewrite.

Open details still to decide during implementation:

- Whether `initOberon(config)` returns `actions` directly alongside `{ adapter, handler }`, or
  whether an adjacent helper composes actions from the same Runtime composition result.
- Exact ordering rules for Plugin actions, especially whether framework transport handling is always
  outermost or follows Plugin order.
- The user wants to be consulted before committing to the concrete implementation shape for action
  composition. Treat these mechanics as implementation-proven decisions rather than more design
  interview work.

## Remaining Discussion Scope

Most Next.js dependency-removal architecture is now settled. Do not reopen already-resolved areas
unless implementation proves an assumption false.

What remains to discuss:

- **Auth boundary** is the last major design puzzle. Better Auth's current Next-specific handler,
  headers, and cookie integration still need a framework-integration design.

What should wait for implementation proof instead of more up-front discussion:

- **Action composition mechanics**: prove the exact `actions` composition shape during
  implementation and consult the user before finalising it.
- **Action ordering**: decide while implementing, based on the smallest working composition.

What should be implemented from the agreed design without reopening broad theory:

- **Routing adapter**: port the current core `redirect()` / `notFound()` behavior into Next Plugin
  hooks/facets per the framework-integration design. The concrete behavior is already known from the
  existing Next implementation.
- **Navigation adapter**: use a client provider pattern with a typed `useRouter` contract.
  Frameworks provide the router implementation; core consumes the contract. Provide a sensible
  fallback when no provider is present instead of building a large framework abstraction.
- **Oberon Image component**: use a client provider pattern with a typed `useTransform` contract.
  Frameworks provide the image transform implementation; core consumes the contract. Provide a
  sensible fallback when no transform provider is present.
- **Framework integration wiring**: avoid heavy defensive programming. If the Framework integration
  is wired correctly, it works; if it is missing or inconsistent, ordinary errors are acceptable.

## Concrete Dependency Catalogue

### Low-Risk Cleanup

- `NextRequest` appears in `OberonHandler` and handler implementations:
  - `packages/oberoncms/core/src/lib/dtd.ts`
  - `packages/oberoncms/core/src/adapter/init-oberon.ts`
  - `packages/plugins/flydrive/src/internal/disk-handlers.ts`
- Current code only needs the standard `Request`/`Response` contract. The user agreed this should
  become standard `Request`.
- `packages/oberoncms/core/src/adapter/mock-plugin.ts` imports `redirect` only for mock `signOut`.
  The user agreed mock `signOut` can become a no-op, with any redirect moved to a framework-level
  sign-out hook/provider later.

### Server Routing

Next `redirect()` / `notFound()` usage in core should become Routing adapter work, split by case:

- Missing public Page in `packages/oberoncms/core/src/render.tsx`.
- Invalid CMS action and default CMS route redirect in `packages/oberoncms/core/src/lib/utils.ts`.
- Unauthenticated CMS redirect in `packages/oberoncms/core/src/provider.tsx`.
- Final unreachable client action fallback in `packages/oberoncms/core/src/editor.tsx`.
- Mock sign-out redirect in `packages/oberoncms/core/src/adapter/mock-plugin.ts`.

The session did not settle the exact API for the Routing adapter. Avoid reopening broad theory; work
through the specific cases. Later clarification: do not treat this as open design work. Port the
current behavior into Next Plugin routing hooks/facets according to the agreed Framework integration
direction.

### Client Navigation

`next/link` and `useRouter()` in core should be replaced by core-owned Oberon navigation surfaces
backed by a client-safe Navigation adapter from the framework integration.

Current core usage:

- `packages/oberoncms/core/src/components/menu.tsx`
  - `Link` for CMS menu links.
  - `useRouter().refresh()` after sign-out.
- `packages/oberoncms/core/src/components/pages.tsx`
  - `Link` for public Page links and CMS edit links.
- `packages/oberoncms/core/src/components/login.tsx`
  - `useRouter().push()` after OTP login succeeds.
- `packages/oberoncms/core/src/components/site.tsx`
  - `useRouter().refresh()` during migration progress.

The user suggested an Oberon-owned `Link` component plus a framework router adapter, rather than
plain anchors or passing `next/link` directly into core.

Later clarification: use a client provider and typed `useRouter` contract. Leave implementation to
the framework, with a sensible fallback if no provider is available.

### Core Admin Image Rendering

`packages/oberoncms/core/src/components/images.tsx` imports `next/image` for admin thumbnails.

The user wants an Oberon Image component that uses `@unpic/react`, with framework-supplied Unpic
image transform options where framework-specific behaviour is needed. Keep this scoped to core admin
image rendering for now. Flydrive and Uploadthing Puck image components are not part of this core
slice.

Later clarification: `@tohuhono/ui/image` owns `ImageTransformProvider`, `useImageTransform`, and
the `Image` component. `useImageTransform` returns `undefined` when no provider is present, and
`Image` applies the provider value internally before rendering through `@unpic/react`.

Registry checks from this session:

- `@unpic/react` declares `next` as an optional peer dependency; use it for the shared UI Image
  primitive.
- `unpic` and `@unpic/core` are implementation dependencies of `@unpic/react`, not the direct UI
  component dependency.
- `@unpic/img` was not found on npm.

### Cache

`packages/plugins/nextjs/src/index.ts` already owns Next cache behavior using `unstable_cache`,
`revalidatePath`, and `updateTag`.

The user agreed this should stay as a Next Plugin server-side adapter-wrapper contribution.

### Action Wrapping

`packages/oberoncms/core/src/lib/utils.ts` imports the private Next helper
`next/dist/client/components/redirect-error` so `wrap()` can rethrow redirect control-flow errors.

This is now resolved as an action-pipeline concern, not a core `wrap()` concern. Do not keep private
Next imports in core. Move Next-aware action response handling into `@oberoncms/plugin-nextjs` as a
Plugin action contribution, and expose the composed actions through thin explicit Next
`"use server"` action files in apps/recipes.

Core should not own framework control-flow passthrough. The Next Framework integration should use
public Next APIs for that behavior, especially `unstable_rethrow(error)` in the catch path. Unknown
application errors should still be genericized in the returned Oberon action response.

### Auth

Auth was intentionally left until last because it is the most complex.

Current Next-specific core auth points:

- `packages/oberoncms/core/src/auth/better-auth.ts`
  - `toNextJsHandler` from `better-auth/next-js`.
  - `headers()` from `next/headers`.
- `packages/oberoncms/core/src/auth/config.ts`
  - `nextCookies()` from `better-auth/next-js`.

This is now the last major design discussion area for Next.js dependency removal.

## Suggested Implementation Slices

1. Replace `NextRequest` with standard `Request` and make mock `signOut` a no-op.
2. Introduce the client Navigation adapter and migrate core `Link`, `push`, and `refresh` usage.
3. Introduce the Oberon Image component using Unpic-style framework-supplied transforms for admin
   thumbnails.
4. Port current server routing behavior into Next Plugin routing hooks/facets and migrate the
   concrete redirect/not-found cases one by one.
5. Introduce Plugin actions, move `wrap()` behavior out of core, and migrate Next action files to
   explicit `"use server"` wrappers over composed actions.
6. Discuss and resolve the Better Auth boundary, then move/authenticate Next-specific pieces into
   the Next Plugin or framework integration.

## Suggested Skills

- `grill-with-docs`: continue refining unresolved API decisions and update `.agents/CONTEXT.md`
  inline as terms settle.
- `design-an-interface`: use if the next agent needs multiple concrete API shapes for Plugin facets,
  Navigation adapter, Routing adapter, or the Oberon Image component.
- `tdd`: use when implementation begins; start with the low-risk cleanup slice and keep tests close
  to the changed contracts.
- `review`: use after an implementation branch exists to check standards and scope against this
  handoff.

## Validation Notes

- Repo instructions prefer root lifecycle commands. Use `pnpm validate` for full validation when a
  slice is implemented.
- For smaller exploratory edits, still run the relevant root-backed validation path; do not invent
  ad-hoc package-local lifecycle commands.
