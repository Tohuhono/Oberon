export const getToolbarPortal = (id: string) => {
  const base = document.querySelector("iframe")?.contentDocument || document

  // Iframe selector
  return base
    ?.querySelector(`[data-rfd-draggable-id="draggable-${id}"]`)
    ?.querySelector("button")?.parentElement
}
