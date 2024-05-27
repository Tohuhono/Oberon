"use client"

import { useEffect, useState } from "react"

export function LocalDate({ date }: { date: Date | string }) {
  const [localDate, setLocalDate] = useState<string>()
  useEffect(() => {
    setLocalDate(new Date(date).toLocaleDateString(navigator.languages))
  }, [date])
  return localDate
}
