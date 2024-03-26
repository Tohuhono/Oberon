declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: "user" | "admin"
  }

  interface User {
    role: "user" | "admin"
  }
}

declare module "@auth/core" {
  interface AdapterUser {
    role: "user" | "admin"
  }

  interface AdapterAccount {
    access_token: string
  }

  interface User {
    role: "user" | "admin"
  }
}

declare module "@auth/core/types" {
  interface AdapterUser {
    role: "user" | "admin"
  }

  interface User {
    role: "user" | "admin"
  }
}
