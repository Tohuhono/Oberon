---
"@dev/playwright": patch
---

Remove stale changesets that still referenced `@dev/test` after the package
rename to `@dev/playwright`.

This unblocks `changesets/action` from failing during `changeset version` when
it validates pending changeset package names.
