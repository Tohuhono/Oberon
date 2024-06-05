import { execSync } from "child_process"
import { writeFile } from "fs/promises"
import path from "path"
import type { PackageManager } from "./config"

export async function installPackages({
  packageManager,
  appPath,
  dependencies,
  devDependencies,
}: {
  packageManager: PackageManager
  appPath: string
  dependencies: string[]
  devDependencies: string[]
}) {
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
