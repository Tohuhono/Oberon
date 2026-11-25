# Architecture references

Read the maintained public documentation instead of duplicating API descriptions here:

- [Configuration](../apps/documentation/src/content/docs/configuration.mdx): config, runtime,
  bootstrap, and framework integration.
- [Plugin shape](../apps/documentation/src/content/docs/plugins/custom/plugin-shape.mdx):
  composition and lifecycle.
- [Adapter hooks](../apps/documentation/src/content/docs/plugins/custom/adapter-hooks.mdx): method
  contracts and middleware.
- [Handler hooks](../apps/documentation/src/content/docs/plugins/custom/handler-hooks.mdx): dispatch
  and framework routes.
- [Authentication](../apps/documentation/src/content/docs/plugins/auth.mdx): sessions and
  permissions.
- [Repository layout](../README.md#repository-layout): workspace ownership.

## Repository-specific wiring

| Surface             | Server config                                                                           |
| ------------------- | --------------------------------------------------------------------------------------- |
| Next.js Playground  | [`apps/playground/oberon/config.ts`](../apps/playground/oberon/config.ts)               |
| TanStack Playground | [`apps/newground/src/oberon/config.ts`](../apps/newground/src/oberon/config.ts)         |
| Documentation demo  | [`apps/documentation/src/oberon/config.ts`](../apps/documentation/src/oberon/config.ts) |
| Next.js recipe      | [`recipes/nextjs/oberon/config.ts`](../recipes/nextjs/oberon/config.ts)                 |
| TanStack recipe     | [`recipes/tanstack/oberon/config.ts`](../recipes/tanstack/oberon/config.ts)             |

Use [CONTEXT.md](CONTEXT.md) for domain names. Read relevant `.agents/adr/` decisions when present.

## Database migrations

The Development, Turso, and PostgreSQL Plugins each own the migration history in their
`src/db/migrations` folder. The Development and Turso Plugins load the shared TypeScript schema
through `@oberoncms/sqlite/schema/source`. Drizzle Kit loads this export directly.

Run `pnpm generate:migrations --output json --explain` from the repository root to inspect the
proposed SQL. If Drizzle Kit returns `missing_hints`, put the reviewed hints in a JSON file under
`.tmp/`. Pass its absolute path with `--hints-file`, rerun the preview, then drop `--explain` to
generate the SQL and snapshots. Run `pnpm check:migrations --output json` to check all database
Plugins. Keep each migration folder and its snapshot together.
[Drizzle Kit reference](https://orm.drizzle.team/docs/drizzle-kit-generate)
