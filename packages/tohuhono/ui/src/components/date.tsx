"use client"

import { useClientState } from "@tohuhono/utils/use-client-state"

export function LocalDate({ date }: { date: Date | string }) {
  return useClientState(
    () => new Date(date).toLocaleDateString(navigator.languages),
    [date],
    "",
  )
}
