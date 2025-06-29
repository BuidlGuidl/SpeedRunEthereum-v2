import { closeDb, getDb } from "../config/postgresClient";
import * as schema from "../config/schema";
import * as dotenv from "dotenv";
import { reset } from "drizzle-seed";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

async function resetDb() {
  try {
    if (!process.env.POSTGRES_URL || !process.env.POSTGRES_URL.includes("localhost")) {
      throw new Error("POSTGRES_URL is not set or is not a local database");
    }
    const db = getDb();
    await reset(db, schema);
    console.log("Database reset complete");
  } catch (error) {
    console.error("Error during database reset:", error);
  } finally {
    await closeDb();
    process.exit(0);
  }
}

resetDb();
