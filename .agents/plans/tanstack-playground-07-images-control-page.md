# TanStack Playground Slice 7: Images Control Page

## Goal

Make the Images control page work in the TanStack Playground enough for current CMS parity coverage.

## Scope

In scope:

- `/cms/images`
- listing Images
- image route/provider behavior needed by existing UI
- current shared Images/Site Playwright assertions

Out of scope:

- full upload provider parity if no current shared test requires it
- Uploadthing/Flydrive framework migrations
- public image CDN transformation decisions

## What to Build

- Ensure `actions.getAllImages` works through the TanStack action boundary.
- Ensure the TanStack client provider supplies image transform behavior only when a concrete need
  appears; do not copy Next.js `imageTransform={{ cdn: "nextjs" }}` semantics blindly.
- Keep any storage/upload provider-specific behavior in the relevant Plugin, not in the Playground
  route layer.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `packages/plugins/tanstack/src/provider.client.tsx`
- storage/upload Plugins only if existing Image UI requires their Handler behavior in TanStack

## Testing Plan

- Run `pnpm test:e2e:new` from repo root.
- Current shared Images coverage is light and includes the Site page assertion in the same spec.
- Add shared Image tests only when both Playground implementations are expected to pass them.

## Acceptance Criteria

- `/cms/images` loads under the authenticated CMS shell.
- Existing shared Images/Site assertions pass.
- No framework-specific Image rendering errors occur in the TanStack Playground.

## Risks and Mitigations

- Risk: image upload support pulls in framework-specific provider work too early. Mitigation: keep
  this slice to current shared coverage unless a visible broken UI blocks CMS parity progress.
