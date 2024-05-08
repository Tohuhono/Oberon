import useSWR from "swr"
import { useOberonActions } from "./use-oberon"
import type { OberonImage } from "@/app/schema"

export const useOberonImages = () => {
  const { getAllImages, addImage } = useOberonActions()

  const {
    data: images,
    mutate,
    isLoading: loading,
  } = useSWR("/oberon/images", () => getAllImages())

  const add = (image: OberonImage) =>
    mutate(async () => await addImage(image), {
      optimisticData: (currentData) => [...(currentData || []), image],
    })

  return { images, loading, add }
}
