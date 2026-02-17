# Critical Code Review: Oberon CMS

## Context

AI in the role of a Senior developer code review of the Oberon CMS monorepo.
This review identifies critical bugs, architectural flaws, missing edge cases,
and security vulnerabilities that should be addressed before production
deployment.

---

## 🔴 CRITICAL ISSUES - Production Blockers

### 1. **Infinite Loop Can Hang Application**

**File**: `packages/plugins/flydrive/src/internal/get-image-size.ts:9-21`

```typescript
while (true) {
  try {
    const { width, height } = imageSize(image)
    if (width && height) return { width, height }
    return defaultSize
  } catch (error) {
    // Loops forever if imageSize keeps throwing
  }
}
```

**Impact**: Image upload processing can hang indefinitely if image size cannot
be determined. No timeout, no exit condition, no max retries.

---

### 2. **Unbounded Memory Consumption in Stream Processing**

**File**: `packages/plugins/uploadthing/src/uploadthing/get-image-size.ts:10-33`

```typescript
const chunks: Uint8Array[] = []
while (true) {
  const { done, value } = await reader.read()
  if (done) return defaultSize
  chunks.push(value) // NO SIZE LIMIT
  const image = Buffer.concat(chunks)
  // ... attempts to get size from partial data
}
```

**Impact**: Uploading a large image causes unbounded memory accumulation. A
500MB image will attempt to load entirely into memory before determining size.
**Guaranteed OOM crash** on large uploads.

---

### 3. **Unsafe Permission Dictionary Access**

**File**: `packages/oberoncms/core/src/adapter/init-plugins.ts:41-42`

```typescript
return (
  permissions[role][action] === permission ||
  permissions[role][action] === "write"
)
```

**Issues**:

- No null checks on nested property access
- If `action` doesn't exist in `permissions[role]`, returns `undefined`
- Silent permission check failures
- Type system allows `AdapterActionGroup` ("all" | "users" | "images" | "pages"
  | "site") but permissions only defines 3 of 5
- If plugin adds "users" action but permissions doesn't define it:
  `undefined === "write"` = silent failure

**Example**: User thinks they have permission when they don't, or vice versa.

---

### 4. **Runtime Crash on Invalid User Role**

**File**: `packages/oberoncms/core/src/adapter/init-plugins.ts:35-43`

```typescript
const role = user?.role || ("unauthenticated" as const)
if (role === "admin") return true

return (
  permissions[role][action] === permission || // ← CRASHES HERE
  permissions[role][action] === "write"
)
```

**Problem**: If `user.role` is something other than "user"/"admin" (due to
database corruption or bug), `permissions[unknownRole]` is `undefined`, causing
`TypeError: Cannot read property of undefined`.

**No validation** that user.role is in the allowed set.

---

### 5. **Silent Data Loss in File Deletion**

**File**: `packages/plugins/uploadthing/src/uploadthing/plugin.ts:14-18`

```typescript
adapter: {
  deleteImage: async (key) => {
    await Promise.allSettled([
      deleteImage(key),         // Always runs
      adapter.deleteImage(key), // Might fail permission check
    ])
  },
}
```

**Issues**:

- Uses `Promise.allSettled` which **swallows errors**
- Deletes from storage regardless of database permission check outcome
- If `adapter.deleteImage` fails, file still deleted from storage
- Orphans records or files depending on which fails
- Same pattern in flydrive plugin

---

### 6. **Broken Async Reduce - Type Error**

**File**: `packages/oberoncms/core/src/adapter/transforms.ts:43-53`

```typescript
zones: await Object.keys(data.zones || {}).reduce(async (acc, zoneKey) => {
  const zone = data.zones?.[zoneKey]
  if (!zone) return acc // ← Returns Promise, not object!
  return { ...acc, [zoneKey]: await Promise.all(zone.map(mapItem)) }
}, Promise.resolve({}))
```

**Bug**: The accumulator is a Promise, but the code spreads `...acc` assuming
it's an object. This will fail at runtime with type errors.

---

### 7. **Race Condition on Migration Execution**

**File**: `packages/oberoncms/core/src/adapter/transforms.ts:109-130`

```typescript
const migrations: Array<Promise<TransformResult>> = []

for (const { key } of pages) {
  const result = applyTransform(key, transforms, getPageData, updatePageData)
  migrations.push(result)
}

for await (const result of migrations) {
  yield result
}
```

**Issues**:

- Launches ALL migrations concurrently with no limit
- For 10,000 pages → 10,000 concurrent database operations
- Exhausts database connection pool
- No timeout per migration
- Error in one doesn't stop others (partial failure state)

---

### 8. **Database Connection Pool Leak**

**File**: `packages/plugins/pgsql/src/db/client.ts`

```typescript
const createRemoteClient = () => {
  if (!process.env.DATABASE_URL) throw new Error(...)
  return new Pool({ connectionString: process.env.DATABASE_URL })
}
export const db = drizzle(createRemoteClient(), { schema })
```

**Problem**: Creates a new Pool instance on every call. Multiple pools exhaust
database connections.

---

### 9. **Stack Overflow in Queue Wait**

**File**: `packages/tohuhono/utils/src/promise-queue.ts:51-55`

```typescript
export async function waitUntilIdle() {
  await enqueue(async () => {})
  if (isPending) {
    await waitUntilIdle() // Recursive - no depth limit
  }
}
```

**Impact**: Deep recursion on long-running queue can cause stack overflow.

---

## 🟠 HIGH SEVERITY ISSUES

### 10. **Open Redirect Vulnerability**

**File**: `packages/oberoncms/core/src/auth/next-auth.ts:46-48`

```typescript
const callbackUrl = new URL(
  withCallback.searchParams.get("callbackUrl") || "/cms",
)
```

**Risk**: User-controlled URL parameter used without validation. Potential open
redirect attack vector.

---

### 11. **No Input Validation on Database Operations**

**File**: `packages/oberoncms/sqlite/src/db/database-adapter.ts` (122 lines)

- Zero try-catch blocks
- All database operations unprotected
- No connection failure handling
- SQLite/Postgres timeout would throw uncaught exception
- No validation that PageData schema matches before storage

---

### 12. **Path Traversal Risk in Page Keys**

**File**: `packages/oberoncms/core/src/lib/dtd.ts:78-82`

```typescript
key: z
  .string()
  .regex(/^[0-9a-zA-Z_.-/]+$/, "Valid characters: 0-9 a-z A-Z -_./")
  .regex(/^(\/|\/[^/]+(\/[^/]+)*)$/, "Route segments cannot be empty"),
```

**Issues**:

- Allows dots (`.`) which could enable path traversal
- No maximum length (could store 10MB key)
- No normalization (`/a/b` vs `/a///b` treated differently)

---

### 13. **Race Condition on Site Config Creation**

**File**: `packages/oberoncms/core/src/adapter/init-adapter.ts:173-181`

```typescript
if (!site) {
  await adapter.updateSite({
    version: config.version,
    // ...
  })
}
```

**Problem**: Multiple concurrent `getConfig` calls can all see `!site` and
attempt updateSite simultaneously. Could create duplicate records or conflicts.

---

### 14. **Silent Error Suppression**

**File**: `packages/oberoncms/core/src/adapter/export-tailwind-clases.ts:48-51`

```typescript
for (const result of results) {
  if (result.status === "rejected") {
    throw result.reason // Only throws FIRST error
  }
}
```

**Problem**: If 50 pages fail to process, only the first error is shown.
Misleading about actual scope of failure.

---

## 🟡 MEDIUM SEVERITY ISSUES

### 15. **Virtually Non-Existent Test Suite**

**Coverage Analysis**:

- Only **1 test file** in entire monorepo:
  `packages/tohuhono/ui/src/components/button.spec.tsx`
- **Zero** unit tests for core business logic
- **Zero** integration tests
- **Zero** e2e tests
- Test runner configured in package.json but **no actual Jest/Vitest setup**

**Untested Critical Paths**:

- Auth adapter (160 lines) - 0 tests
- Database adapters (122 lines) - 0 tests
- Permission system - 0 tests
- API routing - 0 tests
- Transform migrations - 0 tests

---

### 16. **23 TODO Comments Indicating Incomplete Features**

Critical TODOs:

- `transforms.ts:1-2` - "Type system fundamentally broken"
- `uploadthing/file-router.ts:23` - "TODO getUser" (user info not captured)
- `uploadthing/file-router.ts:34` - "This code is unauthorised" (security
  comment)
- `sqlite/database-adapter.ts:117` - "TODO Validate using zod on insertion"
  (data validation missing)

---

### 17. **Type Safety Defeated by `any`**

**Locations**:

- `dtd.ts:21` - `Transforms = Array<(props: any) => any>`
- `transforms.ts:14,17,24` - Multiple any types
- Transform system uses any throughout, defeating TypeScript safety

---

### 18. **N+1 Query Pattern**

**File**: `packages/oberoncms/core/src/adapter/init-adapter.ts:108`

```typescript
const pages = await getAllPagesCached()
const results = applyTransforms({
  transforms,
  pages,
  getPageData: getPageDataCached, // Called separately for each page
  updatePageData,
})
```

For 100 pages → 100+ individual database calls instead of batch operations.

---

### 19. **No Error Boundaries in React Components**

- Zero React error boundary components
- Context access throws if missing (no fallback)
- Form errors thrown but not caught (`login.tsx:67`)
- User sees white screen on error

---

### 20. **Missing Resilience Patterns**

- **No retry logic** for transient failures
- **No circuit breaker** for database outages
- **No timeout handling** on external calls
- **No exponential backoff**
- Single database failure cascades to full application failure

---

## 🔍 MISSING EDGE CASES

### Critical Missing Test Cases:

1. **Empty database state** - What happens on first run?
2. **Concurrent modifications** - Two users editing same page
3. **Network timeouts** - Database, file uploads, auth emails all timeout
   unhandled
4. **Malformed data** - Invalid page/image data from database
5. **Invalid tokens** - Expired, malformed, or tampered verification tokens
6. **Missing env vars** - Production startup without required environment
   variables
7. **Large file uploads** - Streaming edge cases, memory limits
8. **Rapid requests** - Race conditions in async operations
9. **OAuth provider outages** - Auth flow failures
10. **Permission boundary cases** - Unknown roles, missing permissions, action
    conflicts

### Input Validation Gaps:

- No null checks on nested property access (12+ instances)
- No validation that dimensions are positive integers
- No min/max constraints on image dimensions
- No validation that email format is correct before sending
- No validation of plugin-provided data shapes

---

## 📊 SEVERITY SUMMARY

| Category                | Count   | Risk        |
| ----------------------- | ------- | ----------- |
| **Production Blockers** | 9       | 🔴 Critical |
| **High Severity**       | 6       | 🟠 High     |
| **Medium Severity**     | 6       | 🟡 Medium   |
| **Edge Cases Missing**  | 10+     | ⚠️          |
| **Total Issues**        | **31+** |             |

---

## 🎯 RECOMMENDED IMMEDIATE ACTIONS

### P0 - Fix Before Production:

1. ✅ Fix infinite loop in image size detection - add max retries
2. ✅ Add memory limits to stream processing - enforce 10MB cap
3. ✅ Fix unsafe permission lookups - add null checks + validation
4. ✅ Validate user.role at runtime - prevent crashes
5. ✅ Use Promise.all instead of allSettled in deletions
6. ✅ Fix database connection pooling - singleton pattern
7. ✅ Fix async reduce type errors in transforms
8. ✅ Add concurrency limits to migrations

### P1 - High Priority:

9. ✅ Add comprehensive error handling to database operations
10. ✅ Implement retry logic with exponential backoff
11. ✅ Add URL validation for redirects
12. ✅ Add React error boundaries
13. ✅ Fix path traversal risks in page keys
14. ✅ Implement circuit breaker pattern

### P2 - Medium Priority:

15. ✅ Write unit tests for core business logic (aim for >80% coverage)
16. ✅ Resolve all 23 TODO comments
17. ✅ Replace `any` types with proper types
18. ✅ Fix N+1 query patterns with batching
19. ✅ Add input validation framework (Zod on all boundaries)

---

## Unresolved Questions

None - the issues are clear and actionable.
