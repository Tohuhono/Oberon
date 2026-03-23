# create-oberon-app

`create-oberon-app` generates recipes. For a full list of recipes, please see
the monorepo README.

## Usage

Requires Node.js 22 or newer.

npx

```sh
npx create-oberon-app my-app
```

yarn

```sh
yarn create oberon-app my-app
```

## COA e2e lanes

The COA Playwright suite is separated into explicit lanes:

- `@auth`: one-time real login bootstrap that writes reusable browser state
- `@contract`: shared CMS contract behavior reusing that state
- `@login`: unauthenticated login-journey behavior tests
- `@verdaccio`: package provenance checks inside the container harness
- `@container-initialise` / `@container-teardown`: container lifecycle lanes

Run headless COA e2e:

```sh
pnpm test:coa
```

Run interactive COA e2e UI:

```sh
pnpm test:coa:ui
```

## License

MIT © [Tohuhono](https://tohuhono.com/)
