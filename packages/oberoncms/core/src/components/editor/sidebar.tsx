"use client"

import "@puckeditor/core/puck.css"

import { Button } from "@tohuhono/ui/button"
import { cn, isValidKey } from "@tohuhono/utils"

import {
  CardStackPlusIcon,
  ListBulletIcon,
  MixerHorizontalIcon,
  DragHandleDots2Icon,
} from "@radix-ui/react-icons"

import { useState, type PropsWithChildren } from "react"
import { createUsePuck, Puck } from "@puckeditor/core"

const usePuck = createUsePuck()

const sidebarTabs = {
  components: { label: "Components", Icon: CardStackPlusIcon },
  outline: { label: "Layout", Icon: ListBulletIcon },
  fields: { label: "Page Settings", Icon: MixerHorizontalIcon },
} as const
export type SidebarTab = keyof typeof sidebarTabs

export const Drawer = ({ children }: PropsWithChildren) => (
  <div className="h-full space-y-1">{children}</div>
)

export const DrawerItem = ({ name }: { name: string }) => (
  <div className="bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground flex-cols-2 flex cursor-grab items-baseline justify-between rounded-sm border px-2 py-1 shadow transition-colors">
    {name}
    <DragHandleDots2Icon />
  </div>
)

export const SidebarTabs = ({
  activeTab,
  setActiveTab,
  className,
}: {
  activeTab: SidebarTab
  setActiveTab: (tab: SidebarTab) => void
  className?: string
}) => (
  <div role="tablist" aria-label="Editor tools" className={className}>
    {Object.entries(sidebarTabs).map(([tabValue, { label, Icon }]) => (
      <Button
        key={tabValue}
        role="tab"
        aria-label={label}
        aria-selected={activeTab === tabValue}
        aria-controls={`editor-tool-${tabValue}`}
        title={label}
        variant="tab"
        size="icon"
        onClick={() =>
          isValidKey(tabValue, sidebarTabs) && setActiveTab(tabValue)
        }
      >
        <Icon className="s-4" />
        <span className="sr-only">{label}</span>
      </Button>
    ))}
  </div>
)

export const useSidebarTab = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("fields")

  return { activeTab, setActiveTab }
}

export const SidebarHeading = ({
  activeTab,
  className,
}: {
  activeTab: SidebarTab
  className?: string
}) => {
  const selectedComponent = usePuck(
    (s) => s.selectedItem?.type || sidebarTabs["fields"].label,
  )

  const tabLabel =
    activeTab === "fields" ? selectedComponent : sidebarTabs[activeTab].label

  return <h3 className={cn(className, "p-2 pl-4")}>{tabLabel}</h3>
}

export const Sidebar = ({
  activeTab,
  className,
}: {
  activeTab: SidebarTab
  className?: string
}) => {
  return (
    <div className={cn(className, "h-full overflow-auto p-2")}>
      <div id={`editor-tool-${activeTab}`} role="tabpanel">
        {activeTab === "components" && <Puck.Components />}
        {activeTab === "outline" && <Puck.Outline />}
        {activeTab === "fields" && <Puck.Fields />}
      </div>
    </div>
  )
}
