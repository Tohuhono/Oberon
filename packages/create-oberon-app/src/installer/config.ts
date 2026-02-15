export const recipes = ["nextjs"] as const
export const recipeChoices = [{ title: "Next js", value: "nextjs" }]

export type Plugin = {
  id: string
  type: string
  label: string
  packageName?: string
  dependencies?: string[]
}

export const databaseIds = ["turso", "pgsql", "custom"] as const
export type DatabasePlugin = (typeof databaseIds)[number]
export const databasePlugins = {
  turso: {
    label: "Turso (Recommended)",
    packageName: "@oberoncms/plugin-turso",
  },
  pgsql: {
    label: "PostgreSQL",
    packageName: "@oberoncms/plugin-pgsql",
  },
  custom: {
    label: "Custom",
    dependencies: ["@tohuhono/utils"],
  },
}

export const sendIds = ["resend", "sendgrid", "custom"] as const
export type SendPlugin = (typeof sendIds)[number]
export const sendPlugins = {
  resend: { label: "Resend (Recommended)", dependencies: ["resend"] },
  sendgrid: { label: "Sendgrid", dependencies: ["@sendgrid/mail"] },
  custom: { label: "Custom", dependencies: ["@tohuhono/utils"] },
}

export const packageManagers = ["npm", "pnpm", "yarn"] as const
export type PackageManager = (typeof packageManagers)[number]
export const packageManagerChoices = [
  { title: "npm", value: "npm" },
  { title: "pnpm", value: "pnpm" },
  { title: "yarn", value: "yarn" },
]
