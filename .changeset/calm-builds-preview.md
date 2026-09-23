---
"@oberoncms/core": patch
"@oberoncms/plugin-development": patch
"@dev/playwright": patch
---

Run app E2E tests against production builds with deterministic seeded SQLite state, load shared and
local environment files consistently, keep credentials out of committed app defaults, normalize
framework query parameters, and make shared CMS persistence assertions resilient.
