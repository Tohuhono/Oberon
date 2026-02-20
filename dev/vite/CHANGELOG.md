# @dev/vite

## 0.1.2

### Patch Changes

- fbad025: Align workspace task/config setup for consistent Turbo `test` and
  `tsc` behavior.
  - add missing `scripts`, `eslint.config.mjs`, and `tsconfig.json` in
    `@dev/vitest`
  - normalize root `tsc` and `test` scripts (`--concurrency 50`, remove
    `tsc:root`)
  - tighten root and package TypeScript include patterns for config packages
  - add explicit empty outputs for Turbo `test` and `lint` tasks

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
