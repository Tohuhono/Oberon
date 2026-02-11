import { Render } from "@puckeditor/core"
import { config, initialData } from "@/puck.config"

export async function generateMetadata() {
  return {
    title: "Puck Rich Text Editor",
  }
}

export default function Page() {
  const data = initialData["/"]
  return data && <Render config={config} data={data} />
}
