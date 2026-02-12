---
"@tohuhono/ui": patch
"@oberoncms/core": patch
"@tohuhono/puck-rich-text": patch
---

Migrate shared shadcn-based UI primitives from Radix component packages to Base
UI.

- Ported `avatar`, `button`, `checkbox`, `dialog`, `dropdown-menu`, `form`,
  `input-otp`, `label`, `navigation-menu`, `popover`, `radio-group`,
  `scroll-area`, `select`, `separator`, `switch`, `toast`, `tooltip`, and
  related integrations to Base UI while preserving local styling/structure.
- Added compatibility shims for legacy `asChild` and `delayDuration` usage in
  existing consumers.
- Updated UI package dependencies and applied a small core typing compatibility
  update for select change handlers.
- Migrated the rich text toolbar dropdown menu internals from Radix to Base UI
  while preserving the existing local styling pattern.
