# Code style

## General

- Avoid comments unless referencing an external bug or workaround
- Aviod premature optimisation - YAGNI
- Simple, direct code is easier to fix, test, and understand. Excess options create "dead code" or
  "configuration hell" that slows down development.
- Avoid small single-use helpers unless explicitly justified.

## Formatting and Linting

- If a lint or typescript exception is required, comment or link to upstream issue/docs.

## TypeScript

- Minimal typing: Prefer inference and structural typing; add explicit types only when they improve
  correctness or readability.
- Use existing exported library/parser types instead of ad-hoc local type shapes.
- Use inline parameter typing (including for discriminated unions).
- Avoid separate 'type' statements unless intentionally shared or exported

## React

- Usually react hooks and related logic should be encapsulated in a custom hook

## Next.js

- Next.js App Router conventions apply; keep server actions with `"use server"`

## Validation

Shell-Validation Pattern: Zod at the gates, Types in the streets.

- Validate with Zod; infer types;
- Parse, Don't Just Validate.
- Fail Early and Loudly.
- Avoid runtime validation checks; favour improving static checking;
