# TanStack Playground Slice 2: Provider + Login

## Goal

Mount the real Oberon CMS provider in the TanStack Playground and complete the unauthenticated login
flow.

## Scope

In scope:

- `apps/newground` CMS provider route
- `TanstackOberonProvider`
- path/search param plumbing into `OberonProvider`
- login redirect and OTP completion flow
- enabling the relevant shared auth/login Playwright coverage for the TanStack Playground

Out of scope:

- full authenticated CMS control page parity
- Pages/User/Image mutation suites beyond what login needs
- TanStack Recipe propagation

## What to Build

- Add a TanStack CMS wildcard route that mounts `TanstackOberonProvider` with `adapter`, `actions`,
  route path segments, and search params.
- Preserve server-side routing decisions from `OberonProvider`: `/cms` redirects to `/cms/pages`
  once this slice lands, and unknown CMS actions go through adapter `notFound()`.
- Ensure `@oberoncms/plugin-tanstack` request authority works for Better Auth in the TanStack Start
  request context.
- Ensure `TanstackOberonClientProvider` route effects can navigate after OTP completion and refresh
  after sign-out when later pages use it.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/src/routes/cms.tsx`
- `apps/newground/oberon/actions.ts`
- `apps/newground/playwright.config.ts`
- `packages/plugins/tanstack/src/provider.client.tsx` if client route effects need adjustment
- `packages/plugins/tanstack/src/index.ts` only if request authority or routing behavior is wrong

## Testing Plan

- Move from smoke-only composition toward shared auth/login coverage in
  `apps/newground/playwright.config.ts`.
- Use root validation entrypoints only: start with `pnpm test:e2e:new`; later full confidence runs
  use `pnpm validate`.
- The shared `@auth` setup uses server logs to read development OTP tokens. Preserve the app log
  plumbing in `apps/newground/playwright.config.ts`.
- The shared `@login` spec expects `/cms/pages` to redirect to `/cms/login`, complete OTP through
  `/cms/api/auth/sign-in/email-otp`, and land on `/cms/pages`.

## Acceptance Criteria

- Unauthenticated `/cms/pages` reaches `/cms/login`.
- The development OTP flow completes through the TanStack Handler route.
- Auth storage state is written by the shared auth setup for later authenticated projects.
- `/cms` redirects to `/cms/pages` after the provider route exists.
- `pnpm test:e2e:new` passes with the login/auth slice enabled.

## Risks and Mitigations

- Risk: Better Auth TanStack cookies need different request context behavior than Next.js.
  Mitigation: keep fixes in `@oberoncms/plugin-tanstack` as framework integration behavior, not
  app-local hacks.
- Risk: TanStack navigation effects differ from Next.js `router.refresh()`. Mitigation: make only
  the login-required effect work in this slice and leave broader refresh semantics to later pages.
