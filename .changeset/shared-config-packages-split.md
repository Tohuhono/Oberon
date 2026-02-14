---
"@tohuhono/scripts": patch
"@tohuhono/eslint-config": patch
"@tohuhono/tailwind-config": patch
"@tohuhono/typescript-config": patch
"@tohuhono/vite-config": patch
"@tohuhono/ui": patch
"@tohuhono/utils": patch
"@tohuhono/puck-blocks": patch
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
"@oberoncms/plugin-uploadthing": patch
"@oberoncms/plugin-vercel-postgres": patch
"create-oberon-app": patch
---

Split shared repo configs into dedicated internal packages and migrate all
consumers:

- add `@tohuhono/eslint-config`, `@tohuhono/typescript-config`,
  `@tohuhono/tailwind-config`, and `@tohuhono/vite-config`
- move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
  those packages
- replace `@tohuhono/dev` with `@tohuhono/scripts` and keep only the `odt`
  tooling export
- modernize package `exports` maps with explicit `types`/`default` conditions
- simplify `@tohuhono/vite-config` to source export + typecheck-only workflow
