import { publicClient } from "../../utils/ens-or-address";
import { getUsersWithoutEns, updateUser } from "../database/repositories/users";

const BATCH_SIZE = 50;

export async function updateEnsNames() {
  try {
    const usersWithoutEns = await getUsersWithoutEns();

    console.log(`Found ${usersWithoutEns.length} users without ENS names`);

    // Process users in batches of BATCH_SIZE
    for (let i = 0; i < usersWithoutEns.length; i += BATCH_SIZE) {
      const batch = usersWithoutEns.slice(i, i + BATCH_SIZE);

      try {
        await Promise.all(
          batch.map(async user => {
            try {
              const ensName = await publicClient.getEnsName({ address: user.userAddress });

              if (ensName) {
                await updateUser(user.userAddress, { ens: ensName });
                console.log(`Updated ENS name for ${user.userAddress}: ${ensName}`);
              }
            } catch (error) {
              console.error(`Error processing user ${user.userAddress}:`, error);
            }
          }),
        );

        console.log(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(usersWithoutEns.length / BATCH_SIZE)}`);
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Continue with next batch even if one fails
      }
    }

    console.log("ENS name update completed");
  } catch (error) {
    console.error("Error in updateEnsNames:", error);
    throw error;
  }
}
