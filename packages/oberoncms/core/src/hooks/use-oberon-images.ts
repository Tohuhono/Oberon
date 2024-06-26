import useSWR from "swr"
import { OberonImage } from "../lib/dtd"
import { useOberonActions } from "./use-oberon"

export const useOberonImages = () => {
  const { getAllImages, addImage } = useOberonActions()

  const {
    data: images,
    mutate,
    isLoading: loading,
  } = useSWR("/oberon/images", getAllImages)

  return {
    images,
    loading,
    addImage: (image: OberonImage) => {
      mutate(async () => await addImage(image), {
        optimisticData: (currentData) => [...(currentData || []), image],
      })
    },
  }
}
