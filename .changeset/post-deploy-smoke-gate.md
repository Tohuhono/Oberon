---
"@dev/test": patch
---

Support running smoke E2E tests against deployed environments and gate CI
progression on post-deploy smoke results.

- add deployed-target Playwright mode via environment-based base URLs
- skip local web server startup when targeting deployed URLs
- update CI reusable e2e workflow to run project-scoped smoke tests against a
  provided deployment URL
- run post-deploy smoke tests in CI and gate promotion on their status
