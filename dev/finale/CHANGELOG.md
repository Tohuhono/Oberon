# @dev/final

## 0.1.0

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
