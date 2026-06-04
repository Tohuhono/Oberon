import { copyFile, writeFile } from "fs/promises"
import path from "path"

import { type Recipe } from "./config"

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

function getAliasedPlugins(plugins: Plugin[], recipe: Recipe) {
  const aliasedPlugins = plugins.map(({ packageName, type }) => ({
    packageName,
    type,
    alias: `${type}Plugin`,
  }))

  if (recipe === "nextjs") {
    aliasedPlugins.push({
      packageName: "@oberoncms/plugin-nextjs",
      type: "nextjs",
      alias: "nextjsPlugin",
    })
  }

  return aliasedPlugins
}

const createConfig = (plugins: Plugin[], recipe: Recipe) => {
  const aliasedPlugins = getAliasedPlugins(plugins, recipe)

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
    "authPlugin",
  ]

  return `
import "server-cli-only"

import { defineConfig } from "@oberoncms/core"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

${pluginImports}

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [
    ${pluginAliasNames.join(", ")}
  ],
})
`
}

const createAdapter = () => {
  return `
import "server-cli-only"

import { initOberon } from "@oberoncms/core/adapter"

import { config } from "./config"

export const { actions, adapter, handler } = initOberon(config)
`
}

export async function installAdapter(
  oberonPath: string,
  pluginPath: string,
  plugins: Plugin[],
  recipe: Recipe,
) {
  for (const { packageName, type, id } of plugins) {
    if (packageName) {
      continue
    }
    await copyFile(path.join(pluginPath, type, `${id}.ts`), path.join(oberonPath, `${type}.ts`))
  }

  const config = createConfig(plugins, recipe)
  const adapter = createAdapter()

  await writeFile(path.join(oberonPath, "config.ts"), config)
  await writeFile(path.join(oberonPath, "adapter.ts"), adapter)
}
