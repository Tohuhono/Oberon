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

- CMS parity is delivered through slices 1–8.
- `/cms` redirects through the real CMS provider route.
- The TanStack Recipe follows later, after the TanStack Playground is complete enough to copy with
  confidence.
- Caching/revalidation is a future Plugin concern like any other Plugin behavior. It is a
  replacement gate, not part of the completed CMS slices.
- Metadata and static params/prerender parity remain replacement work rather than CMS slice work.

## Current Status

The TanStack Playground has functional CMS parity for the behavior covered by slices 1–8. It runs
the same shared auth and authenticated CMS Playwright projects as the Next.js Playground, including
the `@auth`, `@login`, `@cms`, and `@tdd` lanes.

The latest uncached `pnpm test:e2e:new --force` run completed all 13 tasks successfully. The browser
suite passed 29 tests and intentionally skipped 2 tests.

This is not yet canonical replacement readiness. The remaining gaps are:

- a documented and implemented TanStack caching/revalidation Plugin story
- concrete Image provider/upload/delete parity; the shared Image deletion assertion remains skipped
- public and CMS metadata plus static params/prerender parity

## Architecture Notes

- Applications own routes, server entrypoints, server-side Oberon config, and their local Playwright
  composition.
- `initOberon(config)` is the Runtime composition root and returns the public `adapter` and
  `handler` used by app routes.
- `bootstrapOberon(config)` is called by app `prebuild` scripts and seeds the welcome Page when no
  Pages exist.
- Plugin order controls adapter middleware nesting. Hook factories receive the final Plugin adapter
  and the preceding implementation, then return a method with the original adapter signature.
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
  - `smokeProject`: `@smoke`, used by deployed smoke compositions
  - `authProject`: `@auth|@smoke`, used by both Playgrounds
  - `authenticatedProject`: `@login|@cms|@tdd`, used by both Playgrounds after auth setup
- Shared specs live under `dev/playwright/test`. They are intentionally shared across app configs;
  tag and `grepInvert` choices decide which app consumes which behavior.
- The shared `@cms` fixtures create and delete Pages through the CMS UI. The TanStack Pages slice
  now supports `cmsSeededPageKey` for the dependent Editor and CMS suites.
- The shared smoke spec expects `/cms` to load with status 200. The TanStack CMS provider now meets
  that contract through the login or authenticated redirect flow.

## Slice Checklist

- [x] [Slice 1: Handler + Public Render](./tanstack-playground-01-handler-render.md)
- [x] [Slice 2: Provider + Login](./tanstack-playground-02-provider-login.md)
- [x] [Slice 3: CMS Route Shell](./tanstack-playground-03-cms-route-shell.md)
- [x] [Slice 4: Pages Control Page](./tanstack-playground-04-pages-control-page.md)
- [x] [Slice 5: Site Control Page](./tanstack-playground-05-site-control-page.md)
- [x] [Slice 6: Users Control Page](./tanstack-playground-06-users-control-page.md)
- [x] [Slice 7: Images Control Page](./tanstack-playground-07-images-control-page.md)
- [x] [Slice 8: Editor Control Page](./tanstack-playground-08-editor-control-page.md)
- [ ] [Later Gate: Caching/Revalidation Plugin Story](./tanstack-playground-09-caching-revalidation-gate.md)

## Completion Condition

The CMS slices are complete. This overarching plan is complete when the remaining replacement gaps
are resolved, including a caching/revalidation Plugin story sufficient for the TanStack Playground
to replace the Next.js Playground as the canonical Playground.
