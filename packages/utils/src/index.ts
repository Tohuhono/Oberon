import type { PropsWithChildren } from "react"
import { ClassNameValue, twMerge } from "tailwind-merge"

export type CNProps<T = unknown> = PropsWithChildren<T & { className?: string }>
export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs)
}

export function format(date: Date | string) {
  return new Date(date).toLocaleDateString(navigator.languages)
}
