---
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-development": patch
"@oberoncms/plugin-flydrive": patch
"@oberoncms/plugin-turso": patch
"@oberoncms/plugin-uploadthing": patch
"@tohuhono/puck-rich-text": patch
"@tohuhono/puck-blocks": patch
---

Migrate Puck dependencies and imports from `@measured/puck` to
`@puckeditor/core` and bump to the `0.21.x` line.

Aligned CSS and import paths with the new package namespace and validated
workspace check/build after migration.
