---
"@oberon/docs": patch
"create-oberon-app": patch
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
---

Remove remaining Auth.js/NextAuth coupling from core and database plugins,
standardize user-table methods under auth adapters for sqlite and pgsql, and
align docs with the current auth model, including reducing auth user schemas to
active columns only.
