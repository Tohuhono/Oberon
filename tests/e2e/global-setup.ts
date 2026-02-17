import { execSync } from "child_process"
import path from "path"

const root = path.resolve(__dirname, "../..")

export default function globalSetup() {
  console.log("Building apps for e2e tests...")
  execSync("pnpm build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      USE_DEVELOPMENT_DATABASE: "true",
      SQLITE_FILE: "file:.oberon/e2e-test.db",
    },
  })
}
