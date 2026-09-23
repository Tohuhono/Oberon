# Ubiquitous Language

This file captures canonical terms used across docs. Architecture and implementation notes should
reuse these terms instead of redefining them.

## Runtime composition

| Term                        | Definition                                                                                                                                                                                         | Aliases to avoid                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Oberon config**           | A server-side configuration object containing Oberon client config and an ordered Plugin list.                                                                                                     | definition, runtime config            |
| **Oberon client config**    | The client-safe component and editor configuration included in an Oberon config.                                                                                                                   | config, site config                   |
| **Oberon runtime**          | A configured OberonCMS instance built from an Oberon config.                                                                                                                                       | app, core, CMS instance               |
| **Plugin**                  | An integration that may contribute any combination of runtime capabilities, such as adapter behavior, HTTP handlers, framework entrypoints, actions, bootstrap behavior, caching, or revalidation. | extension, addon, adapter             |
| **Adapter capability**      | A composable runtime capability commonly fulfilled by a Plugin, such as persistence, authorization, send, auth plumbing, or routing behavior.                                                      | plugin type, feature group            |
| **Framework integration**   | A Plugin that adapts an Oberon runtime to a host web framework's routing, rendering, auth, and navigation conventions.                                                                             | framework plugin, app adapter         |
| **Framework contribution**  | A framework or platform capability supplied by a Plugin to an Oberon runtime, such as routing, navigation, request authority, image transformation, action transport, caching, or revalidation.    | route prop, adapter smuggling         |
| **Auth Plugin**             | A Plugin that contributes authentication behavior to an Oberon runtime and produces Users for authorization flows.                                                                                 | framework auth integration            |
| **Request authority**       | A Framework integration capability that reads request-scoped auth state from the host framework for an Oberon runtime.                                                                             | caller-provided headers               |
| **Plugin adapter**          | A plugin-provided implementation of a runtime capability such as storage, auth, or send.                                                                                                           | plugin, provider                      |
| **Plugin action**           | An Oberon action contributed by a Plugin to the Oberon runtime action surface.                                                                                                                     | action hook, action middleware        |
| **Router adapter**          | A client-safe framework integration capability that gives Oberon UI a framework Link component.                                                                                                    | navigation adapter, hand-rolled Link  |
| **Oberon Link component**   | A UI component that renders navigation links through framework-provided routing behavior.                                                                                                          | anchor wrapper, Next Link             |
| **Routing adapter**         | A server-side framework integration capability that maps Oberon routing decisions to host routing behavior.                                                                                        | redirect helper, not-found helper     |
| **Oberon action**           | A framework-neutral CMS operation exposed to Oberon UI, including reads and mutations.                                                                                                             | server action, client action          |
| **Client route effects**    | Client-side framework behavior used by Oberon UI after workflows complete, such as navigating to a route or refreshing visible route data.                                                         | router abstraction, action effects    |
| **Oberon action transport** | A framework integration capability that exposes Oberon actions across the client/server boundary.                                                                                                  | server action, action wrapper         |
| **Oberon action response**  | The framework-neutral success or error result returned by an Oberon action to Oberon UI.                                                                                                           | server action response                |
| **Oberon bootstrap**        | The lifecycle step that prepares an Oberon runtime before serving requests or building app output.                                                                                                 | prepare, prebuild, setup              |
| **Bootstrap composition**   | Private plugin composition used during Oberon bootstrap.                                                                                                                                           | prebuild adapter, setup adapter       |
| **Runtime composition**     | Plugin composition used to create the public Adapter and Handler returned by an Oberon runtime.                                                                                                    | final composition, live adapter       |
| **Adapter**                 | The composed programmatic CMS interface returned by an Oberon runtime, not limited to data or persistence methods.                                                                                 | data adapter, plugin, service, client |
| **Handler**                 | The composed HTTP entrypoint returned by an Oberon runtime.                                                                                                                                        | route, endpoint, API                  |

## Content model

| Term                       | Definition                                                                                     | Aliases to avoid                |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| **Page**                   | A managed content record addressed by a slash-prefixed key.                                    | document, route, entry          |
| **Puck component**         | A page-building component exposed to the Puck editor inside an OberonCMS app.                  | block, widget, section          |
| **Tailwind style assets**  | Generated styles produced from published Page content by the Tailwind Plugin.                  | Tailwind config, runtime config |
| **Image**                  | A stored media asset managed through an OberonCMS storage capability.                          | file, asset, upload             |
| **Oberon Image component** | A UI component that renders an Image through framework-provided image transformation behavior. | image, Next Image               |
| **User**                   | An authenticated identity managed by OberonCMS auth and permissions flows.                     | account, editor, login          |
| **Site state**             | Persisted CMS-wide state such as version and component transform versions.                     | config, site config, settings   |

## Project surfaces

| Term                    | Definition                                                                                                                                                             | Aliases to avoid                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **create-oberon-app**   | The CLI that scaffolds a new OberonCMS project from a recipe.                                                                                                          | generator, starter, bootstrap script     |
| **Recipe**              | A framework-specific starter definition consumed by `create-oberon-app`.                                                                                               | template, example app, boilerplate       |
| **Starter app**         | A generated application created by `create-oberon-app` from a recipe.                                                                                                  | app, recipe, playground                  |
| **Playground**          | A repo-owned development app used to exercise OberonCMS locally.                                                                                                       | demo, starter app, sample project        |
| **TanStack Playground** | The repo-owned TanStack development Playground intended to become the canonical Playground once feature parity is reached.                                             | newground, demo, starter app             |
| **Next.js Playground**  | The repo-owned Next.js development Playground retained during the TanStack migration as a comparison surface, then primarily as compatibility and regression coverage. | legacy app, demo, starter app            |
| **CMS parity**          | A migration milestone where the TanStack Playground supports the CMS workflows currently exercised through the Next.js Playground.                                     | feature complete, replacement            |
| **Documentation app**   | The repo-owned site that publishes OberonCMS documentation and mounts the CMS UI.                                                                                      | docs, website, landing page              |
| **Demo**                | The user-facing OberonCMS example exposed from the documentation app.                                                                                                  | playground, starter app, example project |

## Relationships

- An **Oberon runtime** exposes exactly one public **Adapter** and one public **Handler** from
  **Runtime composition**.
- A **Plugin** can contribute any combination of capabilities; its category does not fully prescribe
  what it can or cannot contribute.
- A **Plugin** commonly fulfills one or more **Adapter capabilities**, but it is not limited to
  those capabilities.
- A **Framework integration** may expose framework-specific entrypoints for an **Oberon runtime**.
- A **Framework integration** may supply **Framework contributions** through the ordered **Plugin**
  list in an **Oberon config**.
- An **Oberon config** supplies the **Oberon client config** and ordered **Plugin** list used by
  both **Bootstrap composition** and **Runtime composition**.
- The ordered **Plugin** list in an **Oberon config** is the canonical list of installed
  integrations; client-safe plugin facets are derived from that list rather than maintained as a
  separate list, without requiring the **Adapter** to expose which framework is in use.
- **Oberon bootstrap** uses **Bootstrap composition** without making bootstrap behavior part of the
  public **Adapter** contract.
- A **Plugin** may contribute zero or more **Plugin adapters**, **Plugin actions**, HTTP handlers,
  framework entrypoints, or bootstrap behavior to an **Oberon runtime**.
- An **Auth Plugin** owns Oberon authentication behavior; a **Framework integration** may supply
  framework-specific request, cookie, and session plumbing used to expose that behavior.
- A **Framework integration** supplies auth plumbing through Plugin contributions from the ordered
  **Plugin** list in an **Oberon config**.
- A **Request authority** is supplied by a **Framework integration**; Oberon callers do not pass
  their own auth headers or session state into **Oberon actions**.
- **Request authority** is exposed through a flat `getRequestHeaders()` **Adapter** method.
- Framework-specific auth plugins are exposed through a flat `getAuthPlugins()` **Adapter** method.
- An **Auth Plugin** may expose auth HTTP behavior as a **Handler**; a **Framework integration**
  adapts that **Handler** to host framework route entrypoints.
- An **Oberon action** may express a User auth intent such as beginning sign-in or requesting
  sign-out; the **Auth Plugin** owns the authentication mechanism and lifecycle effect for that
  intent.
- A **Framework integration** may provide a **Router adapter** for Oberon UI.
- A **Router adapter** exposes a small Oberon-facing Link contract; Framework integrations adapt
  their native Link components to that contract.
- A **Framework integration** may provide **Client route effects** for Oberon UI flows that need to
  navigate or refresh after client-side work completes.
- **Client route effects** are not a substitute for server-side **Routing adapter** decisions;
  invalid CMS actions should be routed before an Oberon client context is created.
- A **Framework integration** may provide a **Routing adapter** for server-side routing behavior.
- **Routing adapter** behavior is exposed as flat **Adapter** methods so it can compose with the
  existing **Adapter** and **Oberon action** surfaces.
- Missing **Routing adapter** behavior follows the existing missing-capability pattern rather than
  silently falling back.
- A **Framework integration** may provide an **Oberon action transport** for Oberon UI.
- An **Oberon action** may read or mutate CMS state.
- An **Oberon action** returns an **Oberon action response** to Oberon UI.
- An **Oberon action transport** owns framework-specific action creation and control-flow behavior.
- **Plugin actions** form the **Oberon action** surface before a **Framework integration** exposes
  them through an **Oberon action transport**.
- **Plugin actions** are composed similarly to **Plugin adapters**: each Plugin may build actions
  from the accumulated **Oberon action** surface and accumulated **Adapter** so far.
- A **Page** is assembled from zero or more **Puck components**.
- An **Oberon Image component** renders an **Image** without making the **Image** itself a framework
  concept.
- An **Oberon runtime** reads and updates one **Site state** record.
- `create-oberon-app` materializes exactly one **Starter app** from exactly one **Recipe** per run.
- The **Playground**, **Documentation app**, and **Demo** are repo-owned surfaces and are not
  **Starter apps**.
- The **TanStack Playground** and **Next.js Playground** may run side by side while the TanStack
  surface reaches feature parity.
- After feature parity, the **TanStack Playground** is expected to become the canonical
  **Playground** while the **Next.js Playground** remains primarily as compatibility and regression
  coverage.

## Example dialogue

> **Dev:** "If I want PostgreSQL storage in a new project, do I change the **Recipe** or add a
> **Plugin** to the **Starter app**?"
>
> **Domain expert:** "Add a **Plugin** to the **Starter app**. A **Recipe** only defines the initial
> project shape that `create-oberon-app` scaffolds."
>
> **Dev:** "And that **Plugin** contributes a **Plugin adapter** to the **Oberon runtime**?"
>
> **Domain expert:** "Yes. The **Oberon runtime** composes plugin adapters into one **Adapter** and
> one **Handler**."
>
> **Dev:** "Is the persisted version data part of the **Oberon config** too?"
>
> **Domain expert:** "No. That belongs to **Site state**. The **Playground** exercises the runtime
> locally, while a **Starter app** is what `create-oberon-app` produces from a **Recipe**."

## Flagged ambiguities

- "config" was used for the full server-side setup, the client-safe component/editor setup, and the
  persisted CMS-wide record returned from storage — use **Oberon config** for the full server-side
  setup, **Oberon client config** for the component/editor setup, and **Site state** for the
  persisted record.
- "plugin" was used to mean both the installable integration package and the concrete adapter
  implementation it supplies — use **Plugin** for the integration and **Plugin adapter** for a
  runtime capability implementation it contributes.
- "app" was used to mean the repo-owned **Playground** or **Documentation app** and also the
  generated output of `create-oberon-app` — use **Starter app** for generated projects and the
  specific surface names for repo-owned apps.
- "component" and "block" both refer to editor-facing page building units — use **Puck component**
  as the canonical term unless you are naming the `puck-blocks` package itself.
- "core" can mean the `@oberoncms/core` package or the broader runtime behavior — use **Oberon
  runtime** for the composed system and reserve "core package" for the package name.
