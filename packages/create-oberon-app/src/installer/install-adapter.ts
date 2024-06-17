import { copyFile, writeFile } from "fs/promises"
import path from "path"

export type Plugin = {
  id: string
  type: string
  label: string
  packageName?: string
  dependencies?: string[]
}

export const databasePlugins = {
  turso: {
    label: "Turso (Recommended)",
    packageName: "@oberoncms/plugin-turso",
  },
  pgsql: {
    label: "PostgreSQL",
    packageName: "@oberoncms/plugin-pgsql",
  },
  "vercel-postgres": {
    label: "Vercel Postgres",
    packageName: "@oberoncms/plugin-vercel-postgres",
  },
  custom: {
    label: "Custom",
    dependencies: ["@tohuhono/utils"],
  },
}
export type DatabasePlugin = keyof typeof databasePlugins
export const databaseIds = Object.keys(databasePlugins) as DatabasePlugin[]

export const sendPlugins = {
  resend: { label: "Resend (Recommended)", dependencies: ["resend"] },
  sendgrid: { label: "Sendgrid", dependencies: ["@sendgrid/mail"] },
  custom: { label: "Custom", dependencies: ["@tohuhono/utils"] },
}
export type SendPlugin = keyof typeof sendPlugins
export const sendIds = Object.keys(sendPlugins) as SendPlugin[]

const createAdapter = (plugins: Plugin[]) => {
  const aliasedPlugins = plugins.map(({ packageName, type }) => ({
    packageName,
    type,
    alias: `${type}Plugin`,
  }))

  const pluginImports = aliasedPlugins
    .map(({ packageName, type, alias }) => {
      if (packageName) {
        return `import { plugin as ${alias} } from "${packageName}"`
      }

      return `import { plugin as ${alias} } from "./${type}"`
    })
    .join("\n")

  const pluginAliasNames = [
    // Development plugin should be first
    "developmentPlugin",
    ...aliasedPlugins.map(({ alias }) => alias),
    // Auth plugin should be last
    "authPlugin",
  ]

  return `
import "server-cli-only"

import { initOberon } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

${pluginImports}

import { config } from "./config"

export const { adapter, handlers } = initOberon({
  config,
  plugins: [
    ${pluginAliasNames.join(", ")}
  ],
})
`
}

export async function installAdapter(
  oberonPath: string,
  pluginPath: string,
  plugins: Plugin[],
) {
  for (const { packageName, type, id } of plugins) {
    if (packageName) {
      continue
    }
    await copyFile(
      path.join(pluginPath, type, `${id}.ts`),
      path.join(oberonPath, `${type}.ts`),
    )
  }

  const adapter = createAdapter(plugins)

  await writeFile(path.join(oberonPath, "adapter.ts"), adapter)
}
