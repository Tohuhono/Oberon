---
"@oberoncms/core": patch
---

Fix unsafe permission dictionary access in hasPermission() that caused silent
failures when actions are undefined for a role. The function now explicitly
checks for undefined actions and returns false (deny permission) instead of
allowing undefined comparisons.
