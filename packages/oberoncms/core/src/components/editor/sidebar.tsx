"use client"

import "@puckeditor/core/puck.css"

import { Puck } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
import { useState } from "react"

const PanelTabs = ({
  value,
  onChange,
}: {
  value: "insert" | "outline" | "inspector"
  onChange: (tab: "insert" | "outline" | "inspector") => void
}) => (
  <div
    role="tablist"
    aria-label="Editor tools"
    className="bg-secondary/50 border-b p-2"
  >
    <div className="grid grid-cols-3 gap-1">
      <Button
        role="tab"
        aria-selected={value === "insert"}
        aria-controls="editor-panel-insert"
        variant={value === "insert" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("insert")}
      >
        Insert
      </Button>
      <Button
        role="tab"
        aria-selected={value === "outline"}
        aria-controls="editor-panel-outline"
        variant={value === "outline" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("outline")}
      >
        Outline
      </Button>
      <Button
        role="tab"
        aria-selected={value === "inspector"}
        aria-controls="editor-panel-inspector"
        variant={value === "inspector" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("inspector")}
      >
        Inspector
      </Button>
    </div>
  </div>
)

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<
    "insert" | "outline" | "inspector"
  >("insert")

  return (
    <aside
      data-testid="editor-tool-shell"
      className="bg-background text-card-foreground flex h-full flex-col"
    >
      <PanelTabs value={activeTab} onChange={setActiveTab} />
      <div
        className="h-full overflow-auto p-2"
        id={`editor-tool-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "insert" && <Puck.Components />}
        {activeTab === "outline" && <Puck.Outline />}
        {activeTab === "inspector" && <Puck.Fields />}
      </div>
    </aside>
  )
}
