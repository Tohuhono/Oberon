import { createPageCachePlugin } from "@oberoncms/plugin-tanstack/nitro"
import { useRuntimeConfig } from "nitro/runtime-config"

export default createPageCachePlugin({
  deployment: useRuntimeConfig().oberonCacheDeployment,
})
