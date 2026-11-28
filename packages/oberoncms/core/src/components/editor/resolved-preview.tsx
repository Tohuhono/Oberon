"use client"

import { Render, resolveAllData } from "@puckeditor/core"
import { useEffect, useState, type ComponentProps } from "react"

export function ResolvedPreview({ config, data, metadata }: ComponentProps<typeof Render>) {
  const [resolution, setResolution] = useState<
    { input: typeof data; data: typeof data } | { input: typeof data; error: Error }
  >()

  useEffect(() => {
    let current = true
    void resolveAllData(data, config, metadata).then(
      (result) => {
        if (current) setResolution({ input: data, data: result })
      },
      (cause: unknown) => {
        if (current) {
          setResolution({
            input: data,
            error: new Error("Could not resolve Puck data for Preview", { cause }),
          })
        }
      },
    )
    return () => {
      current = false
    }
  }, [config, data, metadata])

  const resolved = resolution?.input === data ? resolution : undefined
  if (resolved && "error" in resolved) throw resolved.error
  return <Render config={config} data={resolved?.data ?? data} metadata={metadata} />
}
