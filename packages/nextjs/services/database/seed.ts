import { batches, buildLikes, builds, challenges, lower, userChallenges, users } from "./config/schema";
import * as dotenv from "dotenv";
import { eq, inArray } from "drizzle-orm";
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
  seedBatches?: (typeof batches.$inferInsert & { userAddresses?: string[] })[];
  seedBuilds?: (typeof builds.$inferInsert)[];
  seedBuildLikes?: Array<Omit<typeof buildLikes.$inferInsert, "buildId"> & { buildName: string }>;
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
      seedBuilds: seedData.seedBuilds,
      seedBuildLikes: seedData.seedBuildLikes,
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
  const { seedUsers, seedChallenges, seedUserChallenges, seedBatches, seedBuilds, seedBuildLikes } =
    await loadSeedData();

  if (!seedUsers || !seedChallenges || !seedUserChallenges || !seedBatches) {
    console.error("Error: Required seed data is missing");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, {
    schema: { challenges, userChallenges, users, batches, builds, buildLikes },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(buildLikes).execute();
      await tx.delete(builds).execute();
      await tx.delete(users).execute();
      await tx.delete(batches).execute();
    });

    // remove userAddresses from seedBatches
    const batchesToInsert = seedBatches.map(seedBatch => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userAddresses, ...batch } = seedBatch;
      return batch;
    });

    console.log("Inserting batches...");
    // Insert batches and get their generated IDs
    const insertedBatches = await db.insert(batches).values(batchesToInsert).returning();

    console.log("Inserting users...");
    await db.insert(users).values(seedUsers).execute();

    console.log("Updating users with batch IDs...");
    for (let i = 0; i < insertedBatches.length; i++) {
      const seedBatch = seedBatches[i];
      const insertedBatch = insertedBatches[i];
      if (seedBatch.userAddresses && seedBatch.userAddresses.length > 0) {
        await db
          .update(users)
          .set({ batchId: insertedBatch.id })
          .where(
            inArray(
              lower(users.userAddress),
              seedBatch.userAddresses.map(addr => addr.toLowerCase()),
            ),
          );
      }
    }

    console.log("Inserting challenges...");
    await db.insert(challenges).values(seedChallenges).execute();

    console.log("Inserting user challenges...");
    await db.insert(userChallenges).values(seedUserChallenges).execute();

    console.log("Inserting builds...");
    if (seedBuilds) {
      await db.insert(builds).values(seedBuilds).execute();
    }

    console.log("Inserting build likes...");
    if (seedBuildLikes) {
      for (const like of seedBuildLikes) {
        const buildResult = await db
          .select({ id: builds.id })
          .from(builds)
          .where(eq(builds.name, like.buildName))
          .execute();

        if (buildResult.length > 0) {
          const buildId = buildResult[0].id;
          await db
            .insert(buildLikes)
            .values({
              buildId,
              likerAddress: like.likerAddress,
              likedAt: like.likedAt,
            })
            .execute();
        } else {
          console.warn(`Warning: Build with name "${like.buildName}" not found. Skipping this like.`);
        }
      }
    }

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
