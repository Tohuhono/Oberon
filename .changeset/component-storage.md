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
Pages and Shared components as typed component records and migrate existing Page records. Public
routes can use `adapter.getPage` and `RenderPage` to check for missing Pages before rendering and
resolve Shared components without reading the Page twice.

Breaking: replace Page-specific Adapter capabilities, actions, and schemas with component record
operations. Update custom Plugins and action transports to use the new operations.

`getComponent` reads by unique key, and `listComponents` lists metadata by type. Writes validate
references and reconcile Tailwind style assets in a database transaction. Plugins can use
`onComponentChange` to invalidate cached content after the transaction commits. Page and Shared
component drafts keep their base publication timestamp to detect conflicting edits.

The migrations move existing Page records into the `components` table. SQLite bootstrap converts
their timestamps to milliseconds.

Apply component migrations to Pages and Shared components in one transaction with the Site version
update. A failed transform leaves content and migration versions available for a retry.
