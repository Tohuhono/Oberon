import { test, expect } from "@jest/globals"
import { getRandomInt } from "./utils"

test("returns 1 with tight bounds", () => {
  expect(getRandomInt(1, 1)).toBe(1)
})
