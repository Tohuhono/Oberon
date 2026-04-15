# Plan: Better Auth Migration

## Required reading

Before implementation starts, the agent must read
https://better-auth.com/docs/guides/next-auth-migration-guide and use it as the
baseline reference for migration decisions, terminology, and API changes.

## Hard constraints

Non-negotiable implementation constraints for all phases:

- Do not hand-edit any database migration files.
- Use the provided Drizzle tooling to generate new migrations.
- Never edit, remove, or change existing migration files.

## Architectural decisions

Durable decisions that apply across all phases:

- **Release shape**: ship as a breaking major; no dual-support bridge and no
  long-lived legacy compatibility bridge for existing installs.
- **Migration policy**: perform a clean schema migration and carry minimal core
  user state (`id`, `email`, `role`).
- **Plugin identity**: keep the public `authPlugin` name.
- **Routes**: keep the public CMS auth base path at `/cms/api/auth`; keep the
  Oberon catch-all route shape as `[...path]`; keep `/cms/login` as the CMS
  sign-in page.
- **Auth methods**: v1 supports email OTP only; no OAuth, credentials, or
  passkeys in the initial migration.
- **Login UX**: preserve the current two-step email plus 6-digit code flow.
- **Signup policy**: sign-in remains existing-user-only; unknown emails must not
  auto-create CMS users.
- **Roles**: preserve `admin` and `user`; store role as a real Better Auth user
  field with user input disabled.
- **Authorization model**: keep session-backed permission checks for the hot
  path; on role change, immediately revoke that user's active sessions.
- **Master override**: preserve `MASTER_EMAIL` as the emergency admin override.
- **Persistence ownership**: database plugins continue to own auth persistence
  wiring, but they provide Better Auth schema/database integration instead of
  Auth.js adapter methods.
- **Verification storage**: Better Auth owns session/account/verification
  storage shape.
- **Send boundary**: email delivery remains a separate plugin concern.
- **Development behavior**: preserve development-mode OTP logging to console
  instead of sending real email.
- **Rollout scope**: core lands first; scaffolding and docs follow later.
- **Lane strategy**: keep mock auth for docs/templates while migrating Better
  Auth behavior in the playground lane.
- **Slice sequencing**: land database persistence before Better Auth runtime
  behavior.

---

## Phase 1: Mock-first auth plugin baseline

**User stories**: as a maintainer, I can run auth-related TDD coverage without
database wiring or legacy auth dependencies; as a plugin author, I can compose
against a canonical auth plugin contract that is dependency-light.

### What to build

Create an auth plugin implementation that uses mock behavior end-to-end and can
be composed across the system without requiring database plugins, Auth.js, or
NextAuth runtime dependencies. This slice exists to produce a stable,
database-independent green TDD baseline before migration complexity is added.

### Acceptance criteria

- [x] A canonical mock auth plugin exists and composes through core plugin
      boundaries.
- [x] The mock auth plugin requires no database dependency to run.
- [x] The mock auth plugin requires no current auth stack dependency
      (Auth.js/NextAuth) to run.
- [x] Focused TDD runs are green in a database-independent configuration.

---

## Phase 2: System-wide mock adoption and Auth.js stack removal

**User stories**: as a maintainer, I can run the CMS with mock auth across the
codebase while removing NextAuth and remaining `@auth/*` coupling from Phase 2
surfaces; as a contributor, I can iterate on migration work without hidden
Auth.js stack dependencies.

### What to build

Adopt the mock auth plugin across all currently-auth-integrated surfaces and
remove NextAuth plus `@auth/*` dependencies from Phase 2 ownership surfaces.
This slice ensures the codebase no longer depends on the Auth.js stack before
Better Auth contract work begins.

### Acceptance criteria

- [x] Mock auth plugin is wired across the existing auth touchpoints in core and
      directly affected plugin layers.
- [x] NextAuth and `@auth/*` dependencies are removed from active Phase 2
      execution paths.
- [x] Legacy NextAuth route and callback assumptions are no longer required by
      default execution paths.
- [x] Focused TDD runs remain green after NextAuth removal.

---

## Phase 3: Breaking-major contract reset

**User stories**: as a maintainer, I can remove Auth.js and NextAuth-specific
contracts from Oberon core without preserving compatibility; as a plugin author,
I can target the new canonical auth boundary instead of legacy adapter hooks.

### What to build

Define the new Oberon auth contract for a Better Auth-based world. This slice
removes Auth.js-specific types and assumptions from the public and internal core
surface, while preserving only the durable Oberon behaviors that remain valid
after the migration: `authPlugin`, CMS-path routing, role-aware auth, email OTP
sign-in, and separate database/send plugin composition.

### Acceptance criteria

- [ ] Core no longer models auth persistence around Auth.js adapter method
      names.
- [ ] The new canonical contract explicitly represents Better Auth ownership of
      session/account/verification concerns.
- [ ] The Oberon-specific responsibilities that remain are clear: current user
      lookup, permission checks, CMS login flow, role handling, master override,
      and plugin composition.
- [ ] Breaking changes are recorded clearly enough that later implementation
      slices do not need to preserve legacy compatibility.

### Breaking changes captured in this slice

- Deferred: contract-level breaking changes were intentionally postponed to keep
  behavior migration stable while Better Auth routing and instances are landed.

---

## Phase 4: Better Auth mounted under CMS routes

**User stories**: as a maintainer, I can mount Better Auth under the CMS path
and expose the server/client instances needed by Oberon; as a CMS user, auth
traffic stays within the CMS route namespace.

### What to build

Create the Better Auth server and client integration used by Oberon, mounted at
the CMS auth base path. This slice establishes the canonical route structure,
request handling, and client/server access pattern that all later auth behavior
builds on.

### Acceptance criteria

- [x] Better Auth is mounted under the public base path `/cms/api/auth` while
      preserving the Oberon catch-all route shape (`/cms/api/[...path]`).
- [x] Oberon retains `/cms/login` as the sign-in page.
- [x] A canonical Better Auth server instance exists for server-side session and
      auth operations.
- [x] A canonical Better Auth client instance exists for the CMS client-side
      login/session flow.

---

## Phase 4.5: Explicit auth lane split

**User stories**: as a maintainer, I can migrate Better Auth behavior in one
execution lane without destabilizing docs/templates; as a contributor, I can see
explicit auth imports that communicate migration intent.

### What to build

Introduce explicit auth entrypoints so the playground lane can target Better
Auth independently while docs/scaffolding stay on the mock lane.

### Acceptance criteria

- [x] Core exports an explicit mock auth lane and an explicit playground auth
      lane.
- [x] Playground consumes the playground auth lane explicitly.
- [x] Docs/snippets/templates consume the mock auth lane explicitly.
- [x] The split preserves existing CMS auth route shape and plugin composition.

---

## Phase 5: Database-first Better Auth persistence (sqlite lane)

**User stories**: as a maintainer, I can land Better Auth persistence
foundations before runtime behavior changes; as an operator, existing core user
state is carried forward during schema migration.

### What to build

Implement Better Auth persistence in sqlite first using Better Auth guidance,
including schema and migration generation, while carrying forward minimal user
state (`id`, `email`, `role`). This slice is persistence-only and does not
switch playground runtime auth behavior yet.

### Acceptance criteria

- [ ] sqlite lands Better Auth-aligned persistence schema with generated
      migrations.
- [ ] Schema migration carries forward minimal core user state (`id`, `email`,
      `role`).
- [ ] `role` is represented in the migrated auth user model.
- [ ] Focused tests cover schema/migration/adapter persistence behavior.
- [ ] Docs/templates/COA remain on mock auth imports.

---

## Phase 6: Core contract updates and explicit not-implemented paths

**User stories**: as a maintainer, I can keep type checks honest while only
sqlite persistence is implemented; as a contributor, non-implemented database
lanes fail explicitly.

### What to build

Update core database/auth contracts for the persistence-first rollout and add
explicit `NotImplementedError` behavior for database lanes that are not yet
implemented in this migration sequence.

### Acceptance criteria

- [ ] Adapter contracts reflect the new persistence expectations.
- [ ] Non-implemented lanes throw explicit `NotImplementedError` where required.
- [ ] Type checks pass without pretending unimplemented persistence exists.

---

## Phase 7: Existing-user-only 6-digit email OTP sign-in (playground lane)

**User stories**: as an existing CMS user, I can request a 6-digit code and
complete sign-in from the CMS login screen; as a maintainer, unknown emails do
not create users implicitly.

### What to build

Switch playground lane runtime behavior to use Better Auth session primitives on
top of the sqlite persistence foundation. Preserve two-step email OTP UX and
existing-user-only sign-in policy.

### Acceptance criteria

- [ ] The sign-in flow uses Better Auth email OTP rather than NextAuth callbacks
      in playground lane.
- [ ] The CMS login experience remains a two-step email plus 6-digit code flow.
- [ ] Unknown emails do not auto-create CMS users.
- [ ] Successful OTP completion creates a valid CMS session and redirects into
      the CMS.

---

## Phase 8: Role-aware session model and revocation semantics

**User stories**: as a signed-in user, role checks remain session-backed and
cheap; as an admin, role changes revoke active sessions immediately.

### What to build

Complete role-aware session behavior, including immediate revocation on role
change, while preserving `MASTER_EMAIL` override semantics.

### Acceptance criteria

- [ ] Session-backed role data supports permission checks without extra reads.
- [ ] Role change invalidates active sessions immediately.
- [ ] `MASTER_EMAIL` admin override still applies.

---

## Phase 9: PostgreSQL parity for Better Auth persistence wiring

**User stories**: as a plugin author, pgsql provides the same Better Auth
persistence capabilities as sqlite; as a maintainer, plugin ownership boundaries
remain intact.

### What to build

Implement Better Auth persistence wiring in pgsql to match sqlite behavior and
schema expectations.

### Acceptance criteria

- [ ] pgsql supports Better Auth schema requirements through generated
      migrations.
- [ ] pgsql adapter behavior aligns with sqlite slice behavior.
- [ ] Plugin-owned persistence boundary remains clear.

---

## Phase 10: Focused validation and guarded rollout

**User stories**: as a maintainer, I can verify the new auth flow with targeted
coverage before broadening scope; as a future adopter, templates and docs can be
updated after the core migration is proven.

### What to build

Add focused validation around the migrated core auth flow and deliberately stop
short of full template and docs migration. This slice proves the core design
decisions before expanding the change into scaffolding and documentation work.

### Acceptance criteria

- [ ] Focused validation exists for persistence migrations, OTP login,
      session-backed current-user lookup, role-aware permission checks, and
      role-change revocation.
- [ ] The initial migration scope is limited to core and the directly affected
      plugin layers.
- [ ] Follow-up work for scaffolding and docs is explicitly deferred rather than
      implicitly forgotten.
- [ ] The resulting plan is narrow enough to implement in tracer-bullet slices
      but specific enough to reflect the agreed architectural decisions.
