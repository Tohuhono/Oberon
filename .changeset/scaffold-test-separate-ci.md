---
"create-oberon-app": patch
---

Move scaffold e2e tests to a separate `test:scaffold` command and parallel CI
job, removing them from `pnpm check` to speed up the main validate pipeline.
