import { readFile, writeFile } from "fs/promises"
import path from "path"

export async function updatePackageJson(appName: string, appPath: string) {
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
