# @config/vite

## 0.1.1

### Patch Changes

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@config/eslint`, `@config/typescript`, and `@config/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@config/scripts` and keep only the `odt`
    tooling export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@config/vite` to source export + typecheck-only workflow
