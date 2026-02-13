---
"@tohuhono/puck-rich-text": patch
---

Downgrade `jsdom` to `26.x` to avoid Vercel SSR runtime failures caused by
`jsdom@27` transitive ESM/CJS incompatibilities
(`html-encoding-sniffer`/`@exodus/bytes`).
