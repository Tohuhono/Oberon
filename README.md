<!-- this file is for humans, see `AGENTS.md `for agent instructions -->

<img src="https://img.shields.io/badge/Current Status:%20-000.svg"><img src="https://img.shields.io/badge/Move%20fast%20and%20break%20things-red.svg">

# OberonCMS

A monorepo for OberonCMS and the related packages and tooling.

## Quick start

We use [pNpm](https://pnpm.io/) for workspace support - if you choose to use npm
or yarn ymmv.

```sh
pnpm install

pnpm dev:oberon # Develop OberonCMS and all dependencies using the playground.

pnpm dev:demo # Develop the demo app and all dependencies.

pnpm dev:docs # Develop the documentation.

pnpm dev:rich-text-demo # Develop the rich text demo app and all dependencies.

pnpm tsc # Typecheck

pnpm lint:fix # Run eslint, fixing any issues

pnpm prettier:fix # Run prettier, fixing any issues

pnpm build # Build all packages

pnpm change # Add a changset entry
```

## What's inside?

This [Turborepo](https://turbo.build/repo/) that includes the following packages
and apps:

### Apps

- `apps/documentation` - https://oberoncms.com

  Landing page and documentation for OberonCMS.

  Includes a [demo app](https://oberoncms.com/demo).

- `apps/playground`

  A playground for developers to test OberonCMS.

  Mostly used for local development, there is also a
  [deployment](https://playground.tohuhono.com) with access limited to core
  contributors.

- `apps/rich-text-demo` - https://puck-rich-text.tohuhono.com

  an app demoing
  [puck-rich-text](https://www.npmjs.com/package/@tohuhono/puck-rich-text)

### Packages

#### OberonCMS

- `packages/create-oberon-app` -
  [create-oberon-app](https://www.npmjs.com/package/create-oberon-app)

  A command line tool for creating new projects with OberonCMS.

- `packages/oberoncms/core` -
  [@oberoncms/core](https://www.npmjs.com/package/@oberoncms/core)

  The core package for OberonCMS.

- `packages/oberoncms/sqlite` -
  [@oberoncms/sqlite](https://www.npmjs.com/package/@oberoncms/sqlite)

  Sqlite adapter for OberonCMS.

#### Plugins

- `packages/plugins/developement` -
  [@oberoncms/plugin-development](https://www.npmjs.com/package/@oberoncms/plugin-development)

  Provides local only adapters for development.

- `packages/plugins/turso` -
  [@oberoncms/plugin-turso](https://www.npmjs.com/package/@oberoncms/plugin-turso)

  A Turso libsql database plugin for OberonCMS.

- `packages/plugins/pgsql` -
  [@oberoncms/plugin-pgsql](https://www.npmjs.com/package/@oberoncms/plugin-pgsql)

  A PostgreSQL database plugin for OberonCMS.

- `packages/plugins/vercel-postgres` -
  [@oberoncms/plugin-vercel-postgres](https://www.npmjs.com/package/@oberoncms/plugin-vercel-postgres)

  A Vercel PostgreSQL database plugin for OberonCMS.

- `packages/plugins/uploadthing` -
  [@oberoncms/plugin-uploadthing](https://www.npmjs.com/package/@oberoncms/plugin-uploadthing)

  An Puck component and OberonCMS plugin for embeding uploadthing images.

- `packages/plugins/flydrive` -
  [@oberoncms/plugin-flydrive](https://www.npmjs.com/package/@oberoncms/plugin-flydrive)

  A plugin that provides an Image component and storage using
  [flydrive](https://flydrive.dev/docs/introduction).

#### Utilities and Config

- `packages/tohuhono/dev` -
  [@tohuhono/dev](https://www.npmjs.com/package/@tohuhono/dev)

  Base config and scripts for building packages and apps.
  - [TypeScript](https://www.typescriptlang.org/) for static type checking
  - [ESLint](https://eslint.org/) for code linting
  - [Prettier](https://prettier.io) for code formatting
  - [Vite](https://vitejs.dev/) for bundling

- `packages/tohuhono/utils` -
  [@tohuhono/utils](https://www.npmjs.com/package/@tohuhono/utils)

  A collection of utility functions shared across the monorepo. Particularly
  useful for testing.

- `packages/tohuhono/ui` -
  [@tohuhono/ui](https://www.npmjs.com/package/@tohuhono/ui)

  Shared UI components using [Shadcn/ui](https://ui.shadcn.com/) and utilities
  including a [tailwindcss](https://tailwindcss.com/) theme and components for
  dynamicaly loading and adjusting it.

#### Puck components

- `packages/tohuhono/puck-rich-text` -
  [@tohuhono/puck-rich-text](https://www.npmjs.com/package/@tohuhono/puck-rich-text)

  A puck component for rich text editing made for OberonCMS.

- `packages/tohuhono/puck-blocks` -
  [@tohuhono/puck-blocks](https://www.npmjs.com/package/@tohuhono/puck-blocks)

  A collection of puck components for building pages in OberonCMS, including a
  collection of example Puck components.

### Recipes

Used by the [create-oberon-app](https://www.npmjs.com/package/create-oberon-app)
command. If you would like to support other frameworks, please get in touch as
we would love to help.

- `recipes/nextjs`

  A Next.js starter app.

## Contributing

OberonCMS is an open source project and we welcome contributions from the
community. You can
[raise an issue](https://github.com/Tohuhono/Oberon/issues/new) or submit a pull
request to help us improve.

1. Fork and clone the repository
2. Ensure you have the LTS version of Node.js installed, as well as the latest
   version of [pnpm](https://pnpm.io).
3. Install the project dependencies by running `pnpm install`.
4. Implement your changes, as well as any documentation or tests that are
   required.
5. Create a changeset for your changes by running `pnpm changeset`.
6. Open a pull request with your changes and changeset.

## What next?

We are under heavy development, building out the core capabilities.
[Check out our todo list for upcoming features.](https://github.com/orgs/Tohuhono/projects/1/views/1)

## Contributors

<table>
<tr>
    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/4leite>
            <img src=https://avatars.githubusercontent.com/u/2586037?v=4 width="100;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=Jon Vivian/>
            <br />
            <sub style="font-size:14px"><b>Jon Vivian</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/ahmedrowaihi>
            <img src=https://avatars.githubusercontent.com/u/67356781?v=4 width="100;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=Ahmed Rowaihi/>
            <br />
            <sub style="font-size:14px"><b>Ahmed Rowaihi</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/turbobot-temp>
            <img src=https://avatars.githubusercontent.com/u/145653950?v=4 width="100;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=turbobot-temp/>
            <br />
            <sub style="font-size:14px"><b>turbobot-temp</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/oberoncms>
            <img src=https://avatars.githubusercontent.com/u/170320460?v=4 width="100;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=oberoncms/>
            <br />
            <sub style="font-size:14px"><b>oberoncms</b></sub>
        </a>
    </td>
</tr>
</table>
