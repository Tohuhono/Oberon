# TanStack Playground CMS Feature Parity Plan

## Goal

Move the **TanStack Playground** toward **CMS parity** with the **Next.js Playground** through small
vertical slices. The TanStack Playground should eventually become the canonical **Playground**; the
Next.js Playground remains during the migration as the comparison surface and later as
compatibility/regression coverage.

## Scope

This plan is only for `apps/newground` and the TanStack Playground path to CMS parity.

Out of scope until the TanStack Playground proves the shape:

- `recipes/tanstack`
- `create-oberon-app` propagation
- making the Next.js Playground secondary
- replacing Next.js compatibility/regression coverage
- designing the future caching/revalidation Plugin

## Settled Decisions

- CMS parity is many slices away.
- Slice 1 is Handler + public Render only.
- `/cms` returns 404 until the Provider/Login slice introduces a real CMS route.
- The TanStack Recipe follows later, after the TanStack Playground is complete enough to copy with
  confidence.
- Caching/revalidation is a future Plugin concern like any other Plugin behavior. It is a
  replacement gate, not part of the first slices.
- Metadata can be included in slice 1 if TanStack route `head` support makes it straightforward.
- Static params/prerender parity is not part of slice 1.

## Architecture Notes

- Applications own routes, server entrypoints, server-side Oberon config, and their local Playwright
  composition.
- `initOberon(config)` is the Runtime composition root and returns the public `adapter` and
  `handler` used by app routes.
- `bootstrapOberon(config)` is called by app `prebuild` scripts and seeds the welcome Page when no
  Pages exist.
- Plugin order is semantic. Plugins receive the accumulated Plugin adapter and may return any subset
  of behavior that overrides prior behavior.
- `@oberoncms/plugin-tanstack` currently provides TanStack routing/request/auth plumbing, but the
  Playground route files still decide which Oberon surfaces are mounted.
- The Next.js Playground reference routes are:
  - public rendering: `apps/playground/app/(oberon)/[[...path]]/page.tsx`
  - CMS provider: `apps/playground/app/(oberon)/cms/[[...path]]/page.tsx`
  - Handler: `apps/playground/app/(oberon)/cms/api/[...path]/route.tsx`
- TanStack file routes use `$.tsx` / `$.ts` for wildcard routes. TanStack Start server routes use a
  `server.handlers` object on `createFileRoute`.

## Testing Architecture Notes

- Validation and reproduction must run through root scripts. The narrow TanStack Playground lane is
  `pnpm test:e2e:new`.
- `apps/newground/playwright.config.ts` is the local Playwright composition root: it owns the
  `webServer`, database/log paths, root `use`, and selected shared projects.
- Shared Playwright project constants live in `@dev/playwright/projects`:
  - `smokeProject`: `@smoke`, currently used by the TanStack Playground
  - `authProject`: `@auth|@smoke`, used by the Next.js Playground
  - `authenticatedProject`: `@login|@cms|@tdd`, used by the Next.js Playground after auth setup
- Shared specs live under `dev/playwright/test`. They are intentionally shared across app configs;
  tag and `grepInvert` choices decide which app consumes which behavior.
- The shared `@cms` fixtures create and delete Pages through the CMS UI, so later slices must unlock
  enough Pages behavior before other suites can rely on `cmsSeededPageKey`.
- The current shared smoke spec expects `/cms` to load with status 200. Slice 1 changes the TanStack
  expectation to 404, so the smoke composition or smoke spec must be adjusted without breaking the
  Next.js Playground and Documentation app lanes.

## Slice Checklist

- [x] [Slice 1: Handler + Public Render](./tanstack-playground-01-handler-render.md)
- [ ] [Slice 2: Provider + Login](./tanstack-playground-02-provider-login.md)
- [ ] [Slice 3: CMS Route Shell](./tanstack-playground-03-cms-route-shell.md)
- [ ] [Slice 4: Pages Control Page](./tanstack-playground-04-pages-control-page.md)
- [ ] [Slice 5: Site Control Page](./tanstack-playground-05-site-control-page.md)
- [ ] [Slice 6: Users Control Page](./tanstack-playground-06-users-control-page.md)
- [ ] [Slice 7: Images Control Page](./tanstack-playground-07-images-control-page.md)
- [ ] [Slice 8: Editor Control Page](./tanstack-playground-08-editor-control-page.md)
- [ ] [Later Gate: Caching/Revalidation Plugin Story](./tanstack-playground-09-caching-revalidation-gate.md)

## Completion Condition

This overarching plan is complete when the TanStack Playground runs the shared auth and
authenticated CMS Playwright lanes that the Next.js Playground runs today, and when the future
caching/revalidation Plugin story is sufficient for the TanStack Playground to replace the Next.js
Playground as the canonical Playground.
