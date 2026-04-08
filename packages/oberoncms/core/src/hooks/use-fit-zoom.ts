import { useLayoutEffect, useRef, useState } from "react"

export const useFitZoom = (targetWidth: number | "100%") => {
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<string | number>("100%") // Added state
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    // Use ResizeObserver to track dynamic changes (window resize, sidebar toggle, etc.)
    const observer = new ResizeObserver((entries) => {
      if (targetWidth === "100%" || targetWidth === 0) {
        console.log("111")
        setScale(1)
        setScaledHeight("100%")
        return
      }
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        const containerHeight = entry.contentRect.height
        const newScale = Math.min(containerWidth / targetWidth, 1)

        setScale(newScale)
        setScaledHeight(containerHeight * newScale)
      }
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [targetWidth])

  return { ref: containerRef, scale, scaledHeight }
}
