import { initConfig } from "@tohuhono/vite-config"
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"

const config = initConfig()

export default {
  ...config,
  plugins: [
    ...config.plugins,
    // Bundle the css modules into the two output files
    cssInjectedByJsPlugin({
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(
        outputChunk,
      ) {
        return (
          outputChunk.fileName === "index.js" ||
          outputChunk.fileName === "server.js"
        )
      },
    }),
  ],
}
