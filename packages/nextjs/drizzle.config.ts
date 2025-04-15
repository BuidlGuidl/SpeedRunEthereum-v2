import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.development" });

export const PRODUCTION_DATABASE_HOSTNAME = "cold-resonance";

if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME) && !process.argv.includes("--force")) {
  console.log("\n⚠️ You are pointing to the production database. Use `--force` if you want to continue.\n");
  process.exit(0);
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
