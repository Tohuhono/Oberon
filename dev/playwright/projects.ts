type SharedProject = {
  name: string
  grep: RegExp
  dependencies: string[]
}

export const authProject = {
  name: "auth",
  grep: /@auth/,
  dependencies: [],
} satisfies SharedProject

export const authenticatedProject = {
  name: "authenticated",
  grep: /@cms/,
  dependencies: ["auth"],
} satisfies SharedProject

export const tddProject = {
  name: "tdd",
  grep: /@tdd/,
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
