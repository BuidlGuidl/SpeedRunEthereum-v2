import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let db: ReturnType<typeof drizzle<typeof schema>> | ReturnType<typeof drizzleNeon<typeof schema>>;

const NEON_DB_STRING = "neondb";
if (process.env.POSTGRES_URL?.includes(NEON_DB_STRING)) {
  const sql = neon(process.env.POSTGRES_URL as string);
  db = drizzleNeon({ schema, casing: "snake_case", client: sql });
} else {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  pool.on("error", err => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });
}

export { db };
