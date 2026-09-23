# TanStack Playground Slice 6: Users Control Page

## Goal

Make the Users control page work in the TanStack Playground.

## Scope

In scope:

- `/cms/users`
- adding Users
- changing roles
- deleting Users
- preserving authenticated permission behavior

Out of scope:

- redesigning auth persistence
- changing Better Auth semantics
- create-oberon-app propagation

## What to Build

- Ensure `actions.getAllUsers`, `actions.addUser`, `actions.changeRole`, and `actions.deleteUser`
  work through the TanStack action boundary.
- Confirm role change UI updates after mutation.
- Preserve the Auth Plugin as the owner of authentication behavior and the core `can` adapter as the
  authorization boundary.

## Candidate Files

- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/oberon/actions.ts`
- `packages/plugins/tanstack/src/provider.client.tsx`
- `packages/plugins/tanstack/src/index.ts`

## Testing Plan

- Run `pnpm test:e2e:new` from repo root.
- Use shared `dev/playwright/test/cms/users.spec.ts` once Pages seeding and auth are stable.
- The shared Users fixture creates and deletes test-specific emails through the UI, so failures may
  leave state in the app-local Playwright sqlite database until the next webServer reset.

## Acceptance Criteria

- A User can be added.
- A User role can be changed to `admin`.
- A User can be deleted.
- The authenticated session remains valid through Users page mutations.

## Risks and Mitigations

- Risk: role/session freshness differs across framework request boundaries. Mitigation: keep fixes
  in auth/request authority behavior, not in Users UI code.
