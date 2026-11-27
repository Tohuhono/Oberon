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

Store Pages as Component records of type `page`. Migrate existing Pages with their paths, Puck data,
and publication metadata. SQLite bootstrap converts their timestamps to milliseconds.

Breaking. Replace Page-specific Adapter capabilities, actions, and schemas with Component
operations. Update custom Plugins and action transports to use the new operations. `getComponent`
reads a record by key, and `listComponents` lists metadata by type. Public routes use
`adapter.getPage` and `RenderPage` to resolve a Page once.

Page drafts keep their base publication timestamp to detect conflicting edits. Component writes
reconcile Tailwind style assets in a database transaction. Plugins can invalidate caches with
`onComponentChange` after the transaction commits. Component data migrations and Site version
updates commit together, so a failed transform can be retried.
