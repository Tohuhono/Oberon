import { copyFile, writeFile } from "fs/promises"
import path from "path"
import type { Plugin } from "./config"

const adapter = (plugins: Plugin[]) => {
  const aliasedPlugins = plugins.map(({ id, packageName, type }) => ({
    packageName,
    type,
    alias: id === "custom" ? `${type}Plugin` : id,
  }))

  const pluginImports = aliasedPlugins
    .map(({ packageName, type, alias }) => {
      if (alias === "turso") {
        return `import { databasePlugin as ${alias} } from "${packageName}"`
      }
      if (packageName) {
        return `import { plugin as ${alias} } from "${packageName}"`
      }

      return `import { plugin as ${alias} } from "./${type}"`
    })
    .join("\n")

  const adapterPlugins = [
    ...aliasedPlugins.map(({ alias }) => alias),
    // Auth plugin should be last
    "authPlugin",
  ]

  return `
import "server-cli-only"

import { initAdapter } from "@oberoncms/core/adapter"
${pluginImports}

import { authPlugin } from "@oberoncms/core/auth"

export const adapter = initAdapter([${adapterPlugins.join(", ")}])
`
}

export async function writePlugins(
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

  await writeFile(path.join(oberonPath, "adapter.ts"), adapter(plugins))
}
