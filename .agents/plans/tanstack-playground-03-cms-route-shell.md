# TanStack Playground Slice 3: CMS Route Shell

## Goal

Make authenticated CMS route navigation behave like the Next.js Playground before implementing each
control page in depth.

## Scope

In scope:

- route-level behavior for known CMS actions
- authenticated CMS shell/menu visibility
- 404 behavior for unknown CMS actions
- the shared `CMS Routes` spec subset

Out of scope:

- page creation/deletion workflows
- user mutation workflows
- editor publish workflows
- image upload/delete workflows

## What to Build

- Ensure the TanStack CMS provider route maps path params to the `path: string[]` shape expected by
  `OberonProvider`.
- Ensure search params are passed in the same semantic shape as the Next.js Playground.
- Confirm the shared CMS shell renders framework-neutral links through the TanStack Link adapter.
- Keep invalid CMS actions server-routed to `notFound()` before an Oberon client context is created.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `packages/plugins/tanstack/src/provider.client.tsx`
- `packages/plugins/tanstack/src/index.ts`
- `apps/newground/playwright.config.ts`

## Testing Plan

- Use `pnpm test:e2e:new` from repo root.
- Enable only as much of the shared authenticated project as this slice can satisfy, or split route
  shell assertions so they can run before mutation pages are complete.
- The shared `dev/playwright/test/cms/routes.spec.ts` currently checks `/cms`, `/cms/site`,
  `/cms/pages`, `/cms/images`, `/cms/users`, `/cms/edit`, and unknown routes.

## Acceptance Criteria

- `/cms` redirects to `/cms/pages`.
- Authenticated `/cms/site`, `/cms/pages`, `/cms/images`, `/cms/users`, and `/cms/edit` load their
  shell route without framework routing errors.
- Unknown CMS routes show the 404 UI.
- Framework Link integration does not fall back to raw full-page reloads for CMS navigation.

## Risks and Mitigations

- Risk: enabling the whole shared authenticated project pulls in mutation tests too early.
  Mitigation: use tag discipline or add a narrow route-shell lane before enabling the full project.
- Risk: route params from TanStack splat routes arrive as a single string. Mitigation: centralize
  the splat-to-path conversion in the route file and keep it covered by route shell tests.
