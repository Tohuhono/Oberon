---
"@oberoncms/core": minor
"@oberoncms/plugin-development": minor
"@oberoncms/plugin-pgsql": minor
"@oberoncms/plugin-turso": minor
"@oberoncms/plugin-tailwind": minor
"@oberoncms/plugin-nextjs": minor
"create-oberon-app": minor
"@tohuhono/puck-blocks": minor
"@oberoncms/testing": patch
"@oberon/playground": patch
"@oberon/docs": patch
"@oberon/recipe-nextjs": patch
"@oberon/recipe-tanstack": patch
---

Split Oberon configuration into a server-side `OberonConfig` and client-safe `OberonClientConfig`.

Apps now create one server-only config with `defineConfig({ client, plugins })` and pass it directly
to `initOberon(config)` and `bootstrapOberon(config)`. Bootstrap lifecycle work has moved from the
public adapter `prebuild` method to top-level plugin `bootstrap(next)` hooks, and the public Adapter
no longer exposes `prebuild`.

Generated starter apps now contain `oberon/client.config.tsx` for Puck component configuration and
`oberon/config.ts` for server-only plugin composition. The Next.js recipe output includes the
Next.js plugin in runtime composition while Bootstrap composition avoids Next.js cache wrappers.
