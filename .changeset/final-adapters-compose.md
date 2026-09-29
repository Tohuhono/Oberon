---
"@oberoncms/core": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-flydrive": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-tanstack": minor
"@oberoncms/plugin-turso": minor
"@oberoncms/plugin-uploadthing": minor
"create-oberon-app": minor
---

Migrate Plugins to declarative phase-based definitions. Adapter hooks now initialize with the final
composed adapter and preceding implementation, then receive the original method arguments. Bootstrap
hooks run sequentially with `{ adapter }`, Handler factories receive the final augmented Adapter,
and framework action entrypoints validate input before authorized actions call Adapter methods.
