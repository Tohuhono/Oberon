import { initRouteHandler } from "@tohuhono/puck-upload-thing"
import { auth } from "src/auth/next-auth"
import { actions } from "../../actions"

export const { GET, POST } = initRouteHandler({ auth, actions })
