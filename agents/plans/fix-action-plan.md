# Fix Action Plan

> See [critical-code-review.md](./critical-code-review.md) for detailed analysis

Fix the next single issue; mark complete after PR merged.

For each issue:

- Follow plan mode workflow as a senior developer
- Verify that the analysis is correct
- Review recent github issues, release notes and documentation for imported
  packages where relevant
- Ensure alignment with architecture, codestyle, and conventions

---

## Phase 1: P0 - Production Blockers 🔴

- [x] **1.1** Fix infinite loop -
      [Review #1](./critical-code-review.md#1-infinite-loop-can-hang-application)
      `packages/plugins/flydrive/src/internal/get-image-size.ts`

- [x] **1.2** Add memory limits to stream -
      [Review #2](./critical-code-review.md#2-unbounded-memory-consumption-in-stream-processing)
      `packages/plugins/uploadthing/src/uploadthing/get-image-size.ts`

- [ ] **1.3** Fix unsafe permission lookups -
      [Review #3](./critical-code-review.md#3-unsafe-permission-dictionary-access)
      `packages/oberoncms/core/src/adapter/init-plugins.ts:41-42`

- [ ] **1.4** Validate user role at runtime -
      [Review #4](./critical-code-review.md#4-runtime-crash-on-invalid-user-role)
      `packages/oberoncms/core/src/adapter/init-plugins.ts:35-43`

- [ ] **1.5** Fix silent data loss in deletions -
      [Review #5](./critical-code-review.md#5-silent-data-loss-in-file-deletion)
      `packages/plugins/uploadthing/src/uploadthing/plugin.ts:14-18`
      `packages/plugins/flydrive/src/internal/plugin.ts`

- [ ] **1.6** Fix DB connection pool leak -
      [Review #8](./critical-code-review.md#8-database-connection-pool-leak)
      `packages/plugins/pgsql/src/db/client.ts`

- [ ] **1.7** Fix async reduce type error -
      [Review #6](./critical-code-review.md#6-broken-async-reduce---type-error)
      `packages/oberoncms/core/src/adapter/transforms.ts:43-53`

- [ ] **1.8** Add migration concurrency limits -
      [Review #7](./critical-code-review.md#7-race-condition-on-migration-execution)
      `packages/oberoncms/core/src/adapter/transforms.ts:109-130`

- [ ] **1.9** Fix stack overflow in queue -
      [Review #9](./critical-code-review.md#9-stack-overflow-in-queue-wait)
      `packages/tohuhono/utils/src/promise-queue.ts:51-55`

---

## Phase 2: P1 - High Priority 🟠

- [ ] **2.1** Validate callback URLs -
      [Review #10](./critical-code-review.md#10-open-redirect-vulnerability)
      `packages/oberoncms/core/src/auth/next-auth.ts:46-48`

- [ ] **2.2** Add DB error handling -
      [Review #11](./critical-code-review.md#11-no-input-validation-on-database-operations)
      `packages/oberoncms/sqlite/src/db/database-adapter.ts`

- [ ] **2.3** Fix path traversal risk -
      [Review #12](./critical-code-review.md#12-path-traversal-risk-in-page-keys)
      `packages/oberoncms/core/src/lib/dtd.ts:78-82`

- [ ] **2.4** Fix site config race condition -
      [Review #13](./critical-code-review.md#13-race-condition-on-site-config-creation)
      `packages/oberoncms/core/src/adapter/init-adapter.ts:173-181`

- [ ] **2.5** Improve batch error reporting -
      [Review #14](./critical-code-review.md#14-silent-error-suppression)
      `packages/oberoncms/core/src/adapter/export-tailwind-clases.ts:48-51`

- [ ] **2.6** Add React error boundaries -
      [Review #19](./critical-code-review.md#19-no-error-boundaries-in-react-components)

- [ ] **2.7** Implement resilience patterns -
      [Review #20](./critical-code-review.md#20-missing-resilience-patterns)

---

## Phase 3: P2 - Quality Improvements 🟡

- [ ] **3.1** Set up testing framework -
      [Review #15](./critical-code-review.md#15-virtually-non-existent-test-suite)

- [ ] **3.2** Write unit tests for core logic -
      [Review #15](./critical-code-review.md#15-virtually-non-existent-test-suite)

- [ ] **3.3** Write integration tests

- [ ] **3.4** Write e2e tests

- [ ] **3.5** Resolve TODO comments -
      [Review #16](./critical-code-review.md#16-23-todo-comments-indicating-incomplete-features)

- [ ] **3.6** Replace `any` types -
      [Review #17](./critical-code-review.md#17-type-safety-defeated-by-any)

- [ ] **3.7** Fix N+1 queries -
      [Review #18](./critical-code-review.md#18-n1-query-pattern)

- [ ] **3.8** Add input validation -
      [Review](./critical-code-review.md#input-validation-gaps)

**Progress**: 2/24 complete
