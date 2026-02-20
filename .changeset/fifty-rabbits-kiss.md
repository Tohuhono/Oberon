---
"@dev/scripts": patch
---

Improve changed package detection by validating the Turbo base ref and failing
with clear errors for missing, invalid, empty, or non-JSON dry-run output.
Update the changed-packages CI workflow to avoid masking script failures and
validate missing base input early.
