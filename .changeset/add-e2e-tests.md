---
"@oberon/playground": patch
"@oberon/docs": patch
---

Add Playwright e2e smoke tests for playground and docs

- Configure e2e tests under `dev/test/e2e/` with shared build via globalSetup
- Playground smoke tests: homepage, CMS route, 404 page
- Docs smoke tests: homepage, docs index, CMS route, 404 page
- Uses development plugin with SQLite for playground persistence
- Add CI workflow (`call-playwright-e2e.yml`) wired into the CI pipeline
- New scripts: `pnpm e2e` and `pnpm e2e:ui`
