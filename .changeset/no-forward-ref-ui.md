---
"@tohuhono/ui": patch
---

Adopt React 19 ref-as-prop patterns across UI components by removing
`forwardRef` wrappers.

- Replaced `forwardRef` usage in component wrappers with plain function
  components.
- Updated component prop types to `ComponentPropsWithRef<...>` where refs should
  be accepted.
- Kept runtime behavior and component structure intact while simplifying the
  public API surface.
