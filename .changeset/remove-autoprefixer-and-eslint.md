---
"@oberon/playground": patch
"@oberon/rich-text-demo": patch
"@oberon/recipe-nextjs": patch
"@tohuhono/dev": patch
"@oberoncms/core": patch
"@tohuhono/ui": patch
---

Remove usage of autoprefixer from PostCSS configs and package devDependencies.
Also includes related fixes:

- Remove `autoprefixer` plugin entries from PostCSS configs in the playground,
  rich-text-demo and recipe-nextjs.
- Remove `autoprefixer` devDependency entries from the affected packages.
- ESLint flat-config fixes (avoid spreading plugin exports; add
  `settings.react.version = "detect"`).
- Tailwind/PostCSS adjustments and replacement of unsupported
  `@apply border-border` with explicit `border-color` CSS.

This is a small, non-breaking patch to clean up CSS build-time config and linter
config.
