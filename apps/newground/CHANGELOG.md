# @oberon/newground

## 0.1.2

### Patch Changes

- 1037113: Use one final Adapter throughout Plugin composition. Adapter hooks now receive a
  late-bound `getAdapter` function and object-shaped method payloads, while the Adapter exposes
  reusable `can`, `will`, and `whoWill` authorization capabilities for action orchestration.
  Framework action bridges now validate every action through an independently evolvable schema,
  including explicit undefined schemas for actions that currently have no payload.
- 1037113: Move REST route projection from core into the Next.js and TanStack Framework
  integrations. Each integration now exports a native `createRestHandler(adapter)` factory, while
  the Adapter retains the framework-neutral Plugin HTTP dispatch capability.
- Updated dependencies [1037113]
- Updated dependencies [1037113]
- Updated dependencies [1037113]
- Updated dependencies [2b4526a]
- Updated dependencies [2b4526a]
  - @oberoncms/core@0.21.0
  - @oberoncms/plugin-pgsql@0.12.0
  - @oberoncms/plugin-tailwind@0.21.0
  - @oberoncms/plugin-tanstack@0.2.0
  - @oberoncms/plugin-development@0.10.0
  - @tohuhono/puck-blocks@0.15.1

## 0.1.1

### Patch Changes

- Updated dependencies [4b794ca]
- Updated dependencies [2f7a0c2]
- Updated dependencies [7e48e64]
- Updated dependencies [2f7a0c2]
- Updated dependencies [7e48e64]
- Updated dependencies [929bc33]
- Updated dependencies [5ff8413]
- Updated dependencies [2f7a0c2]
  - @tohuhono/puck-blocks@0.15.0
  - @oberoncms/plugin-development@0.9.0
  - @oberoncms/core@0.20.0
  - @oberoncms/plugin-pgsql@0.11.0
  - @oberoncms/plugin-tanstack@0.1.1
