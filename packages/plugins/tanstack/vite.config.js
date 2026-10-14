import { initConfig } from "@dev/vite"

export default initConfig({
  plugins: [
    {
      name: "external-pre-resolver",
      enforce: "pre", // Run before Vite's built-in resolver hooks
      resolveId(source) {
        // Intercept bare specifiers before Vite crawls their package.json imports
        if (
          source.startsWith("@tanstack") ||
          source.startsWith("better-auth") ||
          source === "#tanstack-start-entry" ||
          source === "#tanstack-router-entry"
        ) {
          return { id: source, external: true }
        }
      },
    },
  ],
})
