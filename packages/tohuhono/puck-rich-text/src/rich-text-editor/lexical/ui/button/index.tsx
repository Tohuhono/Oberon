import { ComponentProps } from "react"

import { getClassNameFactory } from "../../../../compat/get-class-name-factory"
import styles from "./styles.module.css"

const getClassName = getClassNameFactory("ToolbarButton", styles)

export const Button = ({
  active,
  onClick,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) => {
  return (
    <button
      className={getClassName()}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      style={{
        ...(active && { background: "var(--puck-color-grey-02)" }),
      }}
      {...props}
    />
  )
}
