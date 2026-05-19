import { ClassNameValue, twMerge } from "tailwind-merge"

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs)
}

export type CN<T> = Omit<T, "className"> & {
  className?: string
}
