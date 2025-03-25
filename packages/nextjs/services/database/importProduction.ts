import { challenges, userChallenges, users } from "./config/schema";
import { seedChallenges } from "./productionChallenges.data";
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
    schema: { challenges, userChallenges, users },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(users).execute();
    });

    // Insert fresh data
    console.log("Inserting users...");
    console.log(`Total users to insert: ${seedUsers.length}`);
    // Ensure each user has createdAt and updatedAt
    const usersWithTimestamps = seedUsers.map(user => ({
      ...user,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || user.createdAt || new Date(),
    }));
    await db.insert(users).values(usersWithTimestamps).execute();

    console.log("Inserting challenges...");
    console.log(`Total challenges to insert: ${seedChallenges.length}`);

    // Validate challenges data before insertion
    const validChallenges = seedChallenges.filter((challenge, index) => {
      const isValid =
        challenge.id && challenge.challengeName && challenge.description && challenge.sortOrder !== undefined;
      if (!isValid) {
        console.log(`Invalid challenge at index ${index} (missing required fields)`);
      }
      return isValid;
    });

    console.log(
      `Valid challenges to insert: ${validChallenges.length} (${seedChallenges.length - validChallenges.length} invalid)`,
    );

    if (validChallenges.length < seedChallenges.length) {
      console.warn("⚠️ Some challenges were invalid and will be skipped!");
    }

    await db.insert(challenges).values(validChallenges).execute();

    console.log("Inserting user challenges...");
    console.log(`Total user challenges to insert: ${seedUserChallenges.length}`);

    // Filter out entries with missing required fields
    const validUserChallenges = seedUserChallenges.filter(entry => entry.challengeId && entry.userAddress);

    console.log(
      `Valid user challenges after filtering: ${validUserChallenges.length} (${seedUserChallenges.length - validUserChallenges.length} invalid)`,
    );

    if (validUserChallenges.length < seedUserChallenges.length) {
      console.warn("⚠️ Some user challenges were invalid and will be skipped!");
    }

    // Insert in small batches to prevent memory issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < validUserChallenges.length; i += BATCH_SIZE) {
      try {
        const batch = validUserChallenges.slice(i, i + BATCH_SIZE);
        console.log(
          `Inserting user challenges batch ${i / BATCH_SIZE + 1}/${Math.ceil(validUserChallenges.length / BATCH_SIZE)} (${batch.length} items)`,
        );
        // Remove any id field from the data as it's now auto-generated
        const batchWithoutId = batch.map(entry => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = entry;
          return rest;
        });
        await db.insert(userChallenges).values(batchWithoutId).execute();
      } catch (error) {
        console.error(`Error inserting batch starting at index ${i}`);
        console.error(`Error details:`, error);
        throw error;
      }
    }

    // Verify final statistics
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const challengeCount = await db.select({ count: sql`count(*)` }).from(challenges);
    const userChallengeCount = await db.select({ count: sql`count(*)` }).from(userChallenges);

    console.log("\n📊 Final database statistics:");
    console.log(`    - Users inserted: ${userCount[0].count}`);
    console.log(`    - Challenges inserted: ${challengeCount[0].count}`);
    console.log(`    - User challenges inserted: ${userChallengeCount[0].count}`);

    console.log("\n📊 Source data statistics:");
    console.log(`    - Users processed: ${seedUsers.length}`);
    console.log(`    - Valid challenges processed: ${validChallenges.length} of ${seedChallenges.length}`);
    console.log(`    - Valid user challenges processed: ${validUserChallenges.length} of ${seedUserChallenges.length}`);

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
