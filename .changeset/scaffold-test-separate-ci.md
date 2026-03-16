---
"create-oberon-app": patch
---

Move all e2e tests to a separate parallel CI job, removing them from
`pnpm check` to speed up the main validate pipeline.
