import { Menu } from "@base-ui/react/menu"
import { ComponentProps, PropsWithChildren } from "react"
import { getClassNameFactory } from "../../../../compat/get-class-name-factory"
import styles from "./styles.module.css"

const getClassName = getClassNameFactory("DropdownMenu", styles)

export function DropdownMenu({ children }: PropsWithChildren) {
  return <Menu.Root>{children}</Menu.Root>
}

export function DropdownTrigger({
  children,
  onClick,
  ...props
}: PropsWithChildren<ComponentProps<typeof Menu.Trigger>>) {
  return (
    <Menu.Trigger
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      className={getClassName("action")}
      {...props}
    >
      {children}
    </Menu.Trigger>
  )
}

export function DropdownContent({ children }: PropsWithChildren) {
  return (
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup className={getClassName("content")}>{children}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

export function DropdownItem({
  children,
  onClick,
  ...props
}: PropsWithChildren<ComponentProps<typeof Menu.Item>>) {
  return (
    <Menu.Item
      style={{ justifyContent: "left" }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      className={getClassName("action")}
      {...props}
    >
      {children}
    </Menu.Item>
  )
}
