import useSWR from "swr"
import type { OberonImage } from ".."
import { useOberon } from "./use-oberon"

export const useOberonImages = () => {
  const { getAllImages, addImage } = useOberon()

  const {
    data: images,
    mutate,
    isLoading: loading,
  } = useSWR("/oberon/images", getAllImages)

  const add = (image: OberonImage) =>
    mutate(async () => {
      await addImage(image)
      return await getAllImages()
    })

  return { images, loading, add, mutate }
}
