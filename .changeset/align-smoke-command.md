---
"@dev/playwright": patch
---

Align deployed smoke testing around a single project-scoped command and base
URL.

- fix Playwright project mapping so `docs` and `playground` run their matching
  app smoke specs
- update reusable CI e2e workflow to run smoke via
  `pnpm test:smoke -- --project <name>`
- use a single `PLAYWRIGHT_BASE_URL` input for deployed smoke runs
- fail fast when `PLAYWRIGHT_BASE_URL` is not set for smoke runs
- fix smoke artifact upload path to `dev/playwright/.playwright/report`
- refresh test command references in docs to match current workspace scripts
