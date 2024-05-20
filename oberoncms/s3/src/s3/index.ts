"use server"
import "server-only"

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
export interface S3ClientFactoryProps {
  client: S3Client
  bucket: string
  prefix?: string
  generateUUID?: () => string
}

export class S3ClientFactory {
  private s3: S3Client
  private bucket: string
  private generateUUID: () => string

  constructor({ client, bucket, generateUUID }: S3ClientFactoryProps) {
    this.s3 = client
    this.bucket = bucket
    this.generateUUID = generateUUID || require("crypto").randomUUID
  }

  async uploadFile(
    file: Buffer | Uint8Array | Blob | string | ReadableStream,
    contentType: string,
    metadata: Record<string, string> & { extension: string },
  ): Promise<string> {
    const key = `${this.generateUUID()}.${metadata.extension}`
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })
    const response = await this.s3.send(command)
    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error("Failed to upload file")
    }
    return key
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    await this.s3.send(command)
  }

  async getPutURL({
    ext,
    fileType,
    metadata = {},
  }: {
    ext: string
    fileType: string
    metadata?: Record<string, string>
  }): Promise<{ url: string; file: string; deleteUrl: string } | undefined> {
    const file = `${this.generateUUID}.${ext}`
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: file,
        ContentType: fileType,
        Metadata: metadata,
      })
      const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }) // 5 minutes
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file,
      })
      const deleteUrl = await getSignedUrl(this.s3, deleteCommand, {
        expiresIn: 60 * 5,
      }) // 5 minutes
      if (!url || !deleteUrl) throw new Error("Failed to get presigned URL")
      return { url, file, deleteUrl }
    } catch (err) {
      console.error(err)
      return undefined
    }
  }
}
