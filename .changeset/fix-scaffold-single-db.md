---
"create-oberon-app": patch
---

Fix e2e test creating multiple SQLite databases by pinning SQLITE_FILE to an
absolute path during scaffold build and start phases
