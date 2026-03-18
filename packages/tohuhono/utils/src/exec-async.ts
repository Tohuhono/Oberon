import { spawn } from "child_process"

export type ExecAsyncOptions = {
  cwd?: string
  env?: NodeJS.ProcessEnv
  stdio?: "ignore" | "inherit" | "pipe"
}

export function execAsync(
  command: string,
  args: string[],
  options: ExecAsyncOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: options.stdio ?? "inherit",
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(
          `Command failed (exit ${code}): ${command} ${args.join(" ")}`,
        ),
      )
    })

    child.on("error", reject)
  })
}
