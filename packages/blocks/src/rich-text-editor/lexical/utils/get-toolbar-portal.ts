export const getToolbarPortal = (id: string) => {
  return document
    .querySelector(`[data-rfd-draggable-id="draggable-${id}"]`)
    ?.querySelector("button")?.parentElement
}

/*    
  return document
    .getElementsByClassName(
      "styles_DraggableComponent styles_DraggableComponent--isSelected"
    )?.[0]
    ?.getElementsByClassName("styles_DraggableComponent-actionsLabel")?.[0];
*/
