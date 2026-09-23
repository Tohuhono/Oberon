# TanStack Playground Slice 5: Site Control Page

## Goal

Make the Site control page work in the TanStack Playground.

## Scope

In scope:

- `/cms/site`
- reading site state and component transform status
- migration action behavior if exposed on the Site page

Out of scope:

- Page/User/Image mutation behavior beyond what this page needs
- public rendering optimizations
- caching/revalidation Plugin design

## What to Build

- Ensure `actions.getConfig` works through the TanStack action boundary.
- Ensure Site page rendering reflects bootstrapped Site state.
- Ensure migration-related UI does not rely on Next-specific streaming or refresh behavior.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/oberon/actions.ts`
- `packages/plugins/tanstack/src/provider.client.tsx`
- `packages/oberoncms/core/src/components/site.tsx` only if a framework-neutral bug appears

## Testing Plan

- Run `pnpm test:e2e:new` from repo root.
- Use the shared `CMS Images & Site Actions` coverage for the current Site assertion.
- Keep any new tests in shared Playwright only when they are expected to apply to both Playground
  implementations.

## Acceptance Criteria

- `/cms/site` renders the CMS shell and Site content.
- The Site page shows no pending migrations for the bootstrapped TanStack Playground state.
- Any migration action exposed by the page does not throw framework-specific action/refresh errors.

## Risks and Mitigations

- Risk: streaming migration responses behave differently in TanStack. Mitigation: do not expand
  migration coverage in this slice unless the existing UI requires it.
