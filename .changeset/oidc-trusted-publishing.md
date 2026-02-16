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

Migrate package publishing to npm trusted publishing with GitHub OIDC.

- update release workflow permissions for OIDC token exchange
- remove static `NPM_TOKEN` usage from publish job
- enable npm provenance in CI and package publish metadata
