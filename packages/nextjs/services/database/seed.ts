import { challenges, events, userChallenges, users } from "./config/schema";
import { seedChallenges, seedEvents, seedUserChallenges, seedUsers } from "./seed.data";
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
  const db = drizzle(client, {
    schema: { challenges, events, userChallenges, users },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      await tx.delete(events).execute();
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(users).execute();
    });

    // Insert fresh data
    console.log("Inserting users...");
    await db.insert(users).values(seedUsers).execute();

    console.log("Inserting challenges...");
    await db.insert(challenges).values(seedChallenges).execute();

    console.log("Inserting user challenges...");
    await db.insert(userChallenges).values(seedUserChallenges).execute();

    console.log("Inserting events...");
    await db.insert(events).values(seedEvents).execute();

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch(error => {
  console.error("Error in seed script:", error);
  process.exit(1);
});
