import { db } from "../config/postgresClient";
import { users } from "../config/schema";
import * as dotenv from "dotenv";
import { and, isNull, not } from "drizzle-orm";
import { eq } from "drizzle-orm";
import * as path from "path";
import {
  Hex,
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  http,
  isHex,
  labelhash,
  namehash,
  stringToBytes,
  toHex,
} from "viem";
import { mainnet } from "viem/chains";
import { normalize, parseAvatarRecord } from "viem/ens";
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
const ensAbi = [
  // Universal Resolver
  {
    inputs: [
      { name: "name", type: "bytes" },
      { name: "data", type: "bytes" },
      { name: "gatewayUrls", type: "string[]" },
    ],
    name: "resolve",
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function" as const,
  },
  // Text Resolver
  {
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    name: "text",
    outputs: [{ name: "", type: "string" }],
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

// https://github.com/wevm/viem/blob/main/src/utils/ens/encodedLabelToLabelhash.ts
export function encodedLabelToLabelhash(label: string): Hex | null {
  if (label.length !== 66) return null;
  if (label.indexOf("[") !== 0) return null;
  if (label.indexOf("]") !== 65) return null;
  const hash = `0x${label.slice(1, 65)}`;
  if (!isHex(hash)) return null;
  return hash;
}

// https://github.com/wevm/viem/blob/main/src/utils/ens/encodeLabelhash.ts
export function encodeLabelhash(hash: Hex): `[${string}]` {
  return `[${hash.slice(2)}]`;
}

// https://github.com/wevm/viem/blob/main/src/utils/ens/packetToBytes.ts
function packetToBytes(packet: string): Uint8Array {
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0) return new Uint8Array(1);

  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);

  let offset = 0;
  const list = value.split(".");
  for (let i = 0; i < list.length; i++) {
    let encoded = stringToBytes(list[i]);
    // if the length is > 255, make the encoded label value a labelhash
    // this is compatible with the universal resolver
    if (encoded.byteLength > 255) encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }

  if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1);

  return bytes;
}

async function batchGetEnsAvatars(ensNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  const ensNameChunks = chunk(ensNames, BATCH_SIZE);

  const universalResolverAddress = getChainContractAddress({
    chain: mainnet,
    contract: "ensUniversalResolver",
  });

  for (const batch of ensNameChunks) {
    const avatarCalls = batch.map(name => {
      const normalizedName = normalize(name);
      const node = namehash(normalizedName);
      const data = encodeFunctionData({
        abi: ensAbi,
        functionName: "text",
        args: [node, "avatar"],
      });

      return {
        address: universalResolverAddress,
        abi: ensAbi,
        functionName: "resolve",
        args: [toHex(packetToBytes(normalizedName)), data, []],
        originalName: name,
      } as const;
    });

    const avatarResults = await publicClient.multicall({
      contracts: avatarCalls,
      allowFailure: true,
    });

    const processedResults = await Promise.all(
      avatarResults.map(async (res, i) => {
        const { originalName } = avatarCalls[i];
        if (res.status === "success" && res.result !== "0x") {
          try {
            // Decode the result from the universal resolver
            const decodedResult = decodeFunctionResult({
              abi: ensAbi,
              functionName: "text",
              data: res.result,
            });

            const avatarRecord = await parseAvatarRecord(publicClient, { record: decodedResult });
            return { name: originalName, avatar: avatarRecord || null };
          } catch (error) {
            return { name: originalName, avatar: null };
          }
        }
        return { name: originalName, avatar: null };
      }),
    );

    // Convert processed results to the expected format
    processedResults.forEach(({ name, avatar }) => {
      results[name] = avatar;
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
