---
"create-oberon-app": patch
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-pgsql": patch
"@oberoncms/plugin-turso": patch
"@oberoncms/plugin-uploadthing": patch
"@tohuhono/puck-blocks": patch
"@tohuhono/ui": patch
"@tohuhono/utils": patch
---

Standardize unit test scripts by introducing `test:unit` and making `test` call
`test:unit`.

- rename direct unit test command from `test` to `test:unit`
- keep `test` as the entrypoint by delegating to `pnpm test:unit`
- preserve existing e2e-oriented test scripts
