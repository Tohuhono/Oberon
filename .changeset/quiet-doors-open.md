---
"@oberoncms/core": minor
"@oberoncms/plugin-nextjs": minor
"@tohuhono/ui": minor
"create-oberon-app": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-uploadthing": patch
"@dev/vite": patch
"@oberon/recipe-nextjs": patch
---

Remove Next.js from `@oberoncms/core`. The Next.js integration now provides the Next-specific server
and client framework capabilities, while shared UI Link and Image providers keep core rendering
framework-neutral. Updated the Next recipe and create-oberon-app wiring for the new runtime shape,
and moved handler boundaries to standard `Request` types where needed.
