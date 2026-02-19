---
"@oberoncms/core": patch
---

Add Vitest unit testing infrastructure

- `@config/vitest` shared package with `initTestConfig()` helper
- `vitest.config.ts` + `test` script added to all packages and apps
- `tsconfig.test.json` at root for standalone type-checking of test files
- Relaxed ESLint rules for `*.test.ts` files (`no-explicit-any`,
  `no-non-null-assertion`, type assertions)
- Replace Jest CI workflow with Vitest (`pnpm test`)
- `agents/TESTING.md` documents testing strategy and scope
- First test: `packages/oberoncms/core/src/adapter/transforms.test.ts` (9 tests)
