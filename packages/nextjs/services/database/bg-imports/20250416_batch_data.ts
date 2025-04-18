import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import { BatchStatus, BatchUserStatus } from "../config/types";
import { createBatch } from "../repositories/batches";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const BG_BATCHES_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/batches`;
const BG_USERS_WITH_BATCHES_ENDPOINT = `${process.env.NEXT_PUBLIC_BG_BACKEND}/builders/batches`;

type BgBatch = {
  id: string;
  name: string;
  status: string;
  startDate: number;
  telegramLink: string;
  contractAddress: string;
  totalParticipants: number;
  graduates: number;
};

type BgBatchUser = {
  id: string;
  batch: {
    number: string;
    status: string;
  };
};

export async function importData() {
  try {
    console.log("==== Importing BATCH DATA ====");
    console.log("Fetching data from BG firebase...");

    const batchesResponse = await fetch(BG_BATCHES_ENDPOINT);
    const batchesData: BgBatch[] = await batchesResponse.json();

    const usersResponse = await fetch(BG_USERS_WITH_BATCHES_ENDPOINT);
    const usersData: BgBatchUser[] = await usersResponse.json();

    console.log(`Found ${batchesData.length} batches and ${usersData.length} users belonging to a batch`);

    // Save the mapping between Firebase ID and our database ID
    const batchIdMap = new Map<string, number>();

    // Import batches
    for (const batch of batchesData) {
      const newBatch = {
        name: `Batch ${batch.name}`,
        startDate: new Date(batch.startDate),
        status: batch.status.toLowerCase() as BatchStatus,
        contractAddress: batch.contractAddress,
        telegramLink: batch.telegramLink,
      };

      const createdBatch = await createBatch(newBatch);
      console.log(`Imported batch: ${createdBatch.name} (ID: ${createdBatch.id})`);

      // Store the mapping between Firebase ID and our database ID
      batchIdMap.set(batch.name, createdBatch.id);
    }

    // Update users with batch information
    for (const user of usersData) {
      const batchId = batchIdMap.get(user.batch.number);

      if (!batchId) {
        console.warn(`Batch ${user.batch.number} not found for user ${user.id}`);
        continue;
      }

      const result = await db
        .update(users)
        .set({
          batchId: batchId,
          batchStatus: user.batch.status.toLowerCase() as BatchUserStatus,
        })
        .where(eq(users.userAddress, user.id));

      if (result.rowCount === 0) {
        console.warn(`User ${user.id} not found in database`);
        continue;
      }

      console.log(`Updated user: ${user.id} with batch ${user.batch.number}`);
    }

    console.log("Data import completed successfully!");
  } catch (error) {
    console.error("Error during data import:", error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

importData();
