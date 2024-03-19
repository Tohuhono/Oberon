import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  LexicalEditor,
} from "lexical"

import {
  LucideIcon,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
} from "lucide-react"
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "../../ui/dropdown-menu"

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    Icon: LucideIcon
    IconRTL: LucideIcon
    name: string
    command: string
  }
} = {
  left: {
    Icon: AlignLeft,
    IconRTL: AlignLeft,
    name: "Left Align",
    command: "left",
  },
  center: {
    Icon: AlignCenter,
    IconRTL: AlignCenter,
    name: "Center Align",
    command: "center",
  },
  justify: {
    Icon: AlignJustify,
    IconRTL: AlignJustify,
    name: "Justify Align",
    command: "justify",
  },
  right: {
    Icon: AlignRight,
    IconRTL: AlignRight,
    name: "Right Align",
    command: "right",
  },
  start: {
    Icon: AlignLeft,
    IconRTL: AlignRight,
    name: "Start Align",
    command: "start",
  },
  end: {
    Icon: AlignRight,
    IconRTL: AlignLeft,
    name: "End Align",
    command: "end",
  },
}

export function ElementFormatDropdown({
  editor,
  value,
  isRTL,
}: {
  editor: LexicalEditor
  value: ElementFormatType
  isRTL: boolean
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"]

  const TriggerIcon = isRTL ? formatOption.IconRTL : formatOption.Icon

  return (
    <DropdownMenu>
      <DropdownTrigger>
        <TriggerIcon size={16} />
      </DropdownTrigger>

      <DropdownContent>
        {Object.keys(ELEMENT_FORMAT_OPTIONS).map((key) => {
          // @ts-expect-error one day ts will fix this
          const { Icon, IconRTL, name, command } = ELEMENT_FORMAT_OPTIONS[key]
          return (
            <DropdownItem
              key={key}
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, command)
              }}
            >
              {isRTL ? <IconRTL size={16} /> : <Icon size={16} />}
              <span style={{ marginLeft: "4px" }}>{name}</span>
            </DropdownItem>
          )
        })}
      </DropdownContent>
    </DropdownMenu>
  )
}
