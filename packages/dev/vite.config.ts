// @ts-check
// vite.config.js
import { writeFile, mkdir } from "fs/promises"
import { defineConfig } from "vite"
import preserveDirectives from "rollup-preserve-directives"
import dts from "vite-plugin-dts"
import fg from "fast-glob"
import { externalizeDeps } from "vite-plugin-externalize-deps"

// Defines an array of entry points to be used to search for files.
const entryPoints = ["src/*.ts"]

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
const entry = Object.fromEntries(entities)

function watchFile() {
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

export default defineConfig({
  plugins: [
    externalizeDeps(),
    preserveDirectives(),
    //dts({ rollupTypes: true }),
    watchFile(),
  ],
  build: {
    lib: {
      entry,
      name: "MyLib",
      formats: ["es"],
    },
    emptyOutDir: false,
  },
})
