// @ts-check
// vite.config.js
import { writeFile, mkdir } from "fs/promises"
import { defineConfig, type Plugin } from "vite"
import preserveDirectives from "rollup-preserve-directives"
import fg from "fast-glob"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"

function watchFile(): Plugin {
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

  // Maps the file paths in the "files" array to an array of key-value pair.
  const entities = files.map((file) => {
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

export function initConfig(entryPoints: string[] = ["src/*.ts"]) {
  return defineConfig({
    plugins: [
      externalizeDeps(),
      tsconfigPaths(),
      preserveDirectives(),
      watchFile(),
    ],
    build: {
      lib: {
        entry: parseEntryPoints(entryPoints),
        name: "MyLib",
        formats: ["es"],
      },
      emptyOutDir: false,
      rollupOptions: {
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
        },
      },
    },
  })
}

export const config = initConfig()
