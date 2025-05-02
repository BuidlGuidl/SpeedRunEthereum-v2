import { batches, buildBuilders, buildLikes, builds, challenges, lower, userChallenges, users } from "./config/schema";
import * as dotenv from "dotenv";
import { inArray } from "drizzle-orm";
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
  seedBuilds?: (typeof builds.$inferInsert & {
    builderAddresses?: { address: string; isOwner: boolean }[];
    likerAddresses?: { address: string; likedAt: Date }[];
  })[];
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
  const { seedUsers, seedChallenges, seedUserChallenges, seedBatches, seedBuilds } = await loadSeedData();

  if (!seedUsers || !seedChallenges || !seedUserChallenges || !seedBatches) {
    console.error("Error: Required seed data is missing");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, {
    schema: { challenges, userChallenges, users, batches, builds, buildLikes, buildBuilders },
    casing: "snake_case",
  });

  try {
    // Clear existing data in a transaction
    await db.transaction(async tx => {
      console.log("Clearing existing data...");
      await tx.delete(userChallenges).execute();
      await tx.delete(challenges).execute();
      await tx.delete(buildLikes).execute();
      await tx.delete(buildBuilders).execute();
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

    if (seedBuilds) {
      console.log("Inserting builds...");
      const buildsToInsert = seedBuilds.map(seedBuild => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { builderAddresses, likerAddresses, ...build } = seedBuild;
        return build;
      });

      const insertedBuilds = await db.insert(builds).values(buildsToInsert).returning();

      console.log("Inserting build builders...");
      for (let i = 0; i < insertedBuilds.length; i++) {
        const seedBuild = seedBuilds[i];
        const insertedBuild = insertedBuilds[i];

        if (seedBuild.builderAddresses && seedBuild.builderAddresses.length > 0) {
          for (const builder of seedBuild.builderAddresses) {
            await db
              .insert(buildBuilders)
              .values({
                buildId: insertedBuild.id,
                userAddress: builder.address,
                isOwner: builder.isOwner,
              })
              .execute();
          }
        }
      }

      console.log("Inserting build likes...");
      for (let i = 0; i < insertedBuilds.length; i++) {
        const seedBuild = seedBuilds[i];
        const insertedBuild = insertedBuilds[i];

        if (seedBuild.likerAddresses && seedBuild.likerAddresses.length > 0) {
          for (const liker of seedBuild.likerAddresses) {
            await db
              .insert(buildLikes)
              .values({
                buildId: insertedBuild.id,
                userAddress: liker.address,
                likedAt: liker.likedAt,
              })
              .execute();
          }
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
