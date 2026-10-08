# Plan: Behavior-first test refactor

> Source: the test-suite review and vertical-slice breakdown approved in this conversation.

## Architectural decisions

- **Execution**: Turbo orchestrates dependency builds, app prebuild, app builds, and each app's E2E
  run. Preserve this lifecycle and the existing root scripts.
- **Database lifecycle**: built-app tests use the database prepared by prebuild. Do not reset it,
  provision a competing database, or rerun Bootstrap inside browser fixtures.
- **Routes**: preserve `/cms`, `/cms/pages`, `/cms/users`, `/cms/edit`, public Page routes, and
  `/cms/api/auth`. Do not add production endpoints for test access.
- **Models and schema**: preserve Page, User, Site state, and KV contracts. No schema changes.
- **Authorization**: use the documented role policy. Distinguish authorized Oberon actions from
  unrestricted programmatic Adapter capabilities.
- **Framework coverage**: verify shared app behavior independently against the built Next.js and
  TanStack Playgrounds. Do not infer provider equivalence from one app's result.
- **Boundaries**: use CMS UI and the actual action or HTTP boundary for app workflows. Retain pure
  logic, type, architecture, and public Plugin contract tests where E2E cannot replace their
  guarantees.
- **References**: follow [testing guidance](../TESTING.md), [code style](../CODESTYLE.md),
  [architecture](../ARCHITECTURE.md), and [domain terminology](../CONTEXT.md).

## Scope and completion rules

- Change tests and test fixtures by default. Update directly related test guidance where needed.
- Production behavior, routes, schemas, and public interfaces are outside this refactor.
- Use unique test record names and separate session state where needed. Clean up only records and
  browser contexts owned by the test.
- Each slice strengthens one behavior, verifies it, and removes only assertions it replaces.
- Retain old coverage for behavior the replacement does not exercise.
- Do not delete a combined test until every behavior it protects has a verified replacement.
- Preserve existing isolated contract fixtures. Do not introduce database provisioning changes.
- Run `pnpm format` and `pnpm validate` from the repository root.
- Before removing old coverage, require uncached execution of the changed tests through the approved
  root validation path, using `pnpm validate --force` when necessary. Cached success alone is not
  replacement evidence.
- Record the app or provider exercised, observed results, retained cases, and removed assertions for
  each completed slice.
- Keep every slice independently verifiable. There is no final bulk test deletion phase.
- If an approved root script cannot exercise a required scenario, stop and request an approved
  test-path change. Do not bypass orchestration with package-local or direct runner commands.

## Separate implementation-bug procedure

Assume the current implementation is correct, but do not treat that assumption as proof.

When an improved test fails:

1. Check the assertion, fixture, documented expectation, and execution conditions.
2. If evidence suggests an implementation bug, stop the affected slice and report it as a **separate
   implementation concern**, not as part of this testing refactor.
3. Include:
   - Expected behavior and its documented or approved basis.
   - Actual behavior.
   - A reproduction through an approved root script.
   - The affected app, framework, and persistence provider where relevant.
   - Supporting test output or trace, without credentials or OTP values.
   - Whether the bug is suspected or confirmed.
   - The blocked slice and the coverage retained.
4. Preserve the reproduction and existing coverage. Do not weaken expectations, silently skip the
   test, or change production code to make this refactor pass.
5. Keep the slice blocked until the concern is resolved separately. Continue independent slices
   where safe.

An unclear requirement is a specification concern. An unavailable test path is a testing or tooling
concern. Neither is automatically an implementation bug.

No implementation bug is confirmed by this plan. Known weak assertions are test defects. A passing
old test does not disprove a bug exposed by a stronger test.

### Separate concern: local Vitest reporter regression

**Status**: resolved separately from the test refactor. Local `pnpm validate` passed all 92 tasks.
`GITHUB_ACTIONS=true pnpm test:unit --force` passed all 20 tasks with no cached results. The
deprecated reporter import was also replaced with the supported `vitest/node` entrypoint.

Observed while validating this plan, before any test refactoring:

- **Classification**: test-tooling regression, separate from this refactor; not a confirmed CMS
  implementation bug.
- **Reproduction**: `pnpm validate` from the repository root.
- **Expected**: the utilities unit runner initializes and executes its tests.
- **Actual**: `@tohuhono/utils#test:unit` fails during Vitest configuration resolution with
  `TypeError: Cannot read properties of undefined (reading 'length')`, before tests run.
- **Cause**: the reporter change explicitly supplied `reporters: undefined` outside GitHub Actions,
  overwriting Vitest's default array before the runner read `resolved.reporters.length`.
- **Correction**: the [shared test configuration](../../dev/vitest/vitest.config.ts) now omits the
  reporter override locally and preserves the custom reporter array in GitHub Actions.
- **Scope**: this correction changes only the shared test configuration, not CMS implementation
  behavior or the planned test-refactor slices.
- **Verification**: run canonical validation and an uncached unit run with `GITHUB_ACTIONS=true` to
  verify both branches before declaring the regression resolved.

---

## Slice 1: Routing produces the correct user-visible result

**User stories**: a CMS visitor reaches Pages from `/cms`; a visitor gets the appropriate not-found
result for an unknown CMS route or missing public Page.

**Dependencies**: none.

### What to build

Strengthen route coverage against each built Playground. Check the final URL or not-found content
and the response status where the host's documented contract requires it. Replace the corresponding
mocked Provider routing checks within this slice.

### Acceptance criteria

- [ ] `/cms` reaches `/cms/pages` for an authenticated CMS visitor.
- [ ] An unknown CMS route produces the appropriate not-found result.
- [ ] A missing public Page produces the appropriate not-found result.
- [ ] Status expectations account for documented streamed and non-streamed host behavior.
- [ ] Next.js and TanStack results are verified separately.
- [ ] Equivalent redirect and not-found mock assertions are removed only after verification.
- [ ] The denied-public-Page case remains: the default apps do not configure an equivalent
      restricted public Page scenario.

---

## Slice 2: A created User remains available after navigation

**User stories**: an admin creates a User and can retrieve that User on a fresh visit.

**Dependencies**: none.

### What to build

Create a uniquely named User through the CMS, navigate away, and return to User management. Check
persisted email and initial role. Establish reliable cleanup for the owned User.

### Acceptance criteria

- [ ] The User is created through the built app, without direct database insertion.
- [ ] A fresh visit shows the expected email and initial role.
- [ ] The assertion does not rely only on the immediate post-mutation UI.
- [ ] Cleanup removes only the owned User and runs when assertions fail.
- [ ] Both Playgrounds exercise the behavior.
- [ ] The combined Adapter User lifecycle test is retained until slices 2-4 replace its cases.

---

## Slice 3: A changed User role persists

**User stories**: an admin changes a User's role and sees the new role on a fresh visit.

**Dependencies**: slice 2's verified User setup and cleanup.

### What to build

Create an owned User, change the role through the CMS, then navigate away and return. Read the role
from the refreshed User management surface.

### Acceptance criteria

- [ ] The initial role and requested new role are known.
- [ ] The role change goes through the app's normal mutation path.
- [ ] A fresh visit shows the new role.
- [ ] Both Playgrounds exercise the behavior.
- [ ] Cleanup does not change shared admin accounts.
- [ ] The combined Adapter lifecycle test remains until slice 4 completes the replacement.

---

## Slice 4: A deleted User remains absent

**User stories**: an admin deletes a User, and that User remains absent on a fresh visit.

**Dependencies**: slice 2 for User setup; slices 2 and 3 before removing combined lifecycle
coverage.

### What to build

Delete the owned User through the CMS and verify absence after navigating away and returning.
Complete the replacement decision for the existing combined Adapter User lifecycle test.

### Acceptance criteria

- [ ] The test first establishes that its owned User exists.
- [ ] Deletion goes through the normal CMS mutation path.
- [ ] A fresh visit confirms absence.
- [ ] Cleanup safely handles a User already deleted by the test.
- [ ] Both Playgrounds exercise the behavior.
- [ ] The combined Adapter test is removed only for behavior and providers covered by slices 2-4.
- [ ] Provider-specific guarantees without equivalent coverage remain.

---

## Slice 5: Permissions control operations, not call sequences

**User stories**: a regular User can perform an allowed operation but cannot perform an admin-only
User-management operation.

**Dependencies**: slice 2's User setup and cleanup.

### What to build

Authenticate a uniquely named regular User through the existing real sign-in flow, with separate
browser state. Exercise an allowed operation and a denied User-management operation through the
actual action boundary. Use the admin session to verify unchanged stored state after denial.

### Acceptance criteria

- [ ] Admin and regular-User browser contexts and stored session state are separate.
- [ ] An operation permitted by the documented role policy succeeds.
- [ ] An admin-only User-management operation returns the documented denial.
- [ ] Denial is verified at the actual action boundary, not only by a hidden or disabled control.
- [ ] A fresh admin read confirms that denied work did not change persistent state.
- [ ] Both Playgrounds exercise the behavior.
- [ ] Equivalent internal permission-call-order assertions are removed.
- [ ] Programmatic Adapter contracts and unmatched restricted-public-Page checks remain.
- [ ] If the current path cannot exercise a denied action, report the testability gap and block that
      part of the slice; do not add a production test endpoint.

---

## Slice 6: Published content receives its actual styles

**User stories**: an editor publishes a styled Text component, and visitors see its intended style
on the public Page.

**Dependencies**: none; use existing owned-Page fixtures.

### What to build

Publish a Page with known Text classes through the CMS. Visit its public rendering, check content
and computed style, and verify the stylesheet reference actually exposed by the app. Replace
equivalent private-state publishing assertions.

### Acceptance criteria

- [ ] Publishing uses the CMS workflow.
- [ ] The public Page contains the expected content.
- [ ] A known utility has the expected computed style; retain the existing `p-1` padding expectation
      of `4px`.
- [ ] The stylesheet URL comes from the app output, not a test-local reconstruction from KV state.
- [ ] The stylesheet request succeeds and returns CSS.
- [ ] Both Playgrounds exercise the behavior.
- [ ] Equivalent sorted-class, hash-length, and reconstructed-URL checks are removed.
- [ ] Storage-failure, missing-asset, and Bootstrap-repair cases remain unless individually
      replaced.
- [ ] Cleanup removes only owned Pages; it does not clear shared Tailwind state.

---

## Slice 7: Prebuild produces a usable admin and working auth route

**User stories**: the configured Bootstrap admin exists with the expected role and can sign in
through the built app's auth route.

**Dependencies**: none; use the existing managed prebuild and real OTP flow.

### What to build

Check the configured Bootstrap admin through CMS User management and verify real sign-in through the
nested auth route. Replace equivalent happy-path Handler forwarding assertions. Correct the existing
auth test's unsupported claim that it runs earlier Bootstrap work.

### Acceptance criteria

- [ ] The configured Bootstrap admin is present with the expected email and admin role.
- [ ] Real OTP sign-in succeeds through `/cms/api/auth` and reaches CMS Pages.
- [ ] Next.js and TanStack behavior is verified separately.
- [ ] No browser fixture resets the database or reruns Bootstrap.
- [ ] Equivalent happy-path forwarding checks are removed only after verification.
- [ ] Uncovered HTTP-method contracts remain.
- [ ] Normalization, missing-email, and duplicate-prevention cases remain unless equivalent managed
      lifecycle scenarios are available.
- [ ] Additional lifecycle variants are recorded as deferred coverage, not silently dropped.
- [ ] Functional auth coverage does not cause automatic deletion of explicit migration/schema
      compatibility contracts.

---

## Slice 8: Editor remount restores Follow mode

**User stories**: an editor leaves and reopens the editor, and the preview again follows the editor
theme.

**Dependencies**: none; use existing owned-Page fixtures.

### What to build

Set an explicit preview mode, leave the editor, and reopen it. Check Follow immediately after
remount. Change the editor theme and verify that the preview follows without another manual
preview-mode selection.

### Acceptance criteria

- [ ] An explicit preview mode is active before leaving.
- [ ] Follow is selected immediately after reopening the editor.
- [ ] The test does not select Light or Follow to manufacture the expected reset.
- [ ] Changing the editor theme changes the preview as specified.
- [ ] Both Playgrounds exercise the behavior.
- [ ] The old remount test is replaced by this stronger check.

---

## Slice 9: Concurrent mapping yields before all work finishes

**User stories**: a caller receives completed work while other mapped operations remain pending.

**Dependencies**: none.

### What to build

Replace timer-based streaming assumptions with controlled promises in the existing pure-logic test.
Release one operation, keep another pending, and prove that a result is yielded before releasing the
rest.

### Acceptance criteria

- [ ] At least one mapped operation remains pending when the first result is observed.
- [ ] No sleep-duration assumption determines completion order.
- [ ] A buffered implementation would fail the streaming check.
- [ ] Every pending operation is released and the generator is cleaned up, including on failure.
- [ ] Existing concurrency-limit and result-completeness coverage remains.
- [ ] The test remains a pure-logic test rather than being moved to E2E.

---

## Slice 10: Site state is checked through an awaited contract

**User stories**: an Adapter caller reads the supported initial Site state and can read back
supported Site updates.

**Dependencies**: none; use existing contract fixtures.

### What to build

Replace the Promise-based negative throw assertion with awaited outcome checks. Use the existing
database-boundary fixtures and preserve provider-specific initial-state expectations. Where the
fixture supports Site updates, exercise a write and read it back.

### Acceptance criteria

- [ ] Site reads are awaited.
- [ ] The supported initial-state result is asserted explicitly.
- [ ] A supported write can be read back through the same public contract.
- [ ] A rejected read or incorrect stored value fails the test.
- [ ] Capability exclusions are explicit rather than success-shaped fallbacks.
- [ ] Existing fixture provisioning and the built-app database lifecycle are unchanged.
- [ ] The defective negative throw assertion is removed.

---

## Slice 11: Plugin contracts assert meaningful public outcomes

**User stories**: Plugin authors can rely on documented precedence, middleware nesting, late Adapter
access, and lazy Handler initialization.

**Dependencies**: none.

### What to build

Replace the order test that only initializes two configurations with an observable capability
result, or narrow its stated purpose if initialization is the intended guarantee. Make a Handler use
a final Adapter capability and return its result. Retain order and initialization-count checks where
they directly express documented Plugin behavior.

Update related guidance to distinguish pure unit tests, public contract tests, and built-app E2E
tests. Document preservation of the managed database lifecycle.

### Acceptance criteria

- [ ] A precedence claim is backed by competing capabilities with distinguishable results, or the
      claim is narrowed to initialization.
- [ ] A Handler uses a final Adapter capability and its response proves the result.
- [ ] Documented middleware order, late-access rejection, and lazy one-time initialization remain
      covered.
- [ ] Pure transform, type-inference, dependency-boundary, and KV contracts remain.
- [ ] Tests do not constrain private composition details beyond the documented contracts.
- [ ] Test guidance explains the boundaries and does not recommend a competing E2E database
      lifecycle.
- [ ] Formatting and canonical validation pass.
