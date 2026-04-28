# @oberoncms/testing

## 0.2.0

### Minor Changes

- 20820f4: Promote the repo to the Better Auth model across core packages,
  plugins, docs, recipes, and app scaffolds.

  This release removes remaining Auth.js/NextAuth assumptions, standardizes auth
  adapter expectations, and aligns setup guidance around Better Auth as the
  supported path.

  Risks and implications:
  - Integrations still relying on Auth.js/NextAuth-specific behavior may require
    configuration and implementation updates.
  - Auth adapter implementations must match the updated user-table/auth contract
    expectations across sqlite and pgsql paths.
  - Existing user schemas with provider-specific fields may need to be reduced
    or remapped to the active Better Auth model.
  - Environment variables, callback handling, and session/user lifecycle
    behavior should be reviewed during upgrade to avoid auth regressions.

  Treat this as a coordinated upgrade across core, plugins, recipes, and app
  scaffolds rather than a piecemeal patch.

### Patch Changes

- Updated dependencies [20820f4]
- Updated dependencies [fb4d240]
  - @dev/vitest@0.2.0
  - @oberoncms/core@0.19.0
  - @oberoncms/sqlite@0.8.0

## 0.1.2

### Patch Changes

- Updated dependencies [ad993d0]
- Updated dependencies [0e72818]
- Updated dependencies [6e8ba23]
  - @oberoncms/core@0.18.1
  - @oberoncms/sqlite@0.7.7

## 0.1.1

### Patch Changes

- Updated dependencies [a73560b]
- Updated dependencies [8109ea8]
- Updated dependencies [b654991]
- Updated dependencies [8109ea8]
- Updated dependencies [a4578f6]
- Updated dependencies [a011a89]
- Updated dependencies [28aa7e5]
- Updated dependencies [48de893]
- Updated dependencies [aa5371a]
- Updated dependencies [36a3b7e]
- Updated dependencies [237d393]
  - @oberoncms/core@0.18.0
  - @oberoncms/sqlite@0.7.6
