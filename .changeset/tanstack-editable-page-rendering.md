---
"@oberoncms/plugin-tanstack": minor
"@oberoncms/core": patch
"@oberon/newground": patch
"@dev/playwright": patch
---

Add optional Nitro-managed Page output caching and invalidate rendered output after content changes.
Render editable Pages in the TanStack Playground through Oberon's React server component instead of
immutable prerendered files. Shared cache storage remains unconfigured.

Keep Page creation, copying, and deletion pending until the mutation and route refresh finish.

Add shared browser regressions for publishing the existing homepage, deleting and recreating Pages,
slow Page creation, and rendering without JavaScript.
