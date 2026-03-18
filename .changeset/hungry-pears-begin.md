---
"create-oberon-app": patch
"@tohuhono/utils": patch
---

Replace the legacy create-oberon-app e2e lane with a Podman-based `test:coa`
flow that builds a dedicated runner image (`podman build` with cacheable
layers), starts Verdaccio for the full container lifetime, publishes workspace
packages to that registry, scaffolds via `pnpm dlx create-oberon-app`, and runs
the smoke test against the generated app.

Keep workspace files unmounted while mounting only a named pnpm store volume for
faster repeated dependency resolution across runs, and reset Verdaccio storage
at startup so the local registry is always clean and same-version workspace
packages can be republished each e2e run.

Add `@tohuhono/utils/exec-async` and `@tohuhono/utils/wait-for-server` helper
exports and use them in the COA global setup harness.
