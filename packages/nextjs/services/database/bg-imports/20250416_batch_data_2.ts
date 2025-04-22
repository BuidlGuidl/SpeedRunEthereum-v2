import { db } from "../config/postgresClient";
import { batches, users } from "../config/schema";
import { BatchStatus, BatchUserStatus } from "../config/types";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

export async function importData() {
  try {
    console.log("==== TESTTT ====");

    const newBatch = {
      name: `Batch 1`,
      startDate: new Date(),
      status: "active" as BatchStatus,
      contractAddress: "0x123",
      telegramLink: "https://t.me/batch1",
    };

    const result = await db.insert(batches).values(newBatch).returning();
    console.log(result);
  } catch (error) {
    console.error("Error during data import:", error);
    console.log("Transaction rolled back due to error.");
  } finally {
    await db.close();
    process.exit(0);
  }
}

importData();
