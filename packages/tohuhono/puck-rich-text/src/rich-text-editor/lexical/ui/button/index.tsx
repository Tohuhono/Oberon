import { ComponentProps } from "react"

import { getClassNameFactory } from "../../../../compat/get-class-name-factory"
import styles from "./styles.module.css"

const getClassName = getClassNameFactory("ToolbarButton", styles)

export const Button = ({
  active,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) => {
  return (
    <button
      className={getClassName()}
      style={{
        ...(active && { color: "var(--puck-color-azure-07)" }),
      }}
      {...props}
    />
  )
}
