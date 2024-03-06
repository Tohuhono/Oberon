import type { Config } from "@measured/puck"
import { Text } from "@/puck/src/blocks/text"
import { Prose } from "@/puck/src/blocks/prose"
import { Zone } from "@/puck/src/blocks/zone"
import { Image } from "@/puck/src/blocks/image"

export const renderConfig = {
  components: {
    Prose,
    Text,
    Zone,
    Image,
  },
} as Config
