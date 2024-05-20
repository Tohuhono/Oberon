import { NextRequest } from "next/server"
import path from "path"
import { S3ClientFactory } from "../s3"
import { getImageSize } from "./get-image-size"
export type OurFileRouter = ReturnType<typeof initRouteHandler>

export function initRouteHandler(client: S3ClientFactory): {
  POST: (req: NextRequest) => Promise<Response>
  GET: (req: NextRequest) => Response
} {
  const POST: (req: NextRequest) => Promise<Response> = async (req) => {
    const image = (await req.formData()!).get("image") as File
    if (!image) return new Response("No image provided", { status: 400 })

    const buffer = Buffer.from(await image.arrayBuffer())
    const size = await getImageSize(buffer)
    const key = await client.uploadFile(buffer, image.type, {
      extension: path.extname(image.name).slice(1),
      width: size.width.toString(),
      height: size.height.toString(),
    })
    const url = process.env.AWS_ENDPOINT
      ? `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET}/${key}`
      : `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${key}`

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
