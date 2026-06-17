# TanStack Playground Slice 4: Pages Control Page

## Goal

Make the Pages control page work in the TanStack Playground, because later CMS tests seed Pages
through this UI.

## Scope

In scope:

- `/cms/pages` list, add, copy, and delete workflows
- action transport for Page mutations
- client route refresh behavior needed after Page mutations

Out of scope:

- editor publish behavior
- users/images/site pages beyond route-shell visibility
- caching/revalidation Plugin design

## What to Build

- Ensure `actions.addPage`, `actions.deletePage`, and `actions.getAllPages` work from the TanStack
  client boundary.
- Ensure Pages UI updates after mutation using TanStack client route effects or local optimistic
  behavior already present in core.
- Keep behavior framework-neutral in core; framework-specific fixes belong in the TanStack plugin or
  TanStack Playground route wiring.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/oberon/actions.ts`
- `packages/plugins/tanstack/src/provider.client.tsx`
- `packages/plugins/tanstack/src/index.ts`
- `dev/playwright/test/cms/pages.spec.ts` only if tag splitting is required

## Testing Plan

- Run `pnpm test:e2e:new` from repo root.
- Target the shared `CMS Pages Actions` behavior once the authenticated project is enabled.
- Remember that `cmsSeededPageKey` in shared fixtures depends on this page for setup and teardown,
  so this slice unblocks later Editor and Pages-dependent tests.

## Acceptance Criteria

- `/cms/pages` shows the add Page button.
- A Page can be added and appears with the authenticated user as `updatedBy`.
- A Page can be copied.
- A Page can be deleted.
- Shared fixtures can create and clean up `cmsSeededPageKey` reliably in the TanStack Playground.

## Risks and Mitigations

- Risk: action transport works for reads but not mutations. Mitigation: prove add/delete before
  enabling tests that depend on seeded Pages.
- Risk: refresh semantics diverge from Next.js. Mitigation: use the smallest TanStack route effect
  needed for the page list to reflect mutations.
