/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { $isListNode, ListNode } from "@lexical/list"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode"
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text"
import { $isParentElementRTL } from "@lexical/selection"
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils"
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import { Dispatch, useCallback, useEffect, useState } from "react"

import { createPortal } from "react-dom"
import { Bold, Italic, RemoveFormatting } from "lucide-react"
import { getSelectedNode } from "../../../../rich-text-editor/lexical/utils/get-selected-node"
import { sanitizeUrl } from "../../../../rich-text-editor/lexical/utils/url"
import { Button } from "../../../../rich-text-editor/lexical/ui/button"
import { getToolbarPortal } from "../../../../rich-text-editor/lexical/utils/get-toolbar-portal"

import { isApple } from "../../../../rich-text-editor/lexical/utils/is-apple"
import { BlockFormatDropDown, blockFormats } from "./block-format-dropdown"
import { ElementFormatDropdown } from "./element-format-dropdown"

const IS_APPLE = isApple()

export function ToolbarPlugin({
  id,
  showToolbar,
  setIsLinkEditMode,
}: {
  id: string
  showToolbar: boolean
  setIsLinkEditMode: Dispatch<boolean>
}) {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] =
    useState<keyof typeof blockFormats>("paragraph")

  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left")
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [_isUnderline, setIsUnderline] = useState(false)

  const [isRTL, setIsRTL] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      // Update text format
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsRTL($isParentElementRTL(selection))

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          )
          const type = parentList
            ? parentList.getListType()
            : element.getListType()
          if (type in blockFormats) {
            setBlockType(type as keyof typeof blockFormats)
          }
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          if (type in blockFormats) {
            setBlockType(type as keyof typeof blockFormats)
          }
        }
      }
      // Handle buttons
      let matchingParent
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        )
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      )
    }
  }, [activeEditor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar()
        setActiveEditor(newEditor)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor, $updateToolbar])

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
    )
  }, [$updateToolbar, editor, activeEditor])

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload
        const { code, ctrlKey, metaKey } = event

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault()
          let url: string | null
          if (!isLink) {
            setIsLinkEditMode(true)
            url = sanitizeUrl("https://")
          } else {
            setIsLinkEditMode(false)
            url = null
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        }
        return false
      },
      COMMAND_PRIORITY_NORMAL,
    )
  }, [activeEditor, isLink, setIsLinkEditMode])

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor
        const focus = selection.focus
        const nodes = selection.getNodes()

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode
            }

            if (textNode.__style !== "") {
              textNode.setStyle("")
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0)
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat("")
            }
            node = textNode
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true)
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("")
          }
        })
      }
    })
  }, [activeEditor])

  /*
  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);
  */

  const portalTarget = getToolbarPortal(id)

  if (!showToolbar) {
    return null
  }

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div
      style={{
        display: "flex",
        gap: "4px",
        paddingLeft: "12px",
        borderLeft: "1px solid var(--puck-color-grey-4)",
        marginLeft: "8px",
      }}
    >
      <BlockFormatDropDown blockType={blockType} editor={editor} />

      <ElementFormatDropdown
        value={elementFormat}
        editor={editor}
        isRTL={isRTL}
      />
      <Button
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }}
        active={isBold}
        title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
        aria-label={`Format text as bold. Shortcut: ${
          IS_APPLE ? "⌘B" : "Ctrl+B"
        }`}
      >
        <Bold size={16} />
      </Button>
      <Button
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }}
        active={isItalic}
        title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
        aria-label={`Format text as italics. Shortcut: ${
          IS_APPLE ? "⌘I" : "Ctrl+I"
        }`}
      >
        <Italic size={16} />
      </Button>
      {/*<Button
        onClick={insertLink}
        className={"toolbar-item spaced " + (isLink ? "active" : "")}
        aria-label="Insert link"
        title="Insert link"
      >
        a
      </Button>*/}
      <Button
        onClick={clearFormatting}
        aria-label="Clear all text formatting"
        title="Clear text formatting"
      >
        <RemoveFormatting size={16} />
      </Button>
    </div>,
    portalTarget,
  )
}
