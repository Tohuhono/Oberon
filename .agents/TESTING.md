# Agent testing guidance

Use the public [contributor guide](../README.md#testing) for test commands and tools. Run lifecycle
commands from the repository root. Do not reconstruct package-level task graphs.

## Completion gate

- Run `pnpm validate` before declaring code or documentation complete or ready for review.
- Run `pnpm format` from the root without filters.
- Use existing root scripts for reproduction. Do not invoke runners directly or add manual package
  filters.
- If no root script covers the need, ask before adding or changing a script.
- Do not run `pnpm build` or `pnpm start` as a substitute for validation.

## Test scope

- Test framework-neutral logic and adapter contracts through public interfaces.
- Use browser tests for components, auth flows, framework routing, and CMS workflows.
- Do not export private helpers only for testing.
- Do not mock framework behavior to make it a unit test.
- Do not test library declarations, trivial re-exports, or type-only code.

Use `@oberoncms/testing` fixtures for adapter and plugin tests:

- `createAdapterTests(...)` for shared contract coverage.
- `createAdapterTest(test)` or `createPluginTest(test)` for additional cases.
- `createSqliteAdapterFactory(...)` when a disposable database is required.

## Unit tags

Prefer suite-level Vitest tags. Use `baseline` for existing tests, `ai` for agent-authored tests,
and `slow` for expensive tests. Add a task tag such as `issue-308` when useful. Tagged suites use
`initTestConfig()` from `@dev/vitest/config`. Keep provenance explicit in mixed files.

## Browser coverage

Shared CMS tests live in `dev/playwright/test/cms/`. Shared projects live in
`dev/playwright/projects.ts`; app configs select projects and server settings. Keep app-specific
configuration in those app configs.

- `@auth`: login setup.
- `@cms`: authenticated CMS behavior.
- `@login`: unauthenticated sign-in behavior.
- `@tdd`: CMS red/green coverage included by the authenticated project.
- `@smoke`: smoke coverage.

Use the root e2e command for the full app coverage. Do not pass a feature-only `--grep` to that
command: apps without matching tests can fail with "No tests found". The root `test:tdd` script
currently has no matching Playground package script, so it does not run the browser tests. Request a
root workflow change before relying on it.
