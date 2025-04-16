import * as schema from "./schema";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let db: ReturnType<typeof drizzle<typeof schema>> | ReturnType<typeof drizzleNeon<typeof schema>>;

const NEON_DB_STRING = "neondb";
if (process.env.POSTGRES_URL?.includes(NEON_DB_STRING)) {
  const neonPool = new NeonPool({ connectionString: process.env.POSTGRES_URL as string });
  db = drizzleNeon(neonPool, { schema, casing: "snake_case" });
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
