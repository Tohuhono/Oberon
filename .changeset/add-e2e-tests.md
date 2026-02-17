---
"@oberon/playground": patch
---

Add Playwright e2e smoke tests

- Add `@playwright/test` and configure e2e tests under `tests/e2e/`
- Three smoke tests: homepage loads, CMS route loads, 404 renders
- Uses development plugin with SQLite for real persistence
- Add CI workflow (`call-playwright-e2e.yml`) wired into the CI pipeline
- New scripts: `pnpm e2e` and `pnpm e2e:ui`
- Fix AGENTS.md doc paths to reference `agents/` directory
