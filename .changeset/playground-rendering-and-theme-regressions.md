---
"@oberon/playground": patch
"@dev/playwright": patch
"@dev/typescript": patch
---

Enable Cache Components and partial prefetching in the playground, and suspend public page
rendering. Disable instant rendering for public and CMS routes.

Add browser coverage for inline theme scripts on 404 pages before and after hydration. Track the
upstream rendering issue: https://github.com/vercel/next.js/issues/62228.

Declare TypeScript as a dependency of the shared TypeScript configuration package.
