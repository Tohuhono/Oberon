import { resolve } from "path"

import type { Project } from "@playwright/test"

type SharedProject = Project

const testDir = resolve(import.meta.dirname, "test")

export const authProject = {
  name: "auth",
  testDir,
  grep: /@auth|@smoke/,
  grepInvert: /@playground|@docs/,
  dependencies: [],
} satisfies SharedProject

export const authenticatedProject = {
  name: "authenticated",
  testDir,
  grep: /@login|@cms|@tdd/,
  grepInvert: /@playground|@docs/,
  dependencies: ["auth"],
} satisfies SharedProject

export const smokeProject = {
  name: "smoke",
  testDir,
  grep: /@smoke/,
  grepInvert: /@docs|@playground/,
  dependencies: [],
} satisfies SharedProject
