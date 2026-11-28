---
"@oberoncms/core": minor
"@oberoncms/sqlite": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-turso": minor
"create-oberon-app": minor
---

Add a Shared components library so authors can reuse published trees with per-instance props and
slots. Shared components use the `shared` Component type. Publication validates references and
cycles, and blocks deletion while a published Component uses the Shared component. Editors and
public routes render instances from the current published Shared component. Tailwind style assets
include styles from Shared components and content owned by their instances.

Component transactions keep publication, derived styles, and data migrations consistent. Revision
checks protect published data from stale drafts. SQLite bootstrap converts existing publication
timestamps to milliseconds for revision checks.
