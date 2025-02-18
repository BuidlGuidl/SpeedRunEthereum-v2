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

interface EventPayload {
  challengeId?: string;
  contractUrl?: string;
  frontendUrl?: string;
  userAddress: string;
  autograding?: boolean;
  reviewAction?: "ACCEPTED" | "REJECTED";
  reviewMessage?: string;
}

interface Event {
  payload: EventPayload;
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
  const db = drizzle(client, { schema });

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
          creationTimestamp: createValidDate(userData.creationTimestamp),
          email: userData.socialLinks?.email,
          telegram: userData.socialLinks?.telegram,
          twitter: userData.socialLinks?.twitter,
          github: userData.socialLinks?.github,
        })
        .execute();
    }

    // Insert challenges
    console.log("Inserting challenges...");
    const challengeNameMap: Record<string, string> = {
      "decentralized-staking": "Decentralized Staking App",
      "dice-game": "Dice Game",
      "minimum-viable-exchange": "Build a DEX",
      "simple-nft-example": "Simple NFT Example",
      "state-channels": "A State Channel Application",
      "token-vendor": "Token Vendor",
      multisig: "Multisig Wallet",
      "svg-nft": "SVG NFT",
    };

    const nonAutogradingChallenges = new Set(["multisig", "svg-nft"]);

    // Get unique challenges from seed data
    const uniqueChallenges = new Set<string>();
    Object.values(typedSeedData.users).forEach(userData => {
      if (userData.challenges) {
        Object.keys(userData.challenges).forEach(challengeCode => {
          uniqueChallenges.add(challengeCode);
        });
      }
    });

    // Add additional challenges that might not be in seed data
    uniqueChallenges.add("multisig");
    uniqueChallenges.add("svg-nft");

    for (const challengeCode of uniqueChallenges) {
      await db
        .insert(challenges)
        .values({
          challengeCode,
          challengeName:
            challengeNameMap[challengeCode] ||
            challengeCode
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
          autograding: !nonAutogradingChallenges.has(challengeCode),
        })
        .execute();
    }

    // Insert user challenges
    console.log("Inserting user challenges...");
    for (const [userAddress, userData] of Object.entries(typedSeedData.users)) {
      if (userData.challenges) {
        for (const [challengeCode, challengeData] of Object.entries(userData.challenges)) {
          await db
            .insert(userChallenges)
            .values({
              userAddress,
              challengeCode,
              frontendUrl: challengeData.frontendUrl,
              contractUrl: challengeData.contractUrl,
              reviewComment: challengeData.reviewComment,
              submittedTimestamp: createValidDate(challengeData.submittedTimestamp),
              reviewAction: challengeData.status,
            })
            .execute();
        }
      }
    }

    // Insert events
    console.log("Inserting events...");
    for (const event of typedSeedData.events) {
      await db
        .insert(events)
        .values({
          eventType: event.type,
          eventTimestamp: createValidDate(event.timestamp),
          signature: event.signature,
          userAddress: event.payload.userAddress,
          challengeCode: event.payload.challengeId,
          frontendUrl: event.payload.frontendUrl,
          contractUrl: event.payload.contractUrl,
          reviewAction: event.payload.reviewAction,
          reviewMessage: event.payload.reviewMessage,
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
