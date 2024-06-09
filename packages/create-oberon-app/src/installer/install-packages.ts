import { execSync } from "child_process"
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { Plugin } from "./install-adapter"

export const packageManagers = ["npm", "pnpm", "yarn"] as const
export type PackageManager = (typeof packageManagers)[number]
export const packageManagerChoices = [
  { title: "npm", value: "npm" },
  { title: "pnpm", value: "pnpm" },
  { title: "yarn", value: "yarn" },
]

async function updatePackageJson(appName: string, appPath: string) {
  const packageFilePath = path.join(appPath, "./package.json")

  const packageJson = JSON.parse(await readFile(packageFilePath, "utf-8")) as {
    name?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  const workspaceDeps = [] as string[]
  const dependencies =
    packageJson.dependencies || ({} as Record<string, string>)

  for (const dependancy in dependencies) {
    if (dependencies[dependancy]?.startsWith("workspace")) {
      workspaceDeps.push(dependancy)
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete dependencies[dependancy]
    }
  }

  const devDependencies =
    packageJson.devDependencies || ({} as Record<string, string>)
  const workspaceDevDeps = [] as string[]

  for (const dependancy in devDependencies) {
    if (devDependencies[dependancy]?.startsWith("workspace")) {
      workspaceDevDeps.push(dependancy)
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete devDependencies[dependancy]
    }
  }

  await writeFile(
    packageFilePath,
    JSON.stringify({
      ...packageJson,
      name: appName,
      dependencies,
      devDependencies,
    }),
  )

  return { workspaceDeps, workspaceDevDeps }
}

export async function installPackages({
  packageManager,
  appPath,
  appName,
  plugins,
}: {
  packageManager: PackageManager
  appPath: string
  appName: string
  plugins: Plugin[]
}) {
  /*
   * Adjust package.json
   */
  const { workspaceDeps, workspaceDevDeps } = await updatePackageJson(
    appName,
    appPath,
  )

  const pluginDependencies = plugins.flatMap(
    ({ packageName, dependencies = [] }) => [
      ...dependencies,
      ...(packageName ? [packageName] : []),
    ],
  )

  const dependencies = [...workspaceDeps, ...pluginDependencies]
  const devDependencies = workspaceDevDeps

  // https://github.com/tursodatabase/libsql-client-ts/issues/74
  if (packageManager === "pnpm") {
    await writeFile(
      path.join(appPath, "./.npmrc"),
      `
# https://github.com/tursodatabase/libsql-client-ts/issues/74
shamefully-hoist=true
`,
    )
  }

  execSync(`${packageManager} install`, {
    cwd: appPath,
    stdio: "inherit",
  })

  if (dependencies.length) {
    execSync(`${packageManager} install ${dependencies.join(" ")}`, {
      cwd: appPath,
      stdio: "inherit",
    })
  }

  if (devDependencies.length) {
    execSync(
      `${packageManager} install --save-dev ${devDependencies.join(" ")}`,
      {
        cwd: appPath,
        stdio: "inherit",
      },
    )
  }
}
