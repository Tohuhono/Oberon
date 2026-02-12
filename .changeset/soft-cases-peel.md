---
"@tohuhono/ui": patch
"@tohuhono/utils": patch
---

Remove UI type assertions for Base UI class names and keep type-safety intact.

- Replaced `as` assertions in `@tohuhono/ui` components with structural typing
  and runtime guards.
- Updated button/form/toaster internals to avoid unsafe assertions while
  preserving behavior.
- Enhanced `cn` in `@tohuhono/utils` to support state-based className functions
  used by Base UI primitives.
