import { writeFile, mkdir } from "fs/promises"

import fg from "fast-glob"
import { dts } from "rolldown-plugin-dts"
import {
  type ResolveOptions,
  type Rolldown,
  createLogger,
  defineConfig,
  type Plugin as VitePlugin,
} from "vite"

function externalizePackages(): VitePlugin {
  return {
    name: "externalize-packages",
    enforce: "pre",
    resolveId: {
      order: "pre",
      handler(source) {
        if (!source.startsWith(".") && !source.startsWith("/") && !source.startsWith("\0")) {
          return { id: source, external: true }
        }
      },
    },
  }
}

// Tells turbo in dev mode that the first build has finished
function watchFile(): VitePlugin {
  return {
    name: "watch-version",
    enforce: "post" as const,
    closeBundle: {
      order: "post" as const,
      async handler() {
        await mkdir("./dist", { recursive: true })
        await writeFile("./dist/version", `0.0.0`)
      },
    },
  }
}

function parseEntryPoints(entryPoints: string[] = ["src/*.ts"]) {
  // Searches for files that match the patterns defined in the array of input points.
  // Returns an array of absolute file paths.
  const files = fg.sync(entryPoints, { absolute: true })
  const sourceFiles = files.filter((file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file))

  // Maps the file paths in the "files" array to an array of key-value pair.
  const entities = sourceFiles.map((file) => {
    // Extract the part of the file path after the "src" folder and before the file extension.
    const [key] = file.match(/(?<=src\/).*$/) || []

    // Remove the file extension from the key.
    const keyWithoutExt = key?.substring(0, key.lastIndexOf(".")) || key

    return [keyWithoutExt, file]
  })

  // Convert the array of key-value pairs to an object using the Object.fromEntries() method.
  // Returns an object where each key is the file name without the extension and the value is the absolute file path.
  return Object.fromEntries(entities)
}

export function initConfig({
  entryPoints = ["src/*.ts", "src/*.tsx"],
  plugins = [],
  external,
  resolve,
}: {
  entryPoints?: string[]
  plugins?: VitePlugin[]
  external?: Rolldown.ExternalOption
  resolve?: ResolveOptions
} = {}) {
  const logger = createLogger()

  return defineConfig({
    logLevel: "info",
    customLogger: {
      ...logger,
      info: (msg, options) => {
        // Clean gzip output
        if (msg.includes("dist/") && msg.includes(" gzip: ")) {
          return
        }
        logger.info(msg, options)
      },
    },
    resolve,
    plugins: [...plugins, externalizePackages(), dts({ generator: "tsgo" }), watchFile()],
    oxc: {
      exclude: [/\.js$/, /\.d\.[cm]?ts$/],
    },
    build: {
      minify: false,
      lib: {
        entry: parseEntryPoints(entryPoints),
        name: "MyLib",
        formats: ["es"],
      },
      emptyOutDir: false,
      rolldownOptions: {
        external,
        // preserveModules emits modules 1:1 so "use client" survives, but rolldown
        // warns for every directive regardless: https://github.com/rolldown/rolldown/pull/10791
        checks: { moduleLevelDirective: false },
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
        },
      },
    },
  })
}
