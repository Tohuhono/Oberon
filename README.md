<img src="https://img.shields.io/badge/Current Status:%20-000.svg"><img src="https://img.shields.io/badge/Move%20fast%20and%20break%20things-red.svg">

# Tohuhono Monorepo

All things Tohuhono.

## Quick start

This monorepo uses [pNpm](https://pnpm.io/) for workspace support - if you choose to use npm or yarn ymmv.

```
pnpm install

pnpm build

pnpm dev

pnpm lint
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps

- `apps/tohuhono`

  https://tohuhono.com

- `apps/rich-text-demo`

  an app demoing [puck-rich-text](https://www.npmjs.com/package/@tohuhono/puck-rich-text)

  https://puck-rich-text.tohuhono.com

### Utilities and Config

- `packages/dev`
  - [TypeScript](https://www.typescriptlang.org/) for static type checking
  - [ESLint](https://eslint.org/) for code linting
  - [Prettier](https://prettier.io) for code formatting
- `packages/utils`
  - `cn` - tailwind classname merge function

## What next?

Under heavy development.
