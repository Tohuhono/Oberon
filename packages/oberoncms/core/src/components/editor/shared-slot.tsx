"use client"

import type { SlotComponent } from "@puckeditor/core"
import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

type SlotTarget = { element: HTMLElement; render: ReactNode }
const SlotTargets = createContext<((key: string, target: SlotTarget | null) => void) | null>(null)

// In Puck 0.24, a nested Render gives each authored node its own drop zone context.
// Mount editor slots in the instance context and project them into the rendered Shared component.
// https://puckeditor.com/docs/api-reference/components/render
export function SharedSlotOwner({ children }: { children?: ReactNode }) {
  const [targets, setTargets] = useState(() => new Map<string, SlotTarget>())
  const [register] = useState(() => (key: string, target: SlotTarget | null) => {
    setTargets((previous) => {
      const next = new Map(previous)
      if (target) next.set(key, target)
      else next.delete(key)
      return next
    })
  })

  return (
    <SlotTargets value={register}>
      {children}
      {Array.from(targets, ([key, { element, render }]) => createPortal(render, element, key))}
    </SlotTargets>
  )
}

export function SharedSlot({
  slotKey,
  slot: Slot,
  props,
}: {
  slotKey: string
  slot: SlotComponent
  props: Parameters<SlotComponent>[0]
}) {
  const register = useContext(SlotTargets)
  const target = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = target.current
    if (!element || !register) return
    register(slotKey, { element, render: <Slot {...props} /> })
    return () => register(slotKey, null)
  }, [props, register, slotKey, Slot])

  return <div ref={target} style={{ display: "contents" }} />
}
