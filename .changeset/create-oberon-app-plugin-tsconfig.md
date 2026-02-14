---
"create-oberon-app": patch
---

Include `plugins/**/*.ts` in `create-oberon-app` TypeScript config so plugin
templates are typechecked.

Also narrow unknown caught errors in the Sendgrid template to satisfy strict
typechecking.
