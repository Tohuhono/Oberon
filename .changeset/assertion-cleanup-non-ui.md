---
"@oberoncms/core": patch
"@oberoncms/sqlite": patch
"@oberoncms/plugin-flydrive": patch
"@tohuhono/puck-blocks": patch
"create-oberon-app": patch
---

Add a monorepo assertion-safety lint rule and remove type assertion usage across
non-UI packages.

- Added `@typescript-eslint/consistent-type-assertions` to shared ESLint config
  to discourage `as`/angle-bracket assertions.
- Replaced non-UI assertion sites with structural typing, runtime guards, and
  typed locals in core, sqlite, flydrive, puck-blocks, puck-rich-text, and
  create-oberon-app.
- Kept behavior consistent while improving type correctness around server action
  unwrapping, JSON parsing, and runtime value narrowing.
