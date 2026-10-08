# Ubiquitous language

Use these canonical names in code, issues, tests, and documentation. For behavior and API contracts,
use the public documentation linked from [ARCHITECTURE.md](ARCHITECTURE.md). This glossary defines
names, not planned implementation.

## Runtime and integration

| Term                        | Definition                                                                     | Aliases to avoid                |
| --------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| **Oberon config**           | Server-only configuration containing client config and an ordered Plugin list. | definition, runtime config      |
| **Oberon client config**    | Browser-safe component and editor configuration.                               | site config                     |
| **Oberon runtime**          | An OberonCMS instance configured from an Oberon config.                        | core, CMS instance              |
| **Plugin**                  | An integration that contributes runtime or bootstrap capabilities.             | extension, addon, adapter       |
| **Adapter capability**      | A composable capability supplied by a Plugin.                                  | plugin type, feature group      |
| **Plugin adapter**          | A plugin's implementation of an Adapter capability.                            | provider, service               |
| **Adapter**                 | The composed programmatic CMS interface.                                       | data adapter, plugin, client    |
| **Runtime composition**     | Plugin composition that produces the runtime Adapter.                          | final composition, live adapter |
| **Bootstrap composition**   | Plugin composition used for initialization before a build.                     | prebuild adapter, setup adapter |
| **Oberon bootstrap**        | Initialization that prepares CMS data before app output.                       | prepare, setup                  |
| **Framework integration**   | A Plugin and related entrypoints that connect the runtime to a host framework. | app adapter                     |
| **Framework contribution**  | A capability supplied by a Framework integration.                              | route prop, adapter smuggling   |
| **Auth Plugin**             | An integration that supplies authentication behavior.                          | framework auth integration      |
| **Request authority**       | Request-scoped auth state supplied by the host framework.                      | caller-provided headers         |
| **Handler**                 | A framework-native HTTP entrypoint for plugin requests.                        | API, endpoint                   |
| **Routing adapter**         | Server-side routing methods supplied by a Framework integration.               | redirect helper                 |
| **Router adapter**          | The framework Link component supplied to Oberon UI.                            | navigation adapter              |
| **Oberon Link component**   | A UI link rendered through framework routing.                                  | Next Link, anchor wrapper       |
| **Oberon action**           | A framework-neutral CMS operation exposed to UI.                               | server action, client action    |
| **Oberon action transport** | Framework code that exposes actions across the client/server boundary.         | action wrapper                  |
| **Oberon action response**  | An action's success or error result.                                           | server action response          |
| **Client route effects**    | Navigation or refresh after a client workflow.                                 | action effects                  |

## Content

| Term                       | Definition                                                          | Aliases to avoid       |
| -------------------------- | ------------------------------------------------------------------- | ---------------------- |
| **Page**                   | A content record addressed by a slash-prefixed key.                 | document, route, entry |
| **Puck component**         | A page-building component used by the editor.                       | block, widget          |
| **Image**                  | A media record managed through storage and database capabilities.   | file, asset            |
| **Oberon Image component** | A component that displays an Image through framework image support. | Next Image             |
| **User**                   | An authenticated identity used by CMS permission checks.            | account, editor        |
| **Site state**             | Stored CMS-wide version and component migration data.               | config, settings       |
| **Tailwind style assets**  | CSS generated from published Page data.                             | Tailwind config        |

## Project surfaces

| Term                    | Definition                                                | Aliases to avoid            |
| ----------------------- | --------------------------------------------------------- | --------------------------- |
| **create-oberon-app**   | The CLI that creates a Starter app from a Recipe.         | generator, bootstrap script |
| **Recipe**              | A framework-specific app structure used by the installer. | example app, boilerplate    |
| **Starter app**         | An app generated by `create-oberon-app`.                  | recipe, playground          |
| **Playground**          | A repo-owned development app that exercises OberonCMS.    | starter app, demo           |
| **Next.js Playground**  | The Next.js development app at `apps/playground`.         | legacy app                  |
| **TanStack Playground** | The TanStack development app at `apps/newground`.         | newground, starter app      |
| **CMS parity**          | Equivalent CMS workflow coverage across the Playgrounds.  | feature complete            |
| **Documentation app**   | The repo-owned website and CMS demo.                      | playground                  |
| **Demo**                | The public CMS example in the Documentation app.          | starter app                 |

## Invariants

- An Oberon config is the canonical source for the client config and ordered Plugin list.
- Runtime composition and Bootstrap composition use the same Oberon config.
- Runtime composition exposes one Adapter.
- Oberon bootstrap does not add lifecycle methods to the Adapter.
- A Framework integration projects plugin request dispatch into a framework-native Handler.
- A Plugin can contribute more than one capability. Its package category does not limit it.
- Request authority comes from the Framework integration. Callers do not supply auth headers.
- The Auth Plugin owns authentication behavior. The Framework integration supplies host plumbing.
- Server routing decisions and Client route effects are different capabilities.
- Site state is persisted CMS data. It is not part of the Oberon config.
- A Starter app is generated from a Recipe. Playgrounds and the Documentation app are not Starter
  apps.

## Ambiguous terms

- Use **Oberon config** for server configuration, **Oberon client config** for browser-safe
  configuration, and **Site state** for persisted CMS-wide data.
- Use **Plugin** for an integration and **Plugin adapter** for one capability implementation.
- Use **Starter app** for generated output. Use the specific surface name for repo-owned apps.
- Use **Puck component** for editor-facing page units. Reserve "block" for package names.
- Use **Oberon runtime** for the composed system. Reserve "core package" for `@oberoncms/core`.
