---
"@oberoncms/core": patch
"@oberoncms/plugin-development": patch
"create-oberon-app": patch
---

Separate generated Tailwind artifacts into `.oberon/tailwind`, move the
development SQLite database into `.oberon/db`, align the recipe and scaffold
test container with the new paths, and tighten shared Turbo and Vitest defaults
for more stable local and CI runs.
