import { initRouteHandler } from "@tohuhono/puck-upload-thing/router"

import { actions } from "@/app/(oberon)/server-config"
import { auth } from "@/app/(oberon)/server-config"

export const { GET, POST } = initRouteHandler({ auth, actions: actions })
