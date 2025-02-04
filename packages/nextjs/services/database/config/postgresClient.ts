import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { Pool } from "pg";

let db: ReturnType<typeof drizzle<typeof schema>> | ReturnType<typeof drizzleVercel<typeof schema>>;

const VERCEL_DB_STRING = "verceldb";
if (process.env.POSTGRES_URL?.includes(VERCEL_DB_STRING)) {
  db = drizzleVercel(sql, { schema });
} else {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  db = drizzle(pool, { schema });

  pool.on("error", err => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });
}

export { db };
