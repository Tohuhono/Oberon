---
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
"@oberoncms/plugin-vercel-postgres": patch
"@oberoncms/sqlite": patch
---

Include root `*.config.ts` files in package TypeScript configs so config files
are typechecked.

Also update drizzle config typing to the current `drizzle-kit` `dialect` field
to keep checks passing.
