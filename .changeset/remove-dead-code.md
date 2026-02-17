---
"@oberon/docs": patch
"@oberon/recipe-nextjs": patch
---

Remove dead code: unused legacy Pages Router file, unused Welcome component
duplicate, and unused import. Add noUnusedLocals/noUnusedParameters to recipe
tsconfig to prevent future unused imports.
