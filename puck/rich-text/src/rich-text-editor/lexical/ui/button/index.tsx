import { ComponentProps } from "react"

import "./styles.module.css"

export const Button = ({
  active,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) => {
  return (
    <button
      className={"ToolbarButton"}
      style={{
        ...(active && { color: "var(--puck-color-azure-07)" }),
      }}
      {...props}
    />
  )
}
