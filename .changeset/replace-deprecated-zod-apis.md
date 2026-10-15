---
"@oberoncms/core": patch
"create-oberon-app": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-nextjs": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-tailwind": patch
"@oberoncms/plugin-tanstack": patch
"@oberoncms/plugin-turso": patch
"@tohuhono/puck-blocks": patch
"@tohuhono/ui": patch
"@tohuhono/utils": patch
---

Replace deprecated Zod APIs while preserving email validation, installer feedback, and arbitrary
Page data fields.

Refresh direct dependencies to their latest releases.

Clean up seeded Pages and Users after failures. Make explicit development database resets invalidate
bootstrap and dependent build caches without changing normal bootstrap behavior or shared workflow
cache keys.
