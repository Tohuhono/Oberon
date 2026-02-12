---
"@oberon/docs": patch
"@oberon/playground": patch
"@oberon/rich-text-demo": patch
---

Declare `engines.node` in app manifests so Vercel uses Node 24+, matching the
workspace runtime and avoiding `jsdom` ESM/CJS runtime errors in server bundles.
