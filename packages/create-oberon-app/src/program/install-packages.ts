import { execSync } from "child_process"
import type { PackageManager } from "./config"

export function installPackages({
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
