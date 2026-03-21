## Essentials

This is the OberonCMS monorepo for the CMS core, plugins, documentation, website
and create-oberon-app script

- CRITICAL: Read [package.json](./package.json)
- CRITICAL: Read [ARCHITECTURE](.agents/ARCHITECTURE.md) before planning
- CRITICAL: Read [CODESTYLE](.agents/ARCHITECTURE.md) before any edits

# Pnpm and life cycle

- Prefer `pnpm` commands configured in base package.json - these use turborepo
  to correctly manage and cache dependancies
- Avoid filtering or otherwise targeting specfic packages (--filter, --dir)
- Use `pnpm check` to run lint, typecheck, build and tests which is cached for
  efficiency

# Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [design and archetectur](.agents/ARCHITECTURE.md)
- [common patterns and conventions](.agents/CONVENTIONS.md)
- [testing strategy and scope](.agents/TESTING.md)
