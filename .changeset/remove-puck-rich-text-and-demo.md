---
"@oberon/docs": patch
"@oberon/recipe-nextjs": patch
"@tohuhono/puck-blocks": patch
---

Remove the deprecated `@tohuhono/puck-rich-text` package and the
`rich-text-demo` app from the monorepo.

Also remove direct runtime/dependency references and switch `puck-blocks`
example text rendering to native `richtext` fields. Also remove stale CI
deploy/promote workflow jobs and quick-start references for the removed demo.
