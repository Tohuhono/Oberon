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

Simplify local e2e publishing by using root recursive workspace publish to
Verdaccio and removing extra setup complexity. Also remove package-level
provenance defaults from publish configs so local recursive publish works in
non-CI environments, while release provenance remains controlled by CI
environment settings.
