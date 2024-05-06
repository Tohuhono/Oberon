import useSWR from "swr"
import type { OberonImage } from ".."
import { useOberonActions } from "./use-oberon"

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
