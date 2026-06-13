import { randomUUID } from "crypto"
import path from "path"

import { OberonAdapter, OberonError, ResponseError } from "@oberoncms/core"
import type { Disk } from "flydrive"

import { getImageSize } from "./get-image-size"

export function initRouteHandler(
  { can }: OberonAdapter,
  disk: Disk,
): {
  POST: (req: Request) => Promise<Response>
  GET: () => Promise<Response>
} {
  const POST: (req: Request) => Promise<Response> = async (req) => {
    if (!(await can("images", "write"))) {
      throw new ResponseError("Not Allowed")
    }

    const image = (await req.formData()).get("image")
    if (!(image instanceof File)) {
      throw new OberonError("No image provided")
    }

    const toBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(toBuffer)

    const size = await getImageSize(buffer)

    const key = `${randomUUID()}.${path.extname(image.name).slice(1)}`

    await disk.put(key, buffer)

    const url = await disk.getUrl(key)
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

  const GET = async () => {
    // could be used to get presigned URLs
    return new Response("GET request handled", { status: 200 })
  }

  return { POST, GET }
}
