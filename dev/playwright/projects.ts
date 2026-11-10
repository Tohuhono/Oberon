import { resolve } from "path"

import type { Project } from "@playwright/test"

type SharedProject = Project

const testDir = resolve(import.meta.dirname, "test")

export const authProject = {
  name: "auth",
  testDir,
  grep: /@auth|@smoke/u,
  grepInvert: /@playground|@docs/u,
  dependencies: [],
} satisfies SharedProject

export const authenticatedProject = {
  name: "authenticated",
  testDir,
  grep: /@login|@cms|@tdd/u,
  grepInvert: /@playground|@docs/u,
  dependencies: ["auth"],
} satisfies SharedProject

export const smokeProject = {
  name: "smoke",
  testDir,
  grep: /@smoke/u,
  grepInvert: /@docs|@playground/u,
  dependencies: [],
} satisfies SharedProject
