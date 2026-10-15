---
"@oberoncms/core": patch
---

Use `BASE_URL` before `VERCEL_URL` for the auth base URL and pass the configured URL to deployed
servers.

Configure production deployment jobs with their production domains, align Newground login tests with
`BASE_URL`, and document auth URL configuration.
