---
"@dev/playwright": patch
"create-oberon-app": patch
---

Make the shared CMS Playwright suite explicit in `dev/playwright`, keep the
existing `@cms` lane as the shared authenticated behavior lane, add a real
playground `@tdd` suite for red/green work, expose dedicated TDD UI commands,
keep opt-in `@tdd` specs separate from shared CMS contract specs, and document
the canonical root validation, completion gate, and grep workflow for agents.
