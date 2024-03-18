import { usePuck } from "@measured/puck"

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

  const item =
    itemSelector.zone && itemSelector.zone !== "default-zone"
      ? data.zones?.[itemSelector.zone]?.[itemSelector.index]
      : data.content[itemSelector.index]

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
        destinationIndex: itemSelector.index,
        destinationZone: itemSelector.zone || "",
        data: {
          props: { ...item.props, ...props },
          type: item.type,
        },
      }),
  }
}
