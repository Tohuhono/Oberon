import { exit } from "process"
import prompts from "prompts"
import { z } from "zod"
import validateName from "validate-npm-package-name"
import {
  databaseIds,
  databasePlugins,
  packageManagerChoices,
  recipeChoices,
  sendIds,
  sendPlugins,
  type DatabasePlugin,
  type PackageManager,
  type SendPlugin,
} from "./config"

// Lifted from https://github.com/vercel/next.js/blob/c2d7bbd1b82c71808b99e9a7944fb16717a581db/packages/create-next-app/helpers/get-pkg-manager.ts
export function getPackageManager(): PackageManager | undefined {
  const userAgent = process.env.npm_config_user_agent || ""

  if (userAgent.startsWith("yarn")) {
    return "yarn"
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm"
  }

  if (userAgent.startsWith("npm")) {
    return "npm"
  }

  return undefined
}

function onCancel() {
  exit(0)
}

export async function promptOptions(
  appName: unknown,
  args: Partial<{
    use: string
    recipe: string
    database: string
    email: string
    send: string
  }>,
): Promise<{
  appName: string
  recipe: string
  database: DatabasePlugin
  email: string
  send: SendPlugin
  packageManager: PackageManager
}> {
  prompts.override({
    appName,
    packageManager: args.use || getPackageManager(),
    ...args,
  })

  return await prompts(
    [
      {
        type: "text" as const,
        name: "appName",
        message: "What is the name of your app?",
        initial: "oberon",
        validate: (value: string) => {
          const { validForNewPackages, errors } = validateName(value)
          return validForNewPackages || errors?.join(", ") || false
        },
      },
      {
        type: "text" as const,
        name: "email",
        message:
          "Master email - this user has superadmin priviledges for the cms",
        initial: args.email,
        validate: (value: string) => {
          const { success, error } = z.string().email().safeParse(value)
          return success || error.format()._errors.join(", ")
        },
      },
      {
        type: "select" as const,
        name: "packageManager",
        message: "Package Manager",
        choices: packageManagerChoices,
      },
      {
        type: "select" as const,
        name: "recipe",
        message: "Which recipe would you like to use?",
        choices: recipeChoices,
      },
      {
        type: "select" as const,
        name: "database",
        message: "Which database would you like to use?",
        choices: databaseIds.map((id) => ({
          value: id,
          title: databasePlugins[id].label,
        })),
      },
      {
        type: "select" as const,
        name: "send",
        message: "Which send plugin would you like to use?",
        choices: sendIds.map((id) => ({
          value: id,
          title: sendPlugins[id].label,
        })),
      },
    ],
    { onCancel },
  )
}
