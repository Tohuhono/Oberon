import { execSync } from "child_process"

function existsGit(cwd: string) {
  try {
    return (
      execSync("git rev-parse --is-inside-work-tree", {
        cwd,
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim() === "true"
    )
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
  } catch (error) {
    console.error("Failed to commit git changes", error)
  }
}
