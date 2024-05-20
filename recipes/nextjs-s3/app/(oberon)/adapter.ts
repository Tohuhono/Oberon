import "server-only"
import { S3Client } from "@aws-sdk/client-s3"
import { oberonAdapter } from "@oberoncms/adapter-turso"
import { initAdapter } from "@oberoncms/core/adapter"
import { initAuth } from "@oberoncms/core/auth"
import { Resend } from "resend"
import { S3ENV, initOberonS3Client } from "@oberoncms/s3/plugin"
import type { OberonUser } from "@oberoncms/core"
import { config } from "./config"

const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"

const sendVerificationRequest = async ({
  email,
  token,
  url,
}: {
  email: string
  token: string
  url: string
}) => {
  if (!process.env.RESEND_SECRET) {
    throw new Error("No RESEND_SECRET configured")
  }
  const resend = new Resend(process.env.RESEND_SECRET)

  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "One time login to Oberon CMS",
      text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
    })

    if (response.error || !response.data?.id) {
      console.error("Resend response error", response.error)
      return
    }

    console.log(`Sent email id ${response.data.id}`)
  } catch (error) {
    console.error("Signin email failed to send")
  }
}

const oberonAuth = initAuth({
  databaseAdapter: oberonAdapter,
  sendVerificationRequest,
})

export const authHandlers = oberonAuth.handlers

const {
  plugin: s3Plugin,
  client,
  apiHandlers,
} = initOberonS3Client({
  client: new S3Client({
    region: S3ENV.AWS_REGION,
    endpoint: S3ENV.AWS_ENDPOINT,
    credentials: {
      accessKeyId: S3ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: S3ENV.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  }),
  bucket: S3ENV.AWS_BUCKET,
})

export const OberonS3Client = client
export const initRouteHandler = apiHandlers

export const adapter = initAdapter({
  config,
  databaseAdapter: oberonAdapter,
  getCurrentUser: async () => {
    const session = await oberonAuth.auth()

    return (session?.user as OberonUser) || null
  },
  plugins: [s3Plugin],
})
