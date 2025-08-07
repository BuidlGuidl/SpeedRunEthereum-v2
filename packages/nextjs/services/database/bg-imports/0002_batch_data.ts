import { db } from "../config/postgresClient";
import { batches, users } from "../config/schema";
import { BatchNetwork, BatchStatus, BatchUserStatus } from "../config/types";
import { BgBatch, BgBatchUser } from "./types";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_BATCHES_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/batches`;
const BG_USERS_WITH_BATCHES_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builders/batches`;

async function importData() {
  try {
    console.log("==== Importing BATCH DATA ====");
    console.log("Fetching data from BG firebase...");

    const batchesResponse = await fetch(BG_BATCHES_ENDPOINT);
    const batchesData: BgBatch[] = await batchesResponse.json();
    const batchesDataSortedByStartDate = batchesData.sort((a, b) => a.startDate - b.startDate);

    const usersResponse = await fetch(BG_USERS_WITH_BATCHES_ENDPOINT);
    const usersData: BgBatchUser[] = await usersResponse.json();

    console.log(
      `Found ${batchesDataSortedByStartDate.length} batches and ${usersData.length} users belonging to a batch`,
    );

    // Save the mapping between Firebase ID and our database ID
    const batchIdMap = new Map<string, number>();

    // Preload existing batches
    const existingBatches = await db.select().from(batches);
    const existingBatchesByTelegramLink: Record<string, (typeof existingBatches)[0]> = {};
    existingBatches.forEach(batch => {
      if (batch.telegramLink) {
        existingBatchesByTelegramLink[batch.telegramLink] = batch;
      }
    });

    // Import batches
    for (const batch of batchesDataSortedByStartDate) {
      const newBatch = {
        name: `Batch ${batch.name}`,
        startDate: new Date(batch.startDate),
        status: batch.status.toLowerCase() as BatchStatus,
        contractAddress: batch.contractAddress,
        telegramLink: batch.telegramLink,
        bgSubdomain: `batch${batch.name}`,
        // Not present in BG data, so we use Optimism as default
        network: BatchNetwork.OPTIMISM,
      };

      let createdBatch;
      if (batch.telegramLink && batch.telegramLink in existingBatchesByTelegramLink) {
        // Update existing batch with any new information
        const existingBatch = existingBatchesByTelegramLink[batch.telegramLink];
        const result = await db.update(batches).set(newBatch).where(eq(batches.id, existingBatch.id)).returning();
        createdBatch = result[0];
        console.log(`Updated existing batch: ${createdBatch.name} (ID: ${createdBatch.id})`);
      } else {
        const result = await db.insert(batches).values(newBatch).returning();
        createdBatch = result[0];
        console.log(`Imported batch: ${createdBatch.name} (ID: ${createdBatch.id})`);
      }

      // Store the mapping between Firebase ID and our database ID
      batchIdMap.set(batch.name, createdBatch.id);
    }

    // Update users with batch information
    const userUpdateQueries = [];
    for (const user of usersData) {
      const batchId = batchIdMap.get(user.batch.number);

      if (!batchId) {
        console.warn(`Batch ${user.batch.number} not found for user ${user.id}`);
        continue;
      }

      // Prepare update query
      const query = db
        .update(users)
        .set({
          batchId: batchId,
          batchStatus: user.batch.status.toLowerCase() as BatchUserStatus,
        })
        .where(eq(users.userAddress, user.id));
      userUpdateQueries.push(query);
    }

    if (userUpdateQueries.length > 0) {
      await db.executeQueries(userUpdateQueries as any);
    }

    console.log("Data import completed successfully!");
  } catch (error) {
    console.error("Error during data import:", error);
    console.log("Transaction rolled back due to error.");
  } finally {
    await db.close();
    process.exit(0);
  }
}

importData();
