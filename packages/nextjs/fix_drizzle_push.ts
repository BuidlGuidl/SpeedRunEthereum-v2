import drizzleConfig from "./drizzle.config";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { type MigrationConfig, readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "./.env.development") });

const config = {
  ...drizzleConfig,
  migrationsFolder: drizzleConfig.out,
  migrationsTable: drizzleConfig.migrations?.table ?? "__drizzle_migrations",
  migrationsSchema: drizzleConfig.migrations?.schema ?? "drizzle",
} as MigrationConfig;

const migrations = readMigrationFiles(config);

// Set up database connection similar to seed.ts
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

const table_name = `${config.migrationsSchema}.${config.migrationsTable}`;

async function main() {
  await client.connect();
  const connection = drizzle(client);

  // Using a simpler type approach since we don't need the full schema
  const db = connection as any;

  console.log("~..................¯\\_(ツ)_/¯..................~");
  console.log("Drizzle Migration Hardsync");
  console.log("~...............................................~");
  console.log(
    "If you `drizzle-kit push` you ruin the migration history.\r\nThis script will drop the migration table and create a new one.",
  );
  console.log("~...............................................~");
  console.log("~...............................................~");

  console.log("... Dropping Existing Migration Table");
  // Drop the migration table if it exists
  await connection.execute(sql`DROP TABLE IF EXISTS ${sql.raw(table_name)}`);
  console.log("... Existing Migration Table Dropped");

  console.log("... Creating Migration Table");
  // Since we pass no migrations, it only creates the table.
  await db.dialect.migrate([], db.session, {
    migrationsFolder: config.migrationsFolder,
  });
  console.log("... Migration Table Created");
  console.log(`... Inserting ${migrations.length} Migrations`);

  const promises: Promise<void>[] = [];
  for (const migration of migrations) {
    console.log(`... Applying migration ${migration.hash}`);

    // Add migration hashes to migration table
    promises.push(
      connection
        .execute(
          sql`INSERT INTO ${sql.raw(table_name)} (hash, created_at) VALUES (${migration.hash}, ${migration.folderMillis})`,
        )
        .then(() => console.log(`... Applied migration ${migration.hash}`)),
    );
  }

  await Promise.all(promises);

  console.log("~...............................................~");
  console.log("~.. Migration Hardsync Complete! ˶ᵔ ᵕ ᵔ˶........~");
  console.log("~...............................................~");

  // Close the client connection when done
  await client.end();
}

main().catch(console.error);
