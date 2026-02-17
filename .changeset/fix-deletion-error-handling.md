---
"@oberoncms/plugin-uploadthing": patch
"@oberoncms/plugin-flydrive": patch
---

Fix silent data loss in deleteImage operations. Previously, Promise.allSettled
silently swallowed errors from both storage and database deletions, causing
users to see success even when operations failed. Now properly handles errors by
collecting failures and throwing an AggregateError, ensuring users are aware of
partial failures that require admin intervention.
