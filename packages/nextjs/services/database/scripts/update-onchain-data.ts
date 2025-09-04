import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { desc, isNull } from "drizzle-orm";
import * as path from "path";
import { UserUpdate } from "~~/services/database/repositories/users";
import { updateUser } from "~~/services/database/repositories/users";
import { fetchOnchainData } from "~~/services/onchainData";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

if (!process.env.POSTGRES_URL || !process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || !process.env.ZERION_API_KEY) {
  console.error(
    "Error: POSTGRES_URL, NEXT_PUBLIC_ALCHEMY_API_KEY, or ZERION_API_KEY environment variables are not set",
  );
  process.exit(1);
}

const BATCH_SIZE = 8;
const OFFSET_START = 0;
const INTERVAL_TIME = 60_000;

const updateOnchainData = async () => {
  const usersWithoutSidequests = await db.query.users.findMany({
    where: isNull(users.sideQuestsSnapshot),
    limit: BATCH_SIZE,
    offset: OFFSET_START,
    orderBy: [desc(users.createdAt)],
  });

  console.log(`Processing ${usersWithoutSidequests.length} users without sidequests`);

  // Exit if no users found
  if (usersWithoutSidequests.length === 0) {
    console.log("No users without sidequests found - stopping");
    process.exit(0);
  }

  let errorCount = 0;
  for (const user of usersWithoutSidequests) {
    try {
      console.log(`Processing user: ${user.userAddress}`);

      const { ensData, sideQuestsSnapshot } = await fetchOnchainData(user);

      const updateData: UserUpdate = {
        ens: ensData?.name || undefined,
        ensAvatar: ensData?.avatar || undefined,
        sideQuestsSnapshot: {
          ...user.sideQuestsSnapshot,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...sideQuestsSnapshot!,
        },
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

  console.log(`-> Total errors: ${errorCount}`);
};

setInterval(() => {
  updateOnchainData();
  console.log(`==============================================`);
  console.log(`Waiting ${INTERVAL_TIME}ms before next update`);
  console.log(`==============================================`);
}, INTERVAL_TIME);
updateOnchainData();
