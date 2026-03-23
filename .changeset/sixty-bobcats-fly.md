---
"@dev/playwright": patch
"create-oberon-app": patch
---

Make the shared CMS Playwright suite explicit in `dev/playwright`, keep the
existing `@cms` lane as the shared authenticated behavior lane, and add a
separate playground `@tdd` config for red/green work.
