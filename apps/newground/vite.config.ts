import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import rsc from "@vitejs/plugin-rsc"
import { nitro } from "nitro/vite"
import { defineConfig, loadEnv } from "vite"

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  Object.assign(process.env, env)

  return {
    resolve: { tsconfigPaths: true },
    build: {
      rolldownOptions: {
        // Rolldown preserves directives despite emitting this Rollup-compatible warning:
        // https://github.com/rolldown/rolldown/pull/10791
        checks: { moduleLevelDirective: false },
      },
    },
    server: { port: parseInt(process.env.PORT || "5173") },
    preview: { port: parseInt(process.env.PORT || "5173") },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        rsc: { enabled: true },
        prerender: { enabled: false },
      }),
      nitro({ preset: "vercel", traceDeps: ["@tailwindcss/node*"] }),
      rsc(),
      viteReact(),
    ],
  }
})

export default config
