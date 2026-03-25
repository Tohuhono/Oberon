const resolveDevEnv = (value?: string) => {
  switch (value) {
    case "true":
      return true
    case "false":
      return false
    default:
      return (
        !process.env.CI &&
        (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
      )
  }
}

export const USE_DEVELOPMENT_DATABASE_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_DATABASE,
)

export const USE_DEVELOPMENT_SEND_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_SEND,
)
