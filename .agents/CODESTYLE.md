# Code style

## Formatting and Linting

- Use Prettier for formatting; run `pnpm prettier:fix` when needed
- ESLint uses flat config; avoid `/* eslint-env */` comments
- Suggest adding or changing eslint rules where appropriate

## General

- Avoid comments unless referencing an external bug or workaround
- If lint or typescript exception is required, comment or link to upstream
  issue/docs.

## TypeScript

- Use TypeScript for all source; avoid `any` unless no alternative
- Minimal typing: Prefer inference and structural typing; add explicit types
  only when they improve correctness or readability. Don’t use as (or extra type
  aliases) to silence errors; fix the source type instead.
- Prefer implicit types
- Use existing exported library/parser types instead of ad-hoc local type
  shapes.
- For function props, prefer inline parameter typing (including discriminated
  unions).

## React

- Usually react hooks and related logic should be encapsulated in a custom hook

## Next.js

- Next.js App Router conventions apply; keep server actions with `"use server"`

## Testing

- Co-located siblings: `src/foo.test.ts` next to `src/foo.ts`
- Only test pure logic with real branching/transformation — not library
  behaviour
- See `agents/TESTING.md` for full strategy

## Validation

Shell-Validation Pattern: Zod at the gates, Types in the streets.

- Validate with Zod; infer types;
- Parse, Don't Just Validate.
- Fail Early and Loudly.
- Avoid runtime validation checks in internal business logic to maximize
  performance and minimize code clutter; favour improving static checking;
