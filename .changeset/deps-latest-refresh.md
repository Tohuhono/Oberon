---
"create-oberon-app": patch
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
"@oberoncms/plugin-uploadthing": patch
"@tohuhono/puck-blocks": patch
"@tohuhono/ui": patch
"@tohuhono/utils": patch
---

Refresh workspace dependencies to latest available versions with pnpm recursive
update.

Notable upgrades requiring follow-up migration work:

- `flydrive` to v2
- `react-dropzone` to v15
- `@vercel/postgres` remains deprecated upstream

Stability pins retained:

- `eslint`/`@eslint/js` pinned to v9 for plugin compatibility
- `@types/node` pinned to `24.10.1` for current Node 24 usage
