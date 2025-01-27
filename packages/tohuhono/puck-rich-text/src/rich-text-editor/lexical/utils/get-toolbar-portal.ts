export const getToolbarPortal = () => {
  const base = document.querySelector("iframe")?.contentDocument || document

  return base
    ?.querySelector(`[data-puck-overlay="true"]`)
    ?.querySelector("button")?.parentElement
}
