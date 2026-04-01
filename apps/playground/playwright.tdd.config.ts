import { defineConfig } from "@dev/playwright"
import { tddProject } from "@dev/playwright/projects"
import playgroundConfig from "./playwright.config"

export default defineConfig({
  ...playgroundConfig,
  projects: [...(playgroundConfig.projects ?? []), tddProject],
})
