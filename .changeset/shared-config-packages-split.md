---
"@config/scripts": patch
"@config/eslint": patch
"@config/typescript": patch
"@config/vite": patch
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

- add `@config/eslint`, `@config/typescript`, and `@config/vite`
- move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
  those packages
- replace `@tohuhono/dev` with `@config/scripts` and keep only the `odt` tooling
  export
- modernize package `exports` maps with explicit `types`/`default` conditions
- simplify `@config/vite` to source export + typecheck-only workflow
