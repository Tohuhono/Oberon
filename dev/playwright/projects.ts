import { base } from "./base.config"

type SharedProject = {
  name: string
  grep: RegExp
  dependencies: string[]
  use?: {
    storageState?: string
  }
}

export const authProject = {
  name: "auth",
  grep: /@auth/,
  dependencies: [],
} satisfies SharedProject

export const contractProject = {
  name: "contract",
  grep: /@contract/,
  use: {
    storageState: base.use?.authStorageStatePath,
  },
  dependencies: ["auth"],
} satisfies SharedProject

export const tddProject = {
  name: "tdd",
  grep: /@tdd/,
  use: {
    storageState: base.use?.authStorageStatePath,
  },
  dependencies: ["auth"],
} satisfies SharedProject

export const loginProject = {
  name: "login",
  grep: /@login/,
  dependencies: ["auth"],
} satisfies SharedProject

export const smokeProject = {
  name: "smoke",
  grep: /@smoke(?!.*@docs)/,
  dependencies: [],
} satisfies SharedProject
