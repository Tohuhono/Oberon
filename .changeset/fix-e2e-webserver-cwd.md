---
"@dev/test": patch
---

Fix Playwright E2E web server startup by running `start:oberon` and `start:docs`
from the repository root.

- set `cwd` for Playwright `webServer` commands in
  `dev/test/playwright.config.ts`
- prevents `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` when scripts are resolved from
  the test package directory
