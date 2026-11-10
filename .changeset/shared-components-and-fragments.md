---
"@oberoncms/core": minor
"@oberoncms/sqlite": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-turso": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-tanstack": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-shared-components": minor
---

Add a Fragment-backed Shared components library, source editor, Exposed props, and instance-owned
slots. Preserve shared references in nested content, seed independent insertion defaults, and update
published shared design without republishing consumer Pages.

Replace Page storage operations with typed Fragment operations. Migrate existing Pages without
changing their keys, data, authors, or update times. Add atomic record and reference-graph guards,
typed routing, content preparation, source deletion protection, and publication effects across both
Playgrounds.

Keep the existing editor design language. Add source and instance controls, library search, metadata
history, browser-local drafts, conflict messages, read-only views, and regression coverage.
