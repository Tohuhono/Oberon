# Bootstrap and Runtime Plugin Composition

Oberon uses separate Bootstrap composition and Runtime composition for the same Oberon config.
Runtime composition creates the public Adapter and Handler used while serving requests; Bootstrap
composition is used only by `bootstrapOberon` so build-time initialization can use plugin-provided
storage without executing runtime-only decorators such as Next.js cache wrappers.

## Considered Options

- Compose plugins once and make runtime-only decorators bypass bootstrap calls. This kept one
  adapter graph, but preserved hidden lifecycle state inside runtime wrappers.
- Return bootstrap behavior from `initOberon`. This kept a compact app API, but runtime imports
  could pay for bootstrap composition and bootstrap scripts could still import runtime composition.
- Use separate plugin lists for bootstrap and runtime. This avoided phase-aware plugins, but made
  database and storage capabilities easy to drift between phases.

## Consequences

- Apps use one phase-neutral Oberon config for both `initOberon` and `bootstrapOberon`.
- `OberonConfig` is the full server-side config containing `{ client, plugins }`; the existing
  component/editor config becomes `OberonClientConfig`.
- Generated apps keep `client.config.tsx` for `OberonClientConfig` and `config.ts` for the
  server-only `defineConfig({ client, plugins })` result.
- Plugin context includes `phase: "bootstrap" | "runtime"` so plugins can skip phase-specific
  contributions.
- Plugin bootstrap behavior is a top-level middleware-style `bootstrap(next)` hook, not an Adapter
  method.
- `prebuild` remains a package task name only; it is not part of the Adapter contract.
