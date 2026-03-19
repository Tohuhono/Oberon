---
"create-oberon-app": patch
"@dev/playwright": patch
"@oberoncms/core": patch
---

Implement issue #294 E2E auth lane workflow with shared Playwright auth helpers,
add COA login/provenance lane coverage and UI test commands, and fix email
callback/session handling required for deterministic UI sign-in completion.
