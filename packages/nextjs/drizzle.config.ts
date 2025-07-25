import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { join } from "path";

dotenv.config({ path: ".env.development" });

const PRODUCTION_DATABASE_HOSTNAME = "cold-resonance";
const SKIP_PRODUCTION_DATABASE_PROMPT = process.env.VERCEL === "1";

if (!SKIP_PRODUCTION_DATABASE_PROMPT && process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
  process.stdout.write("\n⚠️ You are pointing to the production database. Are you sure you want to proceed? (y/N): ");

  const result = spawnSync("tsx", [join(__dirname, "utils/prompt-confirm.ts")], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.log("Aborted.");
    process.exit(1);
  }
}

export default defineConfig({
  schema: "./services/database/config/schema.ts",
  out: "./services/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
  casing: "snake_case",
});
