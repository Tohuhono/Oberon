# Code style

## Formatting and Linting

- Use Prettier for formatting; run `pnpm prettier:fix` when needed
- ESLint uses flat config; avoid `/* eslint-env */` comments
- Suggest adding or changing eslint rules where appropriate

## General

- Avoid comments unless referencing an external bug or workaround

## TypeScript

- Use TypeScript for all source; avoid `any` unless no alternative
- Prefer implicit, inline types except for public functions and exported values

## React

- Usually react hooks and related logic should be encapsulated in a custom hook

## Next.js

- Next.js App Router conventions apply; keep server actions with `"use server"`
