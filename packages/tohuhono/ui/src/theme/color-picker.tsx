"use client"

import { PopoverContent } from "@radix-ui/react-popover"
import {
  hslaToHsva,
  hsvaToHex,
  type ColorResult,
  type HslColor,
} from "@uiw/react-color"
import ChromeColorPicker from "@uiw/react-color-chrome"
import { Popover, PopoverTrigger } from "../popover"

export const ColorPicker = ({
  disabled,
  color,
  onColorChange,
}: {
  disabled?: boolean
  color: HslColor
  onColorChange: (color: ColorResult) => void
}) => {
  const hsva = hslaToHsva({ ...color, a: 1 })

  return (
    <Popover>
      <PopoverTrigger disabled={disabled} asChild>
        <button
          className="my-1 size-6 flex-shrink-0 rounded border"
          style={{ backgroundColor: hsvaToHex(hsva) }}
        />
      </PopoverTrigger>
      <PopoverContent className="isolate z-50">
        <ChromeColorPicker
          color={hsva}
          onChange={onColorChange}
          showHue={true}
          showColorPreview={true}
        />
      </PopoverContent>
    </Popover>
  )
}
