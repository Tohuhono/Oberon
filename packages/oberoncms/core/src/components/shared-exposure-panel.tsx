"use client"

import { createUsePuck, type Config } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
import { Input } from "@tohuhono/ui/input"
import { Switch } from "@tohuhono/ui/switch"

import { useSharedSourceSettings } from "../hooks/use-shared-source-settings"
import { createSharedExposureKey, getNodeById } from "../lib/shared-components"
import { isSharedEditorComponent } from "./shared-component-render"

const usePuck = createUsePuck()

export function SharedExposurePanel({ config }: { config: Config }) {
  const {
    settings: { exposures, defaults },
    updateSettings,
  } = useSharedSourceSettings()
  const selectedItem = usePuck((state) => state.selectedItem)
  const currentData = usePuck((state) => state.appState.data)
  const selectedId = typeof selectedItem?.props.id === "string" ? selectedItem.props.id : null
  const component = selectedItem ? config.components[selectedItem.type] : undefined
  const fields =
    selectedItem && isSharedEditorComponent(selectedItem.type)
      ? []
      : Object.entries(component?.fields ?? {})
          .filter(([prop]) => prop !== "id")
          .map(([prop, field]) => ({ prop, label: field.label, type: field.type }))
  const selectedExposures = exposures.filter((item) => item.nodeId === selectedId)

  const removeExposure = (key: string) => {
    updateSettings({
      exposures: exposures.filter((item) => item.key !== key),
      defaults: Object.fromEntries(Object.entries(defaults).filter(([itemKey]) => itemKey !== key)),
    })
  }

  return (
    <section className="mt-6 border-t pt-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Shared or per instance</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{exposures.length} exposed</span>
      </header>
      <p className="mt-2 text-xs text-muted-foreground">
        Keep design shared. Expose only the props each instance can change. Source values become
        insertion defaults.
      </p>
      {selectedItem ? (
        <div className="mt-4 space-y-2">
          {fields.map(({ prop, label: fieldLabel, type }) => {
            const exposure = selectedExposures.find((item) => item.prop === prop)
            const label = fieldLabel || prop

            return (
              <div key={prop} className="rounded border p-3">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{label}</span>
                  <Switch
                    aria-label={`Expose ${label}`}
                    checked={Boolean(exposure)}
                    onCheckedChange={(checked) => {
                      if (checked && selectedId) {
                        updateSettings({
                          exposures: [
                            ...exposures,
                            {
                              key: createSharedExposureKey(),
                              nodeId: selectedId,
                              prop,
                              label,
                            },
                          ],
                        })
                      } else if (exposure) {
                        removeExposure(exposure.key)
                      }
                    }}
                  />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {exposure
                    ? type === "slot"
                      ? "Children belong to each instance"
                      : "Editable on each instance"
                    : "Shared across all instances"}
                </p>
                {exposure && (
                  <div className="mt-3 space-y-1">
                    <label className="text-xs" htmlFor={`shared-prop-label-${exposure.key}`}>
                      Prop label
                    </label>
                    <Input
                      id={`shared-prop-label-${exposure.key}`}
                      value={exposure.label}
                      onChange={(event) =>
                        updateSettings({
                          exposures: exposures.map((item) =>
                            item.key === exposure.key
                              ? { ...item, label: event.currentTarget.value }
                              : item,
                          ),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Renaming keeps existing instance values.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Select a component to manage its props.
        </p>
      )}
      <div className="mt-5 space-y-2">
        <h4 className="text-sm font-medium">All Exposed props</h4>
        {exposures.map((exposure) => {
          const node = getNodeById(currentData, config, exposure.nodeId)
          const field = node && config.components[node.type]?.fields?.[exposure.prop]
          const kind = field?.type

          return (
            <div key={exposure.key} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {exposure.label}{" "}
                <span className="text-muted-foreground">({kind ?? exposure.prop})</span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => removeExposure(exposure.key)}>
                Remove
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
