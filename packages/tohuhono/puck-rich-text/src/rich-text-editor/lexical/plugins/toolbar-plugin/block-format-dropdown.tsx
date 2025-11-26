import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list"
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { $createParagraphNode, $getSelection, LexicalEditor } from "lexical"
import {
  Pilcrow,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ListOrdered,
  List,
  TextQuote,
} from "lucide-react"
import {
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "../../ui/dropdown-menu"

export const blockFormats = {
  paragraph: { label: "Paragaph", Icon: Pilcrow },
  h1: { label: "Heading 1", Icon: Heading1 },
  h2: { label: "Heading 2", Icon: Heading2 },
  h3: { label: "Heading 3", Icon: Heading3 },
  h4: { label: "Heading 4", Icon: Heading4 },
  h5: { label: "Heading 5", Icon: Heading5 },
  h6: { label: "Heading 6", Icon: Heading6 },
  bullet: { label: "Bulleted List", Icon: List },
  number: { label: "Numbered List", Icon: ListOrdered },
  quote: { label: "Quote", Icon: TextQuote },
  code: { label: "Code Block", Icon: Code },
} as const

export function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockFormats
  editor: LexicalEditor
  disabled?: boolean
}) {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createParagraphNode())
    })
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      })
    }
  }

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => $createQuoteNode())
      })
    }
  }

  const TriggerIcon = blockFormats[blockType].Icon

  return (
    <DropdownMenu>
      <DropdownTrigger
        disabled={disabled}
        aria-label="Formatting options for text style"
      >
        <TriggerIcon size={16} />
      </DropdownTrigger>

      <DropdownContent>
        <DropdownItem onClick={formatParagraph}>
          <blockFormats.paragraph.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>
            {blockFormats.paragraph.label}
          </span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h1")}>
          <blockFormats.h1.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h1.label}</span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h2")}>
          <blockFormats.h2.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h2.label}</span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h3")}>
          <blockFormats.h3.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h3.label}</span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h4")}>
          <blockFormats.h4.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h4.label}</span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h5")}>
          <blockFormats.h5.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h5.label}</span>
        </DropdownItem>
        <DropdownItem onClick={() => formatHeading("h6")}>
          <blockFormats.h6.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.h6.label}</span>
        </DropdownItem>
        <DropdownItem onClick={formatBulletList}>
          <blockFormats.bullet.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.bullet.label}</span>
        </DropdownItem>
        <DropdownItem onClick={formatNumberedList}>
          <blockFormats.number.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.number.label}</span>
        </DropdownItem>
        <DropdownItem onClick={formatQuote}>
          <blockFormats.quote.Icon size={16} />
          <span style={{ marginLeft: "4px" }}>{blockFormats.quote.label}</span>
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  )
}
