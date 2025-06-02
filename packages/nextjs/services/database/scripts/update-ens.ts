import { db } from "../config/postgresClient";
import { lower, users } from "../config/schema";
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
  const failedResolvers: `0x${string}`[] = [];
  const noEnsRecords: `0x${string}`[] = [];

  for (const addressBatch of addressChunks) {
    // Phase 1: Get all resolver addresses
    const reverseNodes = addressBatch.map(addr => namehash(`${addr.slice(2).toLowerCase()}.addr.reverse`));

    const resolverCalls = reverseNodes.map(node => ({
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
        const address = addressBatch[i];
        if (res.status === "success" && res.result !== "0x0000000000000000000000000000000000000000") {
          return {
            address: res.result as `0x${string}`,
            abi: ensAbi,
            functionName: "name",
            args: [reverseNodes[i]],
          };
        } else {
          // No resolver found for this address
          noEnsRecords.push(address);
          return null;
        }
      })
      .filter((call): call is NonNullable<typeof call> => call !== null);

    if (nameCalls.length === 0) {
      continue; // Skip to next batch if no valid resolvers
    }

    const nameResults = await publicClient.multicall({
      contracts: nameCalls,
      allowFailure: true,
    });

    // Process results and handle fallbacks
    const fallbackAddresses: `0x${string}`[] = [];

    nameResults.forEach((result, i) => {
      const address = addressBatch[i];
      if (result.status === "success" && typeof result.result === "string" && result.result) {
        results[address] = result.result;
      } else {
        // Resolver exists but failed to return a name
        failedResolvers.push(address);
        fallbackAddresses.push(address);
      }
    });

    // Handle fallbacks using viem's getEnsName
    if (fallbackAddresses.length > 0) {
      console.log(`Falling back to getEnsName for ${fallbackAddresses.length} addresses with failed resolvers`);

      // Process fallbacks in smaller batches to avoid rate limits
      const fallbackChunks = chunk<`0x${string}`>(fallbackAddresses, 10);
      for (const fallbackBatch of fallbackChunks) {
        await Promise.all(
          fallbackBatch.map(async (address: `0x${string}`) => {
            try {
              const ensName = await publicClient.getEnsName({ address });
              if (ensName) {
                results[address] = ensName;
                console.log(`Found ENS name via fallback for ${address}: ${ensName}`);
              } else {
                results[address] = null;
              }
            } catch (error) {
              console.error(`Error in fallback lookup for ${address}:`, error);
              results[address] = null;
            }
          }),
        );
        // Delay between fallback chunks
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Delay between main batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Log summary
  console.log("\nENS Lookup Summary:");
  console.log(`Total addresses processed: ${addresses.length}`);
  console.log(`Addresses with no ENS records: ${noEnsRecords.length}`);
  console.log(`Addresses with failed resolvers: ${failedResolvers.length}`);
  console.log(`Successfully resolved ENS names: ${Object.values(results).filter(Boolean).length}`);

  return results;
}

async function updateEnsNames() {
  try {
    const usersWithoutEns = await db.query.users.findMany({
      where: isNull(users.ens),
    });

    console.log(`Found ${usersWithoutEns.length} users without ENS names`);

    // Get all addresses that need ENS lookup
    const addresses = usersWithoutEns.map(user => user.userAddress as `0x${string}`);

    // Batch process ENS lookups
    const ensResults = await batchGetENS(addresses);

    // Prepare bulk update data
    const updates = Object.entries(ensResults)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, ensName]) => ensName !== null)
      .map(([address, ensName]) => ({
        address: address.toLowerCase(),
        ens: ensName,
      }));

    if (updates.length > 0) {
      // Perform bulk update
      await db.transaction(async tx => {
        for (const { address, ens } of updates) {
          await tx
            .update(users)
            .set({
              ens,
              updatedAt: new Date(),
            })
            .where(eq(lower(users.userAddress), address));
        }
      });
      console.log(`Bulk updated ENS names for ${updates.length} users`);
    }

    console.log("ENS name update completed");
  } catch (error) {
    console.error("Error in updateEnsNames:", error);
    throw error;
  }
}

updateEnsNames();
