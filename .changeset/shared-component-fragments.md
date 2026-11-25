---
"@oberoncms/core": minor
"@oberoncms/sqlite": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-tanstack": minor
"@oberoncms/plugin-turso": minor
"create-oberon-app": minor
---

Add a Shared components library so authors can reuse published trees with per-instance values. Store
Pages and Shared components as typed Fragments and migrate existing Page records. Public routes can
use `getPage` and `RenderPage` from `initOberon` to check for missing Pages before rendering and
resolve Shared components without reading the Page twice.

Breaking: replace Page-specific Adapter capabilities, actions, and schemas with their Fragment
equivalents. Update custom Plugins and action transports to use the typed Fragment operations.

Fragment reads use the unique key. Fragment writes validate references inside a database
transaction, and Plugins can use `onFragmentChange` to react after the transaction commits. Page and
Shared component drafts keep their base publication timestamp to detect conflicting edits.

The Fragment migrations preserve Page records and convert their SQLite timestamps to milliseconds.

Apply component migrations to Pages and Shared components in one transaction with the Site version
update. A failed transform leaves content and migration versions available for a retry.
