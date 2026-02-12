"use client"

import { Toast as ToastPrimitives } from "@base-ui/react/toast"

const toastManager = ToastPrimitives.createToastManager()

type ToastVariant = "default" | "destructive"

type ToastData = {
  variant?: ToastVariant
}

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

const toast = ({ title, description, variant = "default" }: ToastInput) => {
  return toastManager.add({
    title,
    description,
    data: { variant },
  })
}

export {
  type ToastVariant,
  type ToastData,
  type ToastInput,
  toast,
  toastManager,
}
