import { challenges, events, userChallenges, users } from "./config/schema";
import * as schema from "./config/schema";
// Import seed data
import seedData from "./seed.json";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

// Define types for the seed data
interface SocialLinks {
  twitter?: string;
  telegram?: string;
  github?: string;
  discord?: string;
  email?: string;
  instagram?: string;
}

interface ChallengeData {
  frontendUrl?: string;
  submittedTimestamp?: number;
  contractUrl?: string;
  reviewComment?: string;
  autograding?: boolean;
  status?: "ACCEPTED" | "REJECTED";
}

interface UserData {
  role: string;
  creationTimestamp: number;
  socialLinks: SocialLinks;
  challenges?: Record<string, ChallengeData>;
}

interface Event {
  payload: {
    userAddress: string; // This is in the original Firebase data
    [key: string]: any;
  };
  signature: string;
  timestamp: number;
  type: "challenge.submit" | "challenge.autograde" | "user.create";
}

interface SeedData {
  version: string;
  users: Record<string, UserData>;
  events: Event[];
}

const typedSeedData = seedData as SeedData;

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

// Add this helper function at the top level
function createValidDate(timestamp: number | undefined): Date | undefined {
  if (!timestamp) {
    return undefined; // Let the database handle the default value
  }
  // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
  const isMilliseconds = timestamp.toString().length === 13;
  const validTimestamp = isMilliseconds ? timestamp : timestamp * 1000;
  return new Date(validTimestamp);
}

async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  await client.connect();
  const db = drizzle(client, {
    schema,
    casing: "snake_case",
  });

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(events).execute();
    await db.delete(userChallenges).execute();
    await db.delete(challenges).execute();
    await db.delete(users).execute();

    // Insert users
    // TODO: Check who should be admin and manually set it
    console.log("Inserting users...");
    for (const [userAddress, userData] of Object.entries(typedSeedData.users)) {
      await db
        .insert(users)
        .values({
          userAddress,
          role: "user", // Set everyone as user by default
          createdAt: createValidDate(userData.creationTimestamp),
          email: userData.socialLinks?.email,
          socialTelegram: userData.socialLinks?.telegram,
          socialTwitter: userData.socialLinks?.twitter,
          socialGithub: userData.socialLinks?.github,
        })
        .execute();
    }

    // Insert challenges
    console.log("Inserting challenges...");
    const challengeData: Record<string, { name: string; github: string; autograding: boolean }> = {
      "simple-nft-example": {
        name: "Simple NFT Example",
        github: "scaffold-eth/se-2-challenges:challenge-0-simple-nft",
        autograding: true,
      },
      "decentralized-staking": {
        name: "Decentralized Staking App",
        github: "scaffold-eth/se-2-challenges:challenge-1-decentralized-staking",
        autograding: true,
      },
      "token-vendor": {
        name: "Token Vendor",
        github: "scaffold-eth/se-2-challenges:challenge-2-token-vendor",
        autograding: true,
      },
      "dice-game": {
        name: "Dice Game",
        github: "scaffold-eth/se-2-challenges:challenge-3-dice-game",
        autograding: true,
      },
      "minimum-viable-exchange": {
        name: "Build a DEX",
        github: "scaffold-eth/se-2-challenges:challenge-4-dex",
        autograding: true,
      },
      "state-channels": {
        name: "A State Channel Application",
        github: "scaffold-eth/se-2-challenges:challenge-5-state-channels",
        autograding: true,
      },
      multisig: {
        name: "Multisig Wallet",
        github: "scaffold-eth/se-2-challenges:challenge-6-multisig",
        autograding: false,
      },
      "svg-nft": {
        name: "SVG NFT",
        github: "scaffold-eth/se-2-challenges:challenge-7-svg-nft",
        autograding: false,
      },
    };

    // Get unique challenges from seed data
    const uniqueChallenges = new Set<string>();
    Object.values(typedSeedData.users).forEach(userData => {
      if (userData.challenges) {
        Object.keys(userData.challenges).forEach(challengeId => {
          uniqueChallenges.add(challengeId);
        });
      }
    });

    // Add additional challenges that might not be in seed data
    uniqueChallenges.add("multisig");
    uniqueChallenges.add("svg-nft");

    for (const id of uniqueChallenges) {
      const data = challengeData[id] || {
        name: id
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        github: "",
        autograding: true,
      };

      await db
        .insert(challenges)
        .values({
          id,
          challengeName: data.name,
          github: data.github,
          autograding: data.autograding,
        })
        .execute();
    }

    // Insert user challenges
    console.log("Inserting user challenges...");
    for (const [userAddress, userData] of Object.entries(typedSeedData.users)) {
      if (userData.challenges) {
        for (const [challengeId, challengeData] of Object.entries(userData.challenges)) {
          await db
            .insert(userChallenges)
            .values({
              userAddress,
              challengeId,
              frontendUrl: challengeData.frontendUrl,
              contractUrl: challengeData.contractUrl,
              reviewComment: challengeData.reviewComment,
              submittedAt: createValidDate(challengeData.submittedTimestamp),
              reviewAction: challengeData.status,
            })
            .execute();
        }
      }
    }

    // Insert events
    console.log("Inserting events...");
    for (const event of typedSeedData.events) {
      // Create a new payload without userAddress
      const { userAddress, ...payloadWithoutUser } = event.payload;
      const eventPayload = {
        ...payloadWithoutUser,
        // Convert reviewAction to proper enum value if present
        reviewAction: event.payload.reviewAction as "ACCEPTED" | "REJECTED" | undefined,
      };

      await db
        .insert(events)
        .values({
          eventType: event.type,
          eventAt: createValidDate(event.timestamp),
          signature: event.signature,
          userAddress: userAddress, // Use the extracted userAddress
          payload: eventPayload,
        })
        .execute();
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch(error => {
  console.error("Error in seed script:", error);
  process.exit(1);
});
