---
"@oberoncms/plugin-tanstack": patch
"@oberoncms/core": minor
"@oberon/newground": patch
"@oberon/playground": patch
"@oberon/recipe-nextjs": patch
"@oberon/docs": patch
"@dev/playwright": patch
---

Render editable Pages in the TanStack Playground through Oberon's React server component. Serve
editable Pages at request time instead of generating immutable prerendered files.

Add `resolvePath` to the action handler to check Page permissions and resolve missing Pages before
rendering. Include it in the server action contract and reuse the existing app actions in public
routes. Change `Render` to accept only `data` and `config`. Use static imports in the TanStack
public route.

Keep Page creation, copying, and deletion pending until the mutation and route refresh finish.

Use Better Auth's official TanStack Start cookie integration instead of a custom cookie bridge.

Add shared browser regressions for publishing the existing homepage, deleting and recreating Pages,
slow Page creation, and rendering without JavaScript.
