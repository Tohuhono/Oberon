# OberonCMS

OberonCMS is a content management system built with the [Puck editor](https://puckeditor.com). It
supports Next.js and TanStack Start.

Use the [getting started guide](https://oberoncms.com/docs/create-oberon-app) to create an app. Use
the instructions below to work on this repository.

## Development

Use Node.js 24.21.0 or later and pnpm 12.9.1 or later. The root manifest specifies the package
manager version. Run all repository commands from the root.

Install dependencies:

```sh
pnpm install
```

Select a development command:

| Command             | Purpose               |
| ------------------- | --------------------- |
| `pnpm dev:oberon`   | Next.js Playground    |
| `pnpm dev:new`      | TanStack Playground   |
| `pnpm dev:docs`     | Documentation website |
| `pnpm dev:nextjs`   | Next.js recipe        |
| `pnpm dev:tanstack` | TanStack Start recipe |

Use `pnpm format` to format the repository with Oxfmt. Use `pnpm validate` to run the
dependency-aware validation workflow. The repository uses Oxlint, not ESLint, for linting.

## Testing

Unit tests use Vitest. Browser tests use Playwright. The `create-oberon-app` tests use a container
harness and require Linux with Podman.

| Command            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `pnpm validate`    | Required build, lint, type, and test checks |
| `pnpm test:unit`   | Package unit and adapter contract tests     |
| `pnpm test:e2e`    | App browser tests                           |
| `pnpm test:coa`    | Installer tests for generated apps          |
| `pnpm test:coa:ui` | Interactive installer tests                 |
| `pnpm test:smoke`  | Tests against a deployed site               |

For deployed smoke tests, set the base URL:

```sh
PLAYWRIGHT_BASE_URL=https://your-deployment.example pnpm test:smoke
```

Run `pnpm validate` before you submit code or documentation changes. Do not replace root workflows
with package-local commands or manual package filters. Request a root script change if the current
scripts cannot run the required checks.

## Repository layout

| Location                                                   | Purpose                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`apps/documentation`](apps/documentation)                 | Public website, documentation, and demo                                |
| [`apps/playground`](apps/playground)                       | Next.js development Playground                                         |
| [`apps/newground`](apps/newground)                         | TanStack development Playground                                        |
| [`packages/oberoncms/core`](packages/oberoncms/core)       | Runtime composition, permissions, CMS actions, and component migration |
| [`packages/oberoncms/sqlite`](packages/oberoncms/sqlite)   | Shared SQLite adapter                                                  |
| [`packages/oberoncms/testing`](packages/oberoncms/testing) | Shared adapter test fixtures                                           |
| [`packages/plugins`](packages/plugins)                     | Database, storage, CSS, development, and framework plugins             |
| [`packages/create-oberon-app`](packages/create-oberon-app) | App installer                                                          |
| [`packages/tohuhono`](packages/tohuhono)                   | Shared UI, utilities, and Puck components                              |
| [`recipes`](recipes)                                       | Next.js and TanStack Start app structures                              |
| [`dev`](dev)                                               | Shared lint, build, type, and test tools                               |

Apps own their routes and server configuration. The installer copies a recipe and configures the
selected plugins. Use the [public documentation](https://oberoncms.com/docs) for runtime and plugin
APIs.

## Contributing

1. Fork the repository.
2. Clone your fork.
3. Install dependencies with `pnpm install`.
4. Make the change.
5. Update the related tests and documentation.
6. Run `pnpm format`.
7. Run `pnpm validate`.
8. Run `pnpm change` if a published package needs a release.
9. Open a pull request.

Use [GitHub Issues](https://github.com/Tohuhono/Oberon/issues) for bugs and feature requests. See
the [roadmap](https://oberoncms.com/docs/roadmap) for planned work.

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
