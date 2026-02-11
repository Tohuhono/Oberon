---
"@oberon/playground": patch
---

Migrate playground global stylesheet to Tailwind CSS v4 entry directives
(`@import "tailwindcss"` + `@config`) so theme token utilities continue to
resolve and runtime theme variable updates apply correctly.
