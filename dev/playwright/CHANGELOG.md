# @dev/playwright

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
