---
"@oberoncms/core": patch
"@oberoncms/plugin-tailwind": patch
"@oberoncms/plugin-nextjs": patch
---

Export `pageTag` from core to create stable Page cache tags.

Hash Tailwind stylesheets from their CSS content and retain previous stylesheet URLs for cached
Pages.

Revalidate the affected Next.js Page's public, editor, and preview paths after creation,
publication, and deletion without expiring unrelated Page reads.
