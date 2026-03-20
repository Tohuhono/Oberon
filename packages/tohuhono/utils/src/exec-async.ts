import { spawn, type SpawnOptions } from "child_process"

export function execAsync(
  command: string,
  args: string[],
  options: SpawnOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: "pipe",
    })

    let output = ""

    child.stdout?.on("data", (data) => (output += data.toString()))
    child.stderr?.on("data", (data) => (output += data.toString()))

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(output)
      } else {
        reject(new Error(`Command failed (exit ${code}): ${output}`))
      }
    })

    child.on("error", (err) => reject(err))
  })
}
