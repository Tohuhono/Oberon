---
"@oberoncms/sqlite": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-turso": minor
---

Upgrade Drizzle ORM and Kit to 1.0.0-rc.6. Convert the existing migration histories to the v1 folder
format and preserve their SQL and the Page storage schema. Generate migrations from each database
Plugin's schema entry point and store them with the Plugin that applies them.
