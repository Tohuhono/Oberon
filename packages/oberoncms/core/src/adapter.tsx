// Must be first - ensures env variables are available for other imports at instantiation
import "./adapter/dotenv"
import { NotImplementedError } from "./lib/dtd"

export function notImplemented(action: string) {
  return (): never => {
    throw new NotImplementedError(
      `No oberon plugin provided for ${action} action, please check your oberon adapter configuration.`,
    )
  }
}

export { mockPlugin } from "./adapter/mock-plugin"

export { bootstrapOberon } from "./adapter/bootstrap-oberon"
export { createActionHandler } from "./adapter/init-action-handler"
export { initAdapter } from "./adapter/init-adapter"
export { createRestHandler } from "./adapter/init-handler"
