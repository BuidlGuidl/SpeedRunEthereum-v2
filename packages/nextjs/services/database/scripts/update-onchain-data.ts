import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { asc, isNull } from "drizzle-orm";
import * as path from "path";
import { UserUpdate } from "~~/services/database/repositories/users";
import { updateUser } from "~~/services/database/repositories/users";
import { fetchOnchainData } from "~~/services/onchainData";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

if (!process.env.POSTGRES_URL) {
  console.error("Error: POSTGRES_URL environment variable is not set");
  process.exit(1);
}

const BATCH_SIZE = 10;

const updateOnchainData = async () => {
  const usersWithoutSidequests = await db.query.users.findMany({
    where: isNull(users.sideQuestsSnapshot),
    limit: BATCH_SIZE,
    orderBy: [asc(users.createdAt)],
  });

  console.log(`Processing ${usersWithoutSidequests.length} users without sidequests`);

  let errorCount = 0;
  for (const user of usersWithoutSidequests) {
    try {
      console.log(`Processing user: ${user.userAddress}`);

      const { ensData, sideQuestsSnapshot } = await fetchOnchainData(user);

      const updateData: UserUpdate = {
        ens: ensData?.name || undefined,
        ensAvatar: ensData?.avatar || undefined,
        sideQuestsSnapshot,
      };

      await updateUser(user.userAddress, updateData);

      console.log(`Done:`);
      console.log(`  ENS: ${user.ens || "N/A"}`);
      console.log(`  Created At: ${user.createdAt}`);
      console.log(`  Sidequests: ${JSON.stringify(sideQuestsSnapshot)}`);
      console.log(`---`);
    } catch (error) {
      console.error(`Error updating onchain data for user ${user.userAddress}:`, error);
      errorCount++;
    }
  }

  console.log(`Total errors: ${errorCount}`);
};

updateOnchainData();
