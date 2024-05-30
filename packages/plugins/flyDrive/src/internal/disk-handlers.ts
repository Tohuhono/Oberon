import path from "path"
import { NextRequest } from "next/server"
import { randomUUID } from "crypto"
import { getImageSize } from "./get-image-size"
import { DriverActions } from "./plugin"

export function initRouteHandler(driverActions: DriverActions): {
  POST: (req: NextRequest) => Promise<Response>
  GET: (req: NextRequest) => Response
} {
  const POST: (req: NextRequest) => Promise<Response> = async (req) => {
    const image = (await req.formData()).get("image") as File | null
    if (!image) return new Response("No image provided", { status: 400 })

    const toBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(toBuffer)

    const size = await getImageSize(buffer)

    const key = `${randomUUID()}.${path.extname(image.name).slice(1)}`

    await driverActions.put(key, buffer)

    const url = await driverActions.getUrl(key)
    const response = {
      key: key,
      alt: key,
      size: image.size,
      url,
      width: size.width,
      height: size.height,
    }

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const GET: (req: NextRequest) => Response = () => {
    // could be used to get presigned URLs
    return new Response("GET request handled", { status: 200 })
  }

  return { POST, GET }
}
