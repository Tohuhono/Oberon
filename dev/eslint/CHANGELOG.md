# @dev/eslint

## 0.1.2

### Patch Changes

- 138dc59: Refine Playwright CMS E2E fixture architecture and route Next/React
  lint rules away from Playwright spec files.

## 0.1.1

### Patch Changes

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@dev/eslint`, `@dev/typescript`, and `@dev/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@dev/scripts` and keep only the `odt` tooling
    export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@dev/vite` to source export + typecheck-only workflow
