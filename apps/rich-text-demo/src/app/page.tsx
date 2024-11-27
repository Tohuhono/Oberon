import ClientRender from "./client.render"

export async function generateMetadata() {
  return {
    title: "Puck Rich Text Editor",
  }
}

export default function Page() {
  return <ClientRender />
}
