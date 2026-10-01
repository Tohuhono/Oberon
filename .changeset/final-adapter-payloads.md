---
"@oberon/docs": patch
"@oberon/newground": patch
"@oberon/playground": patch
"@oberon/recipe-nextjs": patch
"@oberoncms/core": minor
"@oberoncms/sqlite": minor
"@oberoncms/plugin-flydrive": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-tanstack": minor
"@oberoncms/plugin-uploadthing": minor
---

Use one final Adapter throughout Plugin composition. Adapter hooks now receive a late-bound
`getAdapter` function and object-shaped method payloads, while the Adapter exposes reusable `can`,
`will`, and `whoWill` authorization capabilities for action orchestration. Framework action bridges
now validate every action through an independently evolvable schema, including explicit undefined
schemas for actions that currently have no payload.
