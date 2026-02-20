---
"@dev/scripts": patch
---

Simplify changed package detection to a minimal fail-loud script that directly
runs Turbo dry-run JSON output and prints the `packages` array. Update the
changed-packages workflow step to call the script inline and fail immediately
when Turbo or Git ref resolution fails.
