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
  legacy schema migration path for existing installs.
- **Plugin identity**: keep the public `authPlugin` name.
- **Routes**: keep the public CMS auth base path at `/cms/api/auth`; align the
  catch-all route shape to Better Auth style `[...all]`; keep `/cms/login` as
  the CMS sign-in page.
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

- [ ] A canonical mock auth plugin exists and composes through core plugin
      boundaries.
- [ ] The mock auth plugin requires no database dependency to run.
- [ ] The mock auth plugin requires no current auth stack dependency
      (Auth.js/NextAuth) to run.
- [ ] Focused TDD runs are green in a database-independent configuration.

---

## Phase 2: System-wide mock adoption and NextAuth removal

**User stories**: as a maintainer, I can run the CMS with mock auth across the
codebase while removing NextAuth; as a contributor, I can iterate on migration
work without hidden NextAuth coupling.

### What to build

Adopt the mock auth plugin across all currently-auth-integrated surfaces and
remove NextAuth from core paths. This slice ensures the codebase no longer
depends on NextAuth before Better Auth contract work begins.

### Acceptance criteria

- [ ] Mock auth plugin is wired across the existing auth touchpoints in core and
      directly affected plugin layers.
- [ ] NextAuth dependencies are removed from the active core auth flow.
- [ ] Legacy NextAuth route and callback assumptions are no longer required by
      default execution paths.
- [ ] Focused TDD runs remain green after NextAuth removal.

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

- [ ] Better Auth is mounted under the public base path `/cms/api/auth` using
      the Better Auth-style catch-all route shape.
- [ ] Oberon retains `/cms/login` as the sign-in page.
- [ ] A canonical Better Auth server instance exists for server-side session and
      auth operations.
- [ ] A canonical Better Auth client instance exists for the CMS client-side
      login/session flow.

---

## Phase 5: Existing-user-only 6-digit email OTP sign-in

**User stories**: as an existing CMS user, I can request a 6-digit code and
complete sign-in from the CMS login screen; as a maintainer, unknown emails do
not create users implicitly.

### What to build

Replace the NextAuth email flow with Better Auth email OTP while preserving the
current CMS experience. The slice must deliver the end-to-end behavior from
email entry to OTP verification to authenticated session creation, but must
continue to reject unknown users rather than auto-registering them.

### Acceptance criteria

- [ ] The sign-in flow uses Better Auth email OTP rather than NextAuth email
      callbacks.
- [ ] The CMS login experience remains a two-step email plus 6-digit code flow.
- [ ] Unknown emails do not auto-create CMS users.
- [ ] Successful OTP completion creates a valid CMS session and redirects into
      the CMS.

---

## Phase 6: Role-aware session model with immediate revocation on role change

**User stories**: as a signed-in user, my role is available to permission checks
without an extra read on every request; as an admin, when I change another
user's role, their active sessions are revoked immediately; as an operator,
`MASTER_EMAIL` still grants emergency admin access.

### What to build

Model `role` as a Better Auth user field and surface it through the
session-backed auth path that Oberon already relies on. Preserve cheap
permission checks while defining explicit freshness behavior for role changes by
revoking affected sessions. Keep the master admin override behavior intact.

### Acceptance criteria

- [ ] `role` is stored as a real auth user field and is not user-supplied input.
- [ ] The session-backed auth path exposes enough role data for Oberon
      permission checks.
- [ ] Changing a user's role invalidates that user's active sessions
      immediately.
- [ ] `MASTER_EMAIL` still results in admin access under the new auth flow.

---

## Phase 7: Database plugins own Better Auth persistence wiring

**User stories**: as a database plugin author, I can continue to provide the
auth persistence integration for Oberon; as a maintainer, Better Auth storage
requirements fit the existing plugin composition model; as a custom adapter
author, user-supplied database integrations remain possible.

### What to build

Move database plugin responsibility from Auth.js adapter hooks to Better Auth
persistence and schema wiring. This slice preserves the existing division of
responsibility where the auth engine lives in core but database-specific
persistence belongs to the database plugin layer.

### Acceptance criteria

- [ ] Database plugins remain the ownership boundary for auth persistence
      integration.
- [ ] Better Auth core schema requirements for user, session, account, and
      verification are supported through the plugin-owned database layer.
- [ ] The previous Auth.js-specific persistence surface is no longer required.
- [ ] Custom database integrations remain viable through the same general plugin
      pattern.

---

## Phase 8: Send plugin boundary and development OTP logging

**User stories**: as a send plugin author, I remain responsible for delivery
rather than auth state; as a developer, OTPs still log to console locally
instead of sending real mail.

### What to build

Preserve the current send-plugin boundary while adapting it to Better Auth's OTP
flow. The slice must keep delivery concerns separate from auth state management
and preserve the development plugin behavior that logs OTP details to the
console for local work and tests.

### Acceptance criteria

- [ ] Email delivery remains a separate plugin concern rather than being
      hard-wired into core.
- [ ] The Better Auth OTP flow can invoke plugin-provided delivery behavior.
- [ ] Development mode still logs OTP details to console instead of sending real
      email.
- [ ] The development logging path remains usable for local debugging and
      automated tests.

---

## Phase 9: Oberon permission semantics on top of Better Auth

**User stories**: as a maintainer, I can keep Oberon's `adapter.can()` and
current-user semantics stable after the migration; as a CMS user, authz behavior
remains consistent across pages and actions.

### What to build

Reconnect Oberon's permission and current-user helpers to the Better Auth-backed
session model. This slice ensures the CMS still performs authorization the same
way conceptually even though the underlying auth engine has changed.

### Acceptance criteria

- [ ] Current-user resolution works through Better Auth-backed sessions.
- [ ] Permission checks continue to operate from the session-backed role model.
- [ ] Sign-out semantics work correctly under Better Auth.
- [ ] CMS page and action protection behavior remains consistent with the
      intended pre-migration semantics.

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

- [ ] Focused validation exists for OTP login, session-backed current-user
      lookup, role-aware permission checks, role-change revocation, and
      development OTP logging.
- [ ] The initial migration scope is limited to core and the directly affected
      plugin layers.
- [ ] Follow-up work for scaffolding and docs is explicitly deferred rather than
      implicitly forgotten.
- [ ] The resulting plan is narrow enough to implement in tracer-bullet slices
      but specific enough to reflect the agreed architectural decisions.
