import { describe, expect, it } from "vitest"

import { ResponseError } from "../lib/dtd"
import { initPlugins } from "./init-plugins"
import { mockPlugin } from "./mock-plugin"

describe("initPlugins key value store", { tags: ["ai", "issue-318"] }, () => {
  it("exposes a fallback KV contract before a database plugin implements it", async () => {
    const { adapter } = initPlugins()

    expect(() => adapter.getKV("tailwind", "state")).toThrow(
      new ResponseError(
        "No oberon plugin provided for getKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() =>
      adapter.putKV("tailwind", "state", { activeHash: "abc123" }),
    ).toThrow(
      new ResponseError(
        "No oberon plugin provided for putKV action, please check your oberon adapter configuration.",
      ),
    )
    expect(() => adapter.deleteKV("tailwind", "state")).toThrow(
      new ResponseError(
        "No oberon plugin provided for deleteKV action, please check your oberon adapter configuration.",
      ),
    )
  })

  it("lets the mock plugin override KV methods with demo-only stubs", async () => {
    const { adapter } = initPlugins([mockPlugin])

    expect(() => adapter.getKV("mock-plugin", "state")).toThrow(
      new ResponseError("This action is not available in the demo"),
    )
    expect(() =>
      adapter.putKV("mock-plugin", "state", { activeHash: "abc123" }),
    ).toThrow(new ResponseError("This action is not available in the demo"))
    expect(() => adapter.deleteKV("mock-plugin", "state")).toThrow(
      new ResponseError("This action is not available in the demo"),
    )
  })
})
