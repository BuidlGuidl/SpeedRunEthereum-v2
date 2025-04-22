import { batches, challenges, userChallenges, users } from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

type SeedData = {
  SEED_DATA_VERSION?: string;
  seedUsers?: (typeof users.$inferInsert)[];
  seedChallenges?: (typeof challenges.$inferInsert)[];
  seedUserChallenges?: (typeof userChallenges.$inferInsert)[];
  seedBatches?: (typeof batches.$inferInsert)[];
};

async function loadSeedData() {
  try {
    const seedDataPath = path.join(__dirname, "seed.data.ts");
    if (!fs.existsSync(seedDataPath)) {
      console.error(
        "Error: seed.data.ts not found. Please copy seed.data.example.ts to seed.data.ts and update it with your data.",
      );
      process.exit(1);
    }

    // @ts-ignore: seed.data.ts is gitignored and may not exist
    const seedData = (await import("./seed.data")) as SeedData;
    const exampleData = (await import("./seed.data.example")) as SeedData;

    if (seedData.SEED_DATA_VERSION !== exampleData.SEED_DATA_VERSION) {
      console.error(
        `Error: Version mismatch between seed.data.ts (${seedData.SEED_DATA_VERSION}) and seed.data.example.ts (${exampleData.SEED_DATA_VERSION})`,
      );
      process.exit(1);
    }

    return {
      seedUsers: seedData.seedUsers,
      seedChallenges: seedData.seedChallenges,
      seedUserChallenges: seedData.seedUserChallenges,
      seedBatches: seedData.seedBatches,
    };
  } catch (error) {
    console.error("Error: cannot load seed data");
    process.exit(1);
  }
}

const connectionUrl = new URL(process.env.POSTGRES_URL || "");
if (connectionUrl.hostname !== "localhost") {
  console.error("Skipping seed: Database host is not localhost");
  process.exit(0);
}

async function seed() {
  const { seedUsers, seedChallenges, seedUserChallenges, seedBatches } = await loadSeedData();

  if (!seedUsers || !seedChallenges || !seedUserChallenges || !seedBatches) {
    console.error("Error: Required seed data is missing");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, {
    schema: { challenges, userChallenges, users, batches },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(users).execute();
      await tx.delete(batches).execute();
    });

    // Insert fresh data
    console.log("Inserting batches...");
    // Insert batches and get their generated IDs
    const insertedBatches = await db.insert(batches).values(seedBatches).returning();

    // Assign each batch to a starting user in order
    const updatedSeedUsers = seedUsers.map((user, idx) => {
      if (idx < insertedBatches.length) {
        return { ...user, batchId: insertedBatches[idx].id };
      }
      return user;
    });

    console.log("Inserting users...");
    await db.insert(users).values(updatedSeedUsers).execute();

    console.log("Inserting challenges...");
    await db.insert(challenges).values(seedChallenges).execute();

    console.log("Inserting user challenges...");
    await db.insert(userChallenges).values(seedUserChallenges).execute();

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
