import * as Menu from "@radix-ui/react-dropdown-menu"
import { ComponentProps, PropsWithChildren } from "react"
import { getClassNameFactory } from "../../../../compat/get-class-name-factory"
import styles from "./styles.module.css"

const getClassName = getClassNameFactory("DropdownMenu", styles)

export function DropdownMenu({ children }: PropsWithChildren) {
  return <Menu.Root>{children}</Menu.Root>
}

export function DropdownTrigger({
  children,
  ...props
}: PropsWithChildren<ComponentProps<typeof Menu.Trigger>>) {
  return (
    <Menu.Trigger className={getClassName("action")} {...props}>
      {children}
    </Menu.Trigger>
  )
}

export function DropdownContent({ children }: PropsWithChildren) {
  return (
    <Menu.Portal>
      <Menu.Content className={getClassName("content")}>
        {children}
      </Menu.Content>
    </Menu.Portal>
  )
}

export function DropdownItem({
  children,
  ...props
}: PropsWithChildren<ComponentProps<typeof Menu.Item>>) {
  return (
    <Menu.Item
      style={{ justifyContent: "left" }}
      className={getClassName("action")}
      {...props}
    >
      {children}
    </Menu.Item>
  )
}
