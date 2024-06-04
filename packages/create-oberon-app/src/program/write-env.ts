import { writeFile } from "fs/promises"
import { randomBytes } from "crypto"
import path from "path"

export async function writeEnv(appPath: string, email: string) {
  await writeFile(
    path.join(appPath, "./.env.local"),
    `
MASTER_EMAIL=${email}
EMAIL_FROM=${email}

AUTH_SECRET=${randomBytes(64).toString("hex")}

# Development builds
RESEND_USE_REMOTE=false
AUTH_TRUST_HOST=true
ANALYZE=false
      `,
  )
}
