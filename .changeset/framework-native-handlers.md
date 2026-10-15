---
"@oberoncms/core": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-tanstack": minor
"create-oberon-app": patch
---

Move REST route projection from core into the Next.js and TanStack Framework integrations. Each
integration now exports a native `createRestHandler(adapter)` factory, while the Adapter retains the
framework-neutral Plugin HTTP dispatch capability.
