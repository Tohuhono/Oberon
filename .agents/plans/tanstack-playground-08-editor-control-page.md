# TanStack Playground Slice 8: Editor Control Page

## Goal

Make the Editor control page work in the TanStack Playground.

## Scope

In scope:

- `/cms/edit` and `/cms/edit/<page>`
- editor preview iframe
- publish action
- preview theme mode controls
- navigation from the editor to the public rendered Page

Out of scope:

- broad Puck component redesign
- Tailwind style asset caching/revalidation story
- skipped playground-only className test unless it is intentionally re-enabled

## What to Build

- Ensure editor route context loads `edit` and `preview` actions through `OberonProvider`.
- Ensure the preview iframe can render public Page content through the TanStack public Render route.
- Ensure `actions.publishPageData` works from the TanStack action boundary.
- Ensure the editor's View and Publish flows navigate or refresh correctly with TanStack route
  effects.
- Keep Tailwind style asset behavior as a follow-up if it requires a separate Plugin or Handler
  story.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/src/routes/$.tsx`
- `packages/plugins/tanstack/src/provider.client.tsx`
- `packages/oberoncms/core/src/components/editor/**` only if a framework-neutral bug appears

## Testing Plan

- Run `pnpm test:e2e:new` from repo root.
- Use shared `dev/playwright/test/cms/edit.spec.ts` after the Pages control page can seed Pages.
- The shared Editor tests rely on `cmsSeededPageKey`, the preview iframe, publish toast text, and
  public route navigation.

## Acceptance Criteria

- Editor pages show Preview, View, and Publish controls.
- Preview iframe appears and has a measurable width.
- Publishing from editor succeeds and shows the success message.
- Navigating to the published public Page works through the TanStack Render route.
- Preview theme mode controls pass the existing shared `@tdd` assertions once this slice is ready.

## Risks and Mitigations

- Risk: iframe rendering exposes gaps in public catch-all routing. Mitigation: keep public Render
  route behavior covered from slice 1 onward.
- Risk: route refresh behavior differs after publish. Mitigation: isolate any required TanStack
  refresh behavior in the TanStack client provider.
