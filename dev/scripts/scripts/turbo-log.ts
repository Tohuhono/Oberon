#!/usr/bin/env tsx

import { spawn } from "node:child_process"
import { createInterface } from "node:readline"
import { pathToFileURL } from "node:url"

export function runTurboLog(turboArgs: string[]) {
  if (turboArgs.length === 0) {
    process.stderr.write("Usage: odt turbo <turbo-task> [...turbo-options]\n")
    process.exit(1)
  }

  const args = withJsonOutput(turboArgs)
  const child = spawn("pnpm", ["exec", "turbo", ...args], {
    stdio: ["inherit", "pipe", "pipe"],
  })

  const renderer = createRenderer()

  pipeTurboEvents(child.stdout, renderer.render)
  child.stderr.on("data", (chunk: Buffer) => {
    renderer.flushProgress()
    process.stderr.write(chunk)
  })

  child.on("error", (error) => {
    renderer.flushProgress()
    process.stderr.write(`Failed to start Turbo: ${error.message}\n`)
    process.exitCode = 1
  })

  child.on("close", (code, signal) => {
    renderer.flushProgress()

    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 1)
  })
}

function withJsonOutput(args: string[]) {
  const passthroughIndex = args.indexOf("--")
  const turboArgs = passthroughIndex === -1 ? args : args.slice(0, passthroughIndex)

  if (turboArgs.includes("--json")) return args

  if (passthroughIndex === -1) return [...args, "--json"]

  return [...turboArgs, "--json", ...args.slice(passthroughIndex)]
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runTurboLog(process.argv.slice(2))
}

function pipeTurboEvents(input: NodeJS.ReadableStream, renderer: (event: TurboEvent) => void) {
  const lines = createInterface({ input })

  lines.on("line", (line) => {
    const event = parseTurboEvent(line)

    if (event) {
      renderer(event)
    } else {
      process.stdout.write(`${line}\n`)
    }
  })
}

function createRenderer() {
  let activeSource: string | undefined
  let hasProgress = false
  const hiddenOutput = new Map<string, string[]>()
  const replayedSources = new Set<string>()

  return {
    flushProgress,
    render(event: TurboEvent) {
      if (!event.text) return

      if (event.source === "turbo") {
        const output = isErrorEvent(event) ? process.stderr : process.stdout

        flushProgress()
        for (const source of getFailedTaskSources(event)) {
          replayHiddenOutput(source)
        }
        activeSource = event.source
        output.write(`${event.text}\n`)
        return
      }

      if (!replayedSources.has(event.source)) {
        const output = hiddenOutput.get(event.source) ?? []

        output.push(event.text)
        hiddenOutput.set(event.source, output)
        process.stdout.write(".")
        hasProgress = true
        activeSource = undefined
        return
      }

      flushProgress()

      for (const line of event.text.split("\n")) {
        writeSourceHeader(event.source)
        process.stderr.write(`${line}\n`)
      }
    },
  }

  function flushProgress() {
    if (!hasProgress) return

    process.stdout.write("\n")
    hasProgress = false
  }

  function writeSourceHeader(source: string) {
    if (source === activeSource) return

    activeSource = source
    process.stderr.write(`${colorSource(source)}\n`)
  }

  function replayHiddenOutput(source: string) {
    if (replayedSources.has(source)) return

    replayedSources.add(source)
    const output = hiddenOutput.get(source)
    if (!output) return

    hiddenOutput.delete(source)

    for (const line of output) {
      writeSourceHeader(source)
      process.stderr.write(`${line}\n`)
    }
  }
}

function isErrorEvent(event: TurboEvent) {
  return event.level === "stderr" || event.level === "error"
}

function getFailedTaskSources(event: TurboEvent) {
  const failedTasks = event.text.match(/^\s*Failed:\s+(.+)$/m)?.[1]
  if (failedTasks) {
    return failedTasks.split(",").map((source) => source.trim())
  }

  if (!isErrorEvent(event)) return []

  const source = event.text.match(/^(.+?#.+?): command \(/)?.[1]

  return source ? [source] : []
}

function parseTurboEvent(line: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(line)
  } catch {
    return undefined
  }

  if (!isTurboEvent(parsed)) return undefined

  return parsed
}

function isTurboEvent(value: unknown): value is TurboEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "source" in value &&
    "level" in value &&
    "text" in value &&
    typeof value.source === "string" &&
    typeof value.level === "string" &&
    typeof value.text === "string"
  )
}

function colorSource(source: string) {
  const label = formatSource(source)

  if (process.env.NO_COLOR) return label

  const colors = [31, 32, 33, 34, 35, 36, 91, 92, 93, 94, 95, 96]
  const color = colors[hashSource(source) % colors.length]

  return `\u001B[${color}m${label}\u001B[0m`
}

function formatSource(source: string) {
  const [packageName = source, taskName] = source.split("#")
  const shortPackageName = packageName.split("/").at(-1) ?? packageName

  return taskName ? `${shortPackageName}#${taskName}` : shortPackageName
}

function hashSource(source: string) {
  let hash = 0

  for (const character of source) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash
}

type TurboEvent = {
  source: string
  level: string
  text: string
}
