import { base, defineConfig } from "@dev/playwright"

export default defineConfig({
  ...base,
  webServer: {
    command: "pnpm start -p 3201",
    url: "http://localhost:3201",
  },
  projects: [
    {
      name: "playground",
      testMatch: "test/**/*.spec.ts",
      use: { baseURL: "http://localhost:3201" },
    },
  ],
})
