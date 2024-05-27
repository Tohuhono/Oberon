export function isApple() {
  return (
    typeof navigator !== "undefined" && navigator.userAgent.includes("Mac OS X")
  )
}
