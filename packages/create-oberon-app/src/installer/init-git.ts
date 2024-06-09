import { execSync } from "child_process"

function existsGit(cwd: string) {
  try {
    return execSync("git status", { cwd }).toString().indexOf("fatal:") !== 0
  } catch {
    return false
  }
}

export function initGit(appPath: string) {
  // Only commit if this is a new repo
  if (existsGit(appPath)) {
    return
  }

  try {
    execSync("git init", { cwd: appPath, stdio: "inherit" })

    execSync("git add .", { cwd: appPath, stdio: "inherit" })
    execSync('git commit -m "build(puck): generate app"', {
      cwd: appPath,
      stdio: "inherit",
    })
  } catch (error) {
    console.error("Failed to commit git changes", error)
  }
}
