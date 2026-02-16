---
"create-oberon-app": patch
---

Use pnpm-native command execution in repository automation.

- replace `npx turbo` with `pnpm exec turbo` in changed-package script
- replace workflow `npx vercel` usage with pnpm-based execution
