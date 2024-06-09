import { once } from "events"
import { mkdir } from "fs/promises"
import { createWriteStream } from "fs"
import { walkAsyncStep } from "walkjs"
import type { OberonAdapter, OberonPageMeta } from "../lib/dtd"

export async function exportTailwindClasses({
  getAllPages,
  getPageData,
}: OberonAdapter) {
  console.log("Exporting Tailwind classes")

  const pagesPromise = getAllPages()

  await mkdir(".oberon", { recursive: true })

  const outFile = createWriteStream(".oberon/tailwind.classes")

  let matchedFields = 0

  // get the page data and walk it looking for className fields
  const walkPage = async ({ key }: OberonPageMeta) => {
    const data = await getPageData(key)

    for await (const node of walkAsyncStep(data)) {
      if (node.key !== "className" || !node.val) {
        continue
      }

      matchedFields++

      if (!outFile.write(`${node.val} \n`)) {
        await once(outFile, "drain")
      }
    }
  }

  // wait until all writes have been added
  const results = await Promise.allSettled((await pagesPromise).map(walkPage))

  outFile.write("\n")
  outFile.end()

  // wait until the file has been flushed and closed
  await once(outFile, "finish")

  // throw the first error we find
  for (const result of results) {
    if (result.status === "rejected") {
      throw result.reason
    }
  }

  if (!results.length) {
    console.log("No pages in database")
    return
  }

  console.log(
    `Successfully exported tailwind classes from ${matchedFields} fields in ${results.length} pages`,
  )
}
