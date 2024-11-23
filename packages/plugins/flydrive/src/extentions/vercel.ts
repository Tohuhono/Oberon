import type { Readable } from "node:stream"
import { ListFoldedBlobResult, copy, del, head, list, put } from "@vercel/blob"
import { DriveDirectory, DriveFile } from "flydrive"
import type {
  DriverContract,
  ObjectMetaData,
  ObjectVisibility,
  SignedURLOptions,
  WriteOptions,
} from "flydrive/types"

export class VercelBlobDriver implements DriverContract {
  /**
   * Return a boolean value indicating if the file exists
   * or not.
   */
  async exists(_key: string): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return the file contents as a UTF-8 string. Throw an exception
   * if the file is missing.
   */
  async get(_key: string): Promise<string> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return contents of an object for the given key as an Uint8Array.
   * Should throw "E_CANNOT_READ_FILE" error when the file
   * does not exists.
   */
  getBytes(_key: string): Promise<Uint8Array> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return the file contents as a Readable stream. Throw an exception
   * if the file is missing.
   */
  async getStream(_key: string): Promise<Readable> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return the file contents as a Uint8Array. Throw an exception
   * if the file is missing.
   */
  async getArrayBuffer(_key: string): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return metadata of the file. Throw an exception
   * if the file is missing.
   */
  async getMetaData(key: string): Promise<ObjectMetaData> {
    const meta = await head(key)
    return {
      contentLength: meta.size,
      contentType: meta.contentType,
      etag: "",
      lastModified: meta.uploadedAt,
    }
  }

  /**
   * Return visibility of the file. Infer visibility from the initial
   * config, when the driver does not support the concept of visibility.
   */
  async getVisibility(_key: string): Promise<ObjectVisibility> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return the public URL of the file. Throw an exception when the driver
   * does not support generating URLs.
   */
  async getUrl(key: string): Promise<string> {
    /**
     * Copied from https://github.com/vercel/storage/blob/5c195e2073377934a943a76a59364c8657b5fe87/packages/blob/src/api.ts#L99
     */
    let baseUrl = null
    try {
      // wrapping this code in a try/catch as this function is used in the browser and Vite doesn't define the process.env.
      // As this varaible is NOT used in production, it will always default to production endpoint
      baseUrl =
        process.env.VERCEL_BLOB_API_URL ||
        process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL
    } catch {
      // noop
    }
    return `${baseUrl || "https://blob.vercel-storage.com"}${key}`
  }

  /**
   * Return the signed URL to serve a private file. Throw exception
   * when the driver does not support generating URLs.
   */
  async getSignedUrl(
    _key: string,
    _options?: SignedURLOptions,
  ): Promise<string> {
    throw new Error("Method not implemented.")
  }

  /**
   * Update the visibility of the file. Result in a NOOP
   * when the driver does not support the concept of
   * visibility.
   */
  async setVisibility(
    _key: string,
    _visibility: ObjectVisibility,
  ): Promise<void> {
    throw new Error("Method not implemented.")
  }

  /**
   * Create a new file or update an existing file. The contents
   * will be a UTF-8 string or "Uint8Array".
   */
  async put(key: string, contents: string | Uint8Array): Promise<void> {
    await put(key, contents, { access: "public" })
  }

  /**
   * Create a new file or update an existing file. The contents
   * will be a Readable stream.
   */
  async putStream(
    _key: string,
    _contents: Readable,
    _options?: WriteOptions,
  ): Promise<void> {
    throw new Error("Method not implemented.")
  }

  /**
   * Copy the existing file to the destination. Make sure the new file
   * has the same visibility as the existing file. It might require
   * manually fetching the visibility of the "source" file.
   */
  async copy(source: string, destination: string): Promise<void> {
    await copy(source, destination, { access: "public" })
  }

  /**
   * Move the existing file to the destination. Make sure the new file
   * has the same visibility as the existing file. It might require
   * manually fetching the visibility of the "source" file.
   */
  async move(
    _source: string,
    _destination: string,
    _options?: WriteOptions,
  ): Promise<void> {
    throw new Error("Method not implemented.")
  }

  /**
   * Delete an existing file. Do not throw an error if the
   * file is already missing
   */
  async delete(key: string): Promise<void> {
    await del(key)
  }

  /**
   * Delete all files inside a folder. Do not throw an error
   * if the folder does not exist or is empty.
   */
  async deleteAll(prefix: string): Promise<void> {
    await del(prefix)
  }

  /**
   * List all files from a given folder or the root of the storage.
   * Do not throw an error if the request folder does not exist.
   */
  async listAll(
    prefix: string,
    options?: {
      recursive?: boolean
      paginationToken?: string
    },
  ): Promise<{
    paginationToken?: string
    objects: Iterable<DriveFile | DriveDirectory>
  }> {
    const mode = options?.recursive ? "expanded" : "folded"
    const blobList = await list({
      prefix,
      mode,
      cursor: options?.paginationToken,
    })

    if (mode === "expanded") {
      const files = blobList.blobs.map(
        (blob) => new DriveFile(blob.pathname, this),
      )
      return {
        paginationToken: blobList.cursor,
        objects: files,
      }
    } else {
      const files = blobList.blobs.map(
        (blob) => new DriveFile(blob.pathname, this),
      )
      const folders = (blobList as ListFoldedBlobResult).folders.map(
        (folder) => new DriveDirectory(folder),
      )
      return {
        paginationToken: blobList.cursor,
        objects: [...files, ...folders],
      }
    }
  }
}
