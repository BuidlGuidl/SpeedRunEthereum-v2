import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import * as path from "path";
import { createPublicClient, http, namehash } from "viem";
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

const BATCH_SIZE = 500;
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

// ABI Definitions
const ensAbi = [
  // Registry
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "resolver",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function" as const,
  },
  // Resolver
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function" as const,
  },
] as const;

async function batchGetENS(addresses: `0x${string}`[]): Promise<Record<string, string | null>> {
  // Process in batches
  const addressChunks = chunk(addresses, BATCH_SIZE);
  const results: Record<string, string | null> = {};
  const noEnsRecords: `0x${string}`[] = [];

  for (const addressBatch of addressChunks) {
    // Phase 1: Get all resolver addresses
    const reverseNodes = addressBatch.map(addr => {
      // Ensure address is properly formatted for reverse lookup
      const cleanAddr = addr.toLowerCase().startsWith("0x") ? addr.toLowerCase() : `0x${addr.toLowerCase()}`;
      const node = namehash(`${cleanAddr.slice(2)}.addr.reverse`);
      return { node, originalAddress: addr };
    });

    const resolverCalls = reverseNodes.map(({ node }) => ({
      address: ENS_REGISTRY,
      abi: ensAbi,
      functionName: "resolver",
      args: [node],
    }));

    const resolverResults = await publicClient.multicall({
      contracts: resolverCalls,
      allowFailure: true,
    });

    // Phase 2: Get names from resolvers
    const nameCalls = resolverResults
      .map((res, i) => {
        const { node, originalAddress } = reverseNodes[i];
        if (res.status === "success" && res.result !== "0x0000000000000000000000000000000000000000") {
          return {
            address: res.result as `0x${string}`,
            abi: ensAbi,
            functionName: "name",
            args: [node],
            originalAddress,
          };
        } else {
          // No resolver found for this address
          noEnsRecords.push(originalAddress);
          return null;
        }
      })
      .filter((call): call is NonNullable<typeof call> => call !== null);

    if (nameCalls.length === 0) {
      continue; // Skip to next batch if no valid resolvers
    }

    // Process nameCalls in batches of 50
    const nameCallBatches = chunk(nameCalls, 50);
    const nameResults: (string | null)[] = [];

    for (const batch of nameCallBatches) {
      const batchResults = await Promise.all(
        batch.map(call => publicClient.getEnsName({ address: call.originalAddress })),
      );
      nameResults.push(...batchResults);
      // Add 0.1 second delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    nameResults.forEach((result, i) => {
      const { originalAddress } = nameCalls[i];
      if (result) {
        results[originalAddress] = result;
      }
    });

    // Delay between main batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Log summary
  console.log("\nENS Lookup Summary:");
  console.log(`Total addresses processed: ${addresses.length}`);
  console.log(`Addresses with no ENS records: ${noEnsRecords.length}`);
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
