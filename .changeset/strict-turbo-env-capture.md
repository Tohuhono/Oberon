---
"@oberon/docs": patch
"@oberon/playground": patch
---

Switch Turbo from loose to strict env handling and explicitly model runtime env
dependencies.

- set `envMode` to `strict`
- scope task `env` allowlists to app packages only (`apps/playground`,
  `apps/documentation`)
- keep root turbo tasks env-agnostic so non-app packages are not invalidated by
  app env changes
- remove redundant task-level `CI` declarations (covered by root `globalEnv`)
- narrow app `build` env hashing to currently wired env dependencies to reduce
  unnecessary cache misses
- keep test task env minimal while allowing required Playwright vars
- expand env file hashing for app build inputs with package-local `.env*`
