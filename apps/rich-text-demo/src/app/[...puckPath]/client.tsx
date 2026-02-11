"use client"

import { Puck, type Data, Button, Render } from "@puckeditor/core"
import { useDemoData } from "../../lib/use-demo-data"
import { config } from "@/puck.config"

export function Client({ path, isEdit }: { path: string; isEdit: boolean }) {
  const { data, resolvedData, key } = useDemoData({
    path,
    isEdit,
  })

  if (isEdit) {
    return (
      <div>
        <Puck
          config={config}
          data={data}
          onPublish={async (data: Data) => {
            localStorage.setItem(key, JSON.stringify(data))
          }}
          headerPath={path}
          overrides={{
            headerActions: () => (
              <>
                <div>
                  <Button href={path} newTab variant="secondary">
                    View page
                  </Button>
                </div>
              </>
            ),
          }}
        />
      </div>
    )
  }

  if (data) {
    return <Render config={config} data={resolvedData} />
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1>404</h1>
        <p>Page does not exist in session storage</p>
      </div>
    </div>
  )
}

export default Client
