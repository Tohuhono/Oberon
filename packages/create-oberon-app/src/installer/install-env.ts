import { writeFile } from "fs/promises"
import { randomBytes } from "crypto"
import path from "path"

export async function installEnv(appPath: string, email: string) {
  await writeFile(
    path.join(appPath, "./.env.local"),
    `
MASTER_EMAIL=${email}
EMAIL_FROM=${email}

AUTH_SECRET=${randomBytes(64).toString("hex")}

# Development builds
USE_DEVELOPMENT_DATABASE=true
USE_DEVELOPMENT_SEND=true
AUTH_TRUST_HOST=true
ANALYZE=false
      `,
  )
}
