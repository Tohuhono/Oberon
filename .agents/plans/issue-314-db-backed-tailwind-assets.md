# Plan: Issue 314 - DB-backed immutable Tailwind CSS assets

> Source PRD: https://github.com/Tohuhono/Oberon/issues/314

## Goal

Replace the current build-time `.oberon/tailwind/tailwind.classes` runtime
dependency with immutable Tailwind CSS assets stored in the database, selected
by an explicit active hash on the site singleton, served through the shared
Oberon API surface, and switched atomically during publish.

## Status

- Implementation is complete on the current branch.
- Repo validation passed with `pnpm validate` on 2026-03-26.
- Remaining work is PR-gated review only.

## Architectural decisions

Durable decisions that apply across all phases:

- Routes: immutable assets are served from
  `/<mounted-oberon-api-prefix>/tailwind/[hash].css`, which is
  `/cms/api/tailwind/[hash].css` for current playground and recipe mounts.
- Site model: the singleton site row gains a nullable explicit
  `activeTailwindHash`; there is no "latest asset" inference fallback.
- Asset model: Tailwind assets are immutable rows containing `hash`,
  `classList`, and `css` together.
- Hash identity: the asset hash is derived from compiled CSS, not raw class
  input.
- Class extraction contract: v1 does not persist `cssNames` and does not require
  the client to submit `cssNames`; the server derives classes by walking the
  submitted structured page data directly, reusing the current walk-page style
  extraction approach.
- Class-set scope: the effective site-wide class set is built from
  server-derived classes for the submitted page plus the rest of the published
  corpus only as needed.
- Recompile guard: if the active asset already covers the effective class set,
  publish must not recompile CSS and must keep the current active hash.
- Class removal semantics: if a publish removes classes and adds none, v1 keeps
  the existing CSS and active hash; shrinking recompilation is out of scope.
- Render integration: the active stylesheet link is attached in an app/render
  wrapper around render, not inside core render itself.
- Build-time generation: initial CSS availability must come from build-time
  generation of the active asset state, not from first publish alone.
- Runtime recovery: v1 has no runtime recovery path for missing or broken active
  asset state after deploy; that condition is treated as an operator or admin
  rebuild problem.
- Atomicity: page write, optional immutable asset insert or reuse, and optional
  `activeTailwindHash` update must commit atomically at the `updatePageData`
  live page-data update boundary, rather than requiring a dedicated publish
  method or a lower-level transaction primitive.
- Update scope: `updatePageData` is the domain boundary for live page-data
  updates. That intentionally covers publish semantics while remaining broader
  than the editor publish button specifically, including migrations and
  welcome-page initialization where those paths update live data.
- Feature placement: prefer a core-provided plugin that wraps
  `adapter.updatePageData` and adds Tailwind asset behavior; direct core
  integration is acceptable for the first slice if it is materially simpler,
  with extraction documented as follow-up intent.
- Conflict policy: stale-baseline writes fail with conflict; v1 does not
  auto-retry.
- Retention: old immutable assets remain available in v1; cleanup is follow-up
  work.

## Recommended slice order

1. sqlite + playground `updatePageData` live-update boundary slice
2. sqlite + playground build-time bootstrap generation
3. sqlite + playground effective class-set and skip-recompile logic
4. sqlite + playground concurrency hardening
5. wider adapter and app rollout: pgsql, turso if needed, recipe-nextjs, and
   create-app template alignment

## Phase 1: updatePageData live-update boundary and first end-to-end slice

**User stories**: publish creates a DB-backed immutable stylesheet, the
stylesheet is publicly fetchable by hash, and public rendering can switch to the
active asset without touching core render internals.

### What to build

Build the smallest real vertical slice in sqlite + playground that proves the
new architecture:

- add the site pointer and immutable asset storage model
- add the shared Tailwind asset GET handler on the existing Oberon first-segment
  router surface
- add a render-wrapper integration in playground that reads the active hash and
  emits the stylesheet link when present
- implement the `updatePageData` live page-data update boundary so a working
  sqlite-backed path can persist page data plus asset plus active pointer
  atomically
- prove and document that the same boundary intentionally covers the other
  existing `updatePageData` entry points, especially migrations and welcome-page
  initialization

This slice is allowed to be intentionally narrow as long as it is real
end-to-end and closes the contract shape for all `updatePageData` callers.

### Acceptance criteria

- [x] sqlite schema and migrations support nullable `activeTailwindHash` and
      immutable Tailwind asset rows
- [x] the shared Oberon API surface serves `/cms/api/tailwind/[hash].css` with
      `200`, `404`, `405`, and immutable cache headers
- [x] public playground rendering emits the active stylesheet link from a
      wrapper around render, not from core render
- [x] the `updatePageData` live-data update path can atomically write page data
      and switch the active hash when a new asset is created
- [x] the `updatePageData` domain semantics are documented as the live page-data
      update boundary and explicitly cover publish, migrations, and welcome-page
      initialization
- [x] the first implementation records whether Tailwind asset behavior ships as
      a core-provided plugin wrapper immediately or lands in core first with
      extraction intent documented
- [x] old assets remain fetchable after the active hash changes

### Implementation notes

- The first slice landed directly in core rather than as a wrapper plugin.
- The route is served from the shared Oberon handler surface and public apps add
  the active stylesheet link in a render wrapper.
- Old immutable assets remain addressable by hash after the active hash moves.

### Test strategy

- Unit: none unless pure routing or header helpers emerge with non-trivial
  branching
- Integration: sqlite adapter coverage for asset fetch, asset persistence,
  active pointer persistence, atomic commit semantics at the `updatePageData`
  live-data boundary, and proof that migration and welcome-page callers still
  behave correctly
- E2E: playground publish proves a new stylesheet can be fetched by hash and is
  linked from public render after publish
- Review gate: this phase closes the contract shape for every `updatePageData`
  caller before later slices build on it

---

## Phase 2: Build-time bootstrap generation

**User stories**: a site with published content has working CSS immediately
after a successful build and deploy, without waiting for a new publish or
relying on runtime recovery.

### What to build

Add build-time generation of the initial immutable Tailwind asset and active
hash from the currently published corpus when needed. This slice must treat
valid active asset state as a build output requirement, not a best-effort
fallback. It should also make the accepted v1 operating model explicit: if
deploy completes with missing or broken active asset state anyway, recovery
happens through admin or operator rebuild workflows rather than runtime
self-healing.

### Acceptance criteria

- [x] build-time generation can create and activate the initial asset when
      published content requires one
- [x] sites with no published Tailwind classes may legitimately leave
      `activeTailwindHash` null
- [x] v1 does not provide a runtime recovery path for missing or broken active
      asset state
- [x] the plan and implementation notes explicitly call out that missing or bad
      `activeTailwindHash` after deploy is an operator or admin rebuild problem
- [x] cache invalidation refreshes site-facing active-hash reads without
      requiring immutable asset purges

### Test strategy

- Unit: pure tests for bootstrap decision logic only if isolated into
  deterministic helpers
- Integration: sqlite tests for build-time generation idempotency and
  active-hash persistence from an existing published corpus
- E2E: playground build from an existing published corpus results in a linked
  stylesheet on first public render after deploy without requiring an additional
  publish

---

## Phase 3: Effective class-set calculation and skip-recompile behavior

**User stories**: publish derives classes from submitted page data on the
server, builds the correct site-wide class set, and avoids recompiling when the
active asset already covers the site.

### What to build

Extend the publish path so it computes the post-publish effective class set by
walking the submitted page data on the server plus the rest of the published
corpus only as needed. Add deterministic normalization and ordering, compare
against the active asset's stored `classList`, and skip compilation when no new
classes are introduced.

This phase should move from "proof of architecture" to "correct publish decision
logic" while staying on sqlite + playground.

### Acceptance criteria

- [x] submitted page classes are derived on the server from the submitted `Data`
      object and do not rely on persisted or client-submitted `cssNames`
- [x] publish does not re-read the just-submitted page solely to rediscover its
      classes
- [x] effective class-set construction combines submitted page classes with the
      remaining published corpus correctly
- [x] class normalization and ordering are deterministic for equivalent inputs
- [x] publish preserves the active hash and skips compilation when the active
      asset already covers the effective class set
- [x] if a publish removes classes and adds none, publish keeps the current
      active hash and does not run shrinking recompilation
- [x] when compilation is needed, the hash is derived from compiled CSS and
      existing identical hashes are reused

### Test strategy

- Unit: pure tests for class extraction contract boundaries, normalization,
  deduplication, ordering, class-set comparison, and CSS-hash stability
- Integration: sqlite publish tests for reuse of existing asset rows, unchanged
  active hash on no-op class-set expansions, and page write plus pointer
  behavior
- E2E: playground publish with no new classes keeps the same stylesheet URL;
  publish with new classes switches to a new hash and the page renders with
  matching CSS

---

## Phase 4: Concurrency and conflict hardening

**User stories**: concurrent publishes do not silently lose active-pointer
updates, and failure leaves prior page and CSS state intact.

### What to build

Add baseline verification and conflict handling around the `updatePageData` live
page-data update boundary so Tailwind compilation can occur outside the
transaction while commit still protects against stale baseline decisions. The v1
policy is fixed: stale baselines fail with conflict and do not auto-retry.

### Acceptance criteria

- [x] concurrent publishes detect baseline drift instead of silently overwriting
      the active pointer
- [x] stale-baseline publishes fail with a conflict outcome rather than retrying
      automatically
- [x] a failed asset insert, failed pointer update, or failed commit leaves
      prior page and CSS state intact
- [x] identical compiled CSS produced by competing publishes reuses the same
      immutable asset row without error
- [x] publish success is reported only after the atomic persistence step commits

### Test strategy

- Unit: pure tests only if baseline comparison or conflict mapping logic is
  isolated into deterministic helpers
- Integration: sqlite conflict tests that simulate stale baselines, duplicate
  hashes, and rollback behavior
- E2E: targeted playground TDD coverage for concurrent or near-concurrent
  publish outcomes if the harness can express it reliably; otherwise leave this
  at integration level and document the residual gap

---

## Phase 5: Wider adapter and integration rollout

**User stories**: the architecture proven in sqlite/playground becomes the
supported default shape across Oberon adapters and generated app integrations.

### What to build

Port the settled contract and behavior to the remaining supported database
adapters, then align the shared app integration surfaces so recipe-nextjs and
generated apps expose the same immutable asset route shape and render-wrapper
stylesheet integration as playground.

This phase should only begin after sqlite/playground semantics are stable enough
to copy rather than rediscover.

### Acceptance criteria

- [x] the `updatePageData` live page-data update boundary is implemented
      consistently across supported DB adapters
- [x] recipe-nextjs mounts the same asset route shape and render-wrapper link
      behavior
- [x] generated app scaffolding reflects the new runtime CSS model instead of
      relying on publish-time mutation of build artifacts
- [x] retained immutable assets remain publicly fetchable across supported
      integrations

## Outcome

- The branch implements Phases 1 through 5 for the approved issue 314 scope.
- Review remains explicitly gated on opening a GitHub PR.

### Test strategy

- Unit: none expected beyond any extracted pure helpers already covered earlier
- Integration: adapter-specific persistence tests for the widened backends
- E2E: recipe-nextjs or generated-app validation that the mounted route and
  active stylesheet link shape match playground behavior

---

## Phase-specific TDD order

1. Write the failing sqlite integration test that expresses `updatePageData` as
   the live page-data update boundary before coding Phase 1.
2. Add the failing playground end-to-end test that proves the immutable asset
   route plus linked stylesheet path.
3. Add failing build-time generation coverage before Phase 2 work.
4. Add pure unit tests for normalization and hash-decision helpers before Phase
   3 implementation.
5. Add failing conflict and rollback integration coverage before Phase 4 work.

## Blockers and pre-implementation decisions

- No design blockers remain for planning after the resolved decisions captured
  above.
- Rollout order after sqlite/playground can still be confirmed before Phase 5:
  pgsql first, or recipe integration first, depending on active adoption
  pressure.
