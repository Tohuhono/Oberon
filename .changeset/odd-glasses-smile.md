---
"@oberon/docs": patch
"create-oberon-app": patch
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
---

Remove remaining Auth.js/NextAuth coupling from core and database plugins, keep
the auth contract ready for Better Auth, and align docs with the current auth
model.
