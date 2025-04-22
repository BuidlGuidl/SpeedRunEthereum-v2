import * as schema from "./schema";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

type DbInstance = ReturnType<typeof drizzle>;

let dbInstance: DbInstance | null = null;

function getDb(): DbInstance {
  if (dbInstance) {
    return dbInstance;
  }

  let connectionString = process.env.POSTGRES_URL;
  // Configuring Neon for local development
  if (process.env.NODE_ENV === "development") {
    connectionString = "postgres://postgres:mysecretpassword@db.localtest.me:5432/postgres";
    neonConfig.fetchEndpoint = host => {
      const [protocol, port] = host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
      return `${protocol}://${host}:${port}/sql`;
    };
    const connectionStringUrl = new URL(connectionString);
    neonConfig.useSecureWebSocket = connectionStringUrl.hostname !== "db.localtest.me";
    neonConfig.wsProxy = host => (host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`);
  }
  neonConfig.webSocketConstructor = ws;

  const sql = neon(connectionString!);
  dbInstance = drizzle({ schema, casing: "snake_case", client: sql });
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  dbInstance = null;
}

// Create a proxy to intercept all property accesses and method calls
const dbProxy = new Proxy(
  {},
  {
    get: (target, prop: keyof DbProxy) => {
      if (prop === "close") {
        return closeDb;
      }

      const db = getDb();
      return db[prop];
    },
  },
);

type DbProxy = DbInstance & {
  close: () => Promise<void>;
};

export const db = dbProxy as DbProxy;
