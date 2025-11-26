"use client"

import { useMemo } from "react"

export function LocalDate({ date }: { date: Date | string }) {
  return useMemo(
    () => new Date(date).toLocaleDateString(navigator.languages),
    [date],
  )
}
