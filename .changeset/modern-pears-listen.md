---
"@tohuhono/ui": patch
---

Fix theme editor style injection to avoid passing non-boolean `jsx`/`global`
attributes to the DOM under Next.js 16 + Turbopack.
