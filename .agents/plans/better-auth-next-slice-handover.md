# Better Auth Migration: Next Slice Handover

## Snapshot

- Branch: `finalise/20260415-162129-better-auth-current`
- Baseline commit: `85287cd`

## Recommended next slice

### Slice name

Phase 5 tracer bullet: existing-user-only 6-digit OTP sign-in on Better Auth
session primitives.

### Why this is next

- `packages/oberoncms/core/src/auth.tsx` still exports the mock auth plugin.
- `packages/oberoncms/core/src/auth/mock.ts` still performs manual OTP/session
  cookie state (`oberon-auth-otp`, `oberon-auth-session`) and custom `/verify`
  handling.
- `packages/oberoncms/core/src/auth/server.ts` already creates a Better Auth
  server with `emailOTP`, but session lifecycle is not yet the canonical source
  for `getCurrentUser`.
- The migration plan marks Phase 5 as the next unresolved behavior slice after
  route mounting.

## Objective

Deliver the CMS login flow as:

1. existing user submits email,
2. receives a 6-digit OTP via `sendVerificationRequest`,
3. verifies OTP through Better Auth,
4. receives an authenticated session recognized by `getCurrentUser`,
5. unknown emails are rejected without auto-creation.

## Scope

### In scope

- Replace mock-only OTP/session state path in
  `packages/oberoncms/core/src/auth/better-auth.ts` with Better Auth
  implementation.
- Preserve route shape under `/cms/api/auth` and login entry at `/cms/login`.
- Preserve send-plugin boundary by continuing to call `sendVerificationRequest`
  through adapter wiring.
- TDD testing through playgound
- Keep strict existing-user-only behavior.
- If migrations are necesary, use the tooling - do not wing it.

### Out of scope

- Role-change-triggered session revocation (Phase 6).
- Template/docs/scaffolding updates.
- Hand-editing existing migration SQL.
- COA / template implementation - leave on mock for now

## Entry points

- `packages/oberoncms/core/src/auth.tsx`
- `packages/oberoncms/core/src/auth/mock.ts`
- `packages/oberoncms/core/src/auth/better-auth.ts`
- `packages/oberoncms/core/src/auth/server.ts`
- `packages/oberoncms/core/src/auth/client.ts`
- `packages/oberoncms/core/src/auth.test.ts`
- `packages/oberoncms/core/src/lib/dtd.ts`

## Implementation outline (TDD-first)

1. Add failing tests in `packages/oberoncms/core/src/auth.test.ts` for:
   - unknown email does not send OTP,
   - successful OTP verification yields session-backed current user,
   - sign-out clears auth session state,
   - verify endpoint behavior remains under `/cms/api/auth`.
2. Refactor `packages/oberoncms/core/src/auth/better-auth.ts` to remove custom
   pending/session cookie codec as source of truth.
3. Route sign-in/verify through Better Auth APIs from
   `packages/oberoncms/core/src/auth/server.ts` while retaining plugin
   composition and send adapter usage.
4. Keep `MASTER_EMAIL` override behavior intact when resolving current user
   role.
5. Update tests to assert role continuity (`admin`/`user`) from resolved current
   user.

## Acceptance criteria for this slice

- OTP issuance remains 6-digit and reaches `sendVerificationRequest` for known
  users only.
- Unknown emails do not auto-create users and do not establish sessions.
- `getCurrentUser` resolves from Better Auth-backed session state in normal
  flow.
- `signOut` invalidates the active session path used by `getCurrentUser`.
- Current auth tests are green and cover the new session source of truth.

## Risks and checkpoints

- Do not edit historical migrations directly.
