# @dev/playwright

## 0.1.0

### Minor Changes

- 20820f4: Promote the repo to the Better Auth model across core packages,
  plugins, docs, recipes, and app scaffolds.

  This release removes remaining Auth.js/NextAuth assumptions, standardizes auth
  adapter expectations, and aligns setup guidance around Better Auth as the
  supported path.

  Risks and implications:
  - Integrations still relying on Auth.js/NextAuth-specific behavior may require
    configuration and implementation updates.
  - Auth adapter implementations must match the updated user-table/auth contract
    expectations across sqlite and pgsql paths.
  - Existing user schemas with provider-specific fields may need to be reduced
    or remapped to the active Better Auth model.
  - Environment variables, callback handling, and session/user lifecycle
    behavior should be reviewed during upgrade to avoid auth regressions.

  Treat this as a coordinated upgrade across core, plugins, recipes, and app
  scaffolds rather than a piecemeal patch.

## 0.0.3

### Patch Changes

- b654991: Implement issue #294 E2E auth lane workflow with shared Playwright
  auth helpers, add COA login/provenance lane coverage and UI test commands, and
  fix email callback/session handling required for deterministic UI sign-in
  completion.
- 138dc59: Refine Playwright CMS E2E fixture architecture and route Next/React
  lint rules away from Playwright spec files.
- 138dc59: Share fixed Playwright lane constants across playground and COA,
  improve OTP token parsing reliability from dev logs, and align E2E lane
  coverage for auth, login, CMS, and smoke flows.
- a011a89: Make the shared CMS Playwright suite explicit in `dev/playwright`,
  keep the existing `@cms` lane as the shared authenticated behavior lane, add a
  real playground `@tdd` suite for red/green work, expose dedicated TDD UI
  commands, keep opt-in `@tdd` specs separate from shared CMS contract specs,
  and document the canonical root validation, completion gate, and grep workflow
  for agents.
- 138dc59: Standardise Playwright HTML output on `.playwright/report` and add
  shared CI report publishing so failed runs expose a hosted Vercel report link.

## 0.0.2

### Patch Changes

- 39d2f88: Simplify changed package detection to a minimal fail-loud script that
  directly runs Turbo dry-run JSON output and prints the `packages` array.
  Update the changed-packages workflow step to call the script inline and fail
  immediately when Turbo or Git ref resolution fails.

  Pass `VERCEL_PROTECTION_BYPASS` through smoke-test workflows and include it in
  Playwright smoke requests via `x-vercel-protection-bypass` headers.

## 0.0.1

### Patch Changes

- fed3aa0: Align deployed smoke testing around a single project-scoped command
  and base URL.
  - fix Playwright project mapping so `docs` and `playground` run their matching
    app smoke specs
  - update reusable CI e2e workflow to run smoke via
    `pnpm test:smoke -- --project <name>`
  - use a single `PLAYWRIGHT_BASE_URL` input for deployed smoke runs
  - fail fast when `PLAYWRIGHT_BASE_URL` is not set for smoke runs
  - fix smoke artifact upload path to `dev/playwright/.playwright/report`
  - refresh test command references in docs to match current workspace scripts

- cd294c5: Remove stale changesets that still referenced `@dev/test` after the
  package rename to `@dev/playwright`.

  This unblocks `changesets/action` from failing during `changeset version` when
  it validates pending changeset package names.
