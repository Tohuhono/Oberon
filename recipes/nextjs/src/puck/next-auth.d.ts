import { DefaultUser } from "@auth/core/types"

declare module "@auth/core/types" {
  interface Session {
    user: DefaultUser["user"]
  }

  interface User {
    role: "user" | "admin"
  }
}
