import { ResponseError, type OberonClientConfig } from "@oberoncms/core"
import { lazy, Suspense } from "react"

import { SHARED_COMPONENT } from "./model"

const SharedEditor = lazy(() =>
  import("./client").then((module) => ({ default: module.SharedEditor })),
)
const SharedPreview = lazy(() =>
  import("./client").then((module) => ({ default: module.SharedPreview })),
)
const SharedLibrary = lazy(() =>
  import("./client").then((module) => ({ default: module.SharedLibrary })),
)
const loading = (
  <div role="status" className="grid min-h-96 place-items-center text-muted-foreground">
    Loading Shared components...
  </div>
)

export function withSharedComponents(config: OberonClientConfig): OberonClientConfig {
  return {
    ...config,
    components: {
      ...config.components,
      [SHARED_COMPONENT]: {
        label: "Shared component",
        render: () => {
          throw new ResponseError(
            "Shared content is not prepared. Register the Shared components Plugin and pass the Adapter to Oberon Render.",
          )
        },
      },
    },
    authoring: {
      ...config.authoring,
      label: "Shared",
      Editor: (props) => (
        <Suspense fallback={loading}>
          <SharedEditor {...props} />
        </Suspense>
      ),
      Preview: (props) => (
        <Suspense fallback={loading}>
          <SharedPreview {...props} />
        </Suspense>
      ),
      Library: (props) => (
        <Suspense fallback={loading}>
          <SharedLibrary {...props} />
        </Suspense>
      ),
    },
  }
}
