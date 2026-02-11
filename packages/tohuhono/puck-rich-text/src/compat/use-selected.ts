import { usePuck } from "@puckeditor/core"

export const useSelected = (componentId: string) => {
  const {
    appState: {
      ui: { itemSelector },
      data,
    },
    dispatch,
  } = usePuck()

  if (!itemSelector) {
    return {
      isSelected: false,
      onChange: () => {},
    }
  }

  const { index: destinationIndex, zone: destinationZone } = itemSelector

  if (!destinationZone) {
    return {
      isSelected: false,
      onChange: () => {},
    }
  }

  const item =
    destinationZone !== "default-zone"
      ? data.zones?.[destinationZone]?.[destinationIndex]
      : data.content[destinationIndex]

  if (item?.props.id !== componentId) {
    return {
      isSelected: false,
      onChange: () => {},
    }
  }

  return {
    isSelected: true,
    onChange: (props: Partial<typeof item.props>) =>
      dispatch({
        type: "replace",
        destinationIndex,
        destinationZone,
        data: {
          props: { ...item.props, ...props },
          type: item.type,
        },
      }),
  }
}
