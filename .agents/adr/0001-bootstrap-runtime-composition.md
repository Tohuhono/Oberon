# Separate bootstrap and runtime composition

Oberon uses separate Bootstrap composition and Runtime composition for one Oberon config. Runtime
composition creates the public Adapter used for requests. Bootstrap composition lets initialization
use plugin storage without runtime-only behavior such as framework cache wrappers.

Bootstrap hooks run sequentially in configured Plugin order. Each hook can access the final
Bootstrap-composed Adapter through the plugin context's `getAdapter`. Bootstrap behavior is not part
of the public Adapter contract.

## Considered options

- Compose once and make runtime wrappers bypass bootstrap calls. This keeps hidden lifecycle state
  in runtime wrappers.
- Return bootstrap behavior from runtime initialization. This couples build-time and runtime
  imports.
- Use separate plugin lists. This lets bootstrap and runtime capabilities drift.

## Consequences

- One Oberon config supplies the client config and ordered Plugin list for both phases.
- Plugin context includes `phase: "bootstrap" | "runtime"`.
- Generated apps keep browser-safe settings in `client.config.tsx` and server settings in
  `config.ts`.
- `prebuild` remains a package task name. It is not an Adapter method.
