import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import * as fs from "fs";

dotenv.config({ path: ".env.development" });

const PRODUCTION_DATABASE_HOSTNAME = "cold-resonance";

if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
  process.stdout.write("\n⚠️ You are pointing to the production database. Are you sure you want to proceed? (y/N): ");

  // Ensure blocking read
  fs.readSync(0, Buffer.alloc(0), 0, 0, null);

  const buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1, null);
  const answer = buffer.toString().toLowerCase();

  if (answer !== "y") {
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
