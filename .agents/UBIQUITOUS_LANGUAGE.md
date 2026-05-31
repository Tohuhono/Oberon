# Ubiquitous Language

This file captures canonical terms used across docs. Architecture and implementation notes should
reuse these terms instead of redefining them.

## Runtime composition

| Term               | Definition                                                                                    | Aliases to avoid          |
| ------------------ | --------------------------------------------------------------------------------------------- | ------------------------- |
| **Oberon runtime** | A configured OberonCMS instance built from runtime config and an ordered plugin list.         | app, core, CMS instance   |
| **Runtime config** | The static configuration object passed into `initOberon`.                                     | config, site config       |
| **Plugin**         | An integration that contributes adapter methods, HTTP handlers, or both to an Oberon runtime. | extension, addon, adapter |
| **Plugin adapter** | A plugin-provided implementation of a runtime capability such as storage, auth, or send.      | plugin, provider          |
| **Adapter**        | The composed programmatic CMS interface returned by an Oberon runtime.                        | plugin, service, client   |
| **Handler**        | The composed HTTP entrypoint returned by an Oberon runtime.                                   | route, endpoint, API      |

## Content model

| Term               | Definition                                                                    | Aliases to avoid              |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------- |
| **Page**           | A managed content record addressed by a slash-prefixed key.                   | document, route, entry        |
| **Puck component** | A page-building component exposed to the Puck editor inside an OberonCMS app. | block, widget, section        |
| **Image**          | A stored media asset managed through an OberonCMS storage capability.         | file, asset, upload           |
| **User**           | An authenticated identity managed by OberonCMS auth and permissions flows.    | account, editor, login        |
| **Site state**     | Persisted CMS-wide state such as version and component transform versions.    | config, site config, settings |

## Project surfaces

| Term                  | Definition                                                                        | Aliases to avoid                         |
| --------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| **create-oberon-app** | The CLI that scaffolds a new OberonCMS project from a recipe.                     | generator, starter, bootstrap script     |
| **Recipe**            | A framework-specific starter definition consumed by `create-oberon-app`.          | template, example app, boilerplate       |
| **Starter app**       | A generated application created by `create-oberon-app` from a recipe.             | app, recipe, playground                  |
| **Playground**        | The repo-owned development app used to exercise OberonCMS locally.                | demo, starter app, sample project        |
| **Documentation app** | The repo-owned site that publishes OberonCMS documentation and mounts the CMS UI. | docs, website, landing page              |
| **Demo**              | The user-facing OberonCMS example exposed from the documentation app.             | playground, starter app, example project |

## Relationships

- An **Oberon runtime** composes one or more **Plugins** into exactly one **Adapter** and one
  **Handler**.
- A **Plugin** may contribute zero or more **Plugin adapters** to an **Oberon runtime**.
- A **Page** is assembled from zero or more **Puck components**.
- An **Oberon runtime** reads and updates one **Site state** record.
- `create-oberon-app` materializes exactly one **Starter app** from exactly one **Recipe** per run.
- The **Playground**, **Documentation app**, and **Demo** are repo-owned surfaces and are not
  **Starter apps**.

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
> **Dev:** "Is the persisted version data part of the **Runtime config** too?"
>
> **Domain expert:** "No. That belongs to **Site state**. The **Playground** exercises the runtime
> locally, while a **Starter app** is what `create-oberon-app` produces from a **Recipe**."

## Flagged ambiguities

- "config" was used for both the static object passed into `initOberon` and the persisted CMS-wide
  record returned from storage — use **Runtime config** for the input object and **Site state** for
  the persisted record.
- "plugin" was used to mean both the installable integration package and the concrete runtime
  implementation it supplies — use **Plugin** for the package and **Plugin adapter** for the
  implementation it contributes.
- "app" was used to mean the repo-owned **Playground** or **Documentation app** and also the
  generated output of `create-oberon-app` — use **Starter app** for generated projects and the
  specific surface names for repo-owned apps.
- "component" and "block" both refer to editor-facing page building units — use **Puck component**
  as the canonical term unless you are naming the `puck-blocks` package itself.
- "core" can mean the `@oberoncms/core` package or the broader runtime behavior — use **Oberon
  runtime** for the composed system and reserve "core package" for the package name.
