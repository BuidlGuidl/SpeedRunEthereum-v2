import { users } from "./config/schema";
import * as schema from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, { schema });
  await db.delete(users).execute();

  console.log("Deleted all users");

  await db
    .insert(users)
    .values([{ id: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" }])
    .execute();

  console.log("Database seeded successfully");
}
seed()
  .catch(error => {
    console.error("Error seeding database:", error);
  })
  .finally(() => {
    process.exit();
  });
