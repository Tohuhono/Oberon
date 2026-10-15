---
"@oberoncms/core": minor
"@oberoncms/plugin-tailwind": patch
"@oberon/newground": patch
"@oberon/docs": patch
"@dev/playwright": patch
---

Add a permission-checked Page resolution hook and global or selective cache invalidation through the
Adapter. Use native TanStack middleware and Vercel cache tagging in the TanStack Playground. Keep
the standard server entry and Nitro integration.

Invalidate Page output after successful Page mutations. Invalidate all public Page output when the
global Tailwind stylesheet changes, without purging immutable CSS assets. Keep the TanStack Recipe
and generic TanStack Plugin unchanged.

Test local publishing and immutable stylesheet behavior through shared authenticated CMS tests. Keep
preview smoke tests read-only; deployed publish invalidation remains unverified.
