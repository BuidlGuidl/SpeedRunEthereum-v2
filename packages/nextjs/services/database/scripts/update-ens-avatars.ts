import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { and, isNull, not } from "drizzle-orm";
import { eq } from "drizzle-orm";
import * as path from "path";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

if (!process.env.POSTGRES_URL) {
  console.error("Error: POSTGRES_URL environment variable is not set");
  process.exit(1);
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(getAlchemyHttpUrl(mainnet.id)),
});

/**
 * Splits an array into chunks of specified size
 * @param array The array to split into chunks
 * @param size The size of each chunk
 * @returns Array of chunks
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const BATCH_SIZE = 50;

async function getEnsAvatar(ensName: string): Promise<string | null> {
  try {
    const avatar = await publicClient.getEnsAvatar({ name: ensName });
    return avatar;
  } catch (error) {
    console.error(`Error fetching avatar for ${ensName}:`, error);
    return null;
  }
}

async function batchGetEnsAvatars(ensNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  const ensNameChunks = chunk(ensNames, BATCH_SIZE);

  for (const batch of ensNameChunks) {
    const avatarPromises = batch.map(ensName => getEnsAvatar(ensName));
    const avatarResults = await Promise.all(avatarPromises);
    batch.forEach((ensName, index) => {
      results[ensName] = avatarResults[index];
    });

    // Add delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

async function updateEnsAvatars() {
  try {
    // Get users who have ENS names but no avatars
    const usersWithEnsNoAvatar = await db.query.users.findMany({
      where: and(not(isNull(users.ens)), isNull(users.ensAvatar)),
    });

    console.log(`Found ${usersWithEnsNoAvatar.length} users with ENS names but no avatars`);

    // Get all ENS names that need avatar lookup
    const ensNames = usersWithEnsNoAvatar.map(user => user.ens).filter((ens): ens is string => ens !== null);

    const avatarResults = await batchGetEnsAvatars(ensNames);

    // Prepare bulk update data
    const updates = usersWithEnsNoAvatar
      .map(user => {
        if (!user.ens) return null;
        const ensAvatar = avatarResults[user.ens];
        if (!ensAvatar) return null;

        return {
          address: user.userAddress,
          ensAvatar,
        };
      })
      .filter((update): update is NonNullable<typeof update> => update !== null);

    if (updates.length > 0) {
      // Perform bulk update
      const updateQueries = updates.map(({ address, ensAvatar }) => {
        return db
          .update(users)
          .set({
            ensAvatar,
            updatedAt: new Date(),
          })
          .where(eq(users.userAddress, address));
      });

      await db.executeQueries(updateQueries as any);
      console.log(`Bulk updated avatars for ${updates.length} users`);
    }

    console.log("\nENS avatar update completed");
  } catch (error) {
    console.error("Error in updateEnsAvatars:", error);
    throw error;
  }
}

updateEnsAvatars();
