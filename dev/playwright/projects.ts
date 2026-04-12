import { resolve } from "path"
import type { Project } from "@playwright/test"

type SharedProject = Project

const testDir = resolve(import.meta.dirname, "test")

console.log(testDir)

export const authProject = {
  name: "auth",
  testDir,
  grep: /@auth/,
  dependencies: [],
} satisfies SharedProject

export const authenticatedProject = {
  name: "authenticated",
  testDir,
  grep: /@cms/,
  dependencies: ["auth"],
} satisfies SharedProject

export const tddProject = {
  name: "tdd",
  testDir,
  grep: /@tdd/,
  dependencies: ["auth"],
} satisfies SharedProject

export const loginProject = {
  name: "login",
  testDir,
  grep: /@login/,
  dependencies: ["auth"],
} satisfies SharedProject

export const smokeProject = {
  name: "smoke",
  testDir,
  grep: /@smoke(?!.*@docs)/,
  dependencies: [],
} satisfies SharedProject
