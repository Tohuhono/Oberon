# Better Auth Migration Outstanding Work

## Current understanding

The Better Auth migration is functionally landed for the agreed rollout scope:
core auth wiring, sqlite/pgsql persistence, playground OTP sign-in, permission
checks, `MASTER_EMAIL` recovery, and `updatedBy` snapshot validation are in
place and covered by focused tests.

## Outstanding work

1. Decide whether Phase 8 session revocation is part of this migration or an
   explicit follow-up.
2. If it stays in scope, implement role-change session revocation without adding
   database reads to the `getCurrentUser` hot path.
3. If it moves out of scope, update the main migration plan so completion is
   measured against the agreed rollout boundary rather than the deferred item.
4. If the migration is considered complete after that scope decision, finalise
   the branch with the required release metadata and PR.

## Relevant decisions already made

- Keep `getCurrentUser` session-backed and cheap on the hot path.
- Treat `MASTER_EMAIL` as a permanent emergency admin override.
- Treat `updatedBy` as immutable write-time authorship, not a live relation.
- Keep docs/templates/scaffolding out of this migration.
- Defer role-change session revocation unless it is trivial; current direction
  is to treat it as a follow-up rather than reopen auth hot-path behavior.

## Recommended next decision

Declare the Better Auth migration complete for the agreed rollout scope and
track role-change session revocation as a separate follow-up task.
