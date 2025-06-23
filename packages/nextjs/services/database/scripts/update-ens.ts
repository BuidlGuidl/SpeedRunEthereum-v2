import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import * as path from "path";
import { createPublicClient, getChainContractAddress, http, toHex } from "viem";
import { mainnet } from "viem/chains";
import { packetToBytes } from "~~/node_modules/viem/utils/ens/packetToBytes";
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

const BATCH_SIZE = 500;

// ABI Definitions
const universalResolverReverseAbi = [
  {
    inputs: [{ name: "name", type: "bytes" }],
    name: "reverse",
    outputs: [
      { name: "name", type: "string" },
      { name: "address", type: "address" },
    ],
    stateMutability: "view",
    type: "function" as const,
  },
] as const;

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

async function batchGetENS(addresses: `0x${string}`[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  const addressChunks = chunk(addresses, BATCH_SIZE);

  const universalResolverAddress = getChainContractAddress({
    chain: mainnet,
    contract: "ensUniversalResolver",
  });

  for (const batch of addressChunks) {
    const reverseCalls = batch.map(addr => {
      const cleanAddr = addr.toLowerCase().startsWith("0x") ? addr.toLowerCase() : `0x${addr.toLowerCase()}`;
      const reverseNode = `${cleanAddr.slice(2)}.addr.reverse`;

      return {
        address: universalResolverAddress,
        abi: universalResolverReverseAbi,
        functionName: "reverse",
        args: [toHex(packetToBytes(reverseNode))],
        originalAddress: addr,
      } as const;
    });

    const reverseResults = await publicClient.multicall({
      contracts: reverseCalls,
      allowFailure: true,
    });

    reverseResults.forEach((res, i) => {
      const { originalAddress } = reverseCalls[i];
      if (res.status === "success") {
        const [name, resolvedAddress] = res.result;
        // Verify that the resolved address matches the input address
        if (resolvedAddress.toLowerCase() === originalAddress.toLowerCase()) {
          results[originalAddress] = name;
        } else {
          results[originalAddress] = null;
        }
      } else {
        results[originalAddress] = null;
      }
    });

    // Add delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Log summary
  console.log("\nENS Lookup Summary:");
  console.log(`Total addresses processed: ${addresses.length}`);
  console.log(`Successfully resolved ENS names: ${Object.values(results).filter(Boolean).length}`);

  return results;
}

async function updateEnsNames() {
  try {
    const usersWithoutEns = await db.query.users.findMany({
      where: isNull(users.ens),
    });

    console.log(`Found ${usersWithoutEns.length} users without ENS names`);

    // Create a map of lowercase addresses to user records
    const userMap = new Map(usersWithoutEns.map(user => [user.userAddress.toLowerCase(), user]));

    // Get all addresses that need ENS lookup
    const addresses = usersWithoutEns.map(user => user.userAddress as `0x${string}`);

    const ensResults = await batchGetENS(addresses);

    // Prepare bulk update data
    const updates = Object.entries(ensResults)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, ensName]) => ensName !== null)
      .map(([address, ensName]) => {
        const originalUser = userMap.get(address.toLowerCase());
        if (!originalUser) {
          return null;
        }
        return {
          address: originalUser.userAddress, // Use the original address from the database
          ens: ensName,
        };
      })
      .filter((update): update is NonNullable<typeof update> => update !== null);

    if (updates.length > 0) {
      // Perform bulk update
      const updateQueries = updates.map(({ address, ens }) => {
        return db
          .update(users)
          .set({
            ens,
            updatedAt: new Date(),
          })
          .where(eq(users.userAddress, address));
      });

      await db.executeQueries(updateQueries as any);
      console.log(`Bulk updated ENS names for ${updates.length} users`);
    }

    console.log("\nENS name update completed");
  } catch (error) {
    console.error("Error in updateEnsNames:", error);
    throw error;
  }
}

updateEnsNames();
