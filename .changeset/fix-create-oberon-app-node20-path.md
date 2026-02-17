---
"create-oberon-app": patch
---

Fix a Node.js compatibility issue in the scaffolder by resolving template/plugin
paths from `import.meta.url` instead of `import.meta.dirname`, preventing
crashes on older Node 20.x versions during plugin selection.
