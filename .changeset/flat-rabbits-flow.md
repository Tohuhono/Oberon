---
"create-oberon-app": patch
---

Stabilize Verdaccio provenance tests by writing Verdaccio HTTP logs to the
mounted `/logs/verdaccio.log` path, clearing stale local
`.playwright/logs/*.log` files before each container run, and making
metadata/proxy log assertions tolerant to quote/method formatting differences
while preserving fallback/proxy guarantees.
