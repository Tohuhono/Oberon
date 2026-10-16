---
"@oberoncms/plugin-tailwind": patch
"@oberoncms/plugin-nextjs": patch
---

Use the existing Page read hook, native TanStack middleware, and Vercel cache tagging in the
TanStack Playground. Keep the standard server entry and Nitro integration. Keep cache invalidation
local to the framework integration instead of exposing it on the Adapter.

Invalidate only the affected Page output after successful Page mutations. Retain immutable Tailwind
CSS assets so cached Pages can keep their existing styles without global invalidation. Keep the
TanStack Recipe and generic TanStack Plugin unchanged.

Test local publishing and immutable stylesheet behavior through shared authenticated CMS tests. Keep
preview smoke tests read-only; deployed publish invalidation remains unverified.

Revalidate the affected Next.js Page's editor and preview paths after publication, creation, and
deletion, alongside its public path. Keep individual Page reads out of the shared Page-list tag.
Cover editor reopening and Page recreation in shared browser tests.
