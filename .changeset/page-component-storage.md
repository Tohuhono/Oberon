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
and publication metadata.

Breaking. Replace Page-specific Adapter capabilities, actions, and schemas with Component
operations. Update custom Plugins and action transports to use the new operations. `getComponent`
reads a record by key, and `listComponents` lists metadata by type. Use `updateComponent` in Plugins
and `publishComponent` in action transports.
