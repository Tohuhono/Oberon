---
"@oberon/playground": patch
"@dev/playwright": patch
"@dev/typescript": patch
---

Enable Cache Components in the playground, and suspend public page rendering. Disable partial
prefetching so missing pages return HTTP 404. Disable instant rendering for public and CMS routes.

Add browser coverage to verify that missing pages return HTTP 404 and respect the saved theme.

Declare TypeScript as a dependency of the shared TypeScript configuration package.
