# Code style

## Formatting and Linting

- Use Prettier for formatting; run `pnpm prettier:fix` when needed
- ESLint uses flat config; avoid `/* eslint-env */` comments
- Suggest adding or changing eslint rules where appropriate

## General

- Avoid comments unless referencing an external bug or workaround

## TypeScript

- Use TypeScript for all source; avoid `any` unless no alternative
- Minimal typing: Prefer inference and structural typing; add explicit types
  only when they improve correctness or readability. Don’t use as (or extra type
  aliases) to silence errors; fix the source type instead.
- When explicit types are needed, use existing exported library/parser types
  instead of ad-hoc local type shapes.
- Prefer implicit, inline types

## React

- Usually react hooks and related logic should be encapsulated in a custom hook

## Next.js

- Next.js App Router conventions apply; keep server actions with `"use server"`
