import { challenges, events, userChallenges, users } from "./config/schema";
import { seedChallenges } from "./productionChallenges.data";
import { seedEvents } from "./productionEvents.data";
import { seedUserChallenges } from "./productionUserChallenges.data";
import { seedUsers } from "./productionUsers.data";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

async function importProductionData() {
  console.log("Starting production data import...");

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
    console.log(`Total users to insert: ${seedUsers.length}`);
    await db.insert(users).values(seedUsers).execute();

    console.log("Inserting challenges...");
    console.log(`Total challenges to insert: ${seedChallenges.length}`);
    await db.insert(challenges).values(seedChallenges).execute();

    console.log("Inserting user challenges...");
    console.log(`Total user challenges to insert: ${seedUserChallenges.length}`);

    // Check for any null or undefined values that might cause issues
    const problematicEntries = seedUserChallenges.filter((entry, index) => {
      const hasNullOrUndefined = Object.values(entry).some(val => val === null || val === undefined);
      if (hasNullOrUndefined) {
        console.log(`Entry at index ${index} has null or undefined values:`, entry);
        return true;
      }
      return false;
    });

    console.log(`Found ${problematicEntries.length} entries with null/undefined values`);

    // Insert in small batches to prevent memory issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < seedUserChallenges.length; i += BATCH_SIZE) {
      try {
        const batch = seedUserChallenges.slice(i, i + BATCH_SIZE);
        console.log(
          `Inserting user challenges batch ${i / BATCH_SIZE + 1}/${Math.ceil(seedUserChallenges.length / BATCH_SIZE)} (${batch.length} items)`,
        );
        await db.insert(userChallenges).values(batch).execute();
      } catch (error) {
        console.error(`Error inserting batch starting at index ${i}:`, error);
        console.log(`Problematic batch sample:`, JSON.stringify(seedUserChallenges.slice(i, i + 2), null, 2));
        throw error;
      }
    }

    console.log("Inserting events...");
    console.log(`Total events to insert: ${seedEvents.length}`);

    // Insert events using same batch size as user challenges
    let insertedEvents = 0;

    for (let i = 0; i < seedEvents.length; i += BATCH_SIZE) {
      try {
        const batch = seedEvents.slice(i, i + BATCH_SIZE);
        console.log(
          `Inserting events batch ${i / BATCH_SIZE + 1}/${Math.ceil(seedEvents.length / BATCH_SIZE)} (${batch.length} items)`,
        );
        await db.insert(events).values(batch).execute();
        insertedEvents += batch.length;
      } catch (error) {
        console.error(`Error inserting events batch starting at index ${i}:`, error);
        console.log(`Problematic events batch sample:`, JSON.stringify(seedEvents.slice(i, i + 2), null, 2));
        throw error;
      }
    }

    console.log(`Successfully inserted ${insertedEvents} events out of ${seedEvents.length}`);

    // Verify final statistics
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const challengeCount = await db.select({ count: sql`count(*)` }).from(challenges);
    const userChallengeCount = await db.select({ count: sql`count(*)` }).from(userChallenges);
    const eventCount = await db.select({ count: sql`count(*)` }).from(events);

    console.log("\n📊 Final database statistics:");
    console.log(`    - Users inserted: ${userCount[0].count}`);
    console.log(`    - Challenges inserted: ${challengeCount[0].count}`);
    console.log(`    - User challenges inserted: ${userChallengeCount[0].count}`);
    console.log(`    - Events inserted: ${eventCount[0].count}`);

    console.log("\n📊 Source data statistics:");
    console.log(`    - Users processed: ${seedUsers.length}`);
    console.log(`    - Challenges processed: ${seedChallenges.length}`);
    console.log(`    - User challenges processed: ${seedUserChallenges.length}`);
    console.log(`    - Events processed: ${seedEvents.length}`);

    console.log("Production data import completed successfully");
  } catch (error) {
    console.error("Error importing production data:", error);
    throw error;
  } finally {
    await client.end();
  }
}

importProductionData().catch(error => {
  console.error("Error in production data import script:", error);
  process.exit(1);
});
